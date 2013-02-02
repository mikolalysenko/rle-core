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
  this.runs         = runs;
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
    , vptrs       = this.ptrs
    , coord       = this.coord
    , stencil_len = this.stencil_len
    , top         = 0
    , shift       = 3 * stencil_len;
  for(var i=0; i<3; ++i) {
    coord[i] = POSITIVE_INFINITY;
  }
  for(var n=0, base=0; n<volumes.length; ++n, base+=shift) {
    var volume = volumes[n]
      , coords = volume.coords
      , nruns  = volume.length();
    
    
outer_loop:
    for(var i=0; i<stencil_len; ++i) {
      var r_ptr = ptrs[i];
      if(r_ptr >= runs.length - 1) {
        continue;
      }
      
      r_ptr += 1;
      for(var j=2; j>=0; --j) {
        var t = coords[j][r_ptr] - delta[j]
          , u = coord[j];
        if(t < u) {
          coord[j--] = u;
          for(; j>=0; --j) {
            coord[j] = coords[j][r_ptr] - delta[j];
          }
          top = 0;
          break;
        } else if(t > u) {
          continue outer_loop;
        }
      }
      POINTER_LIST[top++] = n;
      POINTER_LIST[top++] = i;
    }
  }
  for(var i=0; i<top; i+=2) {
    ++ptrs[POINTER_LIST[i]][POINTER_LIST[i+1]];
  }
}

//Seek to coordinate
MultiIterator.prototype.seek = function(coord) {
  var volumes = this.volumes
    , vptrs   = this.ptrs
    , stencil = this.stencil
    , tcoord  = [0,0,0];
  for(var i=0; i<3; ++i) {
    this.coord[i] = tcoord[i];
  }
  for(var k=0; k<volumes.length; ++k) {
    var volume  = volumes[k]
      , nruns   = volume.length()
      , ptrs    = vptrs[k];
    for(var i=0; i<stencil.length; ++i) {
      delta = stencil[i];
      for(var j=0; j<3; ++j) {
        tcoord[j] = coord[j] + delta[j];
      }
      ptrs[i] = volume.bisect(tcoord, 0, nruns-1);
    }
  }
}

//Returns the phases at the current iterator position
MultiIterator.prototype.phases = function(result) {
  var volumes = this.volumes
    , vptrs   = this.ptrs;
  if(!result) {
    var result = new Array(this.volumes.length);
    for(var i=0; i<result.length; ++i) {
      var vphases = volumes[i].phases
        , ptrs    = vptrs[i];
      var tmp = new Array(ptrs.length);
      for(var j=0; j<ptrs.length; ++j) {
        tmp[j] = vphases[ptrs[j]];
      }
      result[i] = tmp;
    }
    return result;
  }
  for(var i=0; i<result.length; ++i) {
    var vphases = volumes[i].phases
      , ptrs    = vptrs[i]
      , tmp     = result[i];
    for(var j=0; j<ptrs.length; ++j) {
      tmp[j] = vphases[ptrs[j]];
    }
  }
  return result;
}

//Returns the distances at the current iterator position
MultiIterator.prototype.distances = function(result) {
  var volumes = this.volumes
    , vptrs   = this.ptrs;
  if(!result) {
    var result = new Array(this.volumes.length);
    for(var i=0; i<result.length; ++i) {
      var vdistances  = volumes[i].distances
        , ptrs        = vptrs[i];
      var tmp = new Array(ptrs.length);
      for(var j=0; j<ptrs.length; ++j) {
        tmp[j] = vdistances[ptrs[j]];
      }
      result[i] = tmp;
    }
    return result;
  }
  for(var i=0; i<result.length; ++i) {
    var vdistances  = volumes[i].distances
      , ptrs        = vptrs[i]
      , tmp         = result[i];
    for(var j=0; j<ptrs.length; ++j) {
      tmp[j] = vdistances[ptrs[j]];
    }
  }
  return result;
}

exports.MultiIterator  = MultiIterator;
exports.beginMulti     = beginMulti;
