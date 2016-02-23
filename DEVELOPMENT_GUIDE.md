# Development Guideline

This document will guide you through how the library 
is implemented, what is the development perspective 
under the hood.

## Reinforcement Learning

Q-EXP library makes use of Q learning as its primary 
algorithm for exploiting reinforcement learning. 
The strategy the agent needs to learn requires mapping 
into a well-formed action-value function. The environment 
state is measured by the agent using known measuring function 
as each action has been taken, time-to-time.

## Structure of the library

As mentioned in README.md, the library structures its 
processing pipeline using ES6 Promise-like. The sequence 
of operation splits its inner states from each other 
and keeps the dependency between any two subsequent operations 
zero (theoretically). Each of the operation takes an input, 
processes on its own, then passes over the output to 
the next operation over Promise.

## Dependencies

Since the library is built with `npm`, you can have all 
its dependencies installed and ready with a simple command.

```bash
	$ npm install
```

Preferrable versions:

	- [x] NPM 2.14 or newer
	- [x] node 4.2 or newer

**Caveat:** The older versions of `node` are not guaranteed 
working due to the extensive use of ES6 syntaxes.

## Sample pipeline usage

A quick sample of playing `tic-tac-toe` game with 
some strategies learned with Q-learning is shipped with 
the library. You can find it under the `/sample` directory.

#### To run a bot-vs-bot game

Run the following command:

```
$ cd sample
$ node tictactoe.js
```

#### To train a batch of games

We have the script ready for this:

```
$ cd sample
$ ./train-tictactoe
```


