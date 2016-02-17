/**
 * Q-EXP
 * Sample test script
 */

var qexp = require('../main.js');

qexp.isVerbose = true;


/*-----------------
 * c00 | c10 | c20
 *-----------------
 * c01 | c11 | c21
 *-----------------
 * c02 | c12 | c22
 *-----------------
*/


var stateToStr = (s) => JSON.stringify(s);
var strToState = (s) => JSON.parse(s);

var stateGen = function(s,a){
	// Get which cell to fill
	var action = a.match(/c(\d)(\d)/);
	var cell = [action[1],action[2]];

	var state = strToState(s);

}
var rewardOfState = function(state){
	state = strToState(state);

}

var actionCost = function(state,a){
	state = strToState(state);
	
	// Check whether the particular action
	// can legally be applied on the given state
	// Get which cell to fill
	var action = a.match(/c(\d)(\d)/);
	var i = action[1];
	var j = action[2];

	if (state[j][i]==0)
		return Math.random();
	else
		return -1;
}

var stopCrit = function(state){
	state = strToState(state);
	// Still there are some vacant cells?
	return !state.some((row) => row.indexOf(0)>=0)
}

// Initial variables
var initState = stateToStr([
		[0,0,0],
		[0,0,0],
		[0,0,0]
	])

var actionSet = [
	'c00','c10','c20',
	'c01','c11','c21',
	'c02','c12','c22'
];

var alpha = 0.5;


var game = qexp.newAgent(actionSet,stateGen,rewardOfState,actionCost)
	.then(gexp.start(initState,stopCrit,alpha))