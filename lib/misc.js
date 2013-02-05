"use strict"; "use restrict";

//Compares coordinates colexicographically
exports.compareCoord = new Function("ra", "rb", [
  "for(var i=2;i>=0;--i) {",
    "var d=ra[i]-rb[i];",
    "if(d){return d;}",
  "}",
  "return 0;",
].join("\n"));

//Clamps |x| to [0,1]
exports.saturateAbs = new Function("x", [
  "if(x >= 0.0) {",
    "if(x <= 1.0) {",
      "return x;",
    "}",
  "} else if(x >= -1.0) {",
    "return -x;",
  "}",
  "return 1.0;"
].join("\n"));

exports.EPSILON           = 1e-6;
exports.POSITIVE_INFINITY =  (1<<30);
exports.NEGATIVE_INFINITY = -(1<<30);
