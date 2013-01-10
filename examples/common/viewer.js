//Simple mesh viewer
var $             = require('jquery-browserify')
  , GLOW          = require('./GLOW.js').GLOW
  , utils         = require('./utils.js')
  , trimesh       = require('trimesh');

exports.makeViewer = function(params) {

  var shell = require('./shell.js').makeShell(params);

  var shaderInfo = {
    vertexShader: [
      "uniform     mat4     transform;",
      "uniform     mat4     cameraInverse;",
      "uniform     mat4     cameraProjection;",
      
      "attribute  vec3      position;",
      "attribute  vec3      normal;",
      
      "varying    vec3      f_normal;",
      
      "void main(void) {",
        "gl_Position = cameraProjection * cameraInverse * transform * vec4( position, 1.0 );",
        "f_normal = normal;",
      "}"
    ].join("\n"),
    fragmentShader: [
      "#ifdef GL_ES",
        "precision highp float;",
      "#endif",
      
      "varying vec3 f_normal;",
      
      "void main() {",
        "gl_FragColor = vec4(0.5*f_normal+0.5, 1.0);",
      "}"
    ].join("\n"),
    data: {
      transform:        new GLOW.Matrix4(),
      cameraInverse:    GLOW.defaultCamera.inverse,
      cameraProjection: GLOW.defaultCamera.projection,
      position:         new Float32Array([0,0,0,1,0,0,0,1,0]),
      normal:           new Float32Array([0,0,1,0,0,1,0,0,1])
    },
    interleave: {
      position: false,
      normal:   false
    },
    indices: new Uint16Array([0,1,2]),
    primitives: GL.LINES,
    usage:     GL.DYNAMIC_DRAW
  };
  
  shell.shader = new GLOW.Shader(shaderInfo);
  
  //Update mesh
  shell.updateMesh = function(params) {
  
    console.log("Vertex count:", params.positions.length, "Face count:", params.faces.length);
  
    //Update elements
    var faces = params.faces;
    var elements = shell.shader.elements;
    elements.length = faces.length*3;
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, elements.elements);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(utils.flatten(faces)), GL.DYNAMIC_DRAW);
    
    //Updates buffer data
    shell.shader.normal.bufferData(new Float32Array(utils.flatten(trimesh.vertex_normals(params))));
    
    //Update buffer data
    shell.shader.position.bufferData(new Float32Array(utils.flatten(params.positions)), GL.DYNAMIC_DRAW);
  }

  //Draw mesh
  shell.events.on('render', function() {
    var matrix = shell.camera.matrix()
      , xform  = shell.shader.transform;
    for(var i=0; i<4; ++i) {
      for(var j=0; j<4; ++j) {
        xform.value[i+4*j] = matrix[i][j];
      }
    }
    shell.shader.draw();
  });

  return shell;
}