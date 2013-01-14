"use strict"; "use restrict";

//General stuff
var misc = require("./src/misc.js");
exports.EPSILON           = misc.EPSILON;
exports.POSITIVE_INFINITY = misc.POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;
exports.compareCoord      = misc.compareCoord;

//Basic data types
var volume = require("./src/volume.js");
exports.Volume  = volume.Volume;
exports.empty   = volume.empty;

//Iterators
var stencil = require("./src/stencil_iterator.js");
exports.StencilIterator = stencil.StencilIterator;
exports.beginStencil    = stencil.beginStencil;

var multi = require("./src/multi_iterator.js");
exports.MultiIterator   = multi.MultiIterator;
exports.beginMulti      = multi.beginMulti;

//Implicit function -> Level set conversion
exports.sample = require("./src/sample.js").sample;
