var volume = require("./volume.js");
var Run     = volume.Run
  , Volume  = volume.Volume;

var createStencil = require("./stencil_iterator.js").createStencil;

var cleanup = require("./repair.js").cleanup;

//Applies a map to the volume
function apply(volume, stencil, func) {
  var values = new Array(stencil.length)
    , runs = volume.runs
    , nruns = [];

  for(var iter=createStencil(volume, stencil); iter.hasNext(); iter.next()) {
    for(var i=0; i<stencil.length; ++i) {
      values[i] = runs[iter.ptrs[i]].value;
    }
    nruns.push(new Run(iter.coord.slice(0),  func(values) ));
  }
  
  var nv = new Volume(nruns);
  cleanup(nv);
  return nv;
}

exports.apply = apply;