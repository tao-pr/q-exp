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
var b1 = '';
var b2 = '✓';

ttt.agentVsAgent = function agentVsAgent(){
	var alpha;
	// Initialise bots
	var bot1 = ql.newAgent('tictactoe-1',actionSet,alpha=0.35)
		.then(ql.bindRewardMeasure( rewardOf(b1) ))
		.then(ql.bindActionCostMeasure( costOfAct ))
		.then(ql.bindStateGenerator( takeMove(b1) ))
		.then(ql.bindStatePrinter( statePrint(b1,b2) ))
		.then(ql.load('./agent'));

	var bot2 = ql.newAgent('tictactoe-2',actionSet,alpha=0.35)
		.then(ql.bindRewardMeasure( rewardOf(b2) ))
		.then(ql.bindActionCostMeasure( costOfAct ))
		.then(ql.bindStateGenerator( takeMove(b2) ))
		.then(ql.bindStatePrinter( statePrint(b2,b1) ))
		.then(ql.load('./agent'));

	var board = boardToState(emptyBoard(),b1);

	// Start the game
	Promise.all([bot1,bot2])
		.then(function(bots){
			let bot1 = bots[0];
			let bot2 = bots[1];

			// Bot1 makes the first move of the game
			Promise.resolve(bot1)
				.then(ql.start(board))
				.then((_bot1) => {
					// Bot2 takes the next move
					handoverTo(_bot1,bot2)
				})
		})
}


function endGame(reward){
	// TAOTODO:
}

function handoverTo(from,to)
{
	console.log(to.name + ' now takes turn'.magenta);

	// Get the current state
	var state = flipSide(from.state);
	var me = to.then(ql.setState(state));

	// TAOTODO: The game has ended?
	var reward = rewardOf(b1)(state);
	if (Math.abs(reward)>=100){
		// A winner has been decided!
		// TAODEBUG:
		console.log('WINNER HAS BEEN DECIDED!'.magenta)


	}
	else{
		// Still in the game, just learn
		// and move on
		if (me.name=='tictactoe-1'){
			var opponent = from;
			me.then(ql.learn)
				.then(ql.step)
				.then((myself) => handoverTo(myself,opponent)) 
		}
		else{
			// Me takes the current state from opponent
			// makes a new move
			// then handover the turns
			var opponent = from;
			me.then(ql.step)
				.then((myself) => handoverTo(myself,opponent))
		}
	}
}

function flipSide(state,piece,theirPiece){
	var board = stateToBoard(state,piece,theirPiece);
	return boardToState(board,theirPiece);
}

function rewardOf(piece){
	return function(state){
		var mystate = state.split(':')[0];
		var theirstate = state.split(':')[1];

		if (mystate.length==0) return 0;
		
		// Measure the score based on how close we win
		// or lose
		var score = 0;
		winningPatterns().forEach((pattern) => {

			// Skip if winner has been decided
			if (Math.abs(score)>=100) return;

			pattern.forEach((act) => {
				if (mystate.indexOf(act)>=0) agg++;
				if (theirstate.indexOf(act)>=0) agg--;
			})
			
			// Win?
			if (agg==3) score = 100;
			// Almost win?
			else if (agg==2) score += 30;
			// Lost?
			if (agg==-3) score = -100;
			// Almost lost?
			else if (agg==-2) score -= 30;
		})

		return score;
	}
}


function costOfAct(state,action){
	// Invalid moves result minus value
	if (state.indexOf(action)>=0) return -Infinity;

	// Otherwise, we blindly guess the cost
	return Math.random()*10;
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

function takeMove(piece){
	return function(state,action){
		// Convert the state back to a board
		var board = stateToBoard(state,piece,'X');
		// Take a move!
		var move = actionToMove(action);

		board[move[1]][move[0]] = piece;

		// Convert the board back to the state and return
		return boardToState(board,piece);
	}
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
		if (p.length==0) return; // No move representation

		p.split(',').forEach((action) => {
			var move = actionToMove(action);
			var i = move[0];
			var j = move[1];
			board[j][i] = represent[n];
		})
	})

	return board;
}


function statePrint(piece,theirPiece){
	return function(state){
		var board = stateToBoard(state,piece,theirPiece);
		board.forEach((row) => {
			var r = row.map((u) => 
				u==piece ? u.green : 
				u==theirPiece ? u.red :
				'0'
			);
			console.log('   [' + r.join('-') + ']');
		})
	}
}


function winningPatterns(){
	return [
		['c00','c11','c22'], // diagonal
		['c20','c11','c02'], // diagonal
		['c00','c10','c20'], // first row
		['c01','c11','c21'], // second row
		['c02','c12','c22'], // third row
		['c01','c02','c03'], // first column
		['c11','c12','c13'], // second column
		['c21','c22','c23']  // third column
	];
}


function isAvailableToMove(board){
	return !JSON.stringify(board).indexOf('0')>0;
}



// Start
ttt.agentVsAgent();
