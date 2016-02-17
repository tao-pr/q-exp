/**
 * Simple Q-learning library for JavaScript ninja
 * @author StarColon Projects
 */

var ql      = {}
var Promise = require('bluebird');
var _       = require('underscore');
var colors  = require('colors');
var config  = require('./package.json');

/**
 * Create a new agent with given predefined actionset
 * @param {Array} list of actions (string)
 * @param {Function} state generator function
 * @param {Function} function that determines the reward of a state
 */
ql.newAgent = function(actionset,stateGenerator,rewardOfState){
	var agent = {}
	agent.actionset = actionset;
	agent.func = {
		stateGenerator: stateGenerator,
		rewardOfState: rewardOfState
	};
	agent.policy = {}
	return Promise.resolve(agent)
}

ql.saveAgent = function(path){}
ql.loadAgent = function(path){}

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
				return {action: a, reward: initial}
			})
		}
		else{
			// State exists, update the action reward
			agent.policy[state].map(function(a){
				if (a.action==action) return rewardUpdater(a.reward);
				else return a.reward
			})
		}
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
		// Do we have the state and action registered in the policy?
		if (agent.policy.hasOwnProperty(state)){
			// Yes, we have the state memorised
			var _act = (agent.policy[state].filter((a) => a.action==action));
			if (_act.length==0)
				return Math.random(); // Don't know anything about the action
			else
				return _act[0].reward;
		}
		else{
			// We don't know anything about the current state
			// Guess it based on uniform distribution then
			return Math.random();
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
			return {action: a, reward: ql.__q(state,a)}
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
		return ql.step(initState,stopCrit,alpha=0.01)
	}
}

/**
 * Step to explore the next state
 * @param {String} current state
 * @param {Function} stopping criteria function
 * @param {}
 */
ql.step = function(state,stopCrit,alpha){
	return function(agent){

		// End up at a terminal state?
		if (stopCrit(state)){
			// Finish!
			return Promise.resolve(agent);
		}

		// Explore the next states
		var nexts = ql.__exploreNext(initState);
		
		// Pick the best action (greedy tithering)
		var chosen = nexts[0]; // TAOTODO: We may rely on other choices
		var currentReward = ql.func['rewardOfState'](state);
		var nextState = agent.func['stateGenerator'](state);
		var nextReward = ql.func['rewardOfState'](nextState);
		
		// Update the state such that
		// Q(s, a) += alpha * (reward(s,a) + max(Q(s') - Q(s,a))
		// where
		// s  : current state
		// s' : next state
		var qdiff = alpha * (chosen.reward + nextReward - currentReward);
		ql.__updatePolicy(
			state,
			chosen.action,
			(r)=>{ r + qdiff },
			initReward=Math.random()
		);

		// Proceed to the next step
		return Promise.resolve(ql.step(nextState,stopCrit,alpha))
	}
}



module.exports = ql;