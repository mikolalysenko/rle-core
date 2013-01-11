var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js");

var neighborhood  = rle.mooreStencil(1);
var CENTER_INDEX  = 1 + 3 + 9;

//Advance game of life one tick
function step(volume) {
  return rle.apply(volume, neighborhood, function(values) {
    //Count neighbors
    var neighbors = 0;
    for(var i=0; i<27; ++i) {
      if(values[i] >= 0) {
        ++neighbors;
      }
    }
    //Compute next state
    if(values[1+3+9] >= 0) {
      if(4 <= neighbors && neighbors <= 5) {
        return 1;
      }
    } else if(neighbors === 3) {
      return 1;
    }
    return -1;
  });
}


$(document).ready(function() {
  //Create viewer
  var viewer = require("gl-shells").makeViewer();
  
  //Create random table
  var table = new Array(256);
  for(var i=0; i<table.length; ++i) {
    table[i] = Math.random() > 0.5 ? 1 : -1;
  }
  
  //Create a volume
  var state = rle.sample([-16,-16,-16], [16,16,16], function(x) {
    for(var i=0; i<3; ++i) {
      if(x[i] <= -16 || x[i] >= 15) {
        return -1;
      }
    }
    var n = x[0] + 57 * x[1] + 3517 * x[2];
    n = (n << 13) ^ n;
    return table[n&0xff];
  });
  
  setInterval(function() {
    state = step(state);
    viewer.updateMesh(rle.surface(state));
  }, 2000);
  
  viewer.updateMesh(rle.surface(state));
  
});