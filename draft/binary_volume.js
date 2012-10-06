"use strict";

/**
 * Infinitesimal value
 *
 * @const
 * @type number
 */
var EPSILON           = 1e-6;

/**
 * @const
 * @type number
 */
var POSITIVE_INFINITY =  (1<<30)
  , NEGATIVE_INFINITY = -(1<<30);


// Edge tables
var EDGE_TABLE      = new Array(256);  // List of 12-bit masks describing edge crossings

//Edge tables
var CUBE_EDGES      = new Array(12);


//Initialize CUBE_EDGES and EDGE_TABLE with precalculated values
(function(){

var n = 0;
for(var i=0; i<8; ++i) {
  for(var d=0; d<3; ++d) {
    var j = i ^ (1<<d);
    if(j < i) {
      continue;
    }
    CUBE_EDGES[n] = [i, j, d];
    ++n;
  }
}

//Precalculate edge crossings
for(var mask=0; mask<256; ++mask) {
  var e_mask = 0;
  for(var i=0; i<12; ++i) {
    var e = CUBE_EDGES[i];
    if(!(mask & (1<<e[0])) !== !(mask & (1<<e[1]))) {
      e_mask |= (1<<i);
    }
    EDGE_TABLE[mask] = e_mask;
  }
}

})();


/**
 * Lexicographic comparison
 */
function lex_compare(p_a, p_b) {
  for(var i=2; i>=0; --i) {
    if(p_a[i] < p_b[i]) {
      return -1;
    } else if(p_a[i] > p_b[i]) {
      return 1;
    }
  }
  return 0;
}


//Construct linear least squares solver
function lin_solve(A, b) {
  //TODO: Implement this
  return [0.0, 0.0, 0.0];
}


//Volume iterator
function VolumeIterator(volume, iters, coord) {
  this.volume = volume;
  this.iters  = iters;
  this.coord  = coord;
}

//Retrieves the 2x2x2 mask of field values
VolumeIterator.prototype.mask = function() {
  var field = this.volume.density
    , mask  = 0
    , iters = this.iters;
  for(var i=0; i<8; ++i) {
    if(field[iters[i]])
      mask |= (1<<i);
  }
  return mask;
}

//Retrieves the 12 instances of the hermite data surrounding the iterator
VolumeIterator.prototype.hermite = function() {
  var result = new Array(12);
    , hermite_d = this.volume.hermite
    , iters = this.iters;
  for(var i=0; i<12; ++i) {
    var e = CUBE_EDGES[i];
    result[i] = hermite_d[iters[e[0]]][e[2]];
  }
  return result;
}

//Advances to the next position
VolumeIterator.prototype.next = function() {

  

}

//Moves iterator back one step
VolumeIterator.prototype.prev = function() {
}

//Checks if two iterators are equal
VolumeIterator.prototype.equals = function(other) {
}

// Compares a pair of volume iterators
VolumeIterator.prototype.compare = function(other) {
  return lex_compare(this.coord, other.coord);
}


//Binary search
function bisect(lo, hi, pt) {
}



/**
 * A Solid object (binary 0/1 volume)
 *
 *
 */
function BinaryVolume(vertices, hermite, density) {
  this.vertices   = vertices;
  this.hermite    = hermite;
  this.density    = density;
};

//Start iterator
BinaryVolume.prototype.begin = function() {
  return new VolumeIterator(
      this
    , [0,0,0,0,0,0,0,0]
    , [NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY]);
}

//End iterator
BinaryVolume.prototype.end = function() {
  var eob = this.vertices.length;
  return new VolumeIterator(
      this
    , [eob, eob, eob, eob, eob, eob, eob, eob]
    , [POSITIVE_INFINITY, POSITIVE_INFINITY, POSITIVE_INFINITY]);
}


/**
 * Performs a binary search for the point x in the volume
 */
BinaryVolume.prototype.classify_point = function(x) {

}


/**
 * Compute mesh via dual contouring
 */
BinaryVolume.prototype.mesh = function() {

  var m_vertices  = this.vertices
    , m_hermite   = this.hermite
    , m_density   = this.density;
    
  //Construct array of iterators
  var positions = []
    , faces     = []
    , r_iters   = new Array(8)
    , v_iters   = new Array(8)
    , A         = [[0,0,0], [0,0,0], [0,0,0]]
    , b         = [0,0,0]
    , coord     = [0, 0, 0]
    , tmp_vec   = [0, 0, 0]
    , rnd_vec   = [0, 0, 0];
  
  //Initialize iterator windows
  for(var i=0; i<8; ++i) {
    r_iters[i]    = 0;
    v_iters[i]  = 0;
  }
  
  //Walk over all the runs
  while(r_iters[0]+1 < m_vertices.length) {
  
    
    console.log("----- FINDING START VEC ------ ");
    //Try to find next coordinate
    var V = m_vertices[r_iters[0]+1];
    for(var i=0; i<3; ++i) {
      coord[i] = V[i];
    }
    
    console.log("Leading vec = ", coord);
    
    var n = 0;
    for(var dz=0; dz<2; ++dz)
    for(var dy=0; dy<2; ++dy, n+=2) {
      if(dy === 0 && dz === 0) {
        continue;
      }
      
      V = m_vertices[r_iters[n]+1];
      
      tmp_vec[0] = coord[0];
      tmp_vec[1] = coord[1]-dy;
      tmp_vec[2] = coord[2]-dz;
      
      console.log("Testing iter:", n, r_iters[n], V, tmp_vec);
      
      if(lex_compare(V, tmp_vec) < 0) {
        coord[0] = V[0];
        coord[1] = V[1]+dy;
        coord[2] = V[2]+dz;
        console.log("Set leading vec = ", coord);
      }
    }
    
    console.log("----- START:", coord, " -------");
    
    //Walk iterators forward to next coordinate
    var n     = 0
      , mask  = 0;
    for(var dz=0; dz<2; ++dz)
    for(var dy=0; dy<2; ++dy) {
    
      //Compute location to advance leading iterator to
      tmp_vec[0] = coord[0];
      tmp_vec[1] = coord[1]-dy;
      tmp_vec[2] = coord[2]-dz;
      
      console.log("Walking iter to:", tmp_vec);
      
      //Step leading run iterator
      var s = lex_compare(m_vertices[r_iters[n]], tmp_vec);
      while(s < 0 && r_iters[n]+1 < m_vertices.length) {
        console.log("Stepping run-iter", n, r_iters[n], m_vertices[r_iters[n]]);
        s = lex_compare(m_vertices[++r_iters[n]], tmp_vec);
      }
      
      //If at boundary, advance trailing iterator, ow step
      if(s === 0) {
        r_iters[n+1] = Math.max(0, r_iters[n]-1);
      } else if(s > 0) {
        r_iters[n]   = Math.max(0, r_iters[n] - 1);
        r_iters[n+1] = r_iters[n];
      } else {
        r_iters[n+1] = r_iters[n];
      }

      //Compute cube mask based on density thresholds
      if(m_density[r_iters[n]]) {
        mask |= (1<<n);
      }
      if(m_density[r_iters[n+1]]) {
        mask |= (1<<(n+1));
      }      
      
      //Step vertex pointer
      if(v_iters[n] < positions.length) {
        
        V = positions[v_iters[n]];
        for(var i=0; i<3; ++i) {
          rnd_vec[i] = Math.ceil(V[i]);
        }
        s = lex_compare(rnd_vec, tmp_vec);
        
        while(s < 0 && v_iters[n]+1 < positions.length) {
          console.log("Stepping vertex-iter", n, v_iters[n], V);
          ++v_iters[n];  
          V = positions[v_iters[n]];
          for(var i=0; i<3; ++i) {
            rnd_vec[i] = Math.ceil(V[i]);
          }
          s = lex_compare(rnd_vec, tmp_vec);
        }
        
        if(s === 0) {
          v_iters[n+1] = Math.max(0, v_iters[n] - 1);
        } else if(s > 0) {
          v_iters[n] = Math.max(0, v_iters[n] - 1);
          v_iters[n+1] = v_iters[n];
        } else {
          v_iters[n+1] = v_iters[n];
        }
      }
      
      n+= 2;
    }
    
    //TODO: Generate mesh
    
    //Log iterators and mask
    console.log(r_iters, mask.toString(2));    
    for(var i=0; i<8; ++i) {
      console.log("--->", m_vertices[r_iters[i]], m_density[r_iters[i]], i.toString(2));
    }
    
    //Compute vertex
    var edge_mask = EDGE_TABLE[mask];
    if(!edge_mask) {
      console.log("THIS SHOULD NEVER HAPPEN");
      continue;
    }
    
    //Clear Hermite matrix
    for(var i=0; i<3; ++i) {
      b[i] = 0.0;
      for(var j=0; j<3; ++j) {
        A[i][j] = 0.0;
      }
    }
    
    //Pack values into linear least squares matrix
    for(var i=0; i<12; ++i) {
      if(!(edge_mask & (1<<i))) {
        continue;
      }
      var edge    = CUBE_EDGES[i]
        , dir     = edge[2]
        , v0      = edge[0]
        , h       = m_hermite[r_iters[v0]][dir]
        , normal  = h[1];
      
      //Shift plane so that v is in center
      var w = h[0];
      for(var j=0; j<3; ++j) {
        if(edge[0] & (1<<j)) {
          w -= normal[j] * 0.5;
        } else {
          w += normal[j] * 0.5;
        }
      }
      
      console.log("Adding plane:", normal, w);
      
      //Pack values into matrix
      for(var j=0; j<3; ++j) {
        b[j] += normal[j] * w;
        for(var k=0; k<3; ++k) {
          A[j][k] += normal[j] * normal[k];
        }
      }
    }
    
    //Solve linear least squares to get vertex position
    var point = lin_solve(A, b);
    console.log("Linear least squares system:", A, b, point);
    
    //Translate and clamp back into box
    for(var i=0; i<3; ++i) {
      point[i] = coord[i] - Math.min(1.0-EPSILON, Math.max(EPSILON, point[i] + 0.5));
    }
    positions.push(point);
    console.log("Vertex = ", point);
    
    //Increment vertex iterators
    v_iters[0] = positions.length - 1;
    v_iters[1] = Math.max(0, positions.length - 2);
    
    console.log("Vertex iterators:", v_iters);
    for(var i=0; i<8; ++i) {
      console.log("--->", positions[v_iters[i]], i.toString(2) );
    }
    
    //Generate faces
    var e0 = !!(mask & (1<<7))
    for(var d=0; d<3; ++d) {
      var e1 = !!(mask & (1<<(7^(1<<d))));
      if(e0 === e1) {
        continue;
      }
      var u = 1<<((d+1)%3)
        , v = 1<<((d+2)%3);        
      if(e0) {
        faces.push([v_iters[0], v_iters[u], v_iters[u+v], v_iters[v]]);
      } else {
        faces.push([v_iters[0], v_iters[v], v_iters[u+v], v_iters[u]]);
      }
      console.log("Adding face: d=", d, u, v, faces[faces.length-1]);
    }
  }
  
  //Compute position, faces
  return { positions: positions, faces: faces }
}


/**
 * Translates the volume by some amount
 */
BinaryVolume.prototype.translate = function(t) {
}

/**
 * Permutes the axes of the volume
 */
BinaryVolume.prototype.transpose = function() {
}


/**
 * Shears the volume (approximately) by some amount
 */
BinaryVolume.prototype.shear = function() {
}

/**
 *
 */
BinaryVolume.prototype.rotate = function() {
}

/**
 * Converts a volume to a printable string
 */
BinaryVolume.prototype.zip = function() {
  var res = [];
  for(var i=0; i<this.vertices.length; ++i) {
    res.push({
        v: this.vertices[i]
      , hx: this.hermite[i][0]
      , hy: this.hermite[i][1]
      , hz: this.hermite[i][2]
      , f: this.density[i]
    });
  }
  return res;
}


/**
 * Voxelizes a potential function
 *
 * @nosideeffects
 * @param {Array.number} dims Resolution of sampling
 * @param {function(number,number,number):number} potential Potential function to sample
 * @param {function(number,number,number):Array.number} gradient Exterior derivative of potential function
 * @return {BinaryVolume}
 */
function voxelize(dims, potential, gradient) {

  //Gradient of potential function
  var dpotential = gradient || function(x, y, z) {  
    return [
        potential(x+EPSILON, y, z) - potential(x-EPSILON, y, z)
      , potential(x, y+EPSILON, z) - potential(x, y-EPSILON, z)
      , potential(x, y, z+EPSILON) - potential(x, y, z-EPSILON)
    ];
  };

  //Returned stuff
  var vertices    = [[NEGATIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_INFINITY]]
    , hermite     = [ [[0.0,[0.0,0.0,0.0]], [0.0,[0.0,0.0,0.0]], [0.0,[0.0,0.0,0.0]]] ]
    , density     = [ false ];

  //Local variables
  var x = [0,0,0]
    , crossings = [0, 0, 0]
    , has_crossing = [false, false, false]
    , window = new Array((dims[0]+2) * (dims[1]+2) * 2)
    , stride  = [1, dims[0]+2, -(dims[0]+2)*(dims[1]+2)];
  
  
  //Fix window values
  for(var i=0; i<window.length; ++i) {
    window[i] = -1e10
  }
    
  for(x[2]=0; x[2]<=dims[2]; ++x[2]) {
  
    //Compute pointer into window 
    var n = (!(x[2]&1))*Math.abs(stride[2]) + stride[0] + stride[1];
    stride[2] *= -1;
  
    for(x[1]=0; x[1]<=dims[1]; ++x[1], ++n)
    for(x[0]=0; x[0]<=dims[0]; ++x[0], ++n) {
    
      var rho = (x[0] >= dims[0] 
              || x[1] >= dims[1]
              || x[2] >= dims[2]) ? -1 : potential(x[0], x[1], x[2])
        , on_boundary = false;
        
      //Save rho to window
      window[n] = rho;
      
      for(var d=0; d<3; ++d) {
        crossings[d] = 0.0;
        
        //Sample adjacent field value
        var prho = window[n - stride[d]];
        
        //Check for 0-crossing
        if((rho < 0) - (prho < 0)) {
        
          //Compute intersection
          var denom = rho + prho
            , t = 0.0;
          if(Math.abs(denom) < EPSILON) {
            t = 0.5;
          } else {
            t = prho / denom;
            if(t < 0.0)   { t = 0.0 }
            if(t > 1.0)   { t = 1.0 }
          }
          
          //Set crossing value
          crossings[d] = t;
          has_crossing[d] = true;
          on_boundary = true;
        } else {
          has_crossing[d] = false;
        }
      }
     
      
      //If we crossed boundary, add a new run
      if(on_boundary) {
      
        //Evaluate Hermite data
        var n_hermite = []
          , p = [x[0], x[1], x[2]];
        for(var d=0; d<3; ++d) {
        
          //Make sure we have some crossing
          if(!has_crossing[d]) {
            n_hermite.push([0, [0, 0, 0]]);
            continue;
          }
          
          //Evaluate gradient
          p[d] += crossings[d];
          var grad  = dpotential(p[0], p[1], p[2]);
          p[d] = x[d];
          
          //Normalize gradient vector and find plane through crossing
          var s = grad[0]*grad[0]+grad[1]*grad[1]+grad[2]*grad[2]
            , w = crossings[d];
          if(s < EPSILON*EPSILON) {
            //First pathological case: Gradient is almost 0
            for(var i=0; i<3; ++i) {
              grad[i] = (i === d) ? 1.0 : 0.0;
            }
          } else {
            s = 1.0 / Math.sqrt(s);
            for(var i=0; i<3; ++i) {
              grad[i] *= s;
            }
            
            //Second pathological case: Gradient is tangent to crossing direction
            if(Math.abs(grad[d]) < EPSILON) {
              if(grad[d] < 0) {
                grad[d] -= EPSILON;
              } else {
                grad[d] += EPSILON;
              }
              w = 0.0;
            } else {
              w /= grad[d];
            }
          }
          
          //Save result
          n_hermite.push([w, grad]);
        }

        //Append run
        vertices.push([x[0], x[1], x[2]]);
        hermite.push(n_hermite);
        density.push(rho >= 0);
      }
    }
  }
    
  //Returns the binary volume
  return new BinaryVolume(vertices, hermite, density);
}


/**
 * Applies a k-ary operator to a collection of volumes
 */
function merge(volumes, operation) {
}



//Declare exports
exports.CUBE_EDGES  = CUBE_EDGES;
exports.voxelize    = voxelize;
exports.merge       = merge;

