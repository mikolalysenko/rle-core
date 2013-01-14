"use strict"; "use restrict";

var empty = require("./volume.js").empty;
var createStencil = require("./stencil_iterator.js").createStencil;
var cleanup = require("./repair.js").cleanup;

//Applies a map to the volume
exports.apply = function(volume, stencil, func) {
  var values      = new Array(stencil.length)
    , phases      = new Array(stencil.length)
    , vdistances  = volume.distances
    , vphases     = volume.phases
    , nvolume     = empty()
    , retval      = { phase: 0, distance: 1.0 };
  //Pop first run
  nvolume.coords[0].pop();
  nvolume.coords[1].pop();
  nvolume.coords[2].pop();
  nvolume.distances.pop();
  nvolume.phases.pop();
  //Iterate over stencils
  for(var iter=createStencil(volume, stencil); iter.hasNext(); iter.next()) {
    var ptrs = iter.ptrs;
    for(var i=0; i<stencil.length; ++i) {
      var p = ptrs[i];
      values[i] = vdistances[p];
      phases[i] = vphases[p];
    }
    //Get return value
    func(phases, values, retval);
    var c = iter.coord;
    nvolume.push(c[0], c[1], c[2], retval.distance, retval.phase);
  }
  //Clean up volume
  cleanup(nvolume);
  return nvolume;
}