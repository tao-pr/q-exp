# Q-EXP

https://github.com/starcolon/q-exp

[Reinforcement Learning](http://www.cs.indiana.edu/~gasser/Salsa/rl.html) 
with Q-learning technique for Node.js app. 
It also provides policy generalisation in-built.

---

## Installation

```bash
$ npm install q-exp
```

---

## Usage

>To include `q-exp` library to your **Node.js** app:

```javascript
var qexp = require('q-exp');
```

Read the instructions all the way down to learn how to use.

---

## Features included

>To make reinforcement learning works end-to-end, 
we implement and include the following features.

- Q-learning
- Exploration-exploitation
- Generalisation with Gradient descent
- Sample usages (Tic-tac-toe and falling-stones)

---

## Usage

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

---

## Sample #1 - Tic tac toe

![Tictactoe](/media/ss-tictactoe.png)

A quick sample implementation is a classic [tic-tac-toe game](https://en.wikipedia.org/wiki/Tic-tac-toe), source code available at 
[/sample/tictactoe.js](https://github.com/starcolon/q-exp/blob/master/sample/tictactoe.js). This sample does not make use of generalisation, 
just a plain exploration-exploitation.

#### To play against the trained tic-tac-toe bot:

```
	$ cd sample
	$ node tictactoe.js play
```

>After having your agent intensively trained for thousands games, 
you'll eventually find out how strong your bot has become.


#### To train the bot

```bash
	$ cd sample
	$ ./train-tictactoe
```

---

## Sample #2 - Falling stones

![Falling stones](/media/ss-falling-stones.png)

Another classic game where two stones are falling from the 
top edge of the screen at random position. The player are forced 
to move left or right to escape from those falling stones. 
If a stone fall onto the player, the game is over.

This sample makes use of `generalisation` so it can 
survive longer even you train it for just ten or twenty games.

To run it:

```bash
	$ cd sample
	$ node falling-stones.js
```

#### Benchmark 

After generalisation, the agent can survive slightly longer. 
However we just fit the reward space with linear plane 
which might not well fit critical cases. It doesn't 
guarantee convergence.

Y axis represents the number of moves it survives in a game.

![Benchmark](/media/falling-stones-benchmark.png)


## Licence

This project is released under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) licence.