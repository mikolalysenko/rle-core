"use strict"; "use restrict";

var DisjointSet = require("./disjoint_set.js").DisjointSet;

var EPSILON           = 1e-6
  , POSITIVE_INFINITY =  (1<<30)
  , NEGATIVE_INFINITY = -(1<<30)
  , EDGE_TABLE        = new Array(256)  //List of 12-bit masks describing edge crossings
  , CUBE_EDGES        = new Array(12)   //List of 12 edges of cube
  , MOORE_STENCIL     = [ [0,0,0] ]
  , SURFACE_STENCIL   = [ ];

//Run data structure
var Run = new Function("coord", "value", [
  "this.coord=coord;",
  "this.value=value;"
].join("\n"));

//Compare two runs
var run_compare = new Function("a", "b", [
  "var ra=a.coord,rb=b.coord;",
  "for(var i=2;i>=0;--i) {",
    "var d=ra[i]-rb[i];",
    "if(d){return d;}",
  "}",
  "return 0;",
].join("\n"));

//Compare two runs
var lex_compare = new Function("ra", "rb", [
  "for(var i=2;i>=0;--i) {",
    "var d=ra[i]-rb[i];",
    "if(d){return d;}",
  "}",
  "return 0;",
].join("\n"));

//Initialize CUBE_EDGES and EDGE_TABLE with precalculated values
(function(){

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

})();

//Walk a stencil over a volume
function StencilIterator(volume, stencil, ptrs, coord, values) {
  this.volume     = volume;
  this.stencil    = stencil;
  this.ptrs       = ptrs;
  this.coord      = coord;
  this.values     = values;
}

//Make a copy of this iterator
StencilIterator.prototype.clone = function() {
  return new StencilIterator(
      volume
    , stencil
    , ptrs.slice(0)
    , coord.slice(0)
    , values.slice(0)
    , length
  );
}

//Retrieves length of current run
StencilIterator.prototype.length = function() {
  var len = POSITIVE_INFINITY
    , runs = this.volume.runs;
  for(var i=0; i<this.ptrs.length; ++i) {
    if(this.ptrs[i] >= this.volume.runs.length - 1) {
      continue;
    };
    var d = runs[this.ptrs[i]+1].coord[0] - runs[this.ptrs[i]].coord[0];
    if(d > 0) {
      len = Math.min(len, d);
    }
  }
  return len;
}

//Checks if iterator has another value
StencilIterator.prototype.hasNext = function() {
  return this.coord[0] < POSITIVE_INFINITY;
}

//Advance iterator one position
StencilIterator.prototype.next = function() {
  var runs    = this.volume.runs
    , stencil = this.stencil
    , ptrs    = this.ptrs
    , coord   = this.coord
    , values  = this.values
    , tcoord  = [0,0,0];
  //Set iterator to infinity initially
  for(var i=0; i<3; ++i) {
    coord[i] = POSITIVE_INFINITY;
  }
  //Compute next coordinate
  for(var i=0; i<stencil.length; ++i) {
    if(ptrs[i] >= runs.length-1) {
      continue;
    }
    var nr = runs[ptrs[i]+1].coord
      , delta = stencil[i];
    for(var j=0; j<3; ++j) {
      tcoord[j] = nr[j] - delta[j];
    }
    if(lex_compare(tcoord, coord) < 0) {
      for(var j=0; j<3; ++j) {
        coord[j] = tcoord[j];
      }
    }
  }
  //Advance to next coordinate
  for(var i=0; i<stencil.length; ++i) {
    if(ptrs[i] >= runs.length-1) {
      continue;
    }
    var nr = runs[ptrs[i]+1].coord
      , delta = stencil[i];
    for(var j=0; j<3; ++j) {
      tcoord[j] = nr[j] - delta[j];
    }
    //Update pointer
    if(lex_compare(tcoord, coord) <= 0) {
      ++ptrs[i];
      values[i] = runs[ptrs[i]].value;
    }
  }
}

//Multivolume iterator
function MultiIterator(volumes, stencil, ptrs, coord, values) {
  this.volumes  = volumes;
  this.stencil  = stencil;
  this.ptrs     = ptrs;
  this.coord    = coord;
  this.values   = values;
}

MultiIterator.prototype.clone = function() {
  return new MultiIterator(
    this.volumes,
    this.stencil,
    this.ptrs.slice(0),
    this.coord.slice(0),
    this.values.slice(0)
  );
}

MultiIterator.prototype.hasNext = function() {
  return this.coord[0] < POSITIVE_INFINITY;
}

MultiIterator.prototype.next = function() {
  var volumes = this.volumes
    , stencil = this.stencil
    , coord   = this.coord
    , tcoord  = [0,0,0];
  //Set iterator to infinity initially
  for(var i=0; i<3; ++i) {
    coord[i] = POSITIVE_INFINITY;
  }
  //Compute next coordinate
  for(var i=0; i<stencil.length; ++i) {
    var delta = stencil[i]
      , ptrs  = this.ptrs[i];
    for(var j=0; j<volumes.length; ++j) {
      var runs = volumes[j].runs;
      if(ptrs[j] >= runs.length-1) {
        continue;
      }
      var x = runs[ptrs[j]+1].coord;
      for(var k=0; k<3; ++k) {
        tcoord[k] = x[k] - delta[k];
      }
      if(lex_compare(tcoord, coord) < 0) {
        for(var k=0; k<3; ++k) {
          coord[k] = tcoord[k];
        }
      }
    }
  }
  //Advance pointers
  for(var i=0; i<stencil.length; ++i) {
    var delta   = stencil[i]
      , ptrs    = this.ptrs[i]
      , values  = this.values[i];
    
    for(var j=0; j<volumes.length; ++j) {
      var runs = volumes[j].runs;
      if(ptrs[j] >= runs.length-1) {
        continue;
      }
      var x = runs[ptrs[j]+1].coord;
      for(var k=0; k<3; ++k) {
        tcoord[k] = x[k] - delta[k];
      }
      if(lex_compare(tcoord, coord) <= 0) {
        ++ptrs[j];
        values[j] = runs[ptrs[j]].value;
      }
    }
  }
}

//Perform a multiway iteration over a collection of volumes
function multi_begin(volumes, stencil) {
  var ptrs    = new Array(stencil.length)
    , values  = new Array(stencil.length);
  for(var i=0; i<ptrs.length; ++i) {
    ptrs[i]     = new Array(volumes.length);
    values[i]   = new Array(volumes.length);
    for(var j=0; j<volumes.length; ++j) {
      ptrs[i][j]    = 0;
      values[i][j]  = volumes[j].runs[0].value;
    }
  }
  return new MultiIterator(
    volumes,
    stencil,
    ptrs,
    [NEGATIVE_INFINITY,NEGATIVE_INFINITY,NEGATIVE_INFINITY],
    values
  );
}

//A binary volume
function BinaryVolume(runs, nfaces) {
  this.runs       = runs;
};

//Create a stencil iterator
BinaryVolume.prototype.stencil_begin = function(stencil) {
  var ptrs = new Array(stencil.length)
    , vals = new Array(stencil.length)
    , v    = this.runs[0].value;
  for(var i=0; i<stencil.length; ++i) {
    ptrs[i] = 0;
    vals[i] = 0;
  }
  return new StencilIterator(
    this,
    stencil,
    ptrs,
    [NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY],
    vals
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
  for(var iter=this.stencil_begin(SURFACE_STENCIL); iter.hasNext(); iter.next()) {
    //Read in values and mask
    var ptrs = iter.ptrs
      , mask = 0
      , vals = iter.values;
    for(var i=0; i<8; ++i) {
      mask |= vals[i] < 0 ? 0 : (1 << i);
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
        faces.push([v_ptr[0],  v_ptr[iu], v_ptr[iv]]);
        faces.push([v_ptr[iv], v_ptr[iu], v_ptr[iu+iv]]);
      } else {
        faces.push([v_ptr[0],  v_ptr[iv], v_ptr[iu]]);
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

//Performs a k-way merge on a collection of volumes
function merge(volumes, merge_func) {
  var merged_runs = [];
  for(var iter = multi_begin(volumes, MOORE_STENCIL); iter.hasNext(); iter.next()) {
    var rho   = merge_func(iter.values[0])
      , sign  = rho < 0;
    for(var i=1; i<6; ++i) {
      var f = merge_func(iter.values[i]);
      if(sign !== (f<0)) {
        merged_runs.push(new Run(iter.coord.slice(0), rho));
        break;
      }
    }
  }
  return new BinaryVolume(merged_runs);
}

//Dilates a volume by a stencil
function dilate(volume, stencil) {
}


//Subtract a function
var SUBTRACT_FUNC = new Function("a", "b", [
  "return Math.min(a,-b);"
].join("\n"));

//Expose interface
exports.Run           = Run;
exports.BinaryVolume  = BinaryVolume;
exports.multi_begin   = multi_begin;
exports.sample        = sample;
exports.merge         = merge;

//Boolean set operations
exports.union      = function(a, b) { return merge([a,b], Math.max); }
exports.intersect  = function(a, b) { return merge([a,b], Math.min); }
exports.subtract   = function(a, b) { return merge([a,b], SUBTRACT_FUNC); }
exports.complement = function(a)    {
  var nruns = new Array(a.runs.length);
  for(var i=0; i<nruns.length; ++i) {
    var r = a.runs[i];
    nruns[i] = new Run(r.coord.slice(0), r.value);
  }
  return new BinaryVolume(nruns);
};

//Create empty volume
Object.defineProperty(exports, "EMPTY_VOLUME", {
  get: function() {
    return new BinaryVolume([
      new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY],-1.0)
    ]);
  }
});

