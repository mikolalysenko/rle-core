var compareCoord = require("./misc.js").compareCoord;

function mooreStencil(radius_) {
  var result = []
    , radius = Math.ceil(radius_);
  for(var i=-radius; i<=radius; ++i) {
    for(var j=-radius; j<=radius; ++j) {
      for(var k=-radius; k<=radius; ++k) {
        result.push([i,j,k]);
      }
    }
  }
  result.sort(compareCoord);
  return result;
}

//Creates an Lp ball stencil
exports.LpStencil = function(p, radius_) {
  if(p === Number.POSITIVE_INFINITY) {
    return mooreStencil(p, radius_);
  }
  var result = []
    , radius = Math.ceil(radius_)
    , rp     = Math.pow(radius_, p);
  for(var i=-radius; i<=radius; ++i) {
    for(var j=-radius; j<=radius; ++j) {
      for(var k=-radius; k<=radius; ++k) {
        if(Math.pow(Math.abs(i), p) + Math.pow(Math.abs(i), p) + Math.pow(Math.abs(i), p) <= rp) {
          result.push([i,j,k]);
        }
      }
    }
  }
  result.sort(compareCoord);
  return result;
}