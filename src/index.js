//General stuff
var misc = require("./misc.js");
exports.POSITIVE_INFINITY = misc.POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;
exports.compareCoord      = misc.compareCoord;

//Basic data types
var volume = require("./volume.js");
exports.Run     = volume.run;
exports.Volume  = volume.Volume;
exports.empty   = volume.empty;

//Sampling
exports.sample = require("./sample.js").sample;

//Surface extraction
exports.surface = require("./surface.js").surface;

//In place updates and morphological processing
exports.apply = require("./apply.js").apply;

//Merging of multiple volumes
exports.merge = require("./merge.js").merge;

//Classifiers
exports.testPoint = require("./test_point.js").testPoint;
exports.testRay = require("./test_ray.js").testRay;

//Connected components
var components = require("./components.js");
exports.labelComponents   = components.labelComponents;
exports.splitComponents   = components.splitComponents;

//Stencils
exports.LpStencil = require("./stencils.js").LpStencil;

