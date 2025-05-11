// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_viewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }

  }` 

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_viewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_whichTexture;

let g_globalAngleX=180;
let g_globalAngleY=0;

function setupWebGL() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {perserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_viewMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');
  if (!u_viewMatrix) {
    console.log('Failed to get the storage location of u_viewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {
  var image0 = new Image();  // Create the image object
  var image1 = new Image();
  if (!image0 || !image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendTextureToTEXTURE0(image0); };
  image1.onload = function(){ sendTextureToTEXTURE1(image1); };
  // Tell the browser to load an image
  image0.src = 'sky.jpg';
  image1.src = 'plastered_wall_04_diff_4k.jpg';

  return true;
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
}

function sendTextureToTEXTURE1(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
}


let animationOn = false;
let pokeOn = false;


function addActionsForHTMLUI() {

  document.getElementById('animationOnButton').onclick = function() {camera.moveLeft(); };
  document.getElementById('animationOffButton').onclick = function() {camera.moveRight(); };
}

function reset() {
  headX = 0;
  headY = 0;
  headZ = 0;

  bodyX = 0;
  bodyY = 0;
  bodyZ = 0;

  tailX = 0;
  tailY = 0;

  leftLegX = 0;
  leftLegY = 0;

  rightLegX = 0;
  rightLegY = 0;

  leftShoulderX = 0;
  leftShoulderY = 0;
  leftShoulderZ = 0;

  leftArmX = 0;
  leftArmY = 0;
  leftArmZ = 0;

  leftHandX = 0;
  leftHandY = 0;
  leftHandZ = 0;

  rightShoulderX = 0;
  rightShoulderY = 0;
  rightShoulderZ = 0;

  rightArmX = 0;
  rightArmY = 0;
  rightArmZ = 0;

  rightHandX = 0;
  rightHandY = 0;
  rightHandZ = 0;
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHTMLUI();

  document.onkeydown = keydown;
  canvas.onclick = async (ev) => {
    click(ev);
    await canvas.requestPointerLock();
  }

  canvas.addEventListener("mousemove", (ev) => {
    if (document.pointerLockElement != canvas){
      return;
    }
    if (ev.movementX > 0) {
      camera.panRight();
    } else if (ev.movementX < 0) {
      camera.panLeft();
    }
    if (ev.movementY < 0) {
      camera.panUp();
    } else if (ev.movementY > 0) {
      camera.panDown();
    }
  })
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.2, 0.2, 0.8);

  // Clear <canvas>
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var elasped = 0;

function tick() {
  g_seconds=performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}


function keydown(ev) {
  if (ev.keyCode == 87) {
    camera.moveForward();
  } else if (ev.keyCode == 83) {
    camera.moveBackward();
  } else if (ev.keyCode == 65) {
    camera.moveLeft();
  } else if (ev.keyCode == 68) {
    camera.moveRight();
  } else if (ev.keyCode == 81) {
    camera.panLeft();
  } else if (ev.keyCode == 69) {
    camera.panRight();
  } else if (ev.keyCode == 82) {
    console.log(camera.eye);
    console.log(camera.at);
    map[32-6][16] = 1; // 0, -10
  }
}

function click(ev) {
  if (document.pointerLockElement != canvas) {
    return;
  }
  let x = 16 - Math.ceil(camera.at.elements[0]);
  let y = 16 - Math.ceil(camera.at.elements[2]);
  if ((x <= 31) && (y <= 31)) {
    if (map[y][x] > 0) {
      map[y][x] = 0;
    } else if (map[y][x] == 0) {
      if (camera.at.elements[1] <= 0) {
        map[y][x] = 1;
      } else {
        map[y][x] = Math.floor(camera.at.elements[1]);
      }
    }
  }
  /*if (map[16 - Math.round(camera.eye.elements[2] + camera.at.elements[2])][16 - Math.round(camera.eye.elements[0] + camera.at.elements[0])] == 1) {
    map[16 - Math.round(camera.eye.elements[2] + camera.at.elements[2])][16 - Math.round(camera.eye.elements[0] + camera.at.elements[0])] = 0;
  } else if (map[16 - Math.round(camera.eye.elements[2] + camera.at.elements[2])][16 - Math.round(camera.eye.elements[0] + camera.at.elements[0])] == 0){
    map[16 - Math.round(camera.eye.elements[2] + camera.at.elements[2])][16 - Math.round(camera.eye.elements[0] + camera.at.elements[0])] = 1;
  }*/
}

let headX = 0;
let headY = 0;
let headZ = 0;

let bodyX = 0;
let bodyY = 0;
let bodyZ = 0;

let tailX = 0;
let tailY = 0;

let leftLegX = 0;
let leftLegY = 0;

let rightLegX = 0;
let rightLegY = 0;

let leftShoulderX = 0;
let leftShoulderY = 0;
let leftShoulderZ = 0;

let leftArmX = 0;
let leftArmY = 0;
let leftArmZ = 0;

let leftHandX = 0;
let leftHandY = 0;
let leftHandZ = 0;

let rightShoulderX = 0;
let rightShoulderY = 0;
let rightShoulderZ = 0;

let rightArmX = 0;
let rightArmY = 0;
let rightArmZ = 0;

let rightHandX = 0;
let rightHandY = 0;
let rightHandZ = 0;

function updateAnimationAngles() {
  if (animationOn && !pokeOn) {
    reset();
    leftLegX = 5*Math.sin(8*g_seconds);
    rightLegX = -5*Math.sin(8*(g_seconds));
    leftLegY = 2*Math.sin(3 * g_seconds);
    rightLegY = -2*Math.sin(3 * g_seconds);

    leftShoulderX = -20*Math.sin(4*(g_seconds));
    leftArmX = 10*Math.sin(4*(g_seconds));
    leftHandY = -10;
    rightShoulderX = 20*Math.sin(4*(g_seconds));
    rightArmX = -10*Math.sin(4*(g_seconds));
    rightHandY = 10;

    tailX = 35*Math.sin(4*g_seconds);
    headX = (5*Math.sin(4*g_seconds)); 
    headY = (5*Math.sin(g_seconds));

    /*tailY = (35*Math.sin(g_seconds));
    tailX = (20*Math.sin(g_seconds));
    headX = (5*Math.sin(g_seconds)); 
    headY = (5*Math.sin(g_seconds));

    leftShoulderY = (18*Math.sin(g_seconds));
    leftArmX = (5*Math.sin(g_seconds));
    leftArmY = (20*Math.sin(g_seconds));
    leftHandY = (45*Math.sin(g_seconds));
    rightShoulderX = (10*Math.sin(g_seconds));*/

    //Poke animation maybe?
    /*leftShoulderY = 30;
    rightShoulderY = -30;
    bodyZ = 45;
    bodyY = 1000*g_seconds;*/
  }

  if (pokeOn) {
    reset();
    tailY = (35*Math.sin(g_seconds));
    tailX = (20*Math.sin(g_seconds));
    headX = (5*Math.sin(g_seconds)); 
    headY = (5*Math.sin(g_seconds));

    leftShoulderY = (18*Math.sin(g_seconds));
    leftArmX = (5*Math.sin(g_seconds));
    leftArmY = (20*Math.sin(g_seconds));
    leftHandY = (45*Math.sin(g_seconds));
    rightShoulderX = (10*Math.sin(g_seconds));
  }

  if ((g_seconds - elasped >= 3.5) && (pokeOn)) {
    pokeOn = false;
    animationOn = true;
    console.log(pokeOn, animationOn);
    reset();
  }
}

var camera = new Camera();

//    FRONT
// LEFT  RIGHT
//    BACK
var map = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,"p","p","p","p","p","p",0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,"p","p","p","p","p","p",0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,"i","i","i","p","p","p","p","p","p","i","i","i",0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,"i","i","i","i","i","p","p","p","p","p","p","i","i","i","i","i",0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,"i","i","i","i","i","o","p","p","p","p","p","p","o","i","i","i","i","i",0,0,0,0,0,0,0],
  [0,0,0,0,0,0,"i","i","i","i","o","o","b","p","p","p","p","p","p","b","o","o","i","i","i","i",0,0,0,0,0,0],  
  [0,0,0,0,0,"i","i","i","i","o","b","b","b","p","p","p","p","p","p","b","b","b","o","i","i","i","i",0,0,0,0,0],  
  [0,0,0,0,"i","i","i","i","o","r","b","b","b","b","b","b","b","b","b","b","b","b","r","o","i","i","i","i",0,0,0,0],  
  [0,0,0,0,"i","i","i","o","r","r","b","b","b","b","b","b","b","b","b","b","b","b","r","r","o","i","i","i",0,0,0,0],  
  [0,0,0,"i","i","i","o","r","r","r","r","b","b","b","b","b","b","b","b","b","b","r","r","r","r","o","i","i","i",0,0,0],  
  [0,0,"i","i","i","o","r","r","r","r","r","r","b","b","b","b","b","b","b","b","r","r","r","r","r","r","o","i","i","i",0,0],  
  [0,0,"i","i","i","o","b","b","r","r","r","r","r","b","b","b","b","b","b","r","r","r","r","r","b","b","o","i","i","i",0,0],  
  [0,0,"i","i","o","b","b","b","b","b","r","r","r","b","b","b","b","b","b","r","r","r","b","b","b","b","b","o","i","i",0,0],  
  [0,0,"i","o","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","o","i",0,0],  
  [0,0,"i","o","b","b","b","b","b","b","b","b","b","b","o","o","o","o","b","b","b","b","b","b","b","b","b","b","o","i",0,0],
  [0,0,"i","o","o","o","o","o","o","o","o","o","o","o","o",1,1,"o","o","o","o","o","o","o","o","o","o","o","o","i",0,0],
  [0,0,"i","o",1,1,1,1,1,1,1,1,1,1,"o",1,1,"o",1,1,1,1,1,1,1,1,1,1,"o","i",0,0],  
  [0,0,"i","o",1,1,1,1,1,1,1,1,1,1,"o","o","o","o",1,1,1,1,1,1,1,1,1,1,"o","i",0,0],  
  [0,0,"i","o",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,"o","i",0,0],  
  [0,0,"i","i","o",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,"o","i","i",0,0],  
  [0,0,"i","i","i","o",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,"o","i","i","i",0,0],  
  [0,0,"i","i","i","o",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,"o","i","i","i",0,0],  
  [0,0,0,"i","i","i","o",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,"o","i","i","i",0,0,0],  
  [0,0,0,0,"i","i","i","o",1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,"o","i","i","i",0,0,0,0],  
  [0,0,0,0,"i","i","i","i","o",1,1,1,1,1,1,1,1,1,1,1,1,1,1,"o","i","i","i","i",0,0,0,0],  
  [0,0,0,0,0,"i","i","i","i","o",1,1,1,"p","p","p","p","p","p",1,1,1,"o","i","i","i","i",0,0,0,0,0],  
  [0,0,0,0,0,0,"i","i","i","i","o","o",1,"p","p","p","p","p","p",1,"o","o","i","i","i","i",0,0,0,0,0,0],
  [0,0,0,0,0,0,0,"i","i","i","i","i","o","p","p","p","p","p","p","o","i","i","i","i","i",0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,"i","i","i","i","i","p","p","p","p","p","p","i","i","i","i","i",0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,"i","i","i","p","p","p","p","p","p","i","i","i",0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,"p","p","p","p","p","p",0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,"p","p","p","p","p","p",0,0,0,0,0,0,0,0,0,0,0,0,0],
];

function drawMap() {
  var body = new Cube();
  for (x=0;x<32;x++){
    for (y=0;y<32;y++){
      if (map[y][x]>0){
        body.color = [1.0,1.0,1.0,1.0];
        body.matrix.setTranslate(-16 + x,-.75 + (map[y][x] - 1),-16 + y);
        body.render();
      }
      if (map[y][x] == "p") {
        body.color = [0.5, 0.5, 0.5, 1.0];
        body.matrix.setTranslate(-16 + x, -.75, -16 + y);
        body.render();
      }
      if (map[y][x] == "i") {
        body.color = [0.2, 0.2, 0.2, 1.0];
        body.matrix.setTranslate(-16 + x, -.75, -16 + y);
        body.matrix.scale(1,2,1);
        body.render();
      }
      if (map[y][x] == "o") {
        body.color = [0.0,0.0,0.0,1.0];
        body.matrix.setTranslate(-16 + x, -.75, -16 + y);
        body.render();
      }
      if (map[y][x] == "b") {
        body.color = [0.0,0.0,1.0,1.0];
        body.matrix.setTranslate(-16 + x, -.75, -16 + y);
        body.render();
      }
      if (map[y][x] == "r") {
        body.color = [1.0,0.0,0.0,1.0];
        body.matrix.setTranslate(-16 + x, -.75, -16 + y);
        body.render();
      }
    }
  }
}

function renderAllShapes() {
  // Check the time at the start of this function
  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(camera.fov, canvas.width/canvas.height, 0.1, 1000);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(camera.eye.elements[0],camera.eye.elements[1],camera.eye.elements[2], 
    camera.at.elements[0],camera.at.elements[1],camera.at.elements[2], 
    camera.up.elements[0],camera.up.elements[1],camera.up.elements[2]); // (eye, at, up)
  gl.uniformMatrix4fv(u_viewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //var len = g_shapesList.length;
  //for(var i = 0; i < len; i++) {
  //  g_shapesList[i].render();
  //}

  drawMap();
  // move y position up 0.1!!
  var body = new Cube();
  body.color = [0.56, 0.8, 0.79, 1.0];
  body.matrix.translate(-0.3, -0.65, 0);
  var bodyCoords = new Matrix4(body.matrix);
  body.matrix.rotate(bodyX, 1, 0, 0);
  body.matrix.rotate(bodyY, 0, 1, 0);
  body.matrix.rotate(bodyZ, 0, 0, 1);
  body.matrix.scale(0.7, 0.8, 0.5);
  body.matrix.translate(0, 1.4, 0);
  var bodyRef = new Matrix4(body.matrix);
  body.render();


  var tail = new Cube();
  tail.color = [0.2, 0.29, 0.41, 1.0];
  tail.matrix = new Matrix4(bodyRef);
  tail.matrix.translate(0.25, 0.1, 0.75);
  tail.matrix.rotate(-15, 1, 0, 0);
  tail.matrix.translate(0.17, 0.04, 0.24);
  tail.matrix.rotate(tailX, 1, 0, 0);
  tail.matrix.rotate(tailY, 0, 1, 0);
  tail.matrix.translate(-0.17, -0.04, -0.24);
  tail.matrix.scale(0.5, 0.1, 1.2);
  tail.render();
  
  var head = new Cube(); // Will prolly want to save head coords
  head.color = [1.0, 1.0, 1.0, 1.0];
  head.matrix = new Matrix4(bodyRef);
  head.matrix.translate(-0.15, 1.0, -0.25);
  head.matrix.translate(0.9, 0.56, 0.75);
  head.matrix.rotate(headX, 1, 0, 0);
  head.matrix.rotate(headY, 0, 1, 0);
  head.matrix.rotate(headZ, 0, 0, 1);
  head.matrix.translate(-0.9, -0.56, -0.75);
  var headCoords = new Matrix4(head.matrix);
  head.matrix.scale(1.3, 0.7, 1.5);
  head.render();

  var neck = new Cube();
  neck.color = [0.36, 0.64, 0.7, 1.0];
  neck.matrix = new Matrix4(headCoords);
  neck.matrix.translate(-0.05, -0.25, -0.1);
  neck.matrix.scale(1.4, 0.3, 1.7);
  neck.render();

  var nose = new Cube();
  nose.color = [0.54, 0.4, 0.2, 1.0];
  nose.matrix = new Matrix4(headCoords);
  nose.matrix.translate(0.5, 0.25, -0.1);
  nose.matrix.scale(0.25, 0.15, 0.1);
  nose.render();

  var leftHorn = new Cube();
  leftHorn.color = [0.2, 0.29, 0.41, 1.0];
  leftHorn.matrix = new Matrix4(headCoords);
  leftHorn.matrix.translate(0.3, 0.10, 0.5);
  leftHorn.matrix.rotate(55, 0, 0, 1);
  leftHorn.matrix.translate(0, 0.35, -0.25);
  leftHorn.matrix.scale(0.45, 0.3, 1.0);
  leftHorn.render();

  var rightHorn = new Cube();
  rightHorn.color = [0.2, 0.29, 0.41, 1.0];
  rightHorn.matrix = new Matrix4(headCoords);
  rightHorn.matrix.translate(0.68, 0.4, 0.5);
  rightHorn.matrix.rotate(-55, 0, 0, 1);
  rightHorn.matrix.translate(0, 0.45, -0.25);
  rightHorn.matrix.scale(0.45, 0.3, 1.0);
  rightHorn.render();

  var leftEye = new Cube();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix = new Matrix4(headCoords);
  leftEye.matrix.translate(0.25, 0.3, -0.1);
  var leftEyeCoords = new Matrix4(leftEye.matrix);
  leftEye.matrix.scale(0.15, 0.25, 1);
  leftEye.render();

  var lfreckle_b = new Cube();
  lfreckle_b.color = [0.0, 0.0, 0.0, 1.0];
  lfreckle_b.matrix = new Matrix4(leftEyeCoords);
  lfreckle_b.matrix.translate(0, -0.2, 0);
  lfreckle_b.matrix.scale(0.03, 0.02, 0.01);
  var lfreckle_bRef = new Matrix4(lfreckle_b.matrix);
  lfreckle_b.render();

  var lfreckle_l = new Cube();
  lfreckle_l.color = [0.0, 0.0, 0.0, 1.0];
  lfreckle_l.matrix = new Matrix4(lfreckle_bRef);
  lfreckle_l.matrix.translate(2, 3, 0);
  lfreckle_l.render();

  var lfreckle_r = new Cube();
  lfreckle_r.color = [0.0, 0.0, 0.0, 1.0];
  lfreckle_r.matrix = new Matrix4(lfreckle_bRef);
  lfreckle_r.matrix.translate(-2, 3.5, 0);
  lfreckle_r.render();

  var rfreckle_b = new Cube();
  rfreckle_b.color = [0.0, 0.0, 0.0, 1.0];
  rfreckle_b.matrix = new Matrix4(leftEyeCoords);
  rfreckle_b.matrix.translate(0.7, -0.2, 0);
  rfreckle_b.matrix.scale(0.03, 0.02, 0.01);
  var rfreckle_b_bRef = new Matrix4(rfreckle_b.matrix);
  rfreckle_b.render();

  var rfreckle_l = new Cube();
  rfreckle_l.color = [0.0, 0.0, 0.0, 1.0];
  rfreckle_l.matrix = new Matrix4(rfreckle_b_bRef);
  rfreckle_l.matrix.translate(1.8, 3.3, 0);
  rfreckle_l.render();

  var rfreckle_r = new Cube();
  rfreckle_r.color = [0.0, 0.0, 0.0, 1.0];
  rfreckle_r.matrix = new Matrix4(rfreckle_b_bRef);
  rfreckle_r.matrix.translate(-2.5, 3.4, 0);
  rfreckle_r.render();

  var rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix = new Matrix4(headCoords);
  rightEye.matrix.translate(0.85, 0.3, -0.1);
  rightEye.matrix.scale(0.15, 0.25, 1);
  rightEye.render();

  var leftShoulder = new Cube();
  leftShoulder.color = [1.0, 1.0, 1.0, 1.0];
  leftShoulder.matrix = new Matrix4(bodyRef);
  leftShoulder.matrix.translate(-0.25, 0.5, 0.25);
  leftShoulder.matrix.rotate(leftShoulderX,1,0,0);
  leftShoulder.matrix.rotate(leftShoulderY,0,1,0);
  leftShoulder.matrix.translate(0.085, 0.1, -0.1);
  leftShoulder.matrix.rotate(leftShoulderZ,0,0,1);
  leftShoulder.matrix.translate(-0.085, -0.1, 0.1);
  var leftShoulderCoords = new Matrix4(leftShoulder.matrix);
  leftShoulder.matrix.scale(0.25, 0.25, -0.40);
  leftShoulder.render();
  //console.log(leftShoulder.matrix);

  var leftArm = new Cube();
  leftArm.color = [1.0, 1.0, 1.0, 1.0];
  leftArm.matrix = new Matrix4(leftShoulderCoords);
  leftArm.matrix.translate(0, 0, -0.4);
  leftArm.matrix.translate(0.085, 0.1, -0.05);
  leftArm.matrix.rotate(leftArmX, 1, 0, 0);
  leftArm.matrix.rotate(leftArmY, 0, 1, 0);
  leftArm.matrix.rotate(leftArmZ, 0, 0, 1);
  leftArm.matrix.translate(-0.085, -0.1, 0.05);
  var leftArmCoords = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, 0.25, -0.2);
  leftArm.render();
  //console.log(leftArm.matrix);

  var leftHand = new Cube();
  leftHand.color = [1.0, 1.0, 1.0, 1.0];
  leftHand.matrix = new Matrix4(leftArmCoords);
  leftHand.matrix.translate(0.1, 0, -0.15);
  leftHand.matrix.translate(0.05, 0.1, -0.05);
  leftHand.matrix.rotate(leftHandX, 1, 0, 0);
  leftHand.matrix.rotate(leftHandY, 0, 1, 0);
  leftHand.matrix.rotate(leftHandZ, 0, 0, 1);
  leftHand.matrix.translate(-0.05, -0.1, 0.05);
  leftHand.matrix.scale(0.15, 0.25, -0.2);
  leftHand.render();
  //console.log(leftHand.matrix);

  var rightShoulder = new Cube();
  rightShoulder.color = [1.0, 1.0, 1.0, 1.0];
  rightShoulder.matrix = new Matrix4(bodyRef);
  rightShoulder.matrix.translate(1.0, 0.5, 0.25);
  rightShoulder.matrix.rotate(rightShoulderX,1,0,0);
  rightShoulder.matrix.rotate(rightShoulderY,0,1,0);
  rightShoulder.matrix.translate(0.085, 0.1, -0.1);
  rightShoulder.matrix.rotate(rightShoulderZ,0,0,1);
  rightShoulder.matrix.translate(-0.085, -0.1, 0.1);
  var rightShoulderCoords = new Matrix4(rightShoulder.matrix);
  rightShoulder.matrix.scale(0.25, 0.25, -0.40);
  rightShoulder.render();

  var rightArm = new Cube();
  rightArm.color = [1.0, 1.0, 1.0, 1.0];
  rightArm.matrix = new Matrix4(rightShoulderCoords);
  rightArm.matrix.translate(0, 0, -0.4);
  rightArm.matrix.translate(0.085, 0.1, -0.05);
  rightArm.matrix.rotate(rightArmX, 1, 0, 0);
  rightArm.matrix.rotate(rightArmY, 0, 1, 0);
  rightArm.matrix.rotate(rightArmZ, 0, 0, 1);
  rightArm.matrix.translate(-0.085, -0.1, 0.05);
  var rightArmCoords = new Matrix4(rightArm.matrix);
  rightArm.matrix.scale(0.25, 0.25, -0.2);
  rightArm.render();

  var rightHand = new Cube();
  rightHand.color = [1.0, 1.0, 1.0, 1.0];
  rightHand.matrix = new Matrix4(rightArmCoords);
  rightHand.matrix.translate(0, 0, -0.15);
  rightHand.matrix.translate(0.05, 0.1, -0.05);
  rightHand.matrix.rotate(rightHandX, 1, 0, 0);
  rightHand.matrix.rotate(rightHandY, 0, 1, 0);
  rightHand.matrix.rotate(rightHandZ, 0, 0, 1);
  rightHand.matrix.translate(-0.05, -0.1, 0.05);
  rightHand.matrix.scale(0.15, 0.25, -0.2);
  rightHand.render();

  var leftLeg = new Cube();
  leftLeg.color = [0.2, 0.29, 0.41, 1.0];
  leftLeg.matrix = new Matrix4(bodyRef);
  leftLeg.matrix.translate(-0.1, -0.18, 0.6);
  leftLeg.matrix.rotate(leftLegX, 1, 0, 0);
  leftLeg.matrix.rotate(leftLegY, 0, 1, 0);
  leftLeg.matrix.rotate(10, 0, 1, 0);
  leftLeg.matrix.scale(0.25, 0.2, -0.8);
  leftLeg.render();

  var rightLeg = new Cube();
  rightLeg.color = [0.2, 0.29, 0.41, 1.0];
  rightLeg.matrix = new Matrix4(bodyRef);
  rightLeg.matrix.translate(0.85, -0.2, 0.6);
  rightLeg.matrix.rotate(rightLegX, 1, 0, 0);
  rightLeg.matrix.rotate(rightLegY, 0, 1, 0);
  rightLeg.matrix.rotate(-10, 0, 1, 0);
  rightLeg.matrix.scale(0.25, 0.2, -0.8);
  rightLeg.render();

  var shell = new Cube();
  shell.color = [0.99, 0.92, 0.68, 1.0];
  shell.matrix = new Matrix4(bodyRef);
  shell.matrix.translate(0.25, 0.3, -0.1);
  shell.matrix.translate(0.35 / 2, 0.14, .125 / 2);
  shell.matrix.translate(-0.35 / 2, -0.14, -0.125 / 2);
  shell.matrix.scale(0.5, 0.35, 0.25);
  shell.render();

  var shell_ = new Cube();
  shell_.color = [0.99, 0.92, 0.68, 1.0];
  shell_.matrix = new Matrix4(bodyRef);
  shell_.matrix = new Matrix4(bodyRef);
  shell_.matrix.translate(0.35, 0.2, -0.1);
  shell_.matrix.translate(0.35 / 2, 0.14, .125 / 2);
  shell_.matrix.translate(-0.35 / 2, -0.14, -0.125 / 2);
  shell_.matrix.scale(0.3, 0.1, 0.25);
  shell_.render();

  var floor = new Cube();
  floor.color = [0.76, 0.64, 0.51, 1.0];
  floor.textureNum = 1;
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(32, 0, 32);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  var sky = new Cube();
  sky.color = [1.0,0.0,0.0,1.0];
  sky.textureNum = 0;
  sky.matrix.translate(0,-1,0);
  sky.matrix.scale(32,32,32);
  sky.matrix.translate(-.5,0,-0.5);
  sky.render();


  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + 0 + "ms: " + Math.floor(duration) + "fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}