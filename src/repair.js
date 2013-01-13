"use strict"; "use restrict";

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
    var phase = r.phase;
    for(var i=1; i<7; ++i) {
      if(phase !== runs[ iter.ptrs[i] ].phase ) {
        continue outer_loop;
      }
    }
    dead_runs.push(iter.ptrs[0]);
  }
  //Remove dead runs
  if(dead_runs.length > 0) {
    var ptr = dead_runs[0];
    for(var i=0; i<dead_runs.length; ++i) {
      //Copy interval from [l,h] backwards (ie do a memmove)
      var l = dead_runs[i]+1
        , h = i < dead_runs.length-1 ? dead_runs[i+1] : runs.length;
      for(var j=l; j<h; ++j) {
        var s = runs[ptr++]
          , t = runs[j];
        for(var k=0; k<3; ++k) {
          s.coord[k] = t.coord[k];
        }
        s.distance  = t.distance;
        s.phase     = t.phase;
      }
    }
    //Resize buffer
    runs.length = runs.length - dead_runs.length;
  }
}
