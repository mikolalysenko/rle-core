var apply = require("./apply.js").apply;

var DILATE_FUNC = new Function("v", [
  "var r = v[0];",
  "for(var i=1; i<v.length; ++i) {",
    "r = Math.min(r, v);",
  "}",
  "return r;"
].join("\n"));

function dilate(volume, stencil) {
  return apply(volume, stencil, DILATE_FUNC);
}

var ERODE_FUNC = new Function("v", [
  "var r = v[0];",
  "for(var i=1; i<v.length; ++i) {",
    "r = Math.max(r, v);",
  "}",
  "return r;"
].join("\n"));

function erode(volume, stencil) {
  return apply(volume, stencil, ERODE_FUNC);
}

exports.apply   = apply;
exports.dilate  = dilate;
exports.erode   = erode
exports.closing = function(volume, stencil) { return erode(dilate(volume, stencil), stencil); }
exports.opening = function(volume, stencil) { return dilate(erode(volume, stencil), stencil); }
