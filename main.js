/**
 * Simple Q-learning library for JavaScript ninja
 * @author StarColon Projects
 */

var ql      = {}
var fs      = require('fs');
var Promise = require('bluebird');
var _       = require('underscore');
var colors  = require('colors');
var config  = require('./package.json');

ql.isVerbose = true;
Promise.longStackTraces = true;

/**
 * Create a new agent with given predefined actionset
 * @param {String} name of the agent file to save or load
 * @param {Array} list of actions (string)
 * @param {Number} learning rate
 */
ql.newAgent = function(name,actionset,alpha){
	var agent = {}
	agent.name = name;
	agent.actionset = actionset;
	agent.func = {};
	agent.policy = {};
	agent.alpha = alpha || 0.5;
	agent.history = [];
	return Promise.resolve(agent)
}

ql.bindStateGenerator = function(stateGenerator){
	return function(agent){
		agent.func.stateGenerator = stateGenerator;
		return agent;
	}
}

ql.bindRewardMeasure = function(rewardOfState){
	return function (agent){
		agent.func.rewardOfState = rewardOfState;
		return agent;
	}
}

ql.bindActionCostMeasure = function(actionCost){
	return function(agent){
		agent.func.actionCost = actionCost;
		return agent;
	}
}


ql.clearHistory = function(agent){
	agent.history.length = 0;
	return Promise.resolve(agent);
}

/**
 * Save the learned policy to a physical file
 */
ql.save = function(path){
	return function(agent){
		fs.writeFile(`${path}/${agent.name}.agent`,JSON.stringify(agent.policy));
		return Promise.resolve(agent);
	}
}

/** 
 * Load the policy from a physical file
 */
ql.load = function(path){
	return function(agent){
		return new Promise((done,reject) => {
			fs.readFile(`${path}/${agent.name}.agent`,function(err,policy){
				if (err) {
					console.error('Unable to load agent'.red);
					console.error(err);
					return done(agent);
				}

				policy = JSON.parse(policy);
				agent.policy = policy;

				ql.isVerbose && console.log('AGENT LOADED'.cyan);
				ql.isVerbose && console.log(agent.policy)

				done(agent)
			})
		})
	}
}

/**
 * Illustrate the policy it learned
 */
ql.revealBrain = function(agent){
	if (Object.keys(agent.policy).length==0)
		return agent;

	console.log('[BRAIN SCAN]'.green)
	Object.keys(agent.policy).forEach(function(state){
		console.log(state);
		console.log(`   most probable action: ${agent.policy[state][0].action} (${agent.policy[state][0].reward})`)
	})
	return agent;
}

/**
 * Update the policy from the observation
 * @param {Array} state
 * @param {String} action
 * @param {Number} reward value
 */
ql.__updatePolicy = function(state,action,reward){
	return function(agent){
		// Register a new state if haven't
		if (!agent.policy.hasOwnProperty(state)){
			agent.policy[state] = {}
			agent.policy[state] = agent.actionset.map(function(a){
				return {action: a, reward: a==action ? reward : 0}
			})
		}
		else{
			// State exists, update the action reward
			agent.policy[state] = agent.policy[state].map(function(a){
				if (a.action==action) 
					return {action: action, reward: a.reward + (agent.alpha*reward)};
				else return {action:a.action, reward: a.reward}
			})
		}

		// Resort the policy (higher reward comes first)
		agent.policy[state] = _.sortBy(agent.policy[state],(s)=>-s.reward);

		return Promise.resolve(agent)
	}
}



/**
 * Explore the reward of the next state after applying an action
 * @param {String} current state
 */
ql.__rewardOf = function(state){

	return function(agent){
		return agent.func['rewardOfState'](state);
	}
}


/**
 * Determine (predict) the reward we would get 
 * when perform a particular action on a state 
 */
ql.__q = function(state,action){
	
	return function(agent){
		var cost = agent.func['actionCost'](state,action);
		if (cost<0)
			return cost;

		// Do we have the state and action registered in the policy?
		if (agent.policy.hasOwnProperty(state)){
			// Yes, we have the state memorised
			var _act = (agent.policy[state].filter((a) => a.action==action));
			if (_act.length==0)
				return agent.func['actionCost'](state,a);
			else
				return _act[0].reward;
		}
		else{
			// We don't know anything about the current state
			// Guess it based on uniform distribution then
			return cost;
		}
	}
}


/**
 * Explore the subsequent states by trying some actions on it
 */
ql.__exploreNext = function(state){
	return function(agent){
		// List all actions and try
		var rewards = agent.actionset.map(function(a){
			// Predict the reward we would get
			return {action: a, reward: ql.__q(state,a)(agent)}
		})

		// Sort the actions by rewards (higher first)
		return _.sortBy(rewards,(r) => -r.reward);
	}
}

/**
 * Start a new learning course of the agent
 * @param {String} initial state
 */
ql.start = function(initState){
	return function(agent){
		ql.isVerbose && console.log('Starting...'.cyan);

		// Clear the history then start
		return ql.clearHistory(agent)
			.then(ql.setState(initState))
			.then(ql.step);
	}
}


/**
 * Set the current state
 */
ql.setState = function(state){
	return function(agent){
		agent.state = state;
		// Push the state to the history list too
		agent.history.push({action: null, state: state})
		return agent;
	}
}


ql.getState = function(agent){
	return agent.state
}


/**
 * Learn from the recent step which introduces a new state
 * This should be called after `ql.step`
 * and then `ql.setState` strictly
 */
ql.learn = function(){
	return function(agent){
		// History primary validations
		if (agent.history.length<2){
			return Promise.reject('Agent has not yet made any steps.');
		}

		if (_.last(agent.history).action==null){
			return Promise.reject('Agent needs to step first.');
		}

		if (agent.history[agent.history-2].action != null){
			return Promise.reject('The state before taking an action is missing.')
		}

		// Take the sequence for computation
		var before = agent.history[agent.history.length-2];
		var after  = agent.history[agent.history.length-1];

		var reward0 = agent.func['rewardOfState'](before);
		var reward1 = agent.func['rewardOfState'](after);
		var delta   = agent.alpha * (reward1 - reward0);

		// Learn from mistake, update the policy
		ql.isVerbose && console.log(agent.name + ' learning new policy'.cyan);
		ql.__updatePolicy(agent, before.state, after.action, delta);

		return agent;
	}
}


/**
 * Let the agent choose the next best action
 */
ql.step = function(agent){

	ql.isVerbose && console.log('STEP BEGINS'.green);

	if (!agent.state){
		return Promise.reject('Assign the current state first with `ql.setState`');
	}

	// Explore the next states
	var nexts = ql.__exploreNext(agent.state)(agent);

	ql.isVerbose && console.log('generated actions:'.yellow);
	ql.isVerbose && console.log(nexts);
	
	// Pick the best action (greedy tithering)
	var chosen = nexts[0]; // TAOTODO: We may rely on other choices
	var currentReward = agent.func['rewardOfState'](agent.state);

	// Register the chosen action
	agent.history.push({action: chosen.action, state: agent.state});

	ql.isVerbose && console.log(agent.name + ' chose action :'.green + chosen.action);

	// Generate the state after an action is taken
	agent.state = agent.func['stateGenerator'](agent.state, chosen.action);

	return agent;
}



module.exports = ql;