//Import libraries
var $             = require('jquery-browserify')
  , GLOW          = require('./GLOW.js')
  , ArcballCamera = require('arcball')
  , utils         = require('./utils.js')
  , EventEmitter  = require('events').EventEmitter;

exports.makeShell = function(params) {
  if(!params) {
    params = {};
  }
  var shell = {};
  var bg_color    = params.bg_color ? [ 0.1, 0.2, 0.8 ]
    , camera_pos  = params.camera_pos ? [ 0, 0, 50 ]
    , container   = params.container ? "#container";

  //Create event emitter
  shell.events = new EventEmitter();

  //Initialize GLOW
  shell.context = new GLOW.Context();
  if(!context.enableExtension("OES_texture_float")) {
    throw new Exception("No support for float textures");
  }
  GLOW.defaultCamera.localMatrix.setPosition(
      camera_pos[0]
    , camera_pos[1]
    , camera_pos[2]
  );
  GLOW.defaultCamera.update();
  
  //Create arcball camera
  shell.camera = new ArcballCamera();
  shell.buttons = {
      rotate: false
    , pan: false
    , zoom: false
  };
  
  //Hook up controls
  var buttons = this.buttons;
  shell.container = container;
  $(container).appendChild( shell.context.domElement );
  $(container).mousemove(function(e) {
    var c = $(container);
    c.update(e.pageX/c.width()-0.5, e.pageY/container.height()-0.5, {
      rotate: buttons.rotate || !(e.ctrlKey || e.shiftKey) && (e.which === 1),
      pan:    buttons.pan    || (e.ctrlKey && e.which !== 0) || (e.which === 2),
      zoom:   buttons.zoom   || (e.shiftlKey && e.which !== 0) || e.which === 3
    })
  });
  $(document).keydown(function(e) {
    if(e.keyCode === 65) {
      buttons.rotate = true;
    }
    if(e.keyCode === 83) {
      buttons.pan = true;
    }
    if(e.keyCode === 68) {
      buttons.zoom = true;
    }
  });
  $(document).keyup(function(e) {
    if(e.keyCode === 65) {
      buttons.rotate = false;
    }
    if(e.keyCode === 83) {
      buttons.pan = false;
    }
    if(e.keyCode === 68) {
      buttons.zoom = false;
    }
  });
  
  //Render loop
  function render() {
    shell.context.cache.clear();
    shell.context.enableDepthTesting();
    shell.context.enableCulling(false);
    shell.context.clear();
  
    shell.events.emit("render");
    
    utils.nextFrame(render);
  }
  
  return shell;
}
