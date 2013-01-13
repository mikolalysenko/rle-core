"use strict"; "use restrict";

var volume = require("./volume.js");
var Run     = volume.Run
  , Volume  = volume.Volume;

var createStencil = require("./stencil_iterator.js").createStencil;

var cleanup = require("./repair.js").cleanup;

//Applies a map to the volume
exports.apply = function(volume, stencil, func) {
  var values  = new Array(stencil.length)
    , phases  = new Array(stencil.length)
    , runs    = volume.runs
    , nruns   = [];
  //Iterate over stencils
  for(var iter=createStencil(volume, stencil); iter.hasNext(); iter.next()) {
    var ptrs = iter.ptrs;
    for(var i=0; i<stencil.length; ++i) {
      var run = runs[ptrs[i]];
      values[i] = run.distance;
      phases[i] = run.phase;
    }
    //Get return value
    var retval = func(phases, values);
    nruns.push(new Run(iter.coord.slice(0), retval[0], reval[1]));
  }
  var nv = new Volume(nruns);
  cleanup(nv);
  return nv;
}