var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js");


var COLORS = [
  [0,0,1],
  [1,0,0],
  [0,1,0],
];

$(document).ready(function() {

  //Create viewer
  var viewer = require("gl-shells").makeViewer();
  
  //Create a volume
  function sphere_dist(x) {
    return Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]) - 5.0;
  }
  var volume = rle.sample([-6,-6,-6], [7,7,7], function(x) {
    if(sphere_dist(x) < 0) {
      if(x[0] < 0) {
        return 1;
      }
      return 2;
    }
    return 0;
  }, sphere_dist);
  
  //Generate mesh
  var mesh = rle.surface(volume);
  
  //Color faces based on phase
  var colors = new Array(mesh.positions.length);
  for(var i=0; i<mesh.phases.length; ++i) {
    var f = mesh.faces[i]
      , c = COLORS[mesh.phases[i][0]];
    for(var j=0; j<f.length; ++j) {
      colors[f[j]] = c.slice(0);
    }
  }
  mesh.colors = colors;
  
  //Draw the volume
  viewer.updateMesh(mesh);
  
});