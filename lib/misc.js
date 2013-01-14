"use strict"; "use restrict";

//Compares coordinates colexicographically
var compareCoord = new Function("ra", "rb", [
  "for(var i=2;i>=0;--i) {",
    "var d=ra[i]-rb[i];",
    "if(d){return d;}",
  "}",
  "return 0;",
].join("\n"));

exports.compareCoord      = compareCoord;
exports.EPSILON           = 1e-6;
exports.POSITIVE_INFINITY =  (1<<30);
exports.NEGATIVE_INFINITY = -(1<<30);
