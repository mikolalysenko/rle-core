"use strict"; "use restrict";

var EPSILON             = 1e-6
  , POSITIVE_INFINITY   =  (1<<30)
  , NEGATIVE_INFINITY   = -(1<<30)
  , CROSS_STENCIL       = [ [0,0,0] ]
  , CUBE_STENCIL        = [ ];

//Compare two runs
var compareCoord = new Function("ra", "rb", [
  "for(var i=2;i>=0;--i) {",
    "var d=ra[i]-rb[i];",
    "if(d){return d;}",
  "}",
  "return 0;",
].join("\n"));

(function() {
  //Build surface stencil
  for(var i=0; i<8; ++i) {
    var p = [0,0,0];
    for(var j=0; j<3; ++j) {
      if((i & (1<<j)) !== 0) {
        p[j] = -1;
      }
    }
    CUBE_STENCIL.push(p);
  }
})();

(function() {
  //Build cross
  for(var i=0; i<3; ++i) {
    for(var s=-1; s<=1; s+=2) {
      var p = [0,0,0];
      p[i] = s;
      CROSS_STENCIL.push(p);
    }
  }
})();

exports.compareCoord      = compareCoord;
exports.EPSILON           = EPSILON;
exports.POSITIVE_INFINITY = POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = NEGATIVE_INFINITY;
exports.CROSS_STENCIL     = CROSS_STENCIL;
exports.CUBE_STENCIL      = CUBE_STENCIL;
