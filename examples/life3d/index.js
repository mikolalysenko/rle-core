var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js")
  , examples  = require("../common/examples.js");


var BinaryRun = rle.binary.BinaryRun;

function step(volume) {
  var next_runs   = []
    , runs        = volume.runs
    , prev_value  = 0;
  for(var iter=rle.iterators.createStencil(volume, rle.stencils.VON_NEUMANN); iter.hasNext(); iter.next()) {
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
      if(8 <= neighbors && neighbors <= 14) {
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
  var state = rle.binary.sample([32,32,32], function(x) {
    var s0 = Math.floor(x[0]) * 73856093
      , s1 = Math.floor(x[1]) * 19349663
      , s2 = Math.floor(x[2]) * 83492791;
    var v = (s0 + s1 + s2) & 0xffff;
    if(v < 0x1000) {
      return  1;
    } else {
      return -1;
    }
  });
  
  setInterval(function() {
    state = step(state);
    viewer.updateMesh(state.surface());
  }, 1000);
  
  viewer.updateMesh(state.surface());
  
});