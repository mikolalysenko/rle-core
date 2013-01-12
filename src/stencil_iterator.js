"use strict"; "use restrict";

var misc = require("./misc.js");

var compareCoord      = misc.compareCoord
  , bisect            = misc.bisect
  , POSITIVE_INFINITY = misc.POSITIVE_INFINITY
  , NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

var POINTER_LIST = new Array(128);
(function(){
for(var i=0; i<128; ++i) {
  POINTER_LIST[i] = 0;
}
})();

//Walk a stencil over a volume
function StencilIterator(volume, stencil, ptrs, coord) {
  this.volume     = volume;
  this.stencil    = stencil;
  this.ptrs       = ptrs;
  this.coord      = coord;
  
  //Resize internal buffer
  if(POINTER_LIST.length < stencil.length) {
    POINTER_LIST.length = stencil.length;
    for(var i=0; i<POINTER_LIST.length; ++i) {
      POINTER_LIST[i] = 0;
    }
  }
}

//Make a copy of this iterator
StencilIterator.prototype.clone = function() {
  return new StencilIterator(
      this.volume
    , this.stencil
    , this.ptrs.slice(0)
    , this.coord.slice(0)
  );
}

//Checks if iterator has another value
StencilIterator.prototype.hasNext = function() {
  return this.coord[0] < POSITIVE_INFINITY;
}

//Compute next coordinate
StencilIterator.prototype.nextCoord = function() {
  var ncoord = [0,0,0]
    , runs    = this.volume.runs
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
    if(compareCoord(tcoord, ncoord) < 0) {
      for(var j=0; j<3; ++j) {
        ncoord[j] = tcoord[j];
      }
    }
  }
  return ncoord;
}


//Advance iterator one position
StencilIterator.prototype.next = function() {
  var runs    = this.volume.runs
    , stencil = this.stencil
    , ptrs    = this.ptrs
    , coord   = this.coord
    , tcoord  = [0,0,0]
    , n       = 0;
  
  //Push coordinate to infinity
  for(var i=0; i<3; ++i) {
    coord[i] = POSITIVE_INFINITY;
  }
  
  //Loop through runs, find maximum pointer
outer_loop:
  for(var i=0; i<stencil.length; ++i) {
    if(ptrs[i] >= runs.length-1) {
      continue;
    }
    var nr = runs[ptrs[i]+1].coord
      , delta = stencil[i];
    for(var j=2; j>=0; --j) {
      var t = nr[j] - delta[j]
        , u = coord[j];
      if(t < u) {
        coord[j--] = t;
        for(; j>=0; --j) {
          coord[j] = nr[j] - delta[j];
        }
        POINTER_LIST[0] = i;
        n = 1;
        continue outer_loop;
      } else if(t > u) {
        continue outer_loop;
      }
    }
    POINTER_LIST[n++] = i;
  }

  //Advance pointers
  for(var i=0; i<n; ++i) {
    ++ptrs[POINTER_LIST[i]];
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
    ptrs[i] = Math.max(0, bisect(runs, 0, runs.length-1, tcoord)) ;
  }
}

//Creates a stencil iterator
function createStencil(volume, stencil) {
  var ptrs = new Array(stencil.length);
  for(var i=0; i<stencil.length; ++i) {
    ptrs[i] = 0;
  }
  return new StencilIterator(
    volume,
    stencil,
    ptrs,
    [NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY]
  );
}

exports.StencilIterator = StencilIterator;
exports.createStencil   = createStencil;
