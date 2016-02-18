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

	// Bot won?
	if (stopCrit(stateToStr(state))){
		console.log('[BOT ENDED THE GAME]'.green);
		return Promise.resolve(stateToStr(state));
	}

	// Ask the user to input their choice
	prompt.start();
	return new Promise((done,reject)=>

		prompt.get(['move'],(err,res)=>{
			// TAOTODO: valid move?

			// Apply the move
			let action = res.move.match(/c*(\d)(\d)/);
			let i = action[1];
			let j = action[2];
			state = applyAction(state,i,j,'✅');

			console.log('[AFTER YOUR MOVE]'.green);
			drawState(state);

			// Human won?
			if (stopCrit(stateToStr(state))){
				console.log('[HUMAN ENDED THE GAME]!'.green);
			}

			// Returns the generated state
			done(stateToStr(state))
		})
	);
}
var rewardOfState = function(state){
	state = strToState(state);
	
	// Reward = 1 if win
	// Reward = -1 if lose
	// Reward is higher if more close to win
	var rows = state.map((row) => row.join(''));
	var rowsT = state.map((row,j) => row.map((c,i)=>state[i][j]).join(''));
	var diag = state.map((row,j) => row.map((c,i)=> i==j ? c : '').join('')).join('');
	var diagT = state.map((row,j) => row.map((c,i)=> row.length-i-1==j ? c : '').join('')).join('');

	rows = rows.concat(rowsT);
	rows = rows.concat(diag);
	rows = rows.concat(diagT);

	function anyWin(_rows,c){
		return _rows.some((row) => row.split('').filter((a) => a!=c).length==0);
	}
	function anyCloseToWin(_rows,c){
		return _rows.some((row) => 
			row.split('').filter((a)=>a==c).length==row.length-1 &&
			row.indexOf('0')>=0
		)
	}

	// Agent win?
	if (anyWin(rows,'❌')) return 1;
	// Human win?
	if (anyWin(rows,'✅')) return -1;
	// Agent close to win?
	if (anyCloseToWin(rows,'❌')) return 0.8;
	// Human close to win?
	if (anyCloseToWin(rows,'✅')) return -0.8;

	// Otherwise, random at minimal confidence (0~0.1)
	return Math.random()/10;
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
		return Math.random()/10;
	else
		return -Infinity;
}

var stopCrit = function(state){

	// Somebody won?
	var cost = rewardOfState(state)
	console.log(` cost of current state = ${cost}`);
	if (Math.abs(cost)>=1) return true;
	
	// Still there any space to move?
	if (state.indexOf('0')>0) return false;
	else return true;
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


var game = ql
	.newAgent('ox-agent',actionSet,stateGen,rewardOfState,actionCost)
	.then(ql.load('.'))
	.then(ql.start(initState,stopCrit,alpha))
	.then(ql.save('.'))
	.then((agent) =>
		console.log('--TRAINED AGENT--'.cyan)
	)




