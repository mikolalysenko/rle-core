"use strict"; "use restrict";

var misc = require("./misc.js");
var saturateAbs       = misc.saturateAbs;
var NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

var DynamicVolume     = require("./volume.js").DynamicVolume;
var DEFAULT_DIST_FUNC = new Function("x", "return 1.0;");

//Sample a volume
function sample(lo, hi, phase_func, dist_func) {
  //If no distance function is present, just assume boundary distance is constant
  if(!dist_func) {
    dist_func = DEFAULT_DIST_FUNC;
  }
  var builder = new DynamicVolume()
    , hii     = new Int32Array(hi)
    , loi     = new Int32Array(lo)
    , x       = new Int32Array(3)
    , y       = new Int32Array(3);
  //March over the range at integer increments
  for(x[2]=lo[2]; x[2]<hii[2]; ++x[2]) {
    for(x[1]=lo[1]; x[1]<hii[1]; ++x[1]) {
      for(x[0]=lo[0]; x[0]<hii[0]; ++x[0]) {
        //Check if x is on a phase boundary
        var phase = phase_func(x);
        y[0] = x[0];
        y[1] = x[1];
        y[2] = x[2];
outer_loop:
        for(var d=0; d<3; ++d) {
          for(var s=-1; s<=1; s+=2) {
            y[d] += s;
            if(phase !== phase_func(y)) {
              builder.push(x[0], x[1], x[2],saturateAbs(dist_func(x)), phase);
              break outer_loop;
            }
            y[d] = x[d];
          }
        }
      }
    }
  }
  return builder;
}
module.exports = sample;
