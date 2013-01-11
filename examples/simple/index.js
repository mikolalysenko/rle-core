var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js")
  , examples  = require("../common/examples.js");

$(document).ready(function() {

  //Create viewer
  var viewer = require("../common/viewer.js").makeViewer();
  
  //Create a volume
  var volume = rle.sample([-8,-8,-8], [9,9,9], examples.sphere);
  viewer.updateMesh(rle.surface(volume));
  
});