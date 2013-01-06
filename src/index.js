//General stuff
var misc = require("./misc.js");
exports.POSITIVE_INFINITY = misc.POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;
exports.compareCoord      = misc.compareCoord;

//Stencils
exports.stencils = {
    MOORE:        misc.MOORE_STENCIL
  , SURFACE:      misc.SURFACE_STENCIL
  , VON_NEUMANN:  misc.VON_NEUMANN_STENCIL
};

//Iterators
var stencil   = require("./stencil_iterator.js")
  , multi     = require("./multi_iterator.js");
exports.iterators = {
    StencilIterator:    stencil.StencilIterator
  , createStencil:      stencil.createStencil
  , MultiIterator:      multi.MultiIterator
  , createMultiStencil: multi.createMultiStencil
};

//Binary volumes
exports.binary  = require("./binary_volume.js");
