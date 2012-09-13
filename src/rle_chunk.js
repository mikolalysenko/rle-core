"use strict"; "use restrict";

var TRIPLE_BITS         = 10
  , TRIPLE_MAX          = (1<<TRIPLE_BITS)
  , TRIPLE_MASK         = TRIPLE_MAX-1
  , NEGATIVE_INFINITY   = -(1<<30);

function itriple(x,y,z)  { return x | (y<<TRIPLE_BITS) | (z<<(TRIPLE_BITS*2)); };
function part0(t)        { return t & TRIPLE_MASK; };
function part1(t)        { return (t >> TRIPLE_BITS) & TRIPLE_MASK; };
function part2(t)        { return t >> (TRIPLE_BITS*2); };

function Run(p, v, m) {
  this.pos          = p;
  this.intercept    = v;
  this.material     = m;
}

//Binary search a list
function bsearch_runs(a, v, lo, hi) {
  while(lo < hi) {
    var m = (lo + hi) >> 1
      , m_val = a[m].pos;
    if(m_val < v) {
      hi = m - 1;
    } else if(m_val > v) {
      lo = m + 1;
    } else {
      return m;
    }
  }
  return lo;
}

//Run length encode a volume
function encode_potential(dims, density, material) {
  var runs        = [ new Run(NEGATIVE_INFINITY, 0, 0) ]
    , iters       = [ 0, 0, 0 ]
    , x           = [ 0, 0, 0 ]
    , n           = 0
    , crossings   = [ 0, 0, 0 ]
    , stride      = [ 1, dims[0], dims[0]*dims[1] ];

  for(x[2]=0; x[2]<dims[2]; ++x[2])
  for(x[1]=0; x[1]<dims[1]; ++x[1])
  for(x[0]=0; x[0]<dims[0]; ++x[0], ++n) {
  
    //Read in material and density factor
    var mat   = material[n]
      , den   = density[n];
  
    //Check for 3 crossings
    var idx = itriple(x[0], x[1], x[2]);
    for(var d=0; d<3; ++d) {
      crossings[d] = 0;
    
      //Get iterator position and maybe step if we are past this run
      var iter = iters[d];
      if(iter+1 < runs.length) {
        var n_idx = idx - (1<<(TRIPLE_BITS*d));
        if(runs[iter+1].pos <= n_idx) {
          iter = ++iters[d];
        }
      }
      
      //Unpack coordinate
      var pmaterial = 0
        , pdensity  = 0;
      if(x[d] > 0) {
        var ptr   = n - stride[d]
        pmaterial = material[ptr];
        pdensity  = density[ptr];
      }
      
      //If materials are different, we have a crossing
      if(pmaterial !== mat) {
      
        //Compute intersection based on relative densities
        var denom = pdensity + den;
        if(Math.abs(denom) < 1e-6) {
          denom = 1.0;
        }
        
        //Find intersection point and clamp it
        var t = Math.floor(TRIPLE_MASK * pdensity / denom);
        if(t <= 0) { t = 1; }
        if(t >= TRIPLE_MASK) { t = TRIPLE_MASK; }
        crossings[d] = t;
      }
    }
    
    //If any cells crossed, then add a new run
    if(crossings[0] || crossings[1] || crossings[2]) {
      runs.push(new Run(idx, itriple(crossings[0], crossings[1], crossings[2]), mat));
    }
  }
  
  return runs;
}

exports.encode_potential = encode_potential;


