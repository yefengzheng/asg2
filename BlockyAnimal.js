// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
`attribute vec4 a_Position;
 uniform mat4 u_ModelMatrix;
 uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`


// Fragment shader program
var FSHADER_SOURCE =
`precision mediump float;
 uniform vec4 u_FragColor;
 void main() {
   gl_FragColor = u_FragColor;
 }`



//global
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;


function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer : true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.error('Failed to get storage location of attributes.');
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
let g_mouseX = 200;
let g_prevMouseX = 200;
let g_mouseDown = false;
let g_mouseRotateAngle = 0;
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectsize = 5;
let g_globalAngle = 200;
let g_LegMove13 = 0;
let g_LegMove24 = 0;
let g_YellowAnimation = false;
let g_magentaAnimation = false;
let g_Animation = false;
let g_Move = 1;
let a_Move = 1;
let b_Move = 1;

function addActionsForHtmlUI(){
  document.getElementById('AnimationYellowOnButton').onclick = function(){g_YellowAnimation = true};
  document.getElementById('AnimationYellowOffButton').onclick = function(){g_YellowAnimation = false};

  document.getElementById('AnimationMagentaOnButton').onclick = function(){g_magentaAnimation = true};
  document.getElementById('AnimationMagentaOffButton').onclick = function(){g_magentaAnimation = false,g_LegMove24=0};

  document.getElementById('AnimationOnButton').onclick = function(){g_Animation = true};
  document.getElementById('AnimationOffButton').onclick = function(){g_Animation = false,g_LegMove13=0,g_LegMove24=0};

  document.getElementById('YellowSlide').addEventListener('input', function() {g_LegMove13 = this.value; renderAllShapes();});
  document.getElementById('MagentaAngle').addEventListener('input', function() {g_LegMove24 = this.value; renderAllShapes();});

  document.getElementById('angleSlide').addEventListener('input', function() {g_globalAngle = this.value; renderAllShapes();});

 }


function main() {

  setupWebGL();
  connectVariablesToGLSL()
  addActionsForHtmlUI();
  addMouseControl();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(tick);
}

function addMouseControl() {
  canvas.addEventListener("mousedown", (event) => {
    if (event.shiftKey) {
      let startTime = Date.now();
      let i = 1;
      function loop() {
          let elapsedTime = (Date.now() - startTime) / 1000;
          if (elapsedTime >= 4) return g_Move = 1,a_Move = 1,b_Move = 1; // Stop after 5 seconds
          a_Move = Math.sin(i*0.5);
          b_Move = Math.cos(i*0.5);
          g_Move = Math.tan(i*0.5)
          renderAllShapes();
          i++;
          setTimeout(loop, 100); // Call itself after 100ms
      }
      loop();

    } else {
      g_mouseDown = true;
      g_prevMouseX = event.clientX;
    }
  });

  canvas.addEventListener("mouseup", () => {
    g_mouseDown = false;
  });

  canvas.addEventListener("mousemove", (event) => {
    if (g_mouseDown) {
      let deltaX = event.clientX - g_prevMouseX;

      g_mouseRotateAngle += deltaX * -0.5;
      g_prevMouseX = event.clientX;
      renderAllShapes();
    }
  });
}



// Reset the previous position on mouse up
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

function tick(){
  g_seconds = performance.now()/1000.0-g_startTime;
  console.log(g_seconds);
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

 function updateAnimationAngles(){
   if(g_Animation){
     g_LegMove13 = (0.07*Math.sin(9*g_seconds));
     g_LegMove24 = (-0.07*Math.sin(9*g_seconds));
   }
   if(g_YellowAnimation){
     g_LegMove13 = (0.07*Math.sin(9*g_seconds));
   }
   if(g_magentaAnimation){
     g_LegMove24 = (-0.07*Math.sin(9*g_seconds));
   }
 }


 function renderAllShapes() {
   var startTime = performance.now();

   var globalRotMat = new Matrix4().rotate(g_globalAngle+g_mouseRotateAngle,0,1,0);
   gl.uniformMatrix4fv(u_GlobalRotateMatrix,false, globalRotMat.elements);

   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.clear(gl.COLOR_BUFFER_BIT);
   //drawTriangle3D([-1.0, 0.0, 0.0, -0.5, -1.0, 0.0, 0.0, 0.0, 0.0]);

   var body = new Cube();
   body.color = [0.3, 0.3, 0.3, 1.0];
   body.matrix.translate(-0.2, -0.45, 0.2);
   body.matrix.scale(0.4, 0.2, -0.6);
   body.render();

   // Spider Head
   var head = new Cube();
   head.color = [0.4*g_Move, 0.4, 0.4*g_Move, 1.0];
   head.matrix.translate(-0.1*a_Move, -0.35*g_Move, 0.15*b_Move);
   head.matrix.scale(0.2, 0.15, 0.2);
   head.render();

   var reye = new Cube();
   reye.color = [1/g_Move,0-g_Move,0, 1.0];
   reye.matrix.translate(-0.07/b_Move, -0.3/a_Move, 0.35*g_Move);
   reye.matrix.scale(0.03, 0.03, 0.03);
   reye.render();

   var leye = new Cube();
   leye.color = [1/g_Move,0,0-g_Move, 1.0];
   leye.matrix.translate(0.05/g_Move, -0.3/b_Move, 0.35*a_Move);
   leye.matrix.scale(0.03, 0.03, 0.03);
   leye.render();


   let upperLeg1 = new Cube();
   upperLeg1.color = [0.2, 0.2, 0.2, 1.0];
   upperLeg1.matrix.translate(-0.18, -0.4, -0.4);
   upperLeg1.matrix.rotate(-70, g_LegMove13, 0, 1);
   let legMat1 = new Matrix4(upperLeg1.matrix);
   upperLeg1.matrix.scale(0.05, -0.3, 0.05);
   upperLeg1.matrix.translate(-0.5, 0, 0);
   upperLeg1.render();
   let lowerLeg1 = new Cube();
   lowerLeg1.color = [0.2, 0.2, 0.2, 1.0];
   lowerLeg1.matrix = legMat1;
   lowerLeg1.matrix.translate(0, -0.3, 0);
   lowerLeg1.matrix.rotate(35, 0, 0, 1);
   lowerLeg1.matrix.scale(0.05, -0.3, 0.05);
   lowerLeg1.matrix.translate(-0.5, 0, 0);
   lowerLeg1.render();


   //leg2
   let upperLeg2 = new Cube();
   upperLeg2.color = [0.2, 0.2, 0.2, 1.0];
   upperLeg2.matrix.translate(-0.18, -0.4, -0.25);
   upperLeg2.matrix.rotate(-70, g_LegMove24, 0, 1);
   let legMat2 = new Matrix4(upperLeg2.matrix);
   upperLeg2.matrix.scale(0.05, -0.3, 0.05);
   upperLeg2.matrix.translate(-0.5, 0, 0);
   upperLeg2.render();
   let lowerLeg2 = new Cube();
   lowerLeg2.color = [0.2, 0.2, 0.2, 1.0];
   lowerLeg2.matrix = legMat2;
   lowerLeg2.matrix.translate(0, -0.3, 0);
   lowerLeg2.matrix.rotate(35, 0, 0, 1);
   lowerLeg2.matrix.scale(0.05, -0.3, 0.05);
   lowerLeg2.matrix.translate(-0.5, 0, 0);
   lowerLeg2.render();

   //leg3
   let upperLeg3 = new Cube();
   upperLeg3.color = [0.2, 0.2, 0.2, 1.0];
   upperLeg3.matrix.translate(-0.18, -0.4, -0.1);
   upperLeg3.matrix.rotate(-70, g_LegMove13, 0, 1);
   let legMat3 = new Matrix4(upperLeg3.matrix);
   upperLeg3.matrix.scale(0.05, -0.3, 0.05);
   upperLeg3.matrix.translate(-0.5, 0, 0);
   upperLeg3.render();
   let lowerLeg3 = new Cube();
   lowerLeg3.color = [0.2, 0.2, 0.2, 1.0];
   lowerLeg3.matrix = legMat3;
   lowerLeg3.matrix.translate(0, -0.3, 0);
   lowerLeg3.matrix.rotate(35, 0, 0, 1);
   lowerLeg3.matrix.scale(0.05, -0.3, 0.05);
   lowerLeg3.matrix.translate(-0.5, 0, 0);
   lowerLeg3.render();

   //leg4
   let upperLeg4 = new Cube();
   upperLeg4.color = [0.2, 0.2, 0.2, 1.0];
   upperLeg4.matrix.translate(-0.18, -0.4, 0.05);
   upperLeg4.matrix.rotate(-70, g_LegMove24, 0, 1);
   let legMat4 = new Matrix4(upperLeg4.matrix);
   upperLeg4.matrix.scale(0.05, -0.3, 0.05);
   upperLeg4.matrix.translate(-0.5, 0, 0);
   upperLeg4.render();
   let lowerLeg4 = new Cube();
   lowerLeg4.color = [0.2, 0.2, 0.2, 1.0];
   lowerLeg4.matrix = legMat4;
   lowerLeg4.matrix.translate(0, -0.3, 0);
   lowerLeg4.matrix.rotate(35, 0, 0, 1);
   let legMatMat4 = new Matrix4(lowerLeg4.matrix);
   lowerLeg4.matrix.scale(0.05, -0.3, 0.05);
   lowerLeg4.matrix.translate(-0.5, 0, 0);
   lowerLeg4.render();
   let lowlowerLeg4 = new Cube();
   lowlowerLeg4.color = [1, 0, 0, 1.0];
   lowlowerLeg4.matrix = legMatMat4;
   lowlowerLeg4.matrix.translate(0, -0.3, 0.02);
   lowlowerLeg4.matrix.rotate(-90, 135, 15, 1);
   lowlowerLeg4.matrix.scale(0.01, -0.3, 0.05);
   lowlowerLeg4.matrix.translate(-0.5, 0, 0);
   lowlowerLeg4.render();
   //
   //leg11
   let upperLeg11 = new Cube();
   upperLeg11.color = [0.2, 0.2, 0.2, 1.0];
   upperLeg11.matrix.translate(0.18, -0.4, -0.4);
   upperLeg11.matrix.rotate(70, g_LegMove13, 0, 1);
   let legMat11 = new Matrix4(upperLeg11.matrix);
   upperLeg11.matrix.scale(0.05, -0.3, 0.05);
   upperLeg11.matrix.translate(-0.5, 0, 0);
   upperLeg11.render();
   let lowerLeg11 = new Cube();
   lowerLeg11.color = [0.2, 0.2, 0.2, 1.0];
   lowerLeg11.matrix = legMat11;
   lowerLeg11.matrix.translate(0, -0.3, 0);
   lowerLeg11.matrix.rotate(-35, 0, 0, 1);
   lowerLeg11.matrix.scale(0.05, -0.3, 0.05);
   lowerLeg11.matrix.translate(-0.5, 0, 0);
   lowerLeg11.render();


   //leg21
   let upperLeg21 = new Cube();
   upperLeg21.color = [0.2, 0.2, 0.2, 1.0];
   upperLeg21.matrix.translate(0.18, -0.4, -0.25);
   upperLeg21.matrix.rotate(70, g_LegMove24, 0, 1);
   let legMat21 = new Matrix4(upperLeg21.matrix);
   upperLeg21.matrix.scale(0.05, -0.3, 0.05);
   upperLeg21.matrix.translate(-0.5, 0, 0);
   upperLeg21.render();
   let lowerLeg21 = new Cube();
   lowerLeg21.color = [0.2, 0.2, 0.2, 1.0];
   lowerLeg21.matrix = legMat21;
   lowerLeg21.matrix.translate(0, -0.3, 0);
   lowerLeg21.matrix.rotate(-35, 0, 0, 1);
   lowerLeg21.matrix.scale(0.05, -0.3, 0.05);
   lowerLeg21.matrix.translate(-0.5, 0, 0);
   lowerLeg21.render();

   //leg31
   let upperLeg31 = new Cube();
   upperLeg31.color = [0.2, 0.2, 0.2, 1.0];
   upperLeg31.matrix.translate(0.18, -0.4, -0.1);
   upperLeg31.matrix.rotate(70, g_LegMove13, 0, 1);
   let legMat31 = new Matrix4(upperLeg31.matrix);
   upperLeg31.matrix.scale(0.05, -0.3, 0.05);
   upperLeg31.matrix.translate(-0.5, 0, 0);
   upperLeg31.render();
   let lowerLeg31 = new Cube();
   lowerLeg31.color = [0.2, 0.2, 0.2, 1.0];
   lowerLeg31.matrix = legMat31;
   lowerLeg31.matrix.translate(0, -0.3, 0);
   lowerLeg31.matrix.rotate(-35, 0, 0, 1);
   lowerLeg31.matrix.scale(0.05, -0.3, 0.05);
   lowerLeg31.matrix.translate(-0.5, 0, 0);
   lowerLeg31.render();

   //leg41
   let upperLeg41 = new Cube();
   upperLeg41.color = [0.2, 0.2, 0.2, 1.0];
   upperLeg41.matrix.translate(0.18, -0.4, 0.05);
   upperLeg41.matrix.rotate(70, g_LegMove24, 0, 1);
   let legMat41 = new Matrix4(upperLeg41.matrix);
   upperLeg41.matrix.scale(0.05, -0.3, 0.05);
   upperLeg41.matrix.translate(-0.5, 0, 0);
   upperLeg41.render();
   let lowerLeg41 = new Cube();
   lowerLeg41.color = [0.2, 0.2, 0.2, 1.0];
   lowerLeg41.matrix = legMat41;
   lowerLeg41.matrix.translate(0, -0.3, 0);
   lowerLeg41.matrix.rotate(-35, 0, 0, 1);
   lowerLeg41.matrix.scale(0.05, -0.3, 0.05);
   lowerLeg41.matrix.translate(-0.5, 0, 0);
   lowerLeg41.render();



   var duration = performance.now() - startTime;
   sendTextToHTML("fps: " + Math.floor(10000 / duration) / 10, "numdot");

}


function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get" + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
