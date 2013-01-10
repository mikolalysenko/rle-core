//General stuff
var misc = require("./misc.js");
exports.POSITIVE_INFINITY = misc.POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;
exports.compareCoord      = misc.compareCoord;

//Stencils
exports.stencils = require("./stencils.js");

//Basic volume processing stuff
var volume = require("./volume.js");
exports.Run     = volume.run;
exports.Volume  = volume.Volume;
exports.sample  = volume.sample;

//Surface extraction
exports.surface = require("./surface.js").surface;

//In place updates and morphological processing
var map = require("./map.js");
exports.map       = map.map;
exports.dilate    = map.dilate;
exports.erode     = map.erode;
exports.opening   = map.opening;
exports.closing   = map.closing;
