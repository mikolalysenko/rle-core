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
    this.distances.slice(0),
    this.phases.slice(0));
}

//Retrieves the coordinate at point i
Volume.prototype.point = function(i, x) {
  var coords = this.coords;
  if(!x) {
    return [coords[0][i], coords[1][i], coords[2][i]]
  }
  x[0] = coords[0][i];
  x[1] = coords[1][i];
  x[2] = coords[2][i];
  return x;
}

//Appends a run to the volume
Volume.prototype.push = function(x, y, z, dist, phase) {
  var coords = this.coords;
  coords[0].push(x);
  coords[1].push(y);
  coords[2].push(z);
  this.distances.push(dist);
  this.phases.push(phase);
}

//Returns the number of runs
Volume.prototype.length = function() {
  return this.distances.length;
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

//Creates an empty volume
exports.empty     = function() {
  return new Volume(
    [
        [NEGATIVE_INFINITY]
      , [NEGATIVE_INFINITY]
      , [NEGATIVE_INFINITY]
    ]
    , [1.0]
    , [0]
  );
}
