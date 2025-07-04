// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }` 

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalAngleX=0;
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

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);


}

let animationOn = true;
let pokeOn = false;


function addActionsForHTMLUI() {

  document.getElementById('animationOnButton').onclick = function() {animationOn = true; pokeOn = false; };
  document.getElementById('animationOffButton').onclick = function() {animationOn = false; reset();};

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngleX = this.value; renderAllShapes(); });

  document.getElementById('headX').addEventListener('mousemove', function() { headX = this.value; renderAllShapes(); });
  document.getElementById('headY').addEventListener('mousemove', function() { headY = this.value; renderAllShapes(); });
  document.getElementById('headZ').addEventListener('mousemove', function() { headZ = this.value; renderAllShapes(); });

  document.getElementById('bodyX').addEventListener('mousemove', function() { bodyX = this.value; renderAllShapes(); });
  document.getElementById('bodyY').addEventListener('mousemove', function() { bodyY = this.value; renderAllShapes(); });
  document.getElementById('bodyZ').addEventListener('mousemove', function() { bodyZ = this.value; renderAllShapes(); });

  document.getElementById('tailX').addEventListener('mousemove', function() { tailX = this.value; renderAllShapes(); });
  document.getElementById('tailY').addEventListener('mousemove', function() { tailY = this.value; renderAllShapes(); });

  document.getElementById('leftLegX').addEventListener('mousemove', function() { leftLegX = this.value; renderAllShapes(); });
  document.getElementById('leftLegY').addEventListener('mousemove', function() { leftLegY = this.value; renderAllShapes(); });

  document.getElementById('rightLegX').addEventListener('mousemove', function() { rightLegX = this.value; renderAllShapes(); });
  document.getElementById('rightLegY').addEventListener('mousemove', function() { rightLegY = this.value; renderAllShapes(); });

  document.getElementById('leftShoulderX').addEventListener('mousemove', function() { leftShoulderX = this.value; renderAllShapes(); });
  document.getElementById('leftShoulderY').addEventListener('mousemove', function() { leftShoulderY = this.value; renderAllShapes(); });
  document.getElementById('leftShoulderZ').addEventListener('mousemove', function() { leftShoulderZ = this.value; renderAllShapes(); });

  document.getElementById('leftArmX').addEventListener('mousemove', function() { leftArmX = this.value; renderAllShapes(); });
  document.getElementById('leftArmY').addEventListener('mousemove', function() { leftArmY = this.value; renderAllShapes(); });
  document.getElementById('leftArmZ').addEventListener('mousemove', function() { leftArmZ = this.value; renderAllShapes(); });

  document.getElementById('leftHandX').addEventListener('mousemove', function() { leftHandX = this.value; renderAllShapes(); });
  document.getElementById('leftHandY').addEventListener('mousemove', function() { leftHandY = this.value; renderAllShapes(); });
  document.getElementById('leftHandZ').addEventListener('mousemove', function() { leftHandZ = this.value; renderAllShapes(); });

  document.getElementById('rightShoulderX').addEventListener('mousemove', function() { rightShoulderX = this.value; renderAllShapes(); });
  document.getElementById('rightShoulderY').addEventListener('mousemove', function() { rightShoulderY = this.value; renderAllShapes(); });
  document.getElementById('rightShoulderZ').addEventListener('mousemove', function() { rightShoulderZ = this.value; renderAllShapes(); });

  document.getElementById('rightArmX').addEventListener('mousemove', function() { rightArmX = this.value; renderAllShapes(); });
  document.getElementById('rightArmY').addEventListener('mousemove', function() { rightArmY = this.value; renderAllShapes(); });
  document.getElementById('rightArmZ').addEventListener('mousemove', function() { rightArmZ = this.value; renderAllShapes(); });

  document.getElementById('rightHandX').addEventListener('mousemove', function() { rightHandX = this.value; renderAllShapes(); });
  document.getElementById('rightHandY').addEventListener('mousemove', function() { rightHandY = this.value; renderAllShapes(); });
  document.getElementById('rightHandZ').addEventListener('mousemove', function() { rightHandZ = this.value; renderAllShapes(); });

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

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.2, 0.2, 1.0);

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

function click(ev) {
  if (ev.shiftKey) {
    animationOn = false;
    pokeOn = true;
    g_startTime = performance.now() / 1000.0;
    elapsed = g_seconds;
    reset();
    return;
  }
  g_globalAngleX = ev.screenX;
  g_globalAngleY = ev.screenY;

  /*// Store the coordinates to g_points array
  g_points.push([x, y]);
  // Store the colors to g_colors array
  g_colors.push(g_selectedColor.slice());
  g_sizes.push(g_selectedSize);*/

  renderAllShapes();
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

function renderAllShapes() {
  // Check the time at the start of this function
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //var len = g_shapesList.length;
  //for(var i = 0; i < len; i++) {
  //  g_shapesList[i].render();
  //}

  // move y position up 0.1!!
  var body = new Cube();
  body.color = [0.56, 0.8, 0.79, 1.0];
  body.matrix.translate(-0.3, -0.65, 0);
  var bodyCoords = new Matrix4(body.matrix);
  body.matrix.rotate(bodyX, 1, 0, 0);
  body.matrix.rotate(bodyY, 0, 1, 0);
  body.matrix.rotate(bodyZ, 0, 0, 1);
  body.matrix.scale(0.7, 0.8, 0.5);
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

  var shell = new Shell();
  shell.color = [0.99, 0.92, 0.68, 1.0];
  shell.matrix = new Matrix4(bodyRef);
  shell.matrix.translate(0.25, 0.3, -0.1);
  shell.matrix.translate(0.35 / 2, 0.14, .125 / 2);
  shell.matrix.translate(-0.35 / 2, -0.14, -0.125 / 2);
  shell.matrix.scale(0.5, 0.35, 0.25);
  var shellRef = new Matrix4(shell.matrix);
  shell.render();

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