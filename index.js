"use strict"; "use restrict";

//General stuff
var misc = require("./lib/misc.js");
exports.EPSILON           = misc.EPSILON;
exports.POSITIVE_INFINITY = misc.POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;
exports.compareCoord      = misc.compareCoord;

//Basic data types
var volume = require("./lib/volume.js");
exports.Volume  = volume.Volume;
exports.empty   = volume.empty;

//Implicit function -> Level set conversion
exports.sample = require("./lib/sample.js").sample;

//Iterators
var stencil = require("./lib/stencil_iterator.js");
exports.StencilIterator = stencil.StencilIterator;
exports.beginStencil    = stencil.beginStencil;

var multi = require("./lib/multi_iterator.js");
exports.MultiIterator   = multi.MultiIterator;
exports.beginMulti      = multi.beginMulti;
