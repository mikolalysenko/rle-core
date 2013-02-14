"use strict"; "use restrict";

//General stuff
var misc = require("./lib/misc.js");
exports.compareCoord      = misc.compareCoord;
exports.saturateAbs       = misc.saturateAbs;
exports.EPSILON           = misc.EPSILON;
exports.POSITIVE_INFINITY = misc.POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

//Basic data types
var volume = require("./lib/volume.js");
exports.DynamicVolume     = volume.DynamicVolume;
exports.StaticVolume      = volume.StaticVolume;

//Iterators
var stencil = require("./lib/stencil_iterator.js");
exports.StencilIterator   = stencil.StencilIterator;
exports.beginStencil      = stencil.beginStencil;

var multi = require("./lib/multi_iterator.js");
exports.MultiIterator     = multi.MultiIterator;
exports.beginMulti        = multi.beginMulti;
