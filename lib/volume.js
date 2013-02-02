"use strict"; "use restrict";

//Import miscellaneous library
var misc = require("./misc.js");

//Import globals
var NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

//Creates a dynamic volume
function DynamicVolume(coords_, distances_, phases_) {
  this.coords     = coords_;
  this.distances  = distances_;
  this.phases     = phases_;
};

//Make a copy of a dynamic volume
DynamicVolume.prototype.clone = function() {
  return new DynamicVolume([
    this.coords[0].slice(0),
    this.coords[1].slice(0),
    this.coords[2].slice(0)
  ],  this.distances.slice(0)
    , this.phases.slice(0));
}

//Returns length of volume
DynamicVolume.prototype.length = function() {
  return this.phases.length;
}

//Pops off the last run
DynamicVolume.prototype.pop = function() {
  this.coords[0].pop();
  this.coords[1].pop();
  this.coords[2].pop();
  this.distances.pop();
  this.phases.pop();
}

//Appends a run to the volume
DynamicVolume.prototype.push = function(x, y, z, dist, phase) {
  var coords = this.coords;
  coords[0].push(x);
  coords[1].push(y);
  coords[2].push(z);
  this.distances.push(dist);
  this.phases.push(phase);
}

//Binary search
DynamicVolume.prototype.bisect = function (coord, lo, hi) {
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


//Creates a volume
DynamicVolume.prototype.toStatic = function() {
  return new StaticVolume([
    new Int32Array(this.coords[0]),
    new Int32Array(this.coords[1]),
    new Int32Array(this.coords[2])
  ],
  new Float32Array(this.distances),
  new Int32Array(this.phases));
}


//A binary volume using typed arrays.
//Faster access, but can't modify volume dynamically
function StaticVolume(coords, distances, phases) {
  this.coords     = coords;
  this.distances  = distances;
  this.phases     = phases;
};

//Make a copy of a volume
StaticVolume.prototype.clone = function() {
  return new StaticVolume([
      new Int32Array(this.coords[0]),
      new Int32Array(this.coords[1]),
      new Int32Array(this.coords[2])
    ],
    new Float64Array(this.distances),
    new Int32Array(this.phases));
}

//Returns the number of runs
StaticVolume.prototype.length = function() {
  return this.phases.length;
}

var ArraySlice = Array.prototype.slice;
StaticVolume.prototype.toDynamic = function() {
  return new DynamicVolume([
    ArraySlice.call(this.coords[0], 0),
    ArraySlice.call(this.coords[1], 0),
    ArraySlice.call(this.coords[2], 0)
  ] , ArraySlice.call(this.distances, 0)
    , ArraySlice.call(this.phases, 0));
}

//Bisect to find run containing coord within interval
StaticVolume.prototype.bisect = function (coord, lo, hi) {
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
exports.StaticVolume   = StaticVolume;
exports.DynamicVolume  = DynamicVolume;

