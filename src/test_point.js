var misc = require("./misc.js");

var bisect = misc.bisect;

//Checks if a point is contained in a volume
function testPoint(volume, point) {
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
            tcoord[i] = coord[i] + 1;
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

exports.testPoint = testPoint;