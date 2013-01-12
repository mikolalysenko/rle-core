"use strict"; "use restrict";

//Import miscellaneous library
var misc = require("./misc.js");

//Import globals
var compareCoord      = misc.compareCoord
  , bisect            = misc.bisect
  , EPSILON           = misc.EPSILON
  , POSITIVE_INFINITY = misc.POSITIVE_INFINITY
  , NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

//Run data structure
var Run = new Function("coord", "value", [
  "this.coord=coord;",
  "this.value=value;"
].join("\n"));


//A binary volume
function Volume(runs) {
  this.runs = runs;
};

//Make a copy of a volume
Volume.prototype.clone = function() {
  var nruns = new Array(this.runs.length);
  for(var i=0; i<this.runs.length; ++i) {
    var r = this.runs[i]
      , c = r.coord;
    nruns[i] = new Run([c[0], c[1], c[2]], r.value);
  }
  return new Volume(nruns);
}

//Export data structures
exports.Run     = Run;
exports.Volume  = Volume;

exports.empty     = function() {
  return new Volume([
    new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY],-1.0)
  ]);
}

