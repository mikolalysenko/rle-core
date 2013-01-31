var test  = require("tap").test
  , rle   = require("../index.js");

var sphere_func = new Function("x",
  "return 5 - Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2])"
);

function sphere_phase(x) {
  return sphere_func(x) < 0 ? 0 : 1;
}

test("stencil_iterator", function(t) {

  var sphere_vol = rle.sample([-10,-10,-10],[10,10,10], sphere_phase, sphere_func);
  
  //Try creating iterator
  var iter = rle.beginStencil(sphere_vol, [[0,0,0]]);
  
  //Try basic iteration
  t.ok(iter.hasNext());
  var n = 0;
  
  phases = new Array(1);
  while(iter.hasNext()) {
    //Check pointer
    t.equal(iter.ptrs[0], n++)
    
    //Check phases are consistent
    var coord  = iter.coord;
    iter.phases(phases);
    t.equal(phases[0], sphere_phase(coord), "checking phase");
    
    
    //Check next coord is consistent
    var p = iter.clone();
    iter.next();
    var nc = new Array(3);
    p.nextCoord(nc);
    t.equals(nc[0], iter.coord[0], "nextCoord[0]");
    t.equals(nc[1], iter.coord[1], "nextCoord[1]");
    t.equals(nc[2], iter.coord[2], "nextCoord[2]");
  }
  
  //Final sanity check
  t.equal(iter.ptrs[0], sphere_vol.length()-1);
  t.equal(iter.coord[0], rle.POSITIVE_INFINITY);
  
  
  //Now try iteration with stencil
  var stencil = [[1,0,0], [0,1,0], [0,0,1]];
  iter = rle.beginStencil(sphere_vol, stencil);
  
  var phases = new Array(stencil.length);
  
  while(iter.hasNext()) {
  
    //Check phases
    var coord   = iter.coord
    iter.phases(phases);
    for(var i=0; i<stencil.length; ++i) {
      var tmp = coord.slice(0);
      for(var j=0; j<3; ++j) {
        tmp[j] += stencil[i][j];
      }
      t.equals(phases[i], sphere_phase(tmp));
    }
  
    //Check next coord is consistent
    var p = iter.clone();
    iter.next();
    var nc = new Array(3);
    p.nextCoord(nc);
    t.equals(nc[0], iter.coord[0], "nextCoord[0]");
    t.equals(nc[1], iter.coord[1], "nextCoord[1]");
    t.equals(nc[2], iter.coord[2], "nextCoord[2]");
  }
  
  t.end();
});
