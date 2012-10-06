var voxelize = require('./src/binary_volume.js').voxelize;


var vol = voxelize([10, 10, 10], function(x,y,z) {
  return 2 - Math.max(Math.max(Math.abs(x-5), Math.abs(y-5)), Math.abs(z-5));
});

console.log(vol.zip());

console.log(vol.mesh());
