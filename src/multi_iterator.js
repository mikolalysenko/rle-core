"use strict"; "use restrict";

var misc = require("./misc.js");

var lex_compare       = misc.lex_compare
  , POSITIVE_INFINITY = misc.POSITIVE_INFINITY
  , NEGATIVE_INFINITY = misc.NEGATIVE_INFINITY;

var StencilIterator = require("./stencil_iterator.js").StencilIterator;

//Multivolume iterator
function MultiIterator(volumes, stencil, ptrs, coord) {
  this.volumes  = volumes;
  this.stencil  = stencil;
  this.ptrs     = ptrs;
  this.coord    = coord;
}

//Make a copy of a multivolume iterator
MultiIterator.prototype.clone = function() {
  var ptrs = new Array(this.ptrs.length);
  for(var i=0; i<ptrs.length; ++i) {
    ptrs[i] = this.ptrs[i].slice(0);
  }
  return new MultiIterator(
    this.volumes,
    this.stencil,
    ptrs,
    this.coord.slice(0)
  );
}

//Extract an individual component of this iterator
MultiIterator.prototype.stencil_iterator = function(i) {
  return new StencilIterator(
    this.volumes[i],
    this.stencil,
    this.ptrs[i].slice(0),
    this.coord.slice(0)
  );
}

//Checks if iterator has another value
MultiIterator.prototype.hasNext = function() {
  return this.coord[0] < POSITIVE_INFINITY;
}

//Compute next coordinate of multi iterator
MultiIterator.prototype.nextCoord_rv = function(ncoord) {
  var volumes = this.volumes
    , stencil = this.stencil
    , coord   = this.coord
    , v_ptrs  = this.ptrs
    , tcoord  = [0,0,0];
  
  for(var i=0; i<3; ++i) {
    ncoord[i] = POSITIVE_INFINITY;
  }
  for(var i=0; i<volumes.length; ++i) {
    var runs = volumes[i].runs
      , ptrs = v_ptrs[i];
    for(var j=0; j<stencil.length; ++j) {
      if(ptrs[j] >= runs.length - 1) {
        continue;
      }
      var delta = stencil[j]
        , x     = runs[ptrs[j]+1].coord;
      for(var k=0; k<3; ++k) {
        tcoord[k] = x[k] - delta[k];
      }
      if(lex_compare(tcoord, ncoord) < 0) {
        for(var k=0; k<3; ++k) [
          ncoord[k] = tcoord[k];
        }
      }
    }
  }
}

//Returns next coord
MultiIterator.prototype.nextCoord = function() {
  var ncoord = [0,0,0];
  this.nextCoord_rv(ncoord);
  return ncoord;
}

//Advance to next coordinate
MultiIterator.prototype.next = function() {
  var volumes = this.volumes
    , stencil = this.stencil
    , coord   = this.coord;
  
  //Compute next coordinate
  this.nextCoord_rv(coord);
  
  //Walk pointers
  for(var i=0; i<volumes.length; ++i) {
    var runs = volumes[i].runs
      , ptrs = v_ptrs[i];
outer_loop:
    for(var j=0; j<stencil.length; ++j) {
      if(ptrs[j] >= runs.length - 1) {
        continue;
      }
      var delta = stencil[j]
        , x     = runs[ptrs[j]+1].coord;
      for(var k=0; k<3; ++k) {
        var t = x[k] - delta[k];
        if(t < coord[k]) {
          break;
        } else if(t > coord[k]) {
          continue outer_loop;
        }
      }
      ++ptrs[j];
    }
  }
}

//Perform a multiway iteration over a collection of volumes
function multi_begin(volumes, stencil) {
  return new MultiIterator(
    volumes,
    stencil,
    ptrs,
    [NEGATIVE_INFINITY,NEGATIVE_INFINITY,NEGATIVE_INFINITY]
  );
}

exports.MultiIterator   = MultiIterator;
exports.multi_begin     = multi_begin;