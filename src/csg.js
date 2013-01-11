var merge = require("./merge.js").merge;

var volume  = require("./volume.js");
var Run     = volume.Run
  , Volume  = volume.Volume;

//Subtract a function
var SUBTRACT_FUNC   = new Function("a", "return Math.min(a[0],-a[1]);" )
  , INTERSECT_FUNC  = new Function("a", "return Math.min(a[0], a[1]);" )
  , UNITE_FUNC      = new Function("a", "return Math.max(a[0], a[1]);" );

//CSG
exports.unite      = function(a, b) { return merge([a,b], UNITE_FUNC); }
exports.intersect  = function(a, b) { return merge([a,b], INTERSECT_FUNC); }
exports.subtract   = function(a, b) { return merge([a,b], SUBTRACT_FUNC); }
exports.complement = function(a)    {
  var nruns = new Array(a.runs.length);
  for(var i=0; i<nruns.length; ++i) {
    var r = a.runs[i];
    nruns[i] = new Run(r.coord.slice(0), r.value);
  }
  return new Volume(nruns);
};
