var sample = require("./sample.js");

module.exports = function(lo, hi, dist_func) {
  return sample(lo, hi, function(x) {
    if(dist_func(x) <= 0) {
      return 1;
    }
    return 0;
  }, dist_func);
}
