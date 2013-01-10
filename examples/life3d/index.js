var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js")
  , examples  = require("../common/examples.js");

var neighborhood = rle.stencils.vonNeumann(1);

var BinaryRun = rle.binary.BinaryRun;

function step(volume) {
  var next_runs   = []
    , runs        = volume.runs
    , prev_value  = 0;
  for(var iter=rle.iterators.createStencil(volume, neighborhood); iter.hasNext(); iter.next()) {
    //Count neighbors
    var neighbors = 0;
    for(var i=0; i<27; ++i) {
      var r = runs[iter.ptrs[i]];
      if(r.value >= 0) {
        ++neighbors;
      }
    }
    //Compute next state
    var next_value = -1;
    if(runs[iter.ptrs[1+3+9]].value >= 0) {
      if(8 <= neighbors && neighbors <= 13) {
        next_value = 1;
      }
    } else if(7 <= neighbors && neighbors <= 10) {
      next_value = 1;
    }
    //Add to list
    if(next_value !== prev_value) {
      next_runs.push(new BinaryRun(iter.coord.slice(0), next_value));
      prev_value = next_value;
    }
  }
  return new rle.binary.BinaryVolume(next_runs);
}


$(document).ready(function() {
  //Create viewer
  var viewer = require("../common/viewer.js").makeViewer();
  
  //Create a volume
  var state = rle.binary.sample([-16,-16,-16], [16,16,16], examples.noise);
  
  setInterval(function() {
    state = step(state);
    viewer.updateMesh(state.surface());
  }, 2000);
  
  viewer.updateMesh(state.surface());
  
});