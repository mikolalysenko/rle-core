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
function StencilIterator(volume, stencil, ptrs, coord, frontier) {
  this.volume     = volume;
  this.stencil    = stencil;
  this.ptrs       = ptrs;
  this.coord      = coord;
  this.frontier   = frontier;
  
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
    , new Uint8Array(this.frontier)
  );
}

//Checks if iterator has another value
StencilIterator.prototype.hasNext = function() {
  return this.coord[0] < POSITIVE_INFINITY;
}

//Advance iterator one position
StencilIterator.prototype.next = function() {
  var coords    = this.volume.coords
    , nruns     = this.volume.length()
    , frontier  = this.frontier
    , stencil   = this.stencil
    , ptrs      = this.ptrs
    , coord     = this.coord
    , n         = 0;
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
  //Clear frontier
  for(var i=0; i<ptrs.length; ++i) {
    frontier[i] = 0;
  }
  //Advance pointers
  for(var i=0; i<n; ++i) {
    var idx = POINTER_LIST[i]
    ++ptrs[idx];
    frontier[idx] = 1;
  }
}

//Seek to target coordinate
StencilIterator.prototype.seek = function(coord) {
  var volume    = this.volume
    , vcoords   = volume.coords
    , nruns     = volume.length()
    , ptrs      = this.ptrs
    , stencil   = this.stencil
    , frontier  = this.frontier
    , tcoord    = new Int32Array(3);
  for(var i=0; i<3; ++i) {
    this.coord[i] = coord[i];
  }
  for(var i=0,s=0; i<ptrs.length; ++i, s+=3) {
    for(var j=0; j<3; ++j) {
      tcoord[j] = coord[j] + stencil[s+j];
    }
    ptrs[i] = volume.bisect(tcoord, 0, nruns-1);
    frontier[i] = (vcoords[0][ptrs[i]] === tcoord[0] &&
                   vcoords[1][ptrs[i]] === tcoord[1] &&
                   vcoords[2][ptrs[i]] === tcoord[2]);
  }
}

//Reads the values of all the pointers in the stencil
StencilIterator.prototype.getValues = function(phases, distances) {
  var ptrs        = this.ptrs
    , frontier    = this.frontier
    , vphases     = this.volume.phases
    , vdistances  = this.volume.distances;
  for(var i=0; i<ptrs.length; ++i) {
    var p = ptrs[i];
    phases[i]     = vphases[p];
    distances[i]  = frontier[i] ? vdistances[p] : 1.0;
  }
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
    coord,
    new Uint8Array(ptrs.length)
  );
}

exports.StencilIterator = StencilIterator;
exports.beginStencil    = beginStencil;
