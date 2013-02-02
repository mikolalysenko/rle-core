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
function MultiIterator(volumes, stencil, ptrs, coord, stencil_len) {
  this.volumes      = volumes;
  this.stencil      = stencil;
  this.ptrs         = ptrs;
  this.coord        = coord;
  this.stencil_len  = stencil_len;
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
    stencil_len
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
  //Advance pointers
  for(var i=0; i<n; ++i) {
    ++ptrs[POINTER_LIST[i]];
  }
}

//Seek to coordinate
MultiIterator.prototype.seek = function(coord) {
  var volumes = this.volumes
    , ptrs    = this.ptrs
    , stencil = this.stencil
    , tcoord  = new Int32Array(3)
    , idx     = 0;
  for(var i=0; i<3; ++i) {
    this.coord[i] = coord[i];
  }
  for(var k=0; k<volumes.length; ++k) {
    var volume  = volumes[k]
      , nruns   = volume.length();
    for(var i=0,s=0; i<stencil_len; ++i, s+=3) {
      for(var j=0; j<3; ++j) {
        tcoord[j] = coord[j] + stencil[s+j];
      }
      ptrs[idx++] = volume.bisect(tcoord, 0, nruns-1) ;
    }
  }
}

exports.MultiIterator  = MultiIterator;
exports.beginMulti     = beginMulti;
