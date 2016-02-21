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

The sample pipeline can be written as follows.

```
ql.newAgent('johndoe',['walk','run','standstill'])
	.then(ql.bindRewardMeasure(...))
	.then(ql.bindActionCostMeasure(...))
	.then(ql.bindStopCriteria(...)))
	.then(ql.start('walking'));
```

Each of the operation (represented in each individual line), 
has absolutely no coupling dependencies with its proceeding 
or succeeding piped operation at all. It just takes an input 
(which is an agent instance), passes it over for processing.