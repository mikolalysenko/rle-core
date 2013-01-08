var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js")
  , examples  = require("../common/examples.js");

$(document).ready(function() {

  //Create a volume
  var volume = rle.binary.sample([32,32,32], examples.box);
  
  //Create viewer
  var viewer = require("../common/viewer.js").makeViewer();
  viewer.updateMesh(volume.surface());
  
});