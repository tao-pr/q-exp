"use strict";
/**
 * Circle drawing bot using RL with generalisation
 * @author StarColon Projects
 */

var colors = require('colors');
var prompt = require('prompt');
var _      = require('underscore');
var ql     = require('../main.js');
var State  = require('../state.js');
var fs     = require('fs');

ql.isVerbose = true; // Make sure it's gonna go verbose

var brush = {}