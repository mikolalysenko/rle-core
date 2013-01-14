"use strict"; "use restrict";

var misc = require("./misc.js");
var CROSS_STENCIL = misc.CROSS_STENCIL;
var createStencil = require("./stencil_iterator.js").createStencil;

//Remove old indices
function deleteIndices(array, dead_runs) {
  var ptr = dead_runs[0];
  for(var i=0; i<dead_runs.length; ++i) {
    //Copy interval from [l,h] backwards (ie do a memmove)
    var l = dead_runs[i]+1
      , h = i < dead_runs.length-1 ? dead_runs[i+1] : array.length;
    for(var j=l; j<h; ++j) {
      array[ptr++] = array[j];
    }
  }
  //Resize buffer
  array.length = array.length - dead_runs.length;
}

//Clean up redundant runs
exports.cleanup = function(volume) {
  var dead_runs   = []
    , vcoords     = volume.coords
    , vdistances  = volume.distances
    , vphases     = volume.phases;
  //Skip first run
  var iter    = createStencil(volume, CROSS_STENCIL)
    , icoord  = iter.coord
    , ptrs    = iter.ptrs;
  iter.next();
outer_loop:
  for(; iter.hasNext(); iter.next()) {
    //Skip runs which aren't at center
    var cptr = iter.ptrs[0];
    for(var i=0; i<3; ++i) {
      if(icoord[i] !== vcoords[i][cptr]) {
        continue outer_loop;
      }
    }
    //Check if all neighbors are equal
    var phase = vphases[cptr];
    for(var i=1; i<7; ++i) {
      if(phase !== vphases[ptrs[i]] ) {
        continue outer_loop;
      }
    }
    dead_runs.push(cptr);
  }
  //Remove dead runs
  if(dead_runs.length > 0) {
    for(var i=0; i<3; ++i) {
      deleteIndices(vcoords[i], dead_runs);
    }
    deleteIndices(vdistances, dead_runs);
    deleteIndices(vphases, dead_runs);
  }
}
