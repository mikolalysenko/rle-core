var $         = require("jquery-browserify")
  , rle       = require("../../src/index.js");

$(document).ready(function() {

  //Create viewer
  var viewer = require("gl-shells").makeViewer({wireframe:true});
  
  //Create a volume from a sphere
  var volume = rle.sample([-6,-6,-6], [7,7,7], function(x) {
    return 5 - Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);
  });
  
  //Extract mesh eagerly so we can append rays to it
  var mesh = rle.surface(volume);
  
  //Generate and test a bunch of random rays
  for(var i=0; i<1000; ++i) {
    var origin    = [0,0,0]
      , direction = [0,0,0];
    for(var j=0; j<3; ++j) {
      origin[j]    = Math.random() * 20 - 10;
      direction[j] = Math.random() - 0.5;
    }
  
    //Find the intersection
    var intercept = rle.testRay(volume, origin, direction);
    
    //If the ray hit, add a pair of triangles to mesh so that we can draw it.
    if(intercept.hit) {
      console.log("Ray hit:", origin, direction, intercept);
      var nv = mesh.positions.length;
      mesh.positions.push(origin);
      mesh.positions.push(intercept.x);
      mesh.faces.push([nv, nv+1, nv]);
      mesh.faces.push([nv+1, nv, nv+1]);
    }
  }
  
  //Draw the mesh
  viewer.updateMesh(mesh);
});