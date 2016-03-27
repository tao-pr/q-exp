"use strict";

/**
 * Generalisation test
 */

var Gen   = require('../generaliz.js');
var State = require('../state.js');

// Test dataset
var S = [
	new State([1,5,3]),
	new State([2,5,4]),
	new State([2,5,7]),
	new State([1,2,3]),
	new State([0,3,2]),
	new State([2,2,1])
]
var R = [
	3,
	3,
	10,
	10,
	3,
	0
]

const maxIters = 20;
const alpha = 0.2;
Gen.fit(S,R,maxIters,alpha);