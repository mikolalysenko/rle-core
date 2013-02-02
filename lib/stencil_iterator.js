"use strict"; "use restrict";

var misc = require("./misc.js");

var POSITIVE_INFINITY = misc.POSITIVE_INFINITY
  , NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

var POINTER_LIST = new Int32Array(128);
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
  if(3*POINTER_LIST.length < stencil.length) {
    POINTER_LIST = new Int32Array(stencil.length/3);
  }
}

//Make a copy of this iterator
StencilIterator.prototype.clone = function() {
  return new StencilIterator(
      this.volume
    , this.stencil
    , new Int32Array(this.ptrs)
    , new Int32Array(this.coord)
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
    , n       = 0;
  //Push coordinate to infinity
  for(var i=0; i<3; ++i) {
    coord[i] = POSITIVE_INFINITY;
  }
  //Loop through runs, find maximum pointer
outer_loop:
  for(var i=0, s=0; i<ptrs.length; ++i, s+=3) {
    var r_ptr = ptrs[i];
    if(r_ptr >= nruns-1) {
      continue;
    }
    r_ptr += 1;
    for(var j=2; j>=0; --j) {
      var t = coords[j][r_ptr] - stencil[s+j]
        , u = coord[j];
      if(t < u) {
        coord[j--] = t;
        for(; j>=0; --j) {
          coord[j] = coords[j][r_ptr] - stencil[s+j];
        }
        n = 0;
        break;
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
  var volume  = this.volume
    , nruns   = volume.length()
    , ptrs    = this.ptrs
    , stencil = this.stencil
    , tcoord  = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    this.coord[i] = coord[i];
  }
  for(var i=0,s=0; i<ptrs.length; ++i, s+=3) {
    for(var j=0; j<3; ++j) {
      tcoord[j] = coord[j] + stencil[s+j];
    }
    ptrs[i] = volume.bisect(tcoord, 0, nruns-1) ;
  }
}

//Retrieve phases at current iterator position
StencilIterator.prototype.phases = function(result) {
  var vphases = this.volume.phases
    , ptrs    = this.ptrs
    , n       = ptrs.length;
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
  for(var i=0; i<n; ++i) {
    result[i] = vdistances[ptrs[i]];
  }
  return result;
}

//Creates a stencil iterator
function beginStencil(volume, stencil) {
  var ptrs = new Int32Array(stencil.length / 3);
  var coord = new Int32Array(3);
  coord[0] = coord[1] = coord[2] = NEGATIVE_INFINITY;
  return new StencilIterator(
    volume,
    stencil,
    ptrs,
    coord
  );
}

exports.StencilIterator = StencilIterator;
exports.beginStencil    = beginStencil;
