"use strict";

/**
 * Tic-Tac-Toe strategy learning sample
 */

var colors = require('colors');
var prompt = require('prompt');
var ql = require('../main.js');
var fs = require('fs');

ql.isVerbose = true; // Make sure it's gonna go verbose


/*-----------------
 * c00 | c10 | c20
 *-----------------
 * c01 | c11 | c21
 *-----------------
 * c02 | c12 | c22
 *-----------------
*/

var actionSet = [
	'c00','c10','c20',
	'c01','c11','c21',
	'c02','c12','c22'
];


function agentVsAgent(){
	var alpha;
	// Initialise bots
	var bot1 = ql.newAgent('tictactoe-1',actionset,alpha=0.35)
		.then(ql.bindRewardMeasure(   ))
		.then(ql.bindActionCostMeasure(   ))
		.then(ql.bindStateGenerator(  ))
		.then(ql.load('./agent'));

	var bot2 = ql.newAgent('tictactoe-2',actionset,alpha=0.35)
		.then(ql.bindRewardMeasure(   ))
		.then(ql.bindActionCostMeasure(   ))
		.then(ql.bindStateGenerator(  ))
		.then(ql.load('./agent'));

	// Couple the two bots with sequence of operations
	// TAOTODO:
	var board = boardToState(
		[0,0,0],
		[0,0,0],
		[0,0,0]
	);

	// Let bot1 starts the game (1st turn)
	bot1.then(ql.start(board));

	// Repeatedly plays in a turn-based paradigm
	// until somebody wins, keeps the bot1 learning 
	// from its move

	// TAOTODO:
	

}


// Convert a board to a state string
function boardToState(board){

}


// Convert a state string back to a board
function stateToBoard(state){

}

