
//Applies a map to the volume
function map(volume, stencil, func) {
  var values = new Array(stencil.length)
    , runs = volume.runs
    , nruns = [];

  for(var iter=createStencil(volume, stencil); iter.hasNext(); iter.next()) {
    for(var i=0; i<stencil.length; ++i) {
      values[i] = runs[iter.ptrs[i]].value;
    }
    nruns.push(new Run(iter.coord.slice(0), func(values)));
  }
  
  var nv = new BinaryVolume(nruns);
  nv.cleanup();
  return nv;
}

var DILATE_FUNC = new Function("v", [
  "var r = v[0];",
  "for(var i=1; i<v.length; ++i) {",
    "r = Math.min(r, v);",
  "}",
  "return r;"
].join("\n"));

function dilate(volume, stencil) {
  return map(volume, stencil, DILATE_FUNC);
}

var ERODE_FUNC = new Function("v", [
  "var r = v[0];",
  "for(var i=1; i<v.length; ++i) {",
    "r = Math.max(r, v);",
  "}",
  "return r;"
].join("\n"));

function erode(volume, stencil) {
  return map(volume, stencil, ERODE_FUNC);
}

exports.map     = map;
exports.dilate  = dilate;
exports.erode   = erode
exports.closing = function(volume, stencil) { return erode(dilate(volume, stencil), stencil); }
exports.opening = function(volume, stencil) { return dilate(erode(volume, stencil), stencil); }


