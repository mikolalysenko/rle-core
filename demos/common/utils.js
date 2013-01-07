exports.flatten = function(arr) {
  var result = new Array(arr.length * 3);
  for(var i=0,j=0; i<arr.length; ++i, j+=3) {
    var p = arr[i];
    for(var k=0; k<3; ++k) {
      result[j+k] = p[k];
    }
  }
  return result;
}

exports.nextFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

exports.printVec3 = function(vec) {
  return "vec3(" + vec[0] + "," + vec[1] + "," + vec[2] + ")";
}