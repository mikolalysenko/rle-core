var rle_encode = require('./src/rle_volume.js').encode;

console.log(rle_encode({
      dims: [2,2,2]
    , density_array: [1,1,1,1,1,1,1,1,1] 
  }));


