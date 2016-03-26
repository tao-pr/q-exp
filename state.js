/**
 * State space
 * @author StarColon Projects
 */

class State{
	/**
	 * @param {Array} of state parameters
	 */
	constructor(xs){
		this.xs = []
	}

	static newZeroState(nParams){
		xs = new Array(nParams).fill(0);
		s  = new State(xs);
		return s
	}

	static eqls(s1,s2){
		return s1.hash()===s2.hash()
	}

	/**
	 * Get a hash-able string of the state
	 */
	get hash(){
		return this.xs.join(',')
	}

	/**
	 * Update the state
	 */
	set state(xs){
		this.xs = xs.slice()
	}
}



module.exports = State;