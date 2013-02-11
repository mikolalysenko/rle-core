var sample = require("./sample.js");

function sampleSolid(lo, hi, dist_func) {
  return sample(lo, hi, function(x) {
    if(dist_func(x) <= 0) {
      return 1;
    }
    return 0;
  }, dist_func);
}
module.exports = sampleSolid;