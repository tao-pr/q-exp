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
 * @param {Function} state generator function
 * @param {Function} function that determines the reward of a state
 * @param {Function} action cost function
 */
ql.newAgent = function(name,actionset,stateGenerator,rewardOfState,actionCost){
	var agent = {}
	agent.name = name;
	agent.actionset = actionset;
	agent.func = {
		stateGenerator: stateGenerator, //*NOTE: State generator will return a promise
		rewardOfState: rewardOfState,
		actionCost: actionCost
	};
	agent.policy = {}
	return Promise.resolve(agent)
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
 * @param {Function} reward updater function
 * @param {Number} initial reward if new state-action to store
 */
ql.__updatePolicy = function(state,action,rewardUpdater,initial){
	return function(agent){
		// Register a new state if haven't
		if (!agent.policy.hasOwnProperty(state)){
			agent.policy[state] = {}
			agent.policy[state] = agent.actionset.map(function(a){
				// TAOTOREVIEW: This could possibly apply prior knowledge
				return {action: a, reward: a==action ? initial : Math.random()/3}
			})
		}
		else{
			// State exists, update the action reward
			agent.policy[state] = agent.policy[state].map(function(a){
				if (a.action==action) 
					return {action: action, reward: rewardUpdater(a.reward)};
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
 * @param {Function} function to determine whether the state is terminal
 */
ql.start = function(initState,stopCrit,alpha){
	return function(agent){
		ql.isVerbose && console.log('Starting...'.cyan);
		var history = []
		return ql.step(initState,stopCrit,alpha=0.66,history)(agent)
	}
}


/**
 * Step to explore the next state
 * @param {String} current state
 * @param {Function} stopping criteria function
 * @param {Number} learning rate
 * @param {Array} list of the recent states and actions
 */
ql.step = function(state,stopCrit,alpha,history){
	return function(agent){

		ql.isVerbose && console.log('...');

		// End up at a terminal state?
		if (stopCrit(state)){
			// Finish!
			ql.isVerbose && console.log('FINISH!'.green);
			return Promise.resolve(agent);
		}

		// Explore the next states
		var nexts = ql.__exploreNext(state)(agent);

		ql.isVerbose && console.log('generated actions:'.yellow);
		ql.isVerbose && console.log(nexts);
		
		// Pick the best action (greedy tithering)
		var chosen = nexts[0]; // TAOTODO: We may rely on other choices
		var currentReward = agent.func['rewardOfState'](state);

		// Generate the next state
		var nextState = null;
		return agent.func['stateGenerator'](state,chosen.action)
			.then(function(next){
				nextState = next;
				var nextReward = agent.func['rewardOfState'](nextState);
				
				// Update the state such that
				// Q(s, a) += alpha * (reward(s,a) + max(Q(s') - Q(s,a))
				// where
				// s  : current state
				// s' : next state
				ql.__updatePolicy(
					state,
					chosen.action,
					(r)=>r + alpha * (nextReward - r),
					initReward=nextReward
				)(agent);

				// Update the previous states if this cost penalty
				for (var n=history.length-1; n>=0; n--){
					// TAODEBUG:
					console.log(agent.policy[history[n].state].filter((a)=>a.action==history[n].action)[0].reward)

					console.log(' decay '.blue + JSON.stringify(history[n]));

					ql.__updatePolicy(
						history[n].state,
						history[n].action,
						(r)=>r*Math.pow(0.90,history.length-n),
						initReward=null // Actually no changes
					)(agent);

					// TAODEBUG:
					console.log(agent.policy[history[n].state].filter((a)=>a.action==history[n].action)[0].reward)
				}

				// Register the history
				ql.isVerbose && console.log(`History recorded: ${chosen.action}`)
				history.push({action: chosen.action, state: state});

				ql.isVerbose && console.log('Proceeded... '.cyan)
				ql.isVerbose && console.log(`   prev state = ${state}`);
				ql.isVerbose && console.log(`   next state = ${nextState}`)
				ql.isVerbose && console.log(`   chosen act = ${chosen.action}`)
				ql.isVerbose && console.log(`   reward     = ${nextReward}`)
				return agent
			})
			.then((agent) => ql.step(nextState,stopCrit,alpha,history)(agent))
			.catch((e) => {
				console.error('FATAL '.red + e.message);
				console.error(e.stack);
			})
	}
}



module.exports = ql;