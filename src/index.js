//General stuff
var misc = require("./misc.js");
exports.POSITIVE_INFINITY = misc.POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;
exports.compareCoord      = misc.compareCoord;

//Stencils
var stencils = require("./stencils.js");
exports.mooreStencil      = stencils.mooreStencil;
exports.vonNeumannStencil = stencils.vonNeumannStencil;
exports.ballStencil       = stencils.ballStencil;

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

//Morphology
var morphology = require("./morphology.js");
exports.dilate    = morphology.dilate;
exports.erode     = morphology.erode;
exports.opening   = morphology.opening;
exports.closing   = morphology.closing;

//Constructive solid geometry
var csg = require("./csg.js");
exports.unite       = csg.unite;
exports.intersect   = csg.intersect;
exports.subtract    = csg.subtract;
exports.complement  = csg.complement;