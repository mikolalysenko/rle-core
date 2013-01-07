"use strict"; "use restrict";

var misc = require("./misc.js")
  , iterators = require("./iterators.js")
  , DisjointSet = require("./disjoint_set.js").DisjointSet;

//Import globals
var compareCoord      = misc.compareCoord
  , EPSILON           = misc.EPSILON
  , POSITIVE_INFINITY = misc.POSITIVE_INFINITY
  , NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY
  , EDGE_TABLE        = misc.EDGE_TABLE
  , CUBE_EDGES        = misc.CUBE_EDGES
  , MOORE_STENCIL     = misc.MOORE_STENCIL
  , SURFACE_STENCIL   = misc.SURFACE_STENCIL;

//Import iterators
var createStencil       = iterators.createStencil
  , createMultiStencil  = iterators.createMultiStencil;

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

//A binary volume
function BinaryVolume(runs, nfaces) {
  this.runs       = runs;
};

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

//Checks if a point is contained in a volume
BinaryVolume.prototype.testPoint = function(point) {
  return false;
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
  for(var iter=createStencil(this, SURFACE_STENCIL); iter.hasNext(); iter.next()) {
    //Read in values and mask
    var ptrs = iter.ptrs
      , mask = 0;
    for(var i=0; i<8; ++i) {
      var v = runs[ptrs[i]].value;
      vals[i] = v;
      mask |= v < 0 ? 0 : (1 << i);
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
      if(compareCoord(nc, nd) > 0) {
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
  var merged_runs = []
    , values      = new Array(volumes.length);
  for(var iter = createMultiStencil(volumes, MOORE_STENCIL); iter.hasNext(); iter.next()) {
  
    for(var i=0; i<values.length; ++i) {
      values[i] = volumes[i].runs[iter.ptrs[i][0]].value;
    }
    var rho   = merge_func(values)
      , sign  = rho < 0;
    for(var i=1; i<6; ++i) {
      for(var j=0; j<values.length; ++j) {
        values[j] = volumes[j].runs[iter.ptrs[j][i]].value;
      }
      var f = merge_func(values[i]);
      if(sign !== (f<0)) {
        merged_runs.push(new Run(iter.coord.slice(0), rho));
        break;
      }
    }
  }
  return new BinaryVolume(merged_runs);
}

//Dilate by fixed stencil
function dilate(volume, stencil) {
  var runs = volume.runs
    , nruns = [ new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY], nruns[0].value) ];
  for(var iter=createStencil(volume, stencil); iter.hasNext(); iter.next()) {
    var v = Number.POSITIVE_INFINITY;
    for(var i=0; i<stencil.length; ++i) {
      v = Math.min(v, runs[iter.ptrs[i]].value);
    }
    if((nruns[nruns.length-1].value < 0) !== (v < 0)) {
      nruns.push(new Run(iter.coord.slice(0), v));
    }
  }
  return new BinaryVolume(nruns);
}


function erode(volume, stencil) {
  var runs = volume.runs
    , nruns = [ new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY], nruns[0].value) ];
  for(var iter=createStencil(volume, stencil); iter.hasNext(); iter.next()) {
    var v = Number.NEGATIVE_INFINITY;
    for(var i=0; i<stencil.length; ++i) {
      v = Math.max(v, runs[iter.ptrs[i]].value);
    }
    if((nruns[nruns.length-1].value < 0) !== (v < 0)) {
      nruns.push(new Run(iter.coord.slice(0), v));
    }
  }
  return new BinaryVolume(nruns);
}

//Extracts all connected components of the volume
function labelComponents(volume) {
  //First assign labels
  var runs   = this.runs
    , forest = new DisjointSet(runs.length);
  for(var iter=createStencil(volume, SURFACE_STENCIL); iter.hasNext(); iter.next()) {
    if(runs[iter.ptrs[0]].value < 0) {
      continue;
    }
    for(var i=1; i<8; ++i) {
      if(runs[iter.ptrs[i]].value < 0) {
        continue;
      }
      forest.link(iter.ptrs[0], iter.ptrs[i]);
    }
  }
  //Then mark components using labels
  //HACK: Reuse rank array for labels
  var clabels          = forest.ranks
    , root2label       = []
    , component_count  = 0;
  for(var i=0; i<runs.length(); ++i) {
    var run = runs[i];
    if(run.value < 0) {
      clabels[i] = -1;
      continue;
    }
    var root = forest.find(i);
    if(root in root2label) {
      clabels[i] = root2label[root];
    } else {
      root2label[root] = component_count;
      clabels[i] = component_count;
      component_count++;
    }
  }
  return {
      count: component_count
    , labels: clabels
  }
}

//Extracts all components.  label_struct is the result of running label_components
// and is reused if possible
function splitComponents(volume, label_struct) {
  if(!label_struct) {
    label_struct = this.labelComponents;
  }
  var count       = label_struct.count
    , labels      = label_struct.clabels
    , components  = new Array(count);
  for(var i=0; i<count; ++i) {
    components[i] = [ ];
  }
  var runs = volume.runs;
  for(var iter=createStencil(volume, MOORE_STENCIL); iter.hasNext(); iter.next()) {
    var ptrs    = iter.ptrs
      , center  = runs[ptrs[0]];
    if(center.value < 0) {
      //Check each neighbor
      for(var i=1; i<7; ++i) {
        var neighbor = runs[ptrs[i]];
        if(neighbor.value < 0) {
          continue;
        }
        var id = labels[ptrs[i]]
          , cc = components[id];
        if(compareCoord(cc[cc.length-1].coord, center.coord) < 0) {
          cc.push(new Run(center.coord.slice(0), center.value));
        }
      }
    } else {
      var id = labels[ptrs[0]]
        , cc = components[id];
      if(compareCoord(cc[cc.length-1].coord, center.coord) < 0) {
        cc.push(new Run(center.coord.slice(0), center.value));
      }
    }
  }
  //Convert components back into volumes
  var volumes = new Array(count);
  for(var i=0; i<count; ++i) {
    volumes[i] = new BinaryVolume(components[i]);
  }
  return volumes;
}



//Subtract a function
var SUBTRACT_FUNC   = new Function("a", "return Math.min(a[0],-a[1]);" )
  , INTERSECT_FUNC  = new Function("a", "return Math.min(a[0], a[1]);" )
  , UNION_FUNC      = new Function("a", "return Math.max(a[0], a[1]);" )

//Expose interface
exports.BinaryRun     = Run;
exports.BinaryVolume  = BinaryVolume;
exports.sample        = sample;
exports.merge         = merge;

//Boolean set operations
exports.union      = function(a, b) { return merge([a,b], UNION_FUNC); }
exports.intersect  = function(a, b) { return merge([a,b], INTERSECT_FUNC); }
exports.subtract   = function(a, b) { return merge([a,b], SUBTRACT_FUNC); }
exports.complement = function(a)    {
  var nruns = new Array(a.runs.length);
  for(var i=0; i<nruns.length; ++i) {
    var r = a.runs[i];
    nruns[i] = new Run(r.coord.slice(0), r.value);
  }
  return new BinaryVolume(nruns);
};

//Morphological operations
exports.dilate      = dilate;
exports.erode       = erode;
exports.closing     = function(volume, stencil) { return erode(dilate(volume, stencil), stencil); }
exports.opening     = function(volume, stencil) { return dilate(erode(volume, stencil), stencil); }

//Topological stuff
exports.labelComponents = labelComponents;
exports.splitComponents = splitComponents;

//Empty volume constructor
Object.defineProperty(exports, "EMPTY_VOLUME", {
  get: function() {
    return new BinaryVolume([
      new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY],-1.0)
    ]);
  }
});

