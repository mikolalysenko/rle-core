var volume  = require("./volume.js")
  , misc    = require("./misc.js");

var Run               = volume.Run
  , Volume            = volume.Volume
  , NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;


//Sample a volume
function sample(lo, hi, density_func) {
  var x       = lo.slice(0)
    , y       = [ 0, 0, 0 ]
    , runs    = [ new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY], -1) ];
  //March over the volume
  for(x[2]=lo[2]; x[2]<hi[2]; ++x[2]) {
    for(x[1]=lo[1]; x[1]<hi[1]; ++x[1]) {
      for(x[0]=lo[0]; x[0]<hi[0]; ++x[0]) {
        //Get field and sign value
        var rho   = density_func(x)
          , s_rho = rho < 0;
        y[0] = x[0];
        y[1] = x[1];
        y[2] = x[2];
outer_loop:
        for(var d=0; d<3; ++d) {
          for(var s=-1; s<=1; s+=2) {
            y[d] += s;
            //Check if signs are consistent
            if(s_rho !== (density_func(y) < 0)) {
              runs.push(new Run(x.slice(0), rho));
              break outer_loop;
            }
            y[d] = x[d];
          }
        }
      }
    }
  }
  //Returns a new binary volume
  return new Volume(runs);
}

//Export sampling method
exports.sample  = sample;

