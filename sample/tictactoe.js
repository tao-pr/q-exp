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

var ttt = {}


ttt.agentVsAgent = function agentVsAgent(){
	var alpha;
	var b1 = '✅';
	var b2 = '❌';
	// Initialise bots
	var bot1 = ql.newAgent('tictactoe-1',actionSet,alpha=0.35)
		.then(ql.bindRewardMeasure(   ))
		.then(ql.bindActionCostMeasure(   ))
		.then(ql.bindStateGenerator(  ))
		.then(ql.load('./agent'));

	var bot2 = ql.newAgent('tictactoe-2',actionSet,alpha=0.35)
		.then(ql.bindRewardMeasure(   ))
		.then(ql.bindActionCostMeasure(   ))
		.then(ql.bindStateGenerator(  ))
		.then(ql.load('./agent'));

	// Couple the two bots with sequence of operations
	// TAOTODO:
	var board = boardToState(emptyBoard(),b1);

	// Let bot1 starts the game (1st turn)
	bot1.then(ql.start(board));

	// Repeatedly plays in a turn-based fashion
	// until somebody wins, keeps the bot1 learning 
	// from its move

	// TAOTODO:
	

}

function emptyBoard(){
	return [[0,0,0],[0,0,0],[0,0,0]];
}

function transpose(board){
	var t = board.map((row,i) => 
		row.map((c,j) => board[j][i])
	)
	return t;
}


function actionToMove(a){
	var m = a.match(/c*(\d)(\d)/);
	return [m[1],m[2]];
}


// Convert a board to a state string
// based on the perspective of a player
function boardToState(board,piece){
	var a = [];
	var b = [];

	board.forEach(function(row,j){
		row.forEach(function(c,i){
			if (c==piece) a.push(`c${i}${j}`);
			else if (c!=0) b.push(`c${i}${j}`);
		})
	})

	return a.join(',') + ':' + b.join(',');
}


// Convert a state string back to a board
function stateToBoard(state,piece,theirPiece){
	var players = state.split(':');
	var board = emptyBoard();

	var represent = [piece,theirPiece];

	players.forEach((p,n) => {
		p.split(',').forEach((action) => {
			var move = actionToMove(action);
			var i = move[0];
			var j = move[1];
			board[j][i] = represent[n];
		})
	})

	return board;
}


function isWonBy(board,piece){
	var state = boardToState(board,piece).split(':')[0];
	// Check the winning pattern
	var patterns = [
		['c00','c11','c22'], // diagonal
		['c20','c11','c02'], // diagonal
		['c00','c10','c20'], // first row
		['c01','c11','c21'], // second row
		['c02','c12','c22'], // third row
		['c01','c02','c03'], // first column
		['c11','c12','c13'], // second column
		['c21','c22','c23']  // third column
	];

	// Won by any winning patterns?
	return patterns.some((p) => 
		!p.some((action) => state.indexOf(action)>=0)
	);
}

function isAvailableToMove(board){
	return !JSON.stringify(board).indexOf('0')>0;
}


// Start
ttt.agentVsAgent();
