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
function Volume(runs, nfaces) {
  this.runs       = runs;
};

//Make a copy of a volume
Volume.prototype.clone = function() {
  var nruns = new Array(this.runs.length);
  for(var i=0; i<this.runs.length; ++i) {
    var r = this.runs[i]
      , c = r.coord;
    nruns[i] = new Run([c[0], c[1], c[2]], r.value);
  }
  return new BinaryVolume(nruns);
}

//Checks if a point is contained in a volume
Volume.prototype.testPoint = function(point) {
  var frac  = [0,0,0]
    , coord = [0,0,0];
  for(var i=0; i<3; ++i) {
    coord[i] = Math.floor(point[i]);
    frac[i]  = point[i] - coord[i];
  }
  var s = 0.0
    , d = [0,0,0]
    , tcoord = [0,0,0];
  for(d[2]=0; d[2]<2; ++d[2]) {
    for(d[1]=0; d[1]<2; ++d[1]) {
      for(d[0]=0; d[0]<2; ++d[0]) {
        var w = 1.0;
        for(var i=0; i<3; ++i) {
          if(d[i]) {
            tcoord[i] = coord[i] - 1;
            w *= (1.0 - frac[i]);
          } else {
            tcoord[i] = coord[i];
            w *= frac[i];
          }
        }
        s += w * this.runs[bisect(this.runs, 0, this.runs.length, tcoord)].value;
      }
    }
  }
  return s >= 0;
}


//Export data structures
exports.Run     = Run;
exports.Volume  = Volume;

exports.empty     = function() {
  return new Volume([
    new Run([NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY],-1.0)
  ]);
}

