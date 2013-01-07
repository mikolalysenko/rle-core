"use strict"; "use restrict";

var misc = require("./misc.js");

var compareCoord      = misc.compareCoord
  , bisect            = misc.bisect
  , POSITIVE_INFINITY = misc.POSITIVE_INFINITY
  , NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

//Walk a stencil over a volume
function StencilIterator(volume, stencil, ptrs, coord) {
  this.volume     = volume;
  this.stencil    = stencil;
  this.ptrs       = ptrs;
  this.coord      = coord;
}

//Make a copy of this iterator
StencilIterator.prototype.clone = function() {
  return new StencilIterator(
      volume
    , stencil
    , ptrs.slice(0)
    , coord.slice(0)
  );
}

//Checks if iterator has another value
StencilIterator.prototype.hasNext = function() {
  return this.coord[0] < POSITIVE_INFINITY;
}

//Compute next coordinate with input return value
StencilIterator.prototype.nextCoord_rv = function(ncoord) {
  var runs    = this.volume.runs
    , stencil = this.stencil
    , ptrs    = this.ptrs
    , tcoord  = [0,0,0];
  for(var i=0; i<3; ++i) {
    ncoord[i] = POSITIVE_INFINITY;
  }
  for(var i=0; i<stencil.length; ++i) {
    if(ptrs[i] >= runs.length-1) {
      continue;
    }
    var nr = runs[ptrs[i]+1].coord
      , delta = stencil[i];
    for(var j=0; j<3; ++j) {
      tcoord[j] = nr[j] - delta[j];
    }
    if(lex_compare(tcoord, ncoord) < 0) {
      for(var j=0; j<3; ++j) {
        ncoord[j] = tcoord[j];
      }
    }
  }
  return ncoord;
}

//Compute next coordinate
StencilIterator.prototype.nextCoord = function() {
  var ncoord = [0,0,0];
  this.nextCoord_rv(ncoord);
  return ncoord;
}

//Advance iterator one position
StencilIterator.prototype.next = function() {
  var runs    = this.volume.runs
    , stencil = this.stencil
    , ptrs    = this.ptrs
    , coord   = this.coord;
  
  //Compute next coordinate
  this.nextCoord_rv(coord);
  
  //Advance to next coordinate
outer_loop:
  for(var i=0; i<stencil.length; ++i) {
    if(ptrs[i] >= runs.length-1) {
      continue;
    }
    var nr = runs[ptrs[i]+1].coord
      , delta = stencil[i];
    for(var j=2; j>=0; --j) {
      var t = nr[j] - delta[j];
      if(t < coord[j]) {
        break;
      } else if(t > coord[j]) {
        continue outer_loop;
      }
    }
    //Update pointer
    ++ptrs[i];
  }
}

//Seek to target coordinate
StencilIterator.prototype.seek = function(coord) {
  var runs    = this.volume.runs
    , ptrs    = this.ptrs
    , stencil = this.stencil
    , tcoord  = [0,0,0];
  for(var i=0; i<stencil.length; ++i) {
    var delta = stencil[i];
    for(var j=0; j<3; ++j) {
      tcoord[j] = coord[j] + delta[j];
    }
    ptrs[i] = bisect(runs, 0, runs.length, tcoord);
  }
}

//Creates a stencil iterator
function createStencil(volume, stencil) {
  var ptrs = new Array(stencil.length);
  for(var i=0; i<stencil.length; ++i) {
    ptrs[i] = 0;
  }
  return new StencilIterator(
    this,
    stencil,
    ptrs,
    [NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY]
  );
}

exports.StencilIterator = StencilIterator;
exports.createStencil   = createStencil;
