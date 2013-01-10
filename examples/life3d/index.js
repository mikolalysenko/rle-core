var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js")
  , examples  = require("../common/examples.js");

var neighborhood = rle.stencils.vonNeumann(1);

var BinaryRun = rle.binary.BinaryRun;

function step(volume) {
  return rle.binary.map(volume, neighborhood, function(values) {
    //Count neighbors
    var neighbors = 0;
    for(var i=0; i<27; ++i) {
      if(values[i] >= 0) {
        ++neighbors;
      }
    }
    //Compute next state
    if(values[1+3+9] >= 0) {
      if(10 <= neighbors && neighbors <= 13) {
        return 1;
      }
    } else if(9 <= neighbors && neighbors <= 10) {
      return 1;
    }
    return -1;
  });
}


$(document).ready(function() {
  //Create viewer
  var viewer = require("../common/viewer.js").makeViewer();
  
  //Create a volume
  var state = rle.binary.sample([-16,-16,-16], [16,16,16], examples.box);
  
  setInterval(function() {
    state = step(state);
    viewer.updateMesh(state.surface());
  }, 2000);
  
  viewer.updateMesh(state.surface());
  
});