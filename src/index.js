var misc = require("./misc.js");
exports.POSITIVE_INFINITY = misc.POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

//Stencils
exports.stencils = {
    MOORE:      misc.MOORE_STENCIL
  , SURFACE:    misc.SURFACE_STENCIL
};

//Iterators
var stencil   = require("./stencil_iterator.js")
  , multi     = require("./multi_iterator.js");
exports.iterators = {
    StencilIterator:    stencil.StencilIterator
  , stencil_begin:      stencil.stencil_begin
  , MultiIterator:      multi.MultiIterator
  , multi_begin:        multi.multi_begin
};

//Binary volumes
exports.binary  = require("./binary_volume.js");
