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

const actionSet = [ // Character movement
	'←','→','#' 
];

/* 5x5          0
	┏━━━━━┓
	┃ ⦷       ┃ 1
	┃    ⦷    ┃ 2
	┃         ┃ 3
	┃     😎  ┃ 4*
  ┗━━━━━┛
   1  2  3  4 5   
*/


function initState(){
	var myPos = 3;
	var ball1 = [0,0];
	var ball2 = [2,0];

	return [myPos].concat(ball1).concat(ball2)
}

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
	else if (a=='→'){
		myPos++;
		if (myPos > 5) myPos = 5;
	}

	// Stones fall down
	var ball1 = state.state.slice(1,3);
	var ball2 = state.state.slice(3,5);
}

function render(state){
	// Do nothing
}

var bot = ql.newAgent('bot',actionSet,alpha=0.22)
	.then(ql.bindRewardMeasure(Q))
	.then(ql.bindActionCostMeasure(actionCost))
	.then(ql.bindStateGenerator(nextState))
	.then(ql.bindStatePrinter(render));

console.log('Initial location: '.green)