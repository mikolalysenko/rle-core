"use strict"; "use restrict";

//Import miscellaneous library
var misc = require("./misc.js");

//Import globals
var NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

//A binary volume
function Volume(coords, distances, phases) {
  this.coords     = coords;
  this.distances  = distances;
  this.phases     = phases;
};

//Make a copy of a volume
Volume.prototype.clone = function() {
  return new Volume([
      this.coords[0].slice(0),
      this.coords[1].slice(0),
      this.coords[2].slice(0)
    ],
    distances.slice(0),
    phases.slice(0));
}

//Appends a run to the volume
Volume.prototype.push = function(x, y, z, dist, phase) {
  var coords = this.coords;
  coords[0].push(x);
  coords[1].push(y);
  coords[2].push(z);
  distances.push(dist);
  phases.push(phase);
}

//Export data structures
exports.Volume  = Volume;

exports.empty     = function() {
  return new Volume([
      [NEGATIVE_INFINITY]
    , [NEGATIVE_INFINITY]
    , [NEGATIVE_INFINITY]
    ]
    , [1.0]
    , [0]
  );
}

