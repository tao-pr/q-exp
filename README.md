# Q-EXP

Hello! Here is a simple implementation of a form of 
[reinforcement learning](http://www.cs.indiana.edu/~gasser/Salsa/rl.html) 
called Q learning.  By fundamental design, Q-EXP stands 
for Q-learning Exploration-Exploitation, one among 
common technical terms in reinforcement learning space.

## Implementation

This library is purely written in [ECMAScript 6](https://github.com/lukehoban/es6features) and runs 
with [Node.js](https://nodejs.org/en/). The implementation paradigm 
of the project tends towards functional programming in order to 
keep operations as simple and highly separable as possible. 

### Entire pipeline inspired by Promise

Promise plays a great role in pipelining all sequential 
and also parallel processings in this library. Every single 
canonical operation of Q-EXP takes its arguments and returns 
the Promise. This makes life easier for pipelining the sequential 
processes or operations for readability and manageability and, 
foremostly, side-effect-free paradigm.

## Sample pipeline of operations

To create an agent, load its learned policy from a physical file, 
then let it choose an action which it *believes* it would 
maximise the reward it would get, you may do this:

```javascript
// Initialisation
var agent = ql
	.newAgent('johndoe',actionSet=['walk','run','sleep'],alpha=0.35)
	.then(ql.bindRewardMeasure( /* reward function here */ ))
	.then(ql.bindActionCostMeasure( /* action cost function here */ ))
	.then(ql.bindStateGenerator( /* state generator here */ ))
	.then(ql.load('./dir')); 

// Start!
agent.then(ql.setState(initialState)) // Let the agent know the state
	.then(ql.step) // Ask the agent to move
	.then(ql.getState) // Now let's see how the agent moved
	.then((state) => /* Do something with the state */)

```


## Licence

This project is released under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) licence.