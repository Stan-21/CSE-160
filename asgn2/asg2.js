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

let animationOn = false;


function addActionsForHTMLUI() {

  document.getElementById('animationOnButton').onclick = function() {animationOn = true;};
  document.getElementById('animationOffButton').onclick = function() {animationOn = false;};

  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngleX = this.value; renderAllShapes(); });

  document.getElementById('leftShoulder').addEventListener('mousemove', function() { lShoulderAngle = this.value; renderAllShapes(); });
  document.getElementById('leftArm').addEventListener('mousemove', function() { lArmAngle = this.value; renderAllShapes(); });
  document.getElementById('leftHand').addEventListener('mousemove', function() { lHandAngle = this.value; renderAllShapes(); });

  document.getElementById('rightShoulder').addEventListener('mousemove', function() { rShoulderAngle = this.value; renderAllShapes(); });
  document.getElementById('rightArm').addEventListener('mousemove', function() { rArmAngle = this.value; renderAllShapes(); });
  document.getElementById('rightHand').addEventListener('mousemove', function() { rHandAngle = this.value; renderAllShapes(); });
}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHTMLUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  g_seconds=performance.now()/1000.0-g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function click(ev) {
  g_globalAngleX = ev.screenX;
  g_globalAngleY = ev.screenY;

  /*// Store the coordinates to g_points array
  g_points.push([x, y]);
  // Store the colors to g_colors array
  g_colors.push(g_selectedColor.slice());
  g_sizes.push(g_selectedSize);*/

  renderAllShapes();
}

let bodyX = 0;
let bodyY = 0;
let bodyZ = 0;


let lShoulderAngle = 0;
let lArmAngle = 0;
let lHandAngle = 0;
let rShoulderAngle = 0;
let rArmAngle = 0;
let rHandAngle = 0;

function updateAnimationAngles() {
  if (animationOn) {
    lShoulderAngle = (45*Math.sin(g_seconds));
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
  body.color = [0.6, 0.7, 1.0, 1.0];
  body.matrix.translate(-0.3, -0.65, 0);
  body.matrix.translate(bodyX, bodyY, bodyZ);
  var bodyCoords = new Matrix4(body.matrix);
  body.matrix.rotate(-lShoulderAngle, 1, 0, 0);
  body.matrix.scale(0.7, 0.8, 0.5);
  var bodyRef = new Matrix4(body.matrix);
  body.render();
  
  var head = new Cube(); // Will prolly want to save head coords
  head.color = [1.0, 1.0, 1.0, 1.0];
  head.matrix = new Matrix4(bodyRef);
  head.matrix.translate(-0.15, 1.0, -0.25);
  head.matrix.scale(1.3, 0.7, 1.5);
  head.render();

  var leftShoulder = new Cube();
  leftShoulder.color = [0.5, 0.8, 1.0, 1.0];
  leftShoulder.matrix = new Matrix4(bodyCoords);
  leftShoulder.matrix.translate(-0.25, 0.35, 0.25);
  leftShoulder.matrix.rotate(rShoulderAngle,1,0,0);
  leftShoulder.matrix.rotate(rArmAngle,0,1,0);
  leftShoulder.matrix.rotate(rHandAngle,0,0,1);
  var leftShoulderCoords = new Matrix4(leftShoulder.matrix);
  leftShoulder.matrix.scale(0.25, 0.25, -0.40);
  leftShoulder.render();

  var leftArm = new Cube();
  leftArm.color = [1.0, 0.8, 1.0, 1.0];
  leftArm.matrix = new Matrix4(leftShoulderCoords);
  leftArm.matrix.translate(0, 0, -0.4);
  leftArm.matrix.scale(0.25, 0.25, -0.2);
  var leftArmRef = new Matrix4(leftArm.matrix);
  leftArm.render();

  var leftHand = new Cube();
  leftHand.color = [0.0, 1.0, 1.0, 1.0];
  leftHand.matrix = new Matrix4(leftArmRef);
  leftHand.matrix.translate(0.5, 0, 1.0);
  leftHand.matrix.scale(0.5, 1.0, 0.5);
  leftHand.render();

  var rightShoulder = new Cube();
  rightShoulder.color = [0.5, 0.8, 1.0, 1.0];
  rightShoulder.matrix = new Matrix4(bodyCoords);
  rightShoulder.matrix.translate(0.7, 0.35, 0.25);
  rightShoulder.matrix.rotate(rShoulderAngle,1,0,0);
  rightShoulder.matrix.rotate(rArmAngle,0,1,0);
  rightShoulder.matrix.rotate(rHandAngle,0,0,1);
  var rightShoulderCoords = new Matrix4(rightShoulder.matrix);
  rightShoulder.matrix.scale(0.25, 0.25, -0.40);
  rightShoulder.render();

  var rightArm = new Cube();
  rightArm.color = [1.0, 0.8, 1.0, 1.0];
  rightArm.matrix = new Matrix4(rightShoulderCoords);
  rightArm.matrix.translate(0, 0, -0.4);
  rightArm.matrix.scale(0.25, 0.25, -0.2);
  var rightArmRef = new Matrix4(rightArm.matrix);
  rightArm.render();

  var rightHand = new Cube();
  rightHand.color = [0.0, 1.0, 1.0, 1.0];
  rightHand.matrix = new Matrix4(rightArmRef);
  rightHand.matrix.translate(0, 0, 1.0);
  rightHand.matrix.scale(0.5, 1.0, 0.5);
  rightHand.render();


  var leftLeg = new Cube();
  leftLeg.color = [0.0, 0.0, 1.0, 1.0];
  leftLeg.matrix = new Matrix4(bodyRef);
  leftLeg.matrix.translate(-0.1, -0.1, -0.2);
  leftLeg.matrix.scale(0.25, 0.1, 0.8);
  leftLeg.render();

  var rightLeg = new Cube();
  rightLeg.color = [0.0, 0.0, 1.0, 1.0];
  rightLeg.matrix = new Matrix4(bodyRef);
  rightLeg.matrix.translate(0.85, -0.1, -0.2);
  rightLeg.matrix.scale(0.25, 0.1, 0.8);
  console.log(rightLeg.matrix);
  rightLeg.render();

  var test = new Cube();
  console.log(test.matrix);


  /*var leftLeg = new Cube();
  leftLeg.color = [0.0, 0.0, 1.0, 1.0];
  leftLeg.matrix = bodyCoords;
  leftLeg.matrix.translate(-0.35, -0.65, -0.1);
  leftLeg.matrix.scale(0.18, -0.125, 0.5);
  leftLeg.matrix.scale(-1, 1, 1);
  leftLeg.matrix.rotate(-lArmAngle, 0, 2, 0);
  leftLeg.render();

  var rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix.scale(0.1, 0.15, 0.3);
  rightEye.matrix.translate(1.5, 3.5, -0.65);
  rightEye.render();*/

  /*var body = new Cube();
  body.color = [0.6, 0.7, 1.0, 1.0];
  body.matrix.scale(0.7, 1.0, 0.25);
  body.matrix.translate(-0.48, -0.6, -0.13);
  body.render();

  var shell = new Cube();
  shell.color = [1.0, 1.0, 0.0, 1.0];
  shell.matrix.scale(0.3, 0.3, 0.1);
  shell.matrix.translate(-0.44, -1.2, -0.4);
  shell.render();

  var head = new Cube();
  head.color = [1.0, 1.0, 1.0, 1.0];
  head.matrix.scale(0.8, 0.5, 0.5);
  head.matrix.translate(-0.48, 0.6, -0.3);
  head.render();

  var leftEye = new Cube();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix.scale(0.1, 0.15, 0.3);
  leftEye.matrix.translate(-2.0, 3.5, -0.65);
  leftEye.render();


  var leftLeg = new Cube();
  leftLeg.color = [0.0, 0.0, 1.0, 1.0];
  leftLeg.matrix.rotate(0, 0, 1, 0);
  leftLeg.matrix.scale(0.3, 0.1, -0.5);
  leftLeg.matrix.translate(-1.2, -7, -0.5);
  leftLeg.render();

  var rightLeg = new Cube();
  rightLeg.color = [0.0, 0.0, 1.0, 1.0];
  rightLeg.matrix.rotate(0, 0, 1, 0);
  rightLeg.matrix.scale(0.3, 0.1, -0.5);
  rightLeg.matrix.translate(0.3, -7, -0.5);
  rightLeg.render();

  var leftShoulder = new Cube();
  leftShoulder.color = [0.5, 0.8, 1.0, 1.0];
  leftShoulder.matrix.setTranslate(-0.30, 0, 0);
  leftShoulder.matrix.rotate(-lShoulderAngle, 0, 0, 1);
  var leftShoulderMatrix = new Matrix4(leftShoulder.matrix);
  leftShoulder.matrix.scale(-0.3, 0.2, 0.20);
  leftShoulder.render();

  var leftArm = new Cube();
  leftArm.color = [0.2, 0.1, 0.1, 1.0];
  leftArm.matrix = leftShoulderMatrix;
  leftArm.matrix.translate(-.3, 0, 0);
  leftArm.matrix.rotate(lArmAngle, 0, 0, 1);
  var leftArmMatrix = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(-0.2, 0.2, 0.20);
  leftArm.render();

  var leftHand = new Cube();
  leftHand.color = [0.2, 0.1, 0.1, 1.0];
  leftHand.matrix = leftArmMatrix;
  leftHand.matrix.rotate(lHandAngle, 0, 0, 1);
  leftHand.matrix.scale(-0.1, 0.11, 0.25);
  leftHand.matrix.translate(2, 0.3, 0);
  leftHand.render();

  var rightShoulder = new Cube();
  rightShoulder.color = [0.5, 0.8, 1.0, 1.0];
  rightShoulder.matrix.setTranslate(0.35, 0, 0);
  rightShoulder.matrix.rotate(-rShoulderAngle, 0, 0, 1);
  var rightShoulderMatrix = new Matrix4(rightShoulder.matrix);
  rightShoulder.matrix.scale(0.3, 0.2, 0.20);
  rightShoulder.render();

  var rightArm = new Cube();
  rightArm.color = [0.2, 0.1, 0.1, 1.0];
  rightArm.matrix = rightShoulderMatrix;
  rightArm.matrix.translate(.3, 0, 0);
  rightArm.matrix.rotate(-rArmAngle, 0, 0, 1);
  var rightArmMatrix = new Matrix4(rightArm.matrix);
  rightArm.matrix.scale(0.2, 0.2, 0.20);
  rightArm.render();

  var rightHand = new Cube();
  rightHand.color = [0.2, 0.1, 0.1, 1.0];
  rightHand.matrix = rightArmMatrix;
  rightHand.matrix.rotate(-rHandAngle, 0, 0, 1);
  rightHand.matrix.scale(0.1, 0.11, 0.25);
  rightHand.matrix.translate(2, 0.3, 0);
  rightHand.render();*/

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