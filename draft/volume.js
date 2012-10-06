

//Lexicographic comparison
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
  
//The actual volume object
var Solid = function() {  
  this.vertices   = [];
  this.hermite    = [];
  this.materials  = [];
};

//Returns the material type of a given point
Solid.prototype.classify_point = function(x) {
};
  

function encode(params) {

}

