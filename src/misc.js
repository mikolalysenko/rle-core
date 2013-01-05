var EPSILON           = 1e-6
  , POSITIVE_INFINITY =  (1<<30)
  , NEGATIVE_INFINITY = -(1<<30)
  , EDGE_TABLE        = new Array(256)  //List of 12-bit masks describing edge crossings
  , CUBE_EDGES        = new Array(12)   //List of 12 edges of cube
  , MOORE_STENCIL     = [ [0,0,0] ]
  , SURFACE_STENCIL   = [ ];

//Compare two runs
var lex_compare = new Function("ra", "rb", [
  "for(var i=2;i>=0;--i) {",
    "var d=ra[i]-rb[i];",
    "if(d){return d;}",
  "}",
  "return 0;",
].join("\n"));


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

//Build Moore stencil
for(var i=0; i<3; ++i) {
  for(var s=-1; s<=1; s+=2) {
    var p = [0,0,0];
    p[d] = s;
    MOORE_STENCIL.push(p);
  }
}

var n = 0;
for(var i=0; i<8; ++i) {
  for(var d=0; d<3; ++d) {
    var j = i ^ (1<<d);
    if(j < i) {
      continue;
    }
    CUBE_EDGES[n] = [i, j, d];
    ++n;
  }
}

//Precalculate edge crossings
for(var mask=0; mask<256; ++mask) {
  var e_mask = 0;
  for(var i=0; i<12; ++i) {
    var e = CUBE_EDGES[i];
    if(!(mask & (1<<e[0])) !== !(mask & (1<<e[1]))) {
      e_mask |= (1<<i);
    }
    EDGE_TABLE[mask] = e_mask;
  }
}

//Bisect an interval
function bisect(runs, lo, hi, coord) {
  while (lo < hi) {
    var mid = (lo + hi) >> 1
      , s = lex_compare(runs[mid].coord, coord);
    if(s > 0) {
      lo = mid + 1;
    } else if(s < 0) {
      hi = mid - 1;
    } else {
      return mid;
    }
  }
  return lo;
}

exports.lex_compare       = lex_compare;
exports.bisect            = bisect;
exports.EPSILON           = EPSILON;
exports.POSITIVE_INFINITY = POSITIVE_INFINITY;
exports.NEGATIVE_INFINITY = NEGATIVE_INFINITY;
exports.EDGE_TABLE        = EDGE_TABLE;
exports.CUBE_EDGES        = CUBE_EDGES;
exports.MOORE_STENCIL     = MOORE_STENCIL;
exports.SURFACE_STENCIL   = SURFACE_STENCIL;
