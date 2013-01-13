"use strict"; "use restrict";

var volume  = require("./volume.js");

var Run               = volume.Run
  , Volume            = volume.Volume
  , empty             = volume.empty;

var DEFAULT_DIST_FUNC = new Function("x", "return 1.0;");

//Sample a volume
function sample(lo, hi, phase_func, dist_func) {
  var volume  = empty();

  //If no distance function is present, just assume boundary distance is constant
  if(!dist_func) {
    dist_func = DEFAULT_DIST_FUNC;
  }
  var x       = lo.slice(0)
    , y       = [ 0, 0, 0 ]
    , runs    = volume.runs;
  
  //March over the volume
  for(x[2]=lo[2]; x[2]<hi[2]; ++x[2]) {
    for(x[1]=lo[1]; x[1]<hi[1]; ++x[1]) {
      for(x[0]=lo[0]; x[0]<hi[0]; ++x[0]) {
        //Check if point is on a phase boundary
        var phase = phase_func(x);
        y[0] = x[0];
        y[1] = x[1];
        y[2] = x[2];
outer_loop:
        for(var d=0; d<3; ++d) {
          for(var s=-1; s<=1; s+=2) {
            y[d] += s;
            if(phase !== phase_func(y)) {
              runs.push(new Run(x.slice(0), Math.abs(dist_func(x)), phase));
              break outer_loop;
            }
            y[d] = x[d];
          }
        }
      }
    }
  }
  
  return volume;
}

//Export sampling method
exports.sample  = sample;

