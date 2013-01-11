var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js");

$(document).ready(function() {

  //Create viewer
  var viewer = require("gl-shells").makeViewer();
  
  //Create a volume
  var volume = rle.sample([-6,-6,-6], [7,7,7], function(x) {
    return 5 - Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);
  });
  viewer.updateMesh(rle.surface(volume));
  
});