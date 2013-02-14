var test  = require("tap").test
  , rle   = require("../index.js")
  , sample = require("rle-sample");

test('volume', function(t) {

  var vol = new rle.DynamicVolume();
  console.log(vol);
  t.ok(vol.length() === 1, "Checking empty volume constructor");
  t.ok(vol.coords[0][0] === rle.NEGATIVE_INFINITY, "Checking bounds");

  //Check clone
  var copy = vol.clone();
  t.ok(vol.distances[0] === copy.distances[0]);
  
  //Check push
  vol.push(10, 10, 10, 1, 1);
  t.ok(copy.coords[2].length === 1);
  t.ok(vol.coords[2].length === 2);
  
  //Check bisect
  t.ok(vol.bisect([20, 20, 20], 0, 1) === 1);
  t.ok(vol.bisect([0, 0, 0], 0, 1) === 0);
  t.ok(vol.bisect([10,10,10], 0, 1) === 1);
  t.ok(vol.bisect([rle.NEGATIVE_INFINITY, rle.NEGATIVE_INFINITY, rle.NEGATIVE_INFINITY], 0, 1) === 0);
  
  //Check static volume
  var static_vol = vol.toStatic();
  t.ok(static_vol.coords[2].length === 2);
  t.ok(static_vol.bisect([20, 20, 20], 0, 1) === 1);
  t.ok(static_vol.bisect([0, 0, 0], 0, 1) === 0);
  t.ok(static_vol.bisect([10,10,10], 0, 1) === 1);
  t.ok(static_vol.bisect([rle.NEGATIVE_INFINITY, rle.NEGATIVE_INFINITY, rle.NEGATIVE_INFINITY], 0, 1) === 0);
  
  
  //Turn it back into a dynamic volume
  var dyn_vol = static_vol.toDynamic();
  t.ok(dyn_vol.coords[2].length === 2);
  t.ok(dyn_vol.bisect([20, 20, 20], 0, 1) === 1);
  t.ok(dyn_vol.bisect([0, 0, 0], 0, 1) === 0);
  t.ok(dyn_vol.bisect([10,10,10], 0, 1) === 1);
  t.ok(dyn_vol.bisect([rle.NEGATIVE_INFINITY, rle.NEGATIVE_INFINITY, rle.NEGATIVE_INFINITY], 0, 1) === 0);
  
  
  t.end();
});


var sphere_func = new Function("x",
  "return 5 - Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2])"
);

function sphere_phase(x) {
  return sphere_func(x) < 0 ? 0 : 1;
}

test('sample', function(t) {
  var sphere_vol = sample.dense([-10,-10,-10], [10,10,10], sphere_phase);
  var point = [0,0,0];
  
  for(var i=0; i<sphere_vol.length(); ++i) {
    for(var j=0; j<3; ++j) {
      point[j] = sphere_vol.coords[j][i];
    }
    t.equal(sphere_vol.phases[i], sphere_phase(point), "testing run: " + i + ", point: " + point);
  }
  t.end();
});