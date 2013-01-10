exports.box = new Function("x",
  "return 1 - Math.max(Math.max(Math.abs(x[0]), Math.abs(x[1])), Math.abs(x[2]));"
);

exports.sphere = new Function("x",
  "return 5- Math.sqrt( x[0]*x[0]+x[1]*x[1]+x[2]*x[2] );"
);


exports.noise = function(x) {
  var n = Math.floor(x[0]) + Math.floor(x[1]) * 57 + Math.floor(x[2]) * 8917;
  n = (n << 13) ^ n;
  n = (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff;
  if(n > 0x6ffffff) {
    return 1;
  } else {
    return -1;
  }
}

exports.random = new Function("x", [
  "var s0 = Math.floor(x[0]) * 73856093",
    ", s1 = Math.floor(x[1]) * 19349663",
    ", s2 = Math.floor(x[2]) * 83492791;",
  "var v = (s0 ^ s1 ^ s2) & 0x7fff;",
  "if(v < 0x1000) {",
    "return  1;",
  "} else {",
    "return -1;",
  "}"	
].join("\n"));