// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_viewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform int u_whichTexture;
  uniform int u_lightOn;
  uniform int u_spotLightOn;
  uniform vec4 u_lightColor;
  uniform vec3 u_lightPos;
  uniform vec3 u_spotlightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;

  uniform vec3 u_lightDirection;
  uniform float u_innerLimit;
  uniform float u_outerLimit;

  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0,1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }

    if (u_lightOn == 1) {
      gl_FragColor *= u_lightColor;
      vec3 lightVector = u_lightPos-vec3(v_VertPos);
      float r=length(lightVector);

      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L),0.0);

      vec3 R = reflect(-L,N);

      vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

      float specular = pow(max(dot(E,R),0.0),10.0);
      vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
      vec3 ambient = vec3(gl_FragColor) * 0.3;
      gl_FragColor = vec4(specular+diffuse+ambient,1.0);
    }

    if (u_spotLightOn == 1) {
      vec3 normal = normalize(v_Normal);
      vec3 surfaceToLightDirection = normalize(u_spotlightPos-vec3(v_VertPos));
      vec3 surfaceToViewDirection = normalize(u_cameraPos-vec3(v_VertPos));
      vec3 halfVector = normalize(surfaceToLightDirection+surfaceToViewDirection);
      float light = 0.0;
      float specular = 0.0;
      
      float dotFromDirection = dot(surfaceToLightDirection,-u_lightDirection);
      float limitRange = u_innerLimit - u_outerLimit;
      float inLight = clamp((dotFromDirection - u_outerLimit) / limitRange, 0.0, 1.0);
      if (inLight > 0.5) {
        light = inLight * dot(v_Normal, u_spotlightPos-vec3(v_VertPos));
        specular = inLight * pow(dot(normal, halfVector), 2.0);
        gl_FragColor *= light;
        gl_FragColor += vec4(specular,specular,specular, 1.0);
      }
    }
  }` 

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_viewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;
let u_lightOn;
let u_spotLightOn;
let u_lightColor;
let u_lightPos;
let u_spotlightPos;
let u_cameraPos;
let u_lightDirection;
let u_innerLimit;
let u_outerLimit;

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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
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

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return false;
  }

  u_spotLightOn = gl.getUniformLocation(gl.program, 'u_spotLightOn');
  if (!u_spotLightOn) {
    console.log('Failed to get the storage location of u_spotLightOn');
    return false;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos) {
    console.log('Failed to get the storage location of u_spotlightPos');
    return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
  }

  u_lightDirection = gl.getUniformLocation(gl.program, 'u_lightDirection');
  if (!u_lightDirection) {
    console.log('Failed to get the storage location of u_lightDirection');
    return;
  }

  u_innerLimit = gl.getUniformLocation(gl.program, 'u_innerLimit') 
  if (!u_innerLimit) {
    console.log('Failed to get the storage location of u_innerLimit');
    return;
  }

  u_outerLimit = gl.getUniformLocation(gl.program, 'u_outerLimit') 
  if (!u_outerLimit) {
    console.log('Failed to get the storage location of u_outerLimit');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function initTextures() {
  var image0 = new Image();  // Create the image object
  var image1 = new Image();
  var image2 = new Image();
  if (!image0 || !image1 || !image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendTextureToTEXTURE0(image0); };
  image1.onload = function(){ sendTextureToTEXTURE1(image1); };
  image2.onload = function(){ sendTextureToTEXTURE2(image2); };
  // Tell the browser to load an image
  image0.src = 'trees.png';
  image1.src = 'cheren.jpg';
  image2.src = 'sky.png';

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

function sendTextureToTEXTURE2(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler2, 2);
}

let pokeOn = false;

let animationOn = true;
let lightOn = true;
let spotLightOn = true;
let attackOn = false;
let normalOn = false;
let g_lightPos = [0,7,-10];
let g_spotlightPos = [0,5,-5];

let g_lightRGB = [1,1,1,1];

let lightDirection = [0,-1,1];
var innerLimit = 3 * Math.PI / 180;
var outerLimit = 30 * Math.PI / 180;


function addActionsForHTMLUI() {

  document.getElementById('lightOnButton').onclick = function() {  gl.uniform1i(u_lightOn, lightOn);; };
  document.getElementById('lightOffButton').onclick = function() {  gl.uniform1i(u_lightOn, !lightOn);; };
  document.getElementById('spotOnButton').onclick = function() {  gl.uniform1i(u_spotLightOn, spotLightOn);; };
  document.getElementById('spotOffButton').onclick = function() {  gl.uniform1i(u_spotLightOn, !spotLightOn);; };
  document.getElementById('normalOn').onclick = function() {normalOn = true;};
  document.getElementById('normalOff').onclick = function() {normalOn = false;};

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});

  document.getElementById('lightColorR').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightRGB[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightColorG').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightRGB[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightColorB').addEventListener('mousemove', function(ev) { if (ev.buttons == 1) {g_lightRGB[2] = this.value/100; renderAllShapes();}});
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

  shellYZ = 0;
  shell_X = 0;
  shellTX = 0;
  shellTY = 0;
  shellTZ = 0;
}

let audio1;
let audio2;

function main() {

  audio1 = new Audio('AspertiaCity.mp3');
  audio2 = new Audio('GymBattle.mp3');

  audio1.loop = true;
  audio2.loop = true;


  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHTMLUI();

  document.onkeydown = keydown;
  canvas.onclick = async (ev) => {
    if (audio1.paused && audio2.paused) {
      //audio1.play();
    }
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
  } else if (ev.keyCode == 32) {
    camera.panUp();
  } else if (ev.keyCode == 16) {
    camera.panDown();
  }  else if (ev.keyCode == 80) {
    if (!attackOn) {
      animationOn = false;
      attackOn = true;
      g_startTime = performance.now() / 1000.0;
      if (!audio1.paused) {
        audio1.pause();
      }
      //audio2.play();
    }
  }
}

function click(ev) {
  if (document.pointerLockElement != canvas) {
    return;
  }
  let x = 16 - Math.ceil(camera.at.elements[0]);
  let y = 16 - Math.ceil(camera.at.elements[2]);
  if ((x <= 31) && (y <= 31)) {
    if (map[y][x] != 0) {
      map[y][x] = 0;
    } else if (map[y][x] == 0) {
      if (camera.at.elements[1] <= 0) {
        map[y][x] = 1;
      } else {
        map[y][x] = Math.floor(camera.at.elements[1]);
      }
    }
  }
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

let shellYZ = 0;
let shell_X = 0;
let shellTX = 0;
let shellTY = 0;
let shellTZ = 0;

let lBody = 0;

function updateAnimationAngles() {
  if (animationOn && !pokeOn) {
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

    g_lightPos[0] = Math.cos(g_seconds) * 5;
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

  if (attackOn) {
    if (g_seconds <= 1) {
      leftShoulderY = lerp(0,-45,g_seconds);
    }
    if ((g_seconds > 1) && (g_seconds < 2)) {
      leftShoulderY = lerp(-45,45,g_seconds - 1);
      shellYZ = lerp(0,80,g_seconds - 1);
    }
    if ((g_seconds > 2) && (g_seconds < 3)) {
      leftShoulderX = lerp(0,45,g_seconds - 2);
      shellTX = lerp(0,-0.2,g_seconds - 2);
      shellTY = lerp(0,0.8,g_seconds - 2);
    }
    if ((g_seconds > 3) && (g_seconds < 4)) {
      leftShoulderX = lerp(45,0,(g_seconds - 3) * 2);
      leftShoulderY = lerp(45,0,(g_seconds - 3) * 2);
      leftArmY = lerp(0,-10,(g_seconds - 3) * 2);
      shellTX = lerp(-0.2, 1,(g_seconds - 3));
      shellTZ = lerp(0,-18,(g_seconds - 3));
    }
    if ((g_seconds >= 4) && (g_seconds < 5)) {
      leftShoulderX = -10;
      leftShoulderY = 0;
      leftArmY = 0;
      lBody = lerp(-2,0,g_seconds - 4);
      shellTX = lerp(1,0,g_seconds - 4);
      shellTY = lerp(0.8,0,g_seconds - 4);
      shellTZ = lerp(-15,0,g_seconds - 4);
      shellYZ = lerp(80,0,g_seconds - 4);
    }
    if ((g_seconds > 5)) {
      leftShoulderX = -10;
      leftShoulderY = 0;
      leftArmY = 0;
      shellTX = 0;
      shellTY = 0;
      shellTZ = 0;
      shellYZ = 0;
      attackOn = false;
      attackReset = true;
      animationOn = true;
    }
  }

  if (attackReset && g_seconds > 8) {
    animationOn = false;
    attackOn = true;
    g_startTime = performance.now() / 1000.0;
    attackReset = false;
    reset();
  }
}

let attackReset = false;

function lerp(start, end, t) {
  return start * (1-t) + end * t;
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

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);

  gl.uniform4f(u_lightColor, g_lightRGB[0], g_lightRGB[1], g_lightRGB[2], g_lightRGB[3]);

  gl.uniform3fv(u_lightDirection, lightDirection);
  gl.uniform1f(u_innerLimit, 1);
  gl.uniform1f(u_outerLimit, 1);

  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  var floor = new Cube();
  floor.color = [0.76, 0.64, 0.51, 1.0];
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(32, 0, 32);
  floor.matrix.translate(-0.5, -0.5, -0.5);
  floor.render();

  var wall = new Cube();
  wall.color = [0.7,0.8,0.56,1.0];
  if (normalOn) { wall.textureNum = -3}
  wall.matrix.translate(0,-1,-.0025);
  wall.matrix.scale(-32,-32,-32.01);
  wall.matrix.translate(-.5,-1,-0.5);
  wall.render();


  var sphere = new Sphere();
  if (normalOn) { sphere.textureNum = -3}
  sphere.matrix.scale(2,2,2);
  sphere.matrix.translate(-5,1,0);
  sphere.render();

  /*  var sky = new Cube();
  sky.color = [0.0,0.0,1.0,1.0];
  sky.textureNum = 2;
  sky.matrix.translate(0,30.5,0);
  sky.matrix.scale(32,1,32);
  sky.matrix.translate(-.5,0,-.5);
  sky.render();*/

  var cheren = new Cube();
  cheren.textureNum = 1;
  cheren.matrix.translate(0,0,-12);
  cheren.matrix.scale(4,4,0);
  cheren.matrix.translate(-.5,0,-.5);
  cheren.render();

  Oshawott();
  Lillipup();


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

function Oshawott() {
  var body = new Cube();
  body.color = [0.56, 0.8, 0.79, 1.0];
  body.matrix.translate(-0.3, -0.65, 0);
  var bodyCoords = new Matrix4(body.matrix);
  body.matrix.rotate(bodyX, 1, 0, 0);
  body.matrix.rotate(bodyY, 0, 1, 0);
  body.matrix.rotate(bodyZ, 0, 0, 1);
  body.matrix.scale(0.7, 0.8, 0.5);
  body.matrix.translate(0, 1.4, 12);
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
  shell.matrix.translate(shellTX,shellTY,shellTZ);
  shell.matrix.rotate(shellYZ, 0, 1, 1);
  shell.matrix.translate(0.25, 0.3, -0.1);
  shell.matrix.translate(0.35 / 2, 0.14, .125 / 2);
  shell.matrix.translate(-0.35 / 2, -0.14, -0.125 / 2);
  shell.matrix.scale(0.5, 0.35, 0.25);
  shell.render();

  var shell_ = new Cube();
  shell_.color = [0.99, 0.92, 0.68, 1.0];
  shell_.matrix = new Matrix4(bodyRef);
  shell_.matrix.translate(shellTX, shellTY, shellTZ);
  shell_.matrix.rotate(shellYZ, 0, 1, 1);
  shell_.matrix.translate(0.35, 0.2, -0.1);
  shell_.matrix.translate(0.35 / 2, 0.14, .125 / 2);
  shell_.matrix.translate(-0.35 / 2, -0.14, -0.125 / 2);
  shell_.matrix.scale(0.3, 0.1, 0.25);
  shell_.render();

}

function Lillipup() {
  var body = new Cube();
  body.color = [0.84, 0.58, 0.46, 1.0];
  body.matrix.translate(0,0,lBody);
  body.matrix.translate(-0.3, -0.65, -25);
  var bodyCoords = new Matrix4(body.matrix);
  body.matrix.scale(0.9, 0.8, 1.5);
  body.matrix.translate(0, 1.5, 12);
  var bodyRef = new Matrix4(body.matrix);
  body.render();

  var head = new Cube(); // Will prolly want to save head coords
  head.color = [0.96, 0.83, 0.61, 1.0];
  head.matrix = new Matrix4(bodyRef);
  head.matrix.rotate(headX, 1, 0, 0);
  head.matrix.rotate(headY, 0, 1, 0);
  head.matrix.rotate(headZ, 0, 0, 1);
  head.matrix.translate(-0.05, 0.5, 0.8);
  var headCoords = new Matrix4(head.matrix);
  head.matrix.scale(1.1, 1.1, 0.5);
  head.render();

  var thingy = new Cube();
  thingy.color = [0.25,0.29,0.41,1.0];
  thingy.matrix = new Matrix4(headCoords);
  thingy.matrix.translate(0,0.25,-0.5);
  thingy.matrix.scale(0.95,0.4,0.5);
  thingy.render();

  var leftHorn = new Cube();
  leftHorn.color = [0.84, 0.58, 0.46, 1.0];
  leftHorn.matrix = new Matrix4(headCoords);
  leftHorn.matrix.translate(0.7,0,-0.1);
  leftHorn.matrix.rotate(45,0,0,1);
  leftHorn.matrix.translate(0,1,0);
  leftHorn.matrix.scale(0.45, 0.8, 0.45);
  leftHorn.render();

  var rightHorn = new Cube();
  rightHorn.color = [0.84, 0.58, 0.46, 1.0];
  rightHorn.matrix = new Matrix4(headCoords);
  rightHorn.matrix.translate(0.1,0.25,-0.1);
  rightHorn.matrix.rotate(-45,0,0,1);
  rightHorn.matrix.translate(0,1,0);
  rightHorn.matrix.scale(0.45, 0.8, 0.45);
  rightHorn.render();

  var tail = new Cube();
  tail.color = [0.63, 0.43, 0.35, 1.0];
  tail.matrix = new Matrix4(bodyRef);
  tail.matrix.translate(0.25, 0.4, 0);
  tail.matrix.translate(0.17, 0.04, 0.24);
  tail.matrix.rotate(-tailX, 0, 1, 0);
  //tail.matrix.rotate(-tailY, 0, 1, 0);
  tail.matrix.translate(-0.17, -0.04, -0.24);
  tail.matrix.rotate(15, 1, 0, 0);
  tail.matrix.scale(0.5, 0.5, -0.6);
  tail.render();

  var leftLeg = new Cube();
  leftLeg.color = [0.63, 0.43, 0.35, 1.0];
  leftLeg.matrix = new Matrix4(bodyRef);
  leftLeg.matrix.translate(0.1, -0.5, 0.7);
  leftLeg.matrix.scale(0.25, 0.5, 0.25);
  leftLeg.render();

  var leftLeg_ = new Cube();
  leftLeg_.color = [0.63, 0.43, 0.35, 1.0];
  leftLeg_.matrix = new Matrix4(bodyRef);
  leftLeg_.matrix.translate(0.1, -0.5, 0.0);
  leftLeg_.matrix.scale(0.25, 0.5, 0.25);
  leftLeg_.render();

  var rightLeg = new Cube();
  rightLeg.color = [0.63, 0.43, 0.35, 1.0];
  rightLeg.matrix = new Matrix4(bodyRef);
  rightLeg.matrix.translate(0.7, -0.5, 0.7);
  rightLeg.matrix.scale(0.25, 0.5, 0.25);
  rightLeg.render();

  var rightLeg_ = new Cube();
  rightLeg_.color = [0.63, 0.43, 0.35, 1.0];
  rightLeg_.matrix = new Matrix4(bodyRef);
  rightLeg_.matrix.translate(0.7, -0.5, 0.0);
  rightLeg_.matrix.scale(0.25, 0.5, 0.25);
  rightLeg_.render();

  var leftEye = new Cube();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix = new Matrix4(headCoords);
  leftEye.matrix.translate(0.3, 0.55, 0.31);
  var leftEyeCoords = new Matrix4(leftEye.matrix);
  leftEye.matrix.scale(0.15, 0.25, 0.2);
  leftEye.render();

  var leftPupil = new Cube();
  leftPupil.color = [1.0, 1.0, 1.0, 1.0];
  leftPupil.matrix = new Matrix4(leftEyeCoords);
  leftPupil.matrix.translate(0.06,0.09,0.11);
  var leftEyeCoords = new Matrix4(leftEye.matrix);
  leftPupil.matrix.scale(0.05, 0.08, 0.1);
  leftPupil.render();

  var leftE = new Cube();
  leftE.color = [1.0,1.0,1.0,1.0];
  leftE.matrix = new Matrix4(leftEyeCoords);
  leftE.matrix.translate(-0.2,0,0.0);
  leftE.matrix.scale(0.2,1,1);
  leftE.render();

  var rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix = new Matrix4(headCoords);
  rightEye.matrix.translate(0.7, 0.55, 0.31);
  var rightEyeCoords = new Matrix4(rightEye.matrix);
  rightEye.matrix.scale(0.15, 0.25, 0.2);
  rightEye.render();

  var rightPupil = new Cube();
  rightPupil.color = [1.0, 1.0, 1.0, 1.0];
  rightPupil.matrix = new Matrix4(rightEyeCoords);
  rightPupil.matrix.translate(0.06,0.09,0.11);
  rightPupil.matrix.scale(0.05, 0.08, 0.1);
  rightPupil.render();

  var rightE = new Cube();
  rightE.color = [1.0,1.0,1.0,1.0];
  rightE.matrix = new Matrix4(leftEyeCoords);
  rightE.matrix.translate(3.65,0,0.0);
  rightE.matrix.scale(0.2,1,1);
  rightE.render();

  var nose = new Cube();
  nose.color = [0.8, 0.2, 0.2, 1.0];
  nose.matrix = new Matrix4(headCoords);
  nose.matrix.translate(0.48, 0.4, 0.33);
  nose.matrix.scale(0.2, 0.15, 0.2);
  nose.render();

  var mouth = new Cube();
  mouth.color = [0.0, 0.0, 0.0, 1.0];
  mouth.matrix = new Matrix4(headCoords);
  mouth.matrix.translate(0.55, 0.2, 0.41);
  mouth.matrix.scale(0.05, 0.05, 0.1);
  mouth.render();

  
}