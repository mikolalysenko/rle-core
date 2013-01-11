var misc = require("./misc.js");
var CROSS_STENCIL = misc.CROSS_STENCIL;
var createStencil = require("./stencil_iterator.js").createStencil;

//Clean up redundant runs
exports.cleanup = function(volume) {
  var dead_runs = []
    , runs      = volume.runs;
  
  //Skip first run
  var iter = createStencil(volume, CROSS_STENCIL);
  iter.next();

outer_loop:
  for(; iter.hasNext(); iter.next()) {
    //Skip runs which aren't at center
    var r = runs[iter.ptrs[0]];
    for(var i=0; i<3; ++i) {
      if(iter.coord[i] !== r.coord[i]) {
        continue outer_loop;
      }
    }
    //Check if all neighbors are equal
    var s = r.value < 0;
    for(var i=1; i<7; ++i) {
      if(s !== (runs[ iter.ptrs[i] ].value < 0) ) {
        continue outer_loop;
      }
    }
    dead_runs.push(iter.ptrs[0]);
  }
  
  //Remove dead runs
  if(dead_runs.length > 0) {
    var ptr = dead_runs[0];
    for(var i=0; i<dead_runs.length; ++i) {
      var l = dead_runs[i]+1
        , h = i < dead_runs.length-1 ? dead_runs[i+1] : runs.length;
      for(var j=l; j<h; ++j) {
        var s = runs[ptr++]
          , t = runs[j];
        for(var k=0; k<3; ++k) {
          s.coord[k] = t.coord[k];
        }
        s.value = t.value;
      }
    }
    runs.length = runs.length - dead_runs.length;
  }
}
