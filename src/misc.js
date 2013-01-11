var EPSILON             = 1e-6
  , POSITIVE_INFINITY   =  (1<<30)
  , NEGATIVE_INFINITY   = -(1<<30)
  , CROSS_STENCIL       = [ [0,0,0] ]
  , SURFACE_STENCIL     = [ ];

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
    SURFACE_STENCIL.push(p);
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

//Bisect an interval
function bisect(runs, lo, hi, coord) {
  while (lo < hi) {
    var mid = (lo + hi) >> 1
      , s = compareCoord(runs[mid].coord, coord);
    if(s < 0) {
      lo = mid + 1;
    } else if(s > 0) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  return lo;
}

exports.compareCoord      = compareCoord;
exports.bisect            = bisect;
exports.EPSILON           = EPSILON;
exports.POSITIVE_INFINITY = POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = NEGATIVE_INFINITY;
exports.CROSS_STENCIL     = CROSS_STENCIL;
exports.SURFACE_STENCIL   = SURFACE_STENCIL;
