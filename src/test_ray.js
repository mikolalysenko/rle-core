"use strict"; "use restrict";

var misc = require("./misc.js");

var NEGATIVE_INFINITY   = misc.NEGATIVE_INFINITY
  , POSITIVE_INFINITY   = misc.POSITIVE_INFINITY
  , EPSILON             = misc.EPSILON
  , bisect              = misc.bisect;

//Check if region is on boundary
function isBoundary(lo, hi) {
  for(var j=2; j>=0; --j) {
    if(hi[j] > lo[j]+1) {
      return false;
    } else if(hi[j] < lo[j]+1) {
      return true;
    }
  }
  return false;
}

//Intersect ray with axis-aligned face
function faceIntersect(
    x     //Ray origin
  , dir   //Ray direction
  , p     //Face level
  , axis  //Face axis
  , lo_u, hi_u  //Face u-limits
  , lo_v, hi_v  //Face v-limits
  ) {

  if(Math.abs(dir[axis]) < EPSILON) {
    return Number.POSITIVE_INFINITY;
  }
  var t = (p - x[axis]) / dir[axis];
  if(t < EPSILON) {
    return Number.POSITIVE_INFINITY;
  }

  var u = (axis+1)%3
    , v = (axis+2)%3;
  
  var a = x[u] + dir[u] * t
    , b = x[v] + dir[v] * t;
  
  if(a < lo_u || a >= hi_u || b < lo_v || b >= hi_v) {
    return Number.POSITIVE_INFINITY;
  }
  return t;
}

//Step through an interval
function traceInterval(x, dir, lo, hi) {

  var min_t = Number.POSITIVE_INFINITY;
  
  //Check x-faces
  if(dir[0] < -EPSILON) {
    min_t = faceIntersect(x, dir,
      lo[0], 0,
      NEGATIVE_INFINITY, lo[1]+1,
      NEGATIVE_INFINITY, lo[2]+1);
  } else if(dir[0] > EPSILON) {
    min_t = faceIntersect(x, dir,
      hi[0], 0,
      hi[1], POSITIVE_INFINITY,
      hi[2], POSITIVE_INFINITY);
  }
  
  //Check y-faces
  if(dir[1] < -EPSILON) {
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[1], 1,
      NEGATIVE_INFINITY, lo[2]+1,
      lo[0], POSITIVE_INFINITY));
      
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[1]+1, 1,
      NEGATIVE_INFINITY, lo[2]+1,
      NEGATIVE_INFINITY, lo[0]));
  } else if(dir[1] > EPSILON) {
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[1]+1, 1,
      hi[2], POSITIVE_INFINITY,
      NEGATIVE_INFINITY, hi[0]));
      
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[1], 1,
      hi[2], POSITIVE_INFINITY,
      hi[0], POSITIVE_INFINITY));
  }
  
  //Check z-faces
  if(dir[2] < -EPSILON) {
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[2], 2,
      lo[0], POSITIVE_INFINITY,
      lo[1], lo[1]+1));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[2], 2,
      NEGATIVE_INFINITY, POSITIVE_INFINITY,
      lo[1]+1, POSITIVE_INFINITY));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[2]+1, 2,
      NEGATIVE_INFINITY, POSITIVE_INFINITY,
      NEGATIVE_INFINITY, lo[1]));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      lo[2]+1, 2,
      NEGATIVE_INFINITY, lo[0],
      lo[1], lo[1]+1));
  } else if(dir[2] > EPSILON) {
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[2]+1, 2,
      NEGATIVE_INFINITY, hi[0],
      hi[1], hi[1]+1));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[2]+1, 2,
      NEGATIVE_INFINITY, POSITIVE_INFINITY,
      NEGATIVE_INFINITY, hi[1]));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[2], 2,
      NEGATIVE_INFINITY, POSITIVE_INFINITY,
      hi[1]+1, POSITIVE_INFINITY));
    
    min_t = Math.min(min_t, faceIntersect(x, dir,
      hi[2], 2,
      hi[0], POSITIVE_INFINITY,
      hi[1], hi[1]+1));
  }
  
  //Return step
  return min_t;
}

//Step a ray against a surface
function intersectSurface(x, dir, vals) {
  for(var i=0; i<vals.length; ++i) {
    if(vals[i] >= 0) {
      return 0;
    }
  }
  return -1;
}

var DEFAULT_SOLID_FUNC = new Function("p", "return !!p;");

//Test a ray against the volume
function testRay(volume, origin, direction, max_t, solid_func) {
  if(!max_t) {
    max_t = Number.POSITIVE_INFINITY;
  }
  if(!solid_func) {
    solid_func = DEFAULT_SOLID_FUNC;
  }
  //Unpack local variables
  var runs  = volume.runs
    , x     = origin.slice(0)
    , ix    = [0,0,0]
    , fx    = [0,0,0]
    , y     = [0,0,0]
    , t     = 0.0
    , vals  = [0,0,0,0,0,0,0,0];
outer_loop:
  while(t <= max_t) {
    //Get integer/faction parts of coordinate
    for(var i=0; i<3; ++i) {
      ix[i] = Math.floor(x[i]);
      fx[i] = x[i] - ix[i];
    }
    //Locate pointer
    var ptr = bisect(runs, 0, runs.length-1, ix);
    //Get bounds on run
    var lo = runs[ptr].coord;
    if(ptr < runs.length-1) {
      var hi = runs[ptr+1].coord;
    } else {
      var hi = [POSITIVE_INFINITY, POSITIVE_INFINITY, POSITIVE_INFINITY];
    }
    //Check if on boundary
    if(isBoundary(lo, hi) || runs[ptr].value >= 0) {
      //Get boundary value
      var n = 0;
      for(var dz=0; dz<2; ++dz) {
        y[2] = ix[2]+dz;
        for(var dy=0; dy<2; ++dy) {
          y[1] = ix[1]+dy;
          for(var dx=0; dx<2; ++dx) {
            y[0] = ix[0]+dx;
            vals[n++] = runs[bisect(runs, 0, runs.length-1, y)].value;
          }
        }
      }
      //Check surface intersection
      var step = intersectSurface(fx, direction, vals);
      if(step >= 0) {
        for(var i=0; i<3; ++i) {
          x[i] += step * direction[i];
        }
        t += step;
        return {hit: true, t:t, x:x};
      }
    }
    //Step along ray
    var step = traceInterval(x, direction, lo, hi) + EPSILON;
    for(var i=0; i<3; ++i) {
      x[i] += step * direction[i];
    }
    t += step;
    //Check bounds
    for(var i=0; i<3; ++i) {
      if(x[i] <= NEGATIVE_INFINITY+1 || x[i] >= POSITIVE_INFINITY-1) {
        t = Number.POSITIVE_INFINITY;
        break outer_loop;
      }
    }
  }
  return {hit: false, t:max_t, x:x};
}

exports.testRay = testRay;
