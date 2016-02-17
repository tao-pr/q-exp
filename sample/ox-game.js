"use strict";

/**
 * Q-EXP
 * Sample test script
 */

var colors = require('colors');
var prompt = require('prompt');
var ql = require('../main.js');

ql.isVerbose = true;


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

function applyAction(state,i,j,c){
	state[j][i] = c;
	return state;
}

function drawState(state){
	state.map((row) => {
		console.log(row.map((c) => c==0 ? ' ' : c))
	})
}

var stateGen = function(s,a){
	// Get which cell to fill
	var action = a.match(/c(\d)(\d)/);
	var i = action[1];
	var j = action[2];

	var state = strToState(s);

	// Display the current state
	console.log('[PREVIOUS BOARD]'.green);
	drawState(state);

	// Apply the agent's move
	state = applyAction(state,i,j,'❌');
	console.log('[APPLY] '.green + a);
	console.log('[AFTER BOT MOVE]'.green);
	drawState(state);

	// Ask the user to input their choice
	prompt.start();
	return new Promise((done,reject)=>

		prompt.get(['move'],(err,res)=>{
			// TAOTODO: valid move?

			// Apply the move
			let action = res.move.match(/c(\d)(\d)/);
			let i = action[1];
			let j = action[2];
			state = applyAction(state,i,j,'✅');

			console.log('[AFTER YOUR MOVE]'.green);
			drawState(state);

			// Returns the generated state
			done(stateToStr(state))
		})
	);
}
var rewardOfState = function(state){
	state = strToState(state);
	var stateT = state.map((row,j) =>  // Transposed state
		row.map((col,i) => state[i][j])
	)

	function twoConsecutive(row,c){
		var s = row.join('').replace(c,1);
		return s=='110'||s=='101'||s=='011'||s=='111';
	}

	function closeToWin(_state,_stateT,c){
		if (_state.some((row) => twoConsecutive(row,c)))
			return true;
		if (_stateT.some((row) => twoConsecutive(row,c)))
			return true;

		var diag = [_state[0][0],_state[1][1],_state[2][2]];

		if (twoConsecutive(diag)) return true;

		return false;
	}

	// The agent is close to win?
	if (closeToWin(state,stateT,'❌'))
		return 0.88;

	// The opponent is close to win?
	if (closeToWin(state,stateT,'✅'))
		return 0.0;

	// Otherwise, random
	return Math.random()
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


var game = ql.newAgent(actionSet,stateGen,rewardOfState,actionCost)
	.then(ql.start(initState,stopCrit,alpha))




