"use strict"; "use restrict";

//Import miscellaneous library
var misc = require("./misc.js");

//Import globals
var NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

function VolumeBuilder() {
  this.coords     = [[NEGATIVE_INFINITY], [NEGATIVE_INFINITY], [NEGATIVE_INFINITY]];
  this.distances  = [0];
  this.phases     = [0];
};

VolumeBuilder.prototype.pop = function() {
  this.coords[0].pop();
  this.coords[1].pop();
  this.coords[2].pop();
  this.distances.pop();
  this.phases.pop();
}

//Appends a run to the volume
VolumeBuilder.prototype.push = function(x, y, z, dist, phase) {
  var coords = this.coords;
  coords[0].push(x);
  coords[1].push(y);
  coords[2].push(z);
  this.distances.push(dist);
  this.phases.push(phase);
}

//Creates a volume
VolumeBuilder.prototype.makeVolume = function() {
  return new Volume([
    new Int32Array(this.coords[0]),
    new Int32Array(this.coords[1]),
    new Int32Array(this.coords[2])
  ],
  new Float32Array(this.distances),
  new Int32Array(this.phases));
}

//A binary volume
function Volume(coords, distances, phases) {
  this.coords     = coords;
  this.distances  = distances;
  this.phases     = phases;
};

//Make a copy of a volume
Volume.prototype.clone = function() {
  return new Volume([
      new Int32Array(this.coords[0]),
      new Int32Array(this.coords[1]),
      new Int32Array(this.coords[2])
    ],
    new Float64Array(this.distances),
    new Int32Array(this.phases));
}

//Retrieves the coordinate at point i
Volume.prototype.point = function(i, x) {
  var coords = this.coords;
  x[0] = coords[0][i];
  x[1] = coords[1][i];
  x[2] = coords[2][i];
  return x;
}

//Returns the number of runs
Volume.prototype.length = function() {
  return this.phases.length;
}

//Bisect to find run containing coord within interval
Volume.prototype.bisect = function(coord, lo, hi) {
  var coords = this.coords;
outer_loop:
  while (lo <= hi) {
    var mid = (lo + hi) >> 1;
    for(var i=2; i>=0; --i) {
      var s = coords[i][mid] - coord[i];
      if(s < 0) {
        lo = mid + 1;
        continue outer_loop;
      } else if(s > 0) {
        hi = mid - 1;
        continue outer_loop;
      }
    }
    return mid;
  }
  return Math.max(0,hi);
}

//Export data structures
exports.Volume  = Volume;

exports.VolumeBuilder = VolumeBuilder;

//Creates an empty volume
exports.empty     = function() {
  return new VolumeBuilder().makeVolume();
}
