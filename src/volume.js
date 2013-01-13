"use strict"; "use restrict";

//Import miscellaneous library
var misc = require("./misc.js");

//Import globals
var NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

//Run data structure
function Run(coord, distance, phase) {
  this.coord    = coord;
  this.distance = distance;
  this.phase    = phase;
}

//Clones a run
Run.prototype.clone = function() {
  return new Run(this.coord.slice(0), this.distance, this.phase);
}

//A binary volume
function Volume(runs) {
  this.runs = runs;
};

//Make a copy of a volume
Volume.prototype.clone = function() {
  var nruns = new Array(this.runs.length);
  for(var i=0; i<this.runs.length; ++i) {
    nruns[i] = this.runs[i].clone();
  }
  return new Volume(nruns);
}

//Export data structures
exports.Run     = Run;
exports.Volume  = Volume;

exports.empty     = function() {
  return new Volume([
    new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY],1.0,0)
  ]);
}

