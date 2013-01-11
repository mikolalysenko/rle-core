var compareCoord = require("./misc.js").compareCoord;

exports.mooreStencil = function(radius) {
  var result = [];
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

exports.vonNeumannStencil = function(radius) {
  var result = [];
  for(var i=-radius; i<=radius; ++i) {
    for(var j=-radius; j<=radius; ++j) {
      for(var k=-radius; k<=radius; ++k) {
        if(Math.abs(i) + Math.abs(j) + Math.abs(k) <= radius) {
          result.push([i,j,k]);
        }
      }
    }
  }
  result.sort(compareCoord);
  return result;
}

exports.ballStencil = function(radius) {
  var result = [];
  for(var i=-radius; i<=radius; ++i) {
    for(var j=-radius; j<=radius; ++j) {
      for(var k=-radius; k<=radius; ++k) {
        if(i*i+j*j+k*k <= radius*radius) {
          result.push([i,j,k]);
        }
      }
    }
  }
  result.sort(compareCoord);
  return result;
}