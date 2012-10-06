"use strict"; "use restrict";

/** 
 * Limit for coordinate range, valid for suitably small values of infinity.
 * @const
 * @type{int}
 */
var INFINITY   = (1<<30)
  , EPSILON    = 1e-6;

/**
 * A run stored in the binary tree
 * @constructor
 * @param {!Array.number} coord
 * @param {!Array.number} intercept
 * @param {!number} material
 */
function Run(coord, intercept, material) {
  this.coord      = coord;
  this.intercept  = intercept;
  this.material   = material;
};

function lex_compare(p_a, p_b) {
  for(var i=0; i<3; ++i) {
    if(p_a[i] < p_b[i]) {
      return -1;
    } else if(p_a[i] > p_b[i]) {
      return 1;
    }
  }
  return 0;
};


//Default functions
var default_material_func = new Function("x", "y", "z", "return 0;")
  , default_density_func  = new Function("x", "y", "z", "return 0;"); 

/**
 * Run length encodes a potential function
 */
exports.encode = function(params) {
  "use strict";

  var dims          = params.dims || [0,0,0]
    , density_func  = params.density_func || default_density_func
    , density       = params.density_array || []
    , material_func = params.material_func || default_material_func
    , material      = params.material_array || []
    , i_material    = params.interior_material || 1
    , o_material    = params.exterior_material || 0
    , runs          = [ new Run([-INFINITY, -INFINITY, -INFINITY], [0.0,0.0,0.0], o_material) ]
    , x             = [ 0, 0, 0 ]
    , stride        = [ 1, dims[0], dims[0]*dims[1] ]
    , use_density_func    = !!params.density_func
    , use_material_func   = !!params.material_func
    , use_material_array  = !!params.material_array
    , n             = 0
    , crossings     = [ 0.0, 0.0, 0.0 ];

  var z_iter;
  for(x[2]=0; x[2]<dims[2]; ++x[2]) {
    z_iter = runs.length;
    var y_iter;
    for(x[1]=0; x[1]<dims[1]; ++x[1]) {
      y_iter = runs.length;
      for(x[0]=0; x[0]<dims[0]; ++x[0], ++n) {
        //Read in material and density factor
        var rho   = use_density_func ? density_func(x[0], x[1], x[2]) : density[n]
          , mat   = use_material_func ? material_func(x[0], x[1], x[2]) : (use_material_array ? material[n] : (rho > 0.0 ? i_material : o_material));
      
        //Check for 3 crossings
        for(var d=0; d<3; ++d) {
          crossings[d] = 0;
        
          //Unpack coordinate
          var prho  = 0.0
            , pmat  = o_material;
          if(x[d] > 0) {
            var ptr   = n - stride[d];
            x[d] += 1;
            prho = use_density_func ? density_func(x[0], x[1], x[2]) : density[ptr];
            pmat = use_material_func ? material_func(x[0], x[1], x[2]) : (use_material_array ? material[ptr] : (rho > 0.0 ? i_material : o_material))
            x[d] -= 1;
          }
          
          //If materials are different, we have a crossing
          if(pmat !== mat) {
          
            //Compute intersection based on relative densities
            var denom = prho + rho;
            if(Math.abs(denom) < EPSILON) {
              denom = 1.0;
            }
            
            //Find intersection point and clamp it
            var t = Math.floor(prho / denom);
            if(t <= 0) { t = 1e-6; }
            if(t >= 1) { t = 1.0; }
            crossings[d] = t;
          }
        }
        
        //If any cells crossed, then add a new run
        if(  crossings[0] > 0 
          || crossings[1] > 0 
          || crossings[2] > 0) {
            runs.push(new Run(
                [x[0], x[1], x[2]] 
              , [crossings[0], crossings[1], crossings[2]]
              , mat));
        }
      }
      
      //Seal off boundary on x-run
      if(y_iter < runs.length && runs[runs.length-1].material !== o_material) {
        runs.push(new Run([ dims[0], x[1], x[2] ], [1.0, 0.0, 0.0], o_material ));
      }
    }
    
    //Seal off boundary on y-run
    while(y_iter < runs.length) {
      var r = runs[y_iter++];
      if(r.material !== o_material) {
        var start = r.coord[0]
          , stop  = runs[y_iter].coord[0];
        for(var i=start; i<stop; ++i) {
          runs.push(new Run([ i, dims[1], x[2]], [0.0, 1.0, 0.0], o_material));
        }
      }
    }
  }
  
  //Seal off boundary on z-run
  while(z_iter < runs.length) {
    var r = runs[z_iter++];
    if(r.material !== o_material) {
      var start = r.coord[0]
        , stop  = runs[z_iter].coord[0];
      for(var i=start; i<stop; ++i) {
        runs.push(new Run([ i, r.coord[1], dims[2]], [0.0, 0.0, 1.0], o_material));
      }
    }
  }
    
  return runs;
}


//Default orientation for a pair of values
var default_orientation = new Function("a", "b", "return !!a - !!b;");

//Extract boundary from a w
exports.boundary = function(runs, parameters) {
  var params        = parameters || {}
    , orientation   = params.orientation || default_orientation
    , v_iters       = [ 0, 0, 0 ]
    , x             = [ runs[0].coord[0], runs[1].coord[1], runs[2].coord[2] ]
    , vertices      = [];
  
  while(true) {
  
  
    
  
    
  }
}

//Classify a point
exports.classify_point = function(runs, pt) {
}


//Merges a pair of run length encoded volumes together
exports.merge = function(A, B, merge_func) {
}


//Booleans
var unite_func = new Function("a", "b", "return !!a ? a : b")
  , subtract_func = new Function("a", "b", "return !!b ? 0 : a");
exports.unite     = function(A, B) { return exports.merge(A, B, unite_func); };
exports.subtract  = function(A, B) { return exports.merge(A, B, subtract_func); }
  

