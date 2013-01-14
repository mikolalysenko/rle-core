"use strict"; "use restrict";

var misc = require("./misc.js");

var POSITIVE_INFINITY = misc.POSITIVE_INFINITY
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

//Advance iterator one position
StencilIterator.prototype.next = function() {
  var coords  = this.volume.coords
    , nruns   = this.volume.length()
    , stencil = this.stencil
    , ptrs    = this.ptrs
    , coord   = this.coord
    , tcoord  = [0,0,0]
    , n       = 0
    , nptrs   = this.stencil.length;
  //Push coordinate to infinity
  for(var i=0; i<3; ++i) {
    coord[i] = POSITIVE_INFINITY;
  }
  //Loop through runs, find maximum pointer
outer_loop:
  for(var i=0; i<nptrs; ++i) {
    var r_ptr = ptrs[i];
    if(r_ptr >= nruns-1) {
      continue;
    }
    var delta = stencil[i]
      , n_ptr = r_ptr+1;
    for(var j=2; j>=0; --j) {
      var t = coords[j][n_ptr] - delta[j]
        , u = coord[j];
      if(t < u) {
        coord[j--] = t;
        for(; j>=0; --j) {
          coord[j] = coords[j][n_ptr] - delta[j];
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
  var nruns   = this.volume.length()
    , ptrs    = this.ptrs
    , stencil = this.stencil
    , tcoord  = [0,0,0];
  for(var i=0; i<3; ++i) {
    this.coord[i] = coord[i];
  }
  for(var i=0; i<stencil.length; ++i) {
    var delta = stencil[i];
    for(var j=0; j<3; ++j) {
      tcoord[j] = coord[j] + delta[j];
    }
    ptrs[i] = this.volume.bisect(tcoord, 0, nruns-1) ;
  }
}

//Compute next coordinate
StencilIterator.prototype.nextCoord = function(ncoord) {
  if(!ncoord) {
    ncoord = new Array(3);
  }
  var vcoords = this.volume.coords
    , nruns   = this.volume.length()
    , stencil = this.stencil
    , ptrs    = this.ptrs;
  for(var i=0; i<3; ++i) {
    ncoord[i] = POSITIVE_INFINITY;
  }
  for(var i=0; i<stencil.length; ++i) {
    var r_ptr = ptrs[i];
    if(r_ptr >= nruns-1) {
      continue;
    }
    var delta = stencil[i];
    for(var j=2; j>=0; --j) {
      var t = coords[j][r_ptr] - delta[j]
        , u = ncoord[j];
      if(t < u) {
        ncoord[j--] = t;
        for(; j>=0; --j) {
          ncoord[j] = coords[j][r_ptr] - delta[j];
        }
      } else if(t > u) {
        break;
      }
    }
  }
  return ncoord;
}

//Retrieve phases at current iterator position
StencilIterator.prototype.phases = function(result) {
  var vphases = this.volume.phases
    , ptrs    = this.ptrs
    , n       = ptrs.length;
  if(!result) {
    result = new Array(n);
  }
  for(var i=0; i<n; ++i) {
    result[i] = vphases[ptrs[i]];
  }
  return result;
}

//Retrieve distances at current iterator position
StencilIterator.prototype.distances = function(result) {
  var vdistances  = this.volume.distances
    , ptrs        = this.ptrs
    , n           = ptrs.length;
  if(!result) {
    result = new Array(n);
  }
  for(var i=0; i<n; ++i) {
    result[i] = vdistances[ptrs[i]];
  }
  return result;
}

//Creates a stencil iterator
function beginStencil(volume, stencil) {
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
exports.beginStencil    = beginStencil;
