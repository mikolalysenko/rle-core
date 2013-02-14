var test  = require("tap").test
  , rle   = require("../index.js")
  , sample = require("rle-sample");

var sphere_func = new Function("x",
  "return 5 - Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2])"
);

function sphere_phase(x) {
  return sphere_func(x) < 0 ? 0 : 1;
}

test("multi_iterator", function(t) {

  var sphere_vol = sample.dense([-10,-10,-10],[10,10,10], sphere_phase, sphere_func);
  
  //Try creating iterator
  var iter = rle.beginMulti([sphere_vol, new rle.DynamicVolume()], new Int32Array(3));
  
  //Try basic iteration
  t.ok(iter.hasNext());
  var n = 0;
  
  phases = new Array(1);
  while(iter.hasNext()) {
    //Check pointer
    t.equal(iter.ptrs[0], n++)
    
    //Check phases are consistent
    var coord  = iter.coord;
    t.equal(sphere_vol.phases[iter.ptrs[0]], sphere_phase(coord), "checking phase");
    t.equal(iter.ptrs[1], 0)
    
    iter.next();
  }
  
  //Final sanity check
  t.equal(iter.ptrs[0], sphere_vol.length()-1);
  t.equal(iter.coord[0], rle.POSITIVE_INFINITY);
  t.equal(iter.ptrs[1], 0);
  
  /*
  //Now try iteration with stencil
  var stencil = new Int32Array([1,0,0,   0,1,0,  0,0,1]);
  iter = rle.beginStencil(sphere_vol, stencil);
  
  var phases = new Array(stencil.length);
  
  while(iter.hasNext()) {
  
    //Check phases
    var coord   = iter.coord
    iter.phases(phases);
    for(var i=0; i<3; ++i) {
      var tmp = new Int32Array(coord);
      for(var j=0; j<3; ++j) {
        tmp[j] += stencil[3*i+j];
      }
      t.equals(phases[i], sphere_phase(tmp));
    }
    iter.next();
  
  }
  */
  
  t.end();
});
