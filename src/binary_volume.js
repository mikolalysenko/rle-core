"use strict"; "use restrict";

var DisjointSet = require("./disjoint_set.js").DisjointSet;

var EPSILON           = 1e-6
  , POSITIVE_INFINITY =  (1<<30)
  , NEGATIVE_INFINITY = -(1<<30)
  , EDGE_TABLE        = new Array(256)  //List of 12-bit masks describing edge crossings
  , CUBE_EDGES        = new Array(12);  //List of 12 edges of cube


//Initialize CUBE_EDGES and EDGE_TABLE with precalculated values
(function(){

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

})();

//Run data structure
var Run = new Function("coord", "value", [
  "this.coord = coord;",
  "this.value = value;"
].join("\n"));

//Compare two runs
var run_compare = new Function("a", "b", [
  "var ra = a.coord, rb = b.coord;",
  "for(var i=2; i>=0; --i) {",
    "var d = ra[i] - rb[i];",
    "if(d) { return d; }",
  "}",
  "return 0;",
].join("\n"));


//Compare two runs
var lex_compare = new Function("ra", "rb", [
  "for(var i=2; i>=0; --i) {",
    "var d = ra[i] - rb[i];",
    "if(d) { return d; }",
  "}",
  "return 0;",
].join("\n"));

//Surface iterator
function SurfaceIterator(volume, ptrs, coord) {
  this.volume   = volume;
  this.ptrs     = ptrs;
  this.coord    = coord;
}

//Clone surface iterator
SurfaceIterator.prototype.clone = function() {
  return new SurfaceIterator(
    this.volume,
    this.ptrs.slice(0),
    this.coord.slice(0)
  );
}

//Check if iterator has a next element
SurfaceIterator.prototype.hasNext = function() {
  return this.ptrs[7] < this.volume.runs.length-1;
}

//Advance iterator one position
SurfaceIterator.prototype.next = function() {
  var runs  = this.volume.runs
    , ptrs  = this.ptrs
    , coord = this.coord
    , nc    = [0,0,0];
  //Advance to infinity
  for(var i=0; i<3; ++i) {
    coord[i] = POSITIVE_INFINITY;
  }
  //Compute coordinate for start of next surface point
  for(var i=0; i<8; ++i) {
    if(ptrs[i] >= runs.length-1) {
      continue;
    }
    var nr = runs[ptrs[i]+1].coord;
    for(var j=0; j<3; ++j) {
      nc[j] = nr[j] + ((i&(1<<j)) ? 1 : 0);
    }
    if(lex_compare(nc, coord) < 0) {
      for(var j=0; j<3; ++j) {
        coord[j] = nc[j];
      }
    }
  }
  //Update pointers
  for(var i=0; i<8; ++i) {
    if(ptrs[i] >= runs.length - 1) {
      continue;
    }
    var nr = runs[ptrs[i]+1].coord;
    for(var j=0; j<3; ++j) {
      nc[j] = nr[j] + ((i&(1<<j)) ? 1 : 0);
    }
    if(lex_compare(nc, coord) <= 0) {
      ++ptrs[i];
    }
  }
};


//Computes the mask
SurfaceIterator.prototype.mask = function() {
  var mask = 0
    , runs = this.volume.runs
    , ptrs = this.ptrs;
  for(var i=0; i<8; ++i) {
    if(runs[ptrs[i]].value >= 0) {
      mask |= 1<<i;
    }
  }
  return mask;
}

//A binary volume
function BinaryVolume(runs, nfaces) {
  this.runs       = runs;
};

//Create a surface iterator
BinaryVolume.prototype.begin = function() {
  return new SurfaceIterator(
    this,
    [1,0,0,0,0,0,0,0],
    this.runs[1].coord.slice(0)
  );
}


//Make a copy of a volume
BinaryVolume.prototype.clone = function() {
  var nruns = new Array(this.runs.length);
  for(var i=0; i<this.runs.length; ++i) {
    var r = this.runs[i]
      , c = r.coord;
    nruns[i] = new Run([c[0], c[1], c[2]], r.value);
  }
  return new BinaryVolume(nruns);
}

//Find the run containing a particular coordinate in the volume
BinaryVolume.prototype.bisect = function(lo, hi, coord) {
  var runs = this.runs;
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


//Extracts a surface from the volume using elastic surface nets
BinaryVolume.prototype.surface = function() {
  var positions = []
    , faces     = []
    , runs      = this.runs
    , vals      = [0,0,0,0,0,0,0,0]
    , v_ptr     = [0,0,0,0,0,0,0,0]
    , nc        = [0,0,0]
    , nd        = [0,0,0];
  
  for(var iter=this.begin(); iter.hasNext(); iter.next()) {
    //Read in values and mask
    var ptrs = iter.ptrs
      , mask = 0;
    for(var i=0; i<8; ++i) {
      var v = runs[ptrs[i]].value;
      vals[i] = v;
      mask   |= v < 0 ? 0 : (1 << i);
    }
    if(mask === 0 || mask === 0xff) {
      continue;
    }
    //Compute centroid
    var crossings = EDGE_TABLE[mask]
      , centroid  = [0,0,0]
      , count     = 0;
    for(var i=0; i<12; ++i) {
      if((crossings & (1<<i)) === 0) {
        continue;
      }
      var edge = CUBE_EDGES[i]
        , u = vals[edge[0]]
        , v = vals[edge[1]]
        , d = edge[2];
      centroid[d] += v / (u - v);
      ++count;
    }
    //Compute vertex
    var coord   = iter.coord
      , weight  = 1.0 / count;
    for(var i=0; i<3; ++i) {
      centroid[i] = coord[i] + centroid[i] * weight;
    }
    //Append vertex
    positions.push(centroid);
    //Advance vertex pointers
    for(var i=0; i<8; ++i) {
      var p = positions[v_ptr[i]];
      for(var j=0; j<3; ++j) {
        nc[j] = coord[j] - ((i&(1<<j)) ? 1 : 0);
        nd[j] = Math.ceil(p[j]);
      }
      if(lex_compare(nc, nd) > 0) {
        ++v_ptr[i];
      }
    }
    //Add faces
    for(var i=0; i<3; ++i) {
      if((crossings & (1<<i)) === 0) {
        continue;
      }
      var iu = 1<<((i+1)%3)
        , iv = 1<<((i+2)%3);
      if(mask & 1) {
        faces.push([v_ptr[0], v_ptr[iu], v_ptr[iv]]);
        faces.push([v_ptr[iv], v_ptr[iu], v_ptr[iu+iv]]);
      } else {
        faces.push([v_ptr[0], v_ptr[iv], v_ptr[iu]]);
        faces.push([v_ptr[iu], v_ptr[iv], v_ptr[iu+iv]]);
      }
    }
  }
  
  return {
    positions: positions,
    faces:     faces
  };
}

//Sample a volume
function sample(dims, density_func) {
  var x       = [ 0, 0, 0 ]
    , y       = [ 0, 0, 0 ]
    , runs    = [ new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY], density_func(x)) ];
  //March over the volume
  for(x[2]=0; x[2]<dims[2]; ++x[2]) {
    for(x[1]=0; x[1]<dims[1]; ++x[1]) {
      for(x[0]=0; x[0]<dims[0]; ++x[0]) {
        //Get field and sign value
        var rho   = density_func(x)
          , s_rho = rho < 0;
        y[0] = x[0];
        y[1] = x[1];
        y[2] = x[2];
outer_loop:
        for(var d=0; d<3; ++d) {
          for(var s=-1; s<=1; ++s) {
            y[d] += s;
            //Check if signs are consistent
            if(s_rho !== (density_func(y) < 0)) {
              runs.push(new Run(x.slice(0), rho));
              break outer_loop;
            }
            y[d] = x[d];
          }
        }
      }
    }
  }
  //Returns a new binary volume
  return new BinaryVolume(runs);
}


//Expose interface
exports.sample     = sample;
exports.CUBE_EDGES = CUBE_EDGES;
exports.EDGE_TABLE = EDGE_TABLE;

//Create empty volume
Object.defineProperty(exports, "EMPTY_VOLUME", {
  get: function() {
    return new BinaryVolume([
      new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY],-1.0)
    ]);
  }
});

