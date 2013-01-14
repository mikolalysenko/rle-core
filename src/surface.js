"use strict"; "use restrict";

//Import stuff from misc.js
var misc = require("./misc.js");
var NEGATIVE_INFINITY     = misc.NEGATIVE_INFINITY
  , POSITIVE_INFINITY     = misc.POSITIVE_INFINITY
  , EPSILON               = misc.EPSILON
  , CUBE_STENCIL          = misc.CUBE_STENCIL
  , compareCoord          = misc.compareCoord;

//Import stuff from stencil iterator
var createStencil = require("./stencil_iterator.js").createStencil;

//A table of cube edges
var CUBE_EDGES = [
      [6, 7, 0]
    , [5, 7, 1]
    , [3, 7, 2]
    , [0, 1, 0]
    , [0, 2, 1]
    , [0, 4, 2]
    , [1, 3, 1]
    , [1, 5, 2]
    , [2, 3, 0]
    , [2, 6, 2]
    , [4, 5, 0]
    , [4, 6, 1]
  ];

//List of 12-bit masks describing edge crossings
var EDGE_TABLE = new Array(256);
(function() {
  //Precalculate edge crossings
  for(var mask=0; mask<256; ++mask) {
    var e_mask = 0;
    for(var i=0; i<12; ++i) {
      var e = CUBE_EDGES[i];
      if(!(mask & (1<<e[0])) !== !(mask & (1<<e[1]))) {
        e_mask |= (1<<i);
      }
      EDGE_TABLE[mask] = e_mask;
    }
  }
})();

//Create default solid func
var DEFAULT_SOLID_FUNC = new Function("phase", "return !!phase;");

//Extracts a surface from the volume using elastic surface nets
function surface(volume, lo, hi, solid_func) {
  //Handle missing parameters
  if(!lo) {
    lo = [NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY];
  }
  if(!hi) {
    hi = [POSITIVE_INFINITY, POSITIVE_INFINITY, POSITIVE_INFINITY];
  }
  if(!solid_func) {
    solid_func = DEFAULT_SOLID_FUNC;
  }
  //Locals
  var positions   = []
    , faces       = []
    , phases      = []
    , vdistances  = volume.distances
    , vphases     = volume.phases
    , vals        = [0,0,0,0,0,0,0,0]
    , v_ptr       = [0,0,0,0,0,0,0,0]
    , nc          = [0,0,0]
    , nd          = [0,0,0];
  //Get initial iterator
  var iter = createStencil(volume, CUBE_STENCIL);
  iter.seek(lo);
main_loop:
  for(; iter.hasNext(); iter.next()) {
    //Skip coordinates outside range
    var coord = iter.coord;
    for(var i=0; i<3; ++i) {
      if(coord[i] < lo[i] || coord[i] >= hi[i]) {
        continue main_loop;
      }
    }
    //Exit if we are out of bounds
    if(compareCoord(hi, coord) <= 0) {
      break;
    }
    //Read in values and mask
    var ptrs = iter.ptrs
      , mask = 0;
    for(var i=0; i<8; ++i) {
      vals[i] = vdistances[ptrs[i]];
      mask   |= solid_func(vphases[ptrs[i]]) ? 0 : (1 << i);
    }
    if(mask === 0 || mask === 0xff) {
      continue;
    }
    //Compute centroid
    var crossings = EDGE_TABLE[mask]
      , centroid  = [0,0,0]
      , count     = 0;
    for(var i=0; i<12; ++i) {
      if((crossings & (1<<i)) === 0) {
        continue;
      }
      var edge = CUBE_EDGES[i]
        , eu  = edge[0]
        , u   = vals[eu]
        , v   = vals[edge[1]]
        , d   = edge[2];
      for(var j=0; j<3; ++j) {
        if(eu & (1<<j)) {
          centroid[j] -= 1.0-EPSILON;
        }
      }
      centroid[d] -= Math.min(1.0-EPSILON,Math.max(EPSILON, u / (u + v)));
      ++count;
    }
    //Compute vertex
    var coord   = iter.coord
      , weight  = 1.0 / count;
    for(var i=0; i<3; ++i) {
      centroid[i] = coord[i] + centroid[i] * weight;
    }
    //Append vertex
    positions.push(centroid);
    //Advance vertex pointers
outer_loop:
    for(var i=0; i<8; ++i) {
      while(true) {
        if(v_ptr[i] >= positions.length -1) {
          continue outer_loop;
        }
        var p = positions[v_ptr[i]+1];
        for(var j=0; j<3; ++j) {
          nc[j] = coord[j] - ((i&(1<<j)) ? 1 : 0);
          nd[j] = Math.ceil(p[j]);
        }
        var s = compareCoord(nd, nc);
        if(s <=0) {
          ++v_ptr[i];
        }
        if(s >= 0) {
          break;
        }
      }
    }
    //Check if face in bounds
    for(var i=0; i<3; ++i) {
      if(coord[i] <= lo[i]) {
        continue main_loop;
      }
    }
    //Add faces
    var phase0 = vphases[ptrs[7]];
    for(var i=0; i<3; ++i) {
      if(!(crossings & (1<<i))) {
        continue;
      }
      var phase1 = vphases[ptrs[7^(1<<i)]]
        , iu = 1<<((i+1)%3)
        , iv = 1<<((i+2)%3);
      if(mask & 128) {
        phases.push([phase1, phase0]);
        phases.push([phase1, phase0]);
        faces.push([v_ptr[0],  v_ptr[iu], v_ptr[iv]]);
        faces.push([v_ptr[iv], v_ptr[iu], v_ptr[iu+iv]]);
      } else {
        phases.push([phase0, phase1]);
        phases.push([phase0, phase1]);
        faces.push([v_ptr[0],  v_ptr[iv], v_ptr[iu]]);
        faces.push([v_ptr[iu], v_ptr[iv], v_ptr[iu+iv]]);
      }
    }
  }
  return {
    positions:  positions,
    faces:      faces,
    phases:     phases
  };
}

exports.surface         = surface;
