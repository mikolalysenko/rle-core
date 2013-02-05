"use strict"; "use restrict";

var misc = require("./misc.js");
var POSITIVE_INFINITY = misc.POSITIVE_INFINITY
  , NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

var StencilIterator = require("./stencil_iterator.js").StencilIterator;

var POINTER_LIST = new Array(128);
(function(){
for(var i=0; i<128; ++i) {
  POINTER_LIST[i] = 0;
}
})();

//Multivolume iterator
function MultiIterator(volumes, stencil, ptrs, coord, stencil_len, frontier) {
  this.volumes      = volumes;
  this.stencil      = stencil;
  this.ptrs         = ptrs;
  this.coord        = coord;
  this.stencil_len  = stencil_len;
  this.frontier     = frontier;
}

//Perform a multiway iteration over a collection of volumes
function beginMulti(volumes, stencil) {
  var stencil_len = (stencil.length / 3) | 0;
  if(POINTER_LIST.length < stencil_len) {
    POINTER_LIST.length = stencil_len;
  }
  return new MultiIterator(
    volumes,
    stencil,
    new Int32Array(volumes.length * stencil_len),
    new Int32Array([NEGATIVE_INFINITY,NEGATIVE_INFINITY,NEGATIVE_INFINITY]),
    stencil_len,
    new Uint8Array(volumes.length * stencil_len)
  );
}

//Make a copy of a multivolume iterator
MultiIterator.prototype.clone = function() {
  return new MultiIterator(
    this.volumes,
    this.stencil,
    new Int32Array(this.ptrs),
    new Int32Array(this.coord),
    this.stencil_len
  );
}

//Checks if iterator has another value
MultiIterator.prototype.hasNext = function() {
  return this.coord[0] < POSITIVE_INFINITY;
}

//Advance to next coordinate
MultiIterator.prototype.next = function() {
  var volumes     = this.volumes
    , stencil     = this.stencil
    , ptrs        = this.ptrs
    , coord       = this.coord
    , stencil_len = this.stencil_len
    , frontier    = this.frontier
    , n           = 0
    , idx         = 0;
  for(var i=0; i<3; ++i) {
    coord[i] = POSITIVE_INFINITY;
  }
  for(var vv=0; vv<volumes.length; ++vv) {
    var volume = volumes[vv]
      , coords = volume.coords
      , nruns  = volume.length();
  outer_loop:
    for(var i=0, s=0; i<stencil_len; ++i, s+=3, idx++) {
      var r_ptr = ptrs[idx];
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
      POINTER_LIST[n++] = idx;
    }
  }
  //Clear out frontier
  for(var i=0; i<frontier.length; ++i) {
    frontier[i] = 0;
  }
  //Advance pointers
  for(var i=0; i<n; ++i) {
    var idx = POINTER_LIST[i];
    ++ptrs[idx];
    frontier[idx] = 1;
  }
}

//Seek to coordinate
MultiIterator.prototype.seek = function(coord) {
  var volumes = this.volumes
    , ptrs    = this.ptrs
    , stencil = this.stencil
    , frontier = this
    , tcoord  = new Int32Array(3)
    , idx     = 0;
  for(var i=0; i<3; ++i) {
    this.coord[i] = coord[i];
  }
  for(var k=0; k<volumes.length; ++k) {
    var volume  = volumes[k]
      , vcoords = volume.coords
      , nruns   = volume.length();
    for(var i=0,s=0; i<stencil_len; ++i, s+=3) {
      for(var j=0; j<3; ++j) {
        tcoord[j] = coord[j] + stencil[s+j];
      }
      ptrs[idx]     = volume.bisect(tcoord, 0, nruns-1);
      frontier[idx] = (vcoords[0][ptrs[idx]] === tcoord[0] &&
                       vcoords[1][ptrs[idx]] === tcoord[1] &&
                       vcoords[2][ptrs[idx]] === tcoord[2]);
      ++idx;
    }
  }
}

//Reads the values of all the pointers in the stencil
MultiIterator.prototype.getValues = function(phases, distances) {
  var ptrs        = this.ptrs
    , frontier    = this.frontier
    , idx         = 0;
  for(var i=0; i<this.volumes.length; ++i) {
    var volume      = this.volumes[i]
      , vphases     = volume.phases
      , vdistances  = volume.distances;
    for(var j=0; j<this.stencil_len; ++j) {
      var p           = ptrs[idx];
      phases[idx]     = vphases[p];
      distances[idx]  = frontier[idx] ? vdistances[p] : 1.0;
      ++idx;
    }
  }
}

//Extract an individual component of this iterator
MultiIterator.prototype.subiterator = function(i) {
  var stencil_len = this.stencil_len;
  return new StencilIterator(
    this.volumes[i],
    this.stencil,
    new Int32Array(this.ptrs.subarray(3*stencil_len*i, 3*stencil_len*(i+1))),
    new Int32Array(this.coord)
  );
}

exports.MultiIterator  = MultiIterator;
exports.beginMulti     = beginMulti;
