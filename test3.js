var sample = require('./src/binary_volume.js').sample;


var volume = sample([10, 10, 10], function(x) {
  return 2 - Math.max(Math.max(Math.abs(x[0]-5), Math.abs(x[1]-5)), Math.abs(x[2]-5));
});

console.log(volume);

console.log(volume.surface());