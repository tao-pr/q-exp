"use strict";
/**
 * Falling stones bot using RL with generalisation
 * @author StarColon Projects
 */

var colors = require('colors');
var prompt = require('prompt');
var _      = require('underscore');
var ql     = require('../main.js');
var State  = require('../state.js');
var fs     = require('fs');

ql.isVerbose = true; // Make sure it's gonna go verbose

var alpha;

const actionSet = [ // Character movement
	'←','→','#' 
];

const BOARD_SIZE = 5;

/* 5x5          0
	┏━━━━━┓
	┃ ⦷      ┃ 1
	┃    ⦷   ┃ 2
	┃        ┃ 3
	┃     😎 ┃ 4*
  ┗━━━━━┛
   1  2  3  4 5   
*/


function initState(){
	var myPos = (BOARD_SIZE-1)/2+1;
	var ball1 = [0,0];
	var ball2 = [2,0];

	return new State([myPos].concat(ball1).concat(ball2));
}

/**
 * Perceived total reward of a state
 */
function Q(state){

}

function actionCost(state,a){
	var state_ = nextState(state,a);
	return Q(state_)
}

function nextState(state,a){
	// Move
	var myPos = state.state[0];
	if (a=='←'){ // Move left
		myPos--;
		if (myPos < 0) myPos = 0;
	}
	else if (a=='→'){ // Move right
		myPos++;
		if (myPos > 5) myPos = 5;
	}
	// Otherwise, it stays its position

	// Stones fall down
	var ball1 = state.state.slice(1,3);
	var ball2 = state.state.slice(3,5);

	ball1[1]++;
	ball2[1]++;

	// If the ball hits into the ground,
	// reset the position
	if (ball1[1]>BOARD_SIZE){
		// Randomly pick where to drop the ball on the top
		ball1 = [parseInt(Math.random()*BOARD_SIZE),0]
	}
	if (ball2[1]>BOARD_SIZE){
		ball2 = [parseInt(Math.random()*BOARD_SIZE),0]	
	}

	// Return the next state
	return new State([myPos].concat(ball1).concat(ball2));
}

function render(state){
	// Do nothing
	var myPos = state.state[0];
	var ball1 = state.state.slice(1,3);
	var ball2 = state.state.slice(3,5);

	// Render the frame
	var horz = '';
	for (var i=0; i<BOARD_SIZE; i++) 
		horz += '━'.cyan;
	console.log(horz);
	for (var j=0; j<=BOARD_SIZE; j++){
		horz = '';
		for (var i=0; i<BOARD_SIZE; i++){
			if (ball1[0]==i && ball1[1]==j)
				horz += '⦷'.red;
			else if (ball2[0]==i && ball2[1]==j)
				horz += '⦷'.blue;
			else if (myPos==i && j==5)
				horz += '😎';
			else
				horz += ' ';
		}
		console.log(horz);
	}
	horz = '';
	for (var i=0; i<BOARD_SIZE; i++) 
		horz += '━'.cyan;
	console.log(horz);
}

var bot = ql.newAgent('bot',actionSet,alpha=0.22)
	.then(ql.bindRewardMeasure(Q))
	.then(ql.bindActionCostMeasure(actionCost))
	.then(ql.bindStateGenerator(nextState))
	.then(ql.bindStatePrinter(render));

var board = initState();

console.log('Initial location: '.green);
render(board);