//Extracts a surface from the volume using elastic surface nets
BinaryVolume.prototype.surface = function(lo, hi) {
  var positions = []
    , faces     = []
    , runs      = this.runs
    , vals      = [0,0,0,0,0,0,0,0]
    , v_ptr     = [0,0,0,0,0,0,0,0]
    , nc        = [0,0,0]
    , nd        = [0,0,0];
  
  if(!lo) {
    lo = [NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY];
  }
  if(!hi) {
    hi = [POSITIVE_INFINITY, POSITIVE_INFINITY, POSITIVE_INFINITY];
  }

  var iter = createStencil(this, SURFACE_STENCIL);
  iter.seek(lo);

main_loop:
  for(; iter.hasNext(); iter.next()) {
  
    //Skip coordinates outside range
    var coord = iter.coord;
    for(var i=0; i<3; ++i) {
      if(coord[i] < lo[i] || coord[i] >= hi[i]) {
        continue main_loop;
      }
    }
    //Exit if we are out of bounds
    if(compareCoord(hi, coord) <= 0) {
      break;
    }
  
    //Read in values and mask
    var ptrs = iter.ptrs
      , mask = 0;
    for(var i=0; i<8; ++i) {
      var v = runs[ptrs[i]].value;
      vals[i] = v;
      mask |= v < 0 ? 0 : (1 << i);
    }
    if(mask === 0 || mask === 0xff) {
      continue;
    }
    //Compute centroid
    var crossings = EDGE_TABLE[mask]
      , centroid  = [0,0,0]
      , count     = 0;
    for(var i=0; i<12; ++i) {
      if((crossings & (1<<i)) === 0) {
        continue;
      }
      var edge = CUBE_EDGES[i]
        , eu = edge[0]
        , u = vals[eu]
        , v = vals[edge[1]]
        , d = edge[2];
      for(var j=0; j<3; ++j) {
        if(eu & (1<<j)) {
          centroid[j] -= 1.0-EPSILON;
        }
      }
      centroid[d] -= Math.min(1.0-EPSILON,Math.max(EPSILON, u / (u - v)));
      ++count;
    }
    //Compute vertex
    var coord   = iter.coord
      , weight  = 1.0 / count;
    for(var i=0; i<3; ++i) {
      centroid[i] = coord[i] + centroid[i] * weight;
    }
    //Append vertex
    positions.push(centroid);
    //Advance vertex pointers
outer_loop:
    for(var i=0; i<8; ++i) {
      while(true) {
        if(v_ptr[i] >= positions.length -1) {
          continue outer_loop;
        }
        var p = positions[v_ptr[i]+1];
        for(var j=0; j<3; ++j) {
          nc[j] = coord[j] - ((i&(1<<j)) ? 1 : 0);
          nd[j] = Math.ceil(p[j]);
        }
        var s = compareCoord(nd, nc);
        if(s <=0) {
          ++v_ptr[i];
        }
        if(s >= 0) {
          break;
        }
      }
    }
    
    //Check if face in bounds
    for(var i=0; i<3; ++i) {
      if(coord[i] <= lo[i]) {
        continue main_loop;
      }
    }
    
    //Add faces
    for(var i=0; i<3; ++i) {
      if(!(crossings & (1<<i))) {
        continue;
      }
      var iu = 1<<((i+1)%3)
        , iv = 1<<((i+2)%3);
      if(mask & 128) {
        faces.push([v_ptr[0],  v_ptr[iu], v_ptr[iv]]);
        faces.push([v_ptr[iv], v_ptr[iu], v_ptr[iu+iv]]);
      } else {
        faces.push([v_ptr[0],  v_ptr[iv], v_ptr[iu]]);
        faces.push([v_ptr[iu], v_ptr[iv], v_ptr[iu+iv]]);
      }
    }
  }
  return {
    positions: positions,
    faces:     faces
  };
}
