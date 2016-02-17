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
 */
ql.updatePolicy = function(state,action,rewardUpdater){
	return function(agent){
		// Register a new state if haven't
		if (!agent.policy.hasOwnProperty(state)){
			agent.policy[state] = {}
			agent.policy[state] = agent.actionset.map(function(a){
				// TAOTOREVIEW: This could possibly apply prior knowledge
				return {action: a, reward: 1}
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
 * @param {String} action to take
 */
ql.rewardOf = function(state,action){

	return function(agent){
		// Explore the next state
		var state_ = agent.func['stateGenerator'](state,action);
		// Get the reward of the next state
		var reward_state = agent.func['rewardOfState'](state);
		return reward_state;
	}
}


/**
 * Explore the subsequent states by trying some actions on it
 */
ql.exploreNext = function(state){
	return function(agent){
		// List all actions and try
		var rewards = agent.actionset.map(function(a){
			var r = ql.rewardOf(state,a)(agent);
			return {action: a, reward: r}
		})

		// Sort the actions by rewards (higher first)
		return _.sortBy(rewards,(r) => -r.reward);
	}
}



module.exports = ql;