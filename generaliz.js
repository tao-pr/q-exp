"use stricts";

/**
 * Reinforcement Learning Generalisation Module
 * @author StarColon Projects
 */

var generaliz = {}
var $_        = require('sylvester');
var State     = require('./state.js');
var colors    = require('colors');

/**
 * Y = AX, where both X and Y are vectors
 * x : state
 * y : estimated reward
 * a : affine transformation
 */
generaliz.fit = function(states,rewards,maxIters,alpha){
	// Initialise linear coefficient vector
	var dim = states[0].state.length;
	var ϴ   = $V(new Array(dim+1).fill(1))

	// Iterate until ϴ converges
	return gradientDescent(ϴ,states,rewards,maxIters,alpha)
}

/**
 * Iteratively minimising the error function
 */
function gradientDescent(ϴ,states,rewards,nIters,alpha){
	if (nIters<=0)
		return ϴ;

	console.log(`Iteration #${nIters}`.green);

	// Simple Linear approximation:
	// R`(ϴ,S) = θ0 + θ1s1 + θ2s2 + ... θNsN, N = dim(states)

	// Approximation square error (scalar):
	// E(ϴ,S)  = (1/N) Σ(R(S)-R`(ϴ))², R is an actual reward

	// Gradient of error:
	// ∇(ϴ,S)    = δE(ϴ,S) δθ
	var G = gradientE(ϴ,states,rewards);

	// Update the linear coeff by gradient
	var ϴ = ϴ.map((θ,i) => θ-alpha*G[i]);

	// Repeat
	return gradientDescent(ϴ,states,rewards,nIters-1,alpha)
}

function gradientE(ϴ,states,rewards){
	var N = parseFloat(states.length);
	// Error of n-th state sample
	function E(n,i){ 
		var Sn = [1].concat(states[n].state); // S[0] = 1
		return rewards[n] - Sn.reduce((sum,s,k) => sum+s*ϴ[k],0);
	}
	// Total δE/δ
	function sumError(i){
		var e = 0;
		for (var n=0; n<N; n++) e += E(n,i);
		return e;
	}
	function gradient(θ,i){
		var gradE = (-2/N)*sumError(i)
	}

	var G = ϴ.map(gradient);
	console.log('   ∇ : '.yellow,G);
	return G;
}


module.exports = generaliz;