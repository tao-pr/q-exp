"use strict";

/**
 * Q-EXP
 * Sample test script
 */

var colors = require('colors');
var prompt = require('prompt');
var ql = require('../main.js');
var fs = require('fs');

ql.isVerbose = true;


/*-----------------
 * c00 | c10 | c20
 *-----------------
 * c01 | c11 | c21
 *-----------------
 * c02 | c12 | c22
 *-----------------
*/

var stateToStr = (s) => typeof(s)=='string' ? s : JSON.stringify(s);
var strToState = (s) => typeof(s)=='string' ? JSON.parse(s) : s;

var applyAction = function(state,action,c){

	// TAODEBUG:
	console.log('Apply action'.yellow);
	console.log(state);
	console.log(action);

	let act = action.match(/c*(\d)(\d)/);
	let i = act[1];
	let j = act[2];
	state[j][i] = c;
	return state;
}

var drawState = function(state){
	state.map((row) => {
		console.log(row.map((c) => c==0 ? ' ' : c))
	})
}

var stateGen = function(myspot,theirspot,opponentMove){

	return function(s,a){

		var state = strToState(s);

		// Display the current state
		console.log('[PREVIOUS BOARD]'.green);
		drawState(state);

		// Apply the agent's move
		state = applyAction(state,a,myspot);
		console.log('[APPLY ' + myspot + '] '.green + a);
		console.log('[AFTER' + myspot + ' MOVE]'.green);
		drawState(state);

		// Bot won?
		if (stopCrit(myspot,theirspot)(stateToStr(state))){
			console.log('[' + myspot + ' ENDED THE GAME]'.green);
			return Promise.resolve(stateToStr(state));
		}

		// Ask the opponent to generate the next move
		return opponentMove(state,a);
	}
}

/**
 * Ask human player to generate the next state
 * TAOTODO: Haven't tested
 */
var humanGenerateState = function(state){
	prompt.start();
	return new Promise((done,reject)=>
		prompt.get(['move'],(err,res)=>{
			// TAOTODO: valid move?

			// Apply the move
			// Human always uses green check as their move symbol
			state = applyAction(state,res.move,'✅'); 

			console.log('[AFTER YOUR MOVE]'.green);
			drawState(state);

			// Human won?
			let myspot = '✅', theirspot = '❌';
			if (stopCrit(myspot,theirspot)(stateToStr(state))){
				console.log('[YOU ENDED THE GAME]!'.green);
			}

			// Returns the generated state
			done(stateToStr(state))
		})
	);
}

var rewardOfState = function(myspot,theirspot){	

	return function(state){
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

		// They win?
		if (anyWin(rows,theirspot)) return 1;
		// Me win?
		if (anyWin(rows,myspot)) return -1;
		// They are close to win?
		if (anyCloseToWin(rows,theirspot)) return 0.8;
		// Me close to win?
		if (anyCloseToWin(rows,myspot)) return -0.8;

		// Otherwise, random at minimal confidence (0~0.1)
		return Math.random()/10;
	}
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

var stopCrit = function(myspot,theirspot){

	return function(state){

		// Somebody won?
		var cost = rewardOfState(myspot,theirspot)(state);
		console.log(` cost of current state = ${cost}`);
		if (Math.abs(cost)>=1) return true;
		
		// Still there any space to move?
		if (stateToStr(state).indexOf('0')>0) return false;
		else return true;
	}
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


// Play against itself
// but only the first bot will learn from its mistake
function botVsBot(){
	
	// Prepare instances of two bots
	let me, them, autoRecursion;
	var bot1 = ql.newAgent('ox1',actionSet,autoRecursion=true)
		.then(ql.bindRewardMeasure(rewardOfState(me='❌',them='✅')))
		.then(ql.bindActionCostMeasure(actionCost))
		.then(ql.bindStopCriteria(stopCrit(me='❌',them='✅')))
		.then(ql.load('./agent'));

	var bot2 = ql.newAgent('ox2',actionSet,autoRecursion=false)
		.then(ql.bindStateGenerator(
			// @bot2 will only take an action and leave 
			// the game for @bot1 to control
			stateGen(
				me='✅',
				them='❌',
				(state,action) => Promise.resolve(applyAction(state,action,'✅'))
			))
		)
		.then(ql.bindRewardMeasure(rewardOfState(me='✅',them='❌')))
		.then(ql.bindActionCostMeasure(actionCost))
		.then(ql.bindStopCriteria(stopCrit(me='✅',them='❌')))
		.then(ql.load('./agent'));

	// After having @bot2 initialised,
	// bind the move transition to @bot1
	bot1.then(ql.bindStateGenerator(stateGen(me='❌',them='✅',(state,action) => 
		// Hand over to @bot2 to move
		bot2.then(ql.step(state,action,[]))
	)))


	// Let two bots play each other!	
	var alpha = 0.33;
	var board = [
		[0,0,0],
		[0,0,0],
		[0,0,0]
	];

	// Bot1 starts the game
	bot1.then(ql.start(stateToStr(board))) 
		.then(ql.save('./agent'))
		.then((agent) => console.log(agent.name + ' HAS BEEN TRAINED!'.cyan))
		.then(() => {
			// Copy trained @bot1 as @bot2 for later play
			fs.createReadStream('./agent/bot1.agent')
				.pipe(fs.createWriteStream('./agent/ox2.agent'));
			process.exit(0);
		})
}

// Play a bot vs human
function botVsHuman(){
	// TAOTODO:
}


// Main function
botVsBot();

