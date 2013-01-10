var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js")
  , examples  = require("../common/examples.js");

$(document).ready(function() {

  //Create a volume
  var volume = rle.binary.sample([-8,-8,-8], [8,8,8], examples.noise);
  
  //Create viewer
  var viewer = require("../common/viewer.js").makeViewer();
  viewer.updateMesh(volume.surface([-5, -5, -5], [5,5,5]));
  
});