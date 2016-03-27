"use strict";

/**
 * State space
 * @author StarColon Projects
 */

class State{
	/**
	 * @param {Array} of state parameters
	 */
	constructor(xs){
		this.xs = xs.slice()
	}

	static newZeroState(nParams){
		var xs = new Array(nParams).fill(0);
		var s  = new State(xs);
		return s
	}

	static eqls(s1,s2){
		return s1.hash()===s2.hash()
	}

	/**
	 * Get a hash-able string of the state
	 */
	get hash(){ return this.xs.join(',') }

	/**
	 * Update the state
	 */
	set state(xs){ this.xs = xs.slice() }

	get state(){ return this.xs }
}



module.exports = State;