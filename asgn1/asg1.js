// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectedSize=10.0;
let g_selectedType=POINT;
let g_selectedSegment=10;

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

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

var intervalId;
var cycle = false;

function addActionsForHTMLUI() {
  // Button Events
  document.getElementById('clearCanvas').addEventListener('click', function() { g_shapesList = []; renderAllShapes();});
  document.getElementById('Oshawott').addEventListener('click', function() { oshawott(); });
  document.getElementById('undo').addEventListener('click', function() { undo(); });
  document.getElementById('redo').addEventListener('click', function() { redo(); });

  document.getElementById('rainbow').addEventListener('click', function() { if (cycle == false) { intervalId = setInterval(rainbow, 50); cycle = true} else { clearInterval(intervalId); cycle = false; } });

  document.getElementById('pointButton').addEventListener('click', function() { g_selectedType = POINT});
  document.getElementById('triButton').addEventListener('click', function() { g_selectedType = TRIANGLE});
  document.getElementById('circleButton').addEventListener('click', function() {g_selectedType = CIRCLE});
  // Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100;});

  document.getElementById('shapeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value;});
  document.getElementById('circleSlide').addEventListener('mouseup', function() { g_selectedSegment = this.value;});
}

var undone_Shapes = [];

function rainbow() {
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].cycleColors();
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
}

function undo() {
  if (g_shapesList.length > 0) {
    undone_Shapes.push(g_shapesList.pop());
  }

  document.getElementById('redSlide').value = 0;
  renderAllShapes();
  
}

function redo() {
  if (undone_Shapes.length > 0) {
    g_shapesList.push(undone_Shapes.pop());
  }
  renderAllShapes();
}

function oshawott() {
  g_shapesList = []; // Clearing canvas
  renderAllShapes();
  let point = new Triangle();

  point.color = [0, 0.8, 0.8, 1.0];
  point.points = [-2, 1, 2, 1, -2, -2];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0, 0.8, 0.8, 1.0];
  point.points = [-2, -2, 2, 1, 2, -2];
  g_shapesList.push(point);


  point = new Triangle();
  point.points = [-2, 4, 2, 4, -2, 1];
  g_shapesList.push(point);
  point = new Triangle();
  point.points = [-2, 1, 2, 4, 2, 1];
  g_shapesList.push(point);
  point = new Triangle();
  point.points = [-2, 4, 0, 4.5, 2, 4];
  g_shapesList.push(point);

  point = new Triangle(); // Ears
  point.color = [0.3, 0.4, 1.0, 1.0];
  point.points = [-2, 4, -2.5, 4, -2, 3];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0.3, 0.4, 1.0, 1.0];
  point.points = [2, 4, 3, 3.5, 2, 3];
  g_shapesList.push(point);

  point = new Triangle();
  point.color = [0.3, 0.4, 1.0, 1.0];
  point.points = [-1, -2, -1, -3, -2, -3];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0.3, 0.4, 1.0, 1.0];
  point.points = [1, -2, 1, -3, 2, -3];
  g_shapesList.push(point);

  point = new Triangle();
  point.color = [0.3, 0.4, 1.0, 1.0];
  point.points = [2, -1, 3, -1, 2, -2];
  g_shapesList.push(point);

  point = new Triangle();
  point.color = [0, 0.8, 0.8, 1.0];
  point.points = [-2, -2, 0, -2.5, 2, -2];
  g_shapesList.push(point);

  point = new Triangle();
  point.points = [-2, 1, -2.5, 2, -2, 4];
  g_shapesList.push(point);
  point = new Triangle();
  point.points = [2, 4, 2, 1, 2.5, 2.5];
  g_shapesList.push(point);

  point = new Triangle();
  point.points = [-2, 0, -2, 1, -3, 1];
  g_shapesList.push(point);
  point = new Triangle();
  point.points = [2, 1, 2, 0, 3, 0];
  g_shapesList.push(point);

  point = new Triangle();
  point.points = [-2, 1, -1, 1, -1.5, 0.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.points = [-1, 1, 0, 1, -0.5, 0.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.points = [2, 1, 1, 1, 1.5, 0.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.points = [1, 1, 0, 1, 0.5, 0.5];
  g_shapesList.push(point);

  point = new Triangle(); // Nose
  point.color = [0.58, 0.25, 0.0, 1];
  point.points = [0, 3, -1, 3, -0.5, 2.5];
  g_shapesList.push(point);

  point = new Triangle(); // Shell
  point.color = [1.0, 1.0, 0.5, 1];
  point.points = [0, 0, -1, 0, -1, -1.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [1.0, 1.0, 0.5, 1];
  point.points = [0, 0, 0, -1.5, -1, -1.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [1.0, 1.0, 0.5, 1];
  point.points = [0, 0, 0, -1, 0.25, -0.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [1.0, 1.0, 0.5, 1];
  point.points = [-1, 0, -1.25, -0.5, -1, -1];
  g_shapesList.push(point); 

  point = new Triangle(); // Right Eye
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [0.75, 3, 1, 3.25, 0.75, 3.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [0.75, 3, 0.5, 3.25, 0.75, 3.5];
  g_shapesList.push(point);

  point = new Triangle(); // Left Eye
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [-1.25, 3, -1, 3.25, -1.25, 3.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [-1.25, 3, -1.5, 3.25, -1.25, 3.5];
  g_shapesList.push(point);

  point = new Triangle(); // Mouth
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [-0.5, 2, -1, 1.5, 0, 1.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [1.0, 1.0, 1.0, 1];
  point.points = [-0.5, 1.9, -1, 1.5, 0, 1.5];
  g_shapesList.push(point);

  point = new Triangle(); // Left Freckles
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [-2, 2.1, -1.9, 2.1, -1.95, 2];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [-1.5, 2, -1.4, 2, -1.45, 1.9];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [-1.8, 1.8, -1.7, 1.8, -1.75, 1.7];
  g_shapesList.push(point);

  point = new Triangle(); // Right Freckles
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [1, 1.6, 1.1, 1.6, 1.05, 1.5];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [0.9, 1.8, 1.0, 1.8, 0.95, 1.7];
  g_shapesList.push(point);
  point = new Triangle();
  point.color = [0.0, 0.0, 0.0, 1];
  point.points = [1.2, 1.8, 1.3, 1.8, 1.25, 1.7];
  g_shapesList.push(point);

  renderAllShapes();

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
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = []; // The array to store the size of a point

function click(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSegment;
  }

  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  undone_Shapes = [];
  /*// Store the coordinates to g_points array
  g_points.push([x, y]);
  // Store the colors to g_colors array
  g_colors.push(g_selectedColor.slice());
  g_sizes.push(g_selectedSize);*/

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

function renderAllShapes() {
  // Check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + "fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}