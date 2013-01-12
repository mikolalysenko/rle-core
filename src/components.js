var UnionFind = require("union-find").UnionFind;
var SURFACE_STENCIL = require("./surface.js").SURFACE_STENCIL;
var createStencil = require("./stencil_iterator.js").createStencil;
var misc = require("./misc.js");
var CROSS_STENCIL = misc.CROSS_STENCIL;
var volume = require("./volume.js");
var Run = volume.Run
  , Volume = volume.Volume;

//Extracts all connected components of the volume
function labelComponents(volume) {
  //First assign labels
  var runs   = volume.runs
    , forest = new UnionFind(runs.length);
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
  for(var iter=createStencil(volume, CROSS_STENCIL); iter.hasNext(); iter.next()) {
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
    volumes[i] = new Volume(components[i]);
  }
  return volumes;
}

