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
 */
ql.newAgent = function(actionset){
	var agent = {}
	agent.actionset = actionset;
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
 * Predict the reward of the next state after applying an action
 */
ql.q = function(state,action){
	// Check whether the state exists?
	if (agent.policy.hasOwnProperty(state))
		return 
}

module.exports = ql;