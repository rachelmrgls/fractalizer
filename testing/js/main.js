/*
 * Provides requestAnimationFrame in a cross browser way.
 * paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimationFrame = window.requestAnimationFrame || ( function() {
	return  window.webkitRequestAnimationFrame 	||
			window.mozRequestAnimationFrame 	||
			window.oRequestAnimationFrame 		||
			window.msRequestAnimationFrame 		||
			function(  callback, element ) {
				window.setTimeout( callback, 1000 / 60 );
			};

})();




// construct scene given loaded geometry 
var controlsChangeCallback = function() {

	mu.cur[0] = Gui.values.r;
	mu.cur[1] = Gui.values.i;
	mu.cur[2] = Gui.values.j;
	mu.cur[3] = Gui.values.k;
}

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    Gui.init(controlsChangeCallback );

	init();
	animate();
};


var canvas;
var gl;
var vertexBuffer, rayDirectionBuffer;

var shader1 = {
	program: null,
	attribs: {
		position: null,
		rayDirection: null },
	uniforms: {
		mu: null,
		maxIterations: null,
		epsilon: null,
		eye: null,
		diffuse: null,
		light: null,
		rayOrigin: null }
};

var shader2 = {
	program: null,
	attribs: {
		position: null },
	uniforms: {
		width: null,
		height: null}
};

var frameBuffer;

var frameCounter = 0;

// camera parameters ----------
var eye = [ 0.0, 0.0, 0.0 ];
var lookAt = [ 0.0, 0.0, 0.0 ];
var up = [ 0.0, 0.0, 0.0 ];
var fov = 60.0;
//normal, tangent, and binormal of the image plane
var N = [ 0.0, 0.0, 0.0 ];
var T = [ 0.0, 0.0, 0.0 ];
var B = [ 0.0, 0.0, 0.0 ];

// light parameters ----------
var light = [ 0.0, 0.0, 0.0, 0.0 ];    // point light location

var translate = [ 0.0, 0.0 ];
var zoom = 1.3;    // this whole set up needs to change (also it's counter intuitive: + is farther away)
var curRotation = [
	1.0, 0.0, 0.0, 0.0,
	0.0, 1.0, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	0.0, 0.0, 0.0, 0.0
];

// var mu = {
// 	cur: new THREE.Vector4(),
// 	next: new THREE.Vector4(),
// 	prev: new THREE.Vector4(),

// 	update: function(time) {
// 		for (var i = 0; i < 4; ++i) {
// 			this.cur.setComponent(i, (1.0 - time) * this.prev[i] + time * this.next[i]);
// 		}
// 	},

// 	change: function() {
// 		for (var i = 0; i < this.prev.length; ++i) {
// 			this.prev.setComponent(i, this.next.getComponent(i));
// 			this.next.setComponent(i, 2.0 * Math.random() - 1.0);
// 		}
// 	}
// }

var mu = {
	cur: [ 0.0, 0.0, 0.0, 0.0 ],

	next: [ 0.0, 0.0, 0.0, 0.0 ],
	prev: [ 0.0, 0.0, 0.0, 0.0 ],

	update: function(time) {
		for (var i = 0; i < this.cur.length; ++i) {
			this.cur[i] = (1.0 - time) * this.prev[i] + time * this.next[i];
		}
	},

	change: function() {
		for (var i = 0; i < this.prev.length; ++i) {
			this.prev[i] = this.next[i];
			this.next[i] = 2.0 * Math.random() - 1.0;
		}
	}
}


function init() {
	canvas = document.querySelector('canvas');
	// canvas.width = 512;
	// canvas.height = 256;
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Initialise WebGL
	try {
		gl = canvas.getContext('experimental-webgl');
	} catch(error) { }
	if (!gl) throw "cannot create webgl context";


	vertexBuffer = createVertexBuffer();
	rayDirectionBuffer = createRayDirectionBuffer();
	frameBuffer = createFrameBuffer();


	loadShader(shader1,
		Parser.parseTxt('shaders/vs-1.glsl'),
		Parser.parseTxt('shaders/fs-1.glsl')
	);
	loadShader(shader2,
		Parser.parseTxt('shaders/vs-2.glsl'),
		Parser.parseTxt('shaders/fs-2.glsl')
	);
}


function createVertexBuffer() {
	var buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1.0, -1.0,
		 1.0, -1.0,
		-1.0,  1.0,
		 1.0, -1.0,
		 1.0,  1.0,
		-1.0,  1.0
	]), gl.STATIC_DRAW);

	return buffer;
}

function createRayDirectionBuffer() {
	var buffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0
	]), gl.DYNAMIC_DRAW);

	return buffer;
}

function createFrameBuffer() {
	var frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	frameBuffer.width = 2048;
	frameBuffer.height = 1024;
	// frameBuffer.width = canvas.width*2;
	// frameBuffer.height = canvas.height*2;

	var frameBufferTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, frameBufferTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, frameBuffer.width, frameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	var renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frameBufferTexture, 0);

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return { frameBuffer: frameBuffer, frameBufferTexture: frameBufferTexture }
}


function animate() {
	requestAnimationFrame(animate);

	calculateView();
	// mu.update(frameCounter / 100);

	render();

	// frameCounter++;
	// if (frameCounter >= 100) {
	// 	frameCounter = 0;
	// 	mu.change();
	// }
}

// --------- calculateView() ------------------
//
// Convert transformation matrix into a basis for the space of the image plane.
// This basis is used to generate the rays which are intersected with the
// Julia set.
//
function calculateView() {
	// First apply the view transformations to the initial eye, look at, and
	// up.  These will be used later to determine the basis.

	var eyeStart =    [ 0.0, 0.0, 1.0, 1.0 ];    // eye starts on the unit sphere
	var lookatStart = [ 0.0, 0.0, 0.0, 1.0 ];    // initially look at the origin
	var upStart =     [ 0.0, 1.0, 0.0, 0.0 ];    // up is initially along the y-axis

	// var eyeStart =    [ 0.0, 0.0, 1.0, 0.0 ];    // eye starts on the unit sphere
	// var lookatStart = [ 0.0, 0.0, 0.0, 0.0 ];    // initially look at the origin
	// var upStart =     [ 0.0, 1.0, 0.0, 0.0 ];    // up is initially along the y-axis

	// translate the eye and look at points
	eyeStart[0] += translate[0];
	eyeStart[1] += translate[1];
	eyeStart[2] += zoom;
	lookatStart[0] += translate[0];
	lookatStart[1] += translate[1];
	lookatStart[2] += zoom;


	// rotate eye, lookat, and up by multiplying them with the current rotation matrix
	for( var i=0; i < 4; i++ ) {
		eye[i]    = 0.0;
		lookAt[i] = 0.0;
		up[i]     = 0.0;

		for( var j=0; j<4; j++ ) {
			eye[i]    += curRotation[i*4+j] * eyeStart[j];
			lookAt[i] += curRotation[i*4+j] * lookatStart[j];
			up[i]     += curRotation[i*4+j] * upStart[j];
		}
	}


// FIX, THIS STUFF IS SILLY

	// var rotationMatrix = new THREE.Matrix4();
	// var eyeStart2 = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);
	// var translate2 = new THREE.Vector4(translate[0], translate[1], zoom, 0.0);
	// eyeStart2.add(translate2)
	// eyeStart2.setAxisAngleFromRotationMatrix(rotationMatrix)
	// // console.log(eyeStart2)
	// // console.log(eye)


	// console.log(eye)

	// Now we construct the basis:
	//
	//   N = (look at) - (eye)
	//   T = up
	//   B = N x T
	//
	var mag;

	// find and normalize N = (lookat - eye)
	for(var i=0; i<3; i++) N[i] = lookAt[i] - eye[i];
	
	mag = Math.sqrt(N[0]*N[0] + N[1]*N[1] + N[2]*N[2]);
	
	for(var i=0; i<3; i++) N[i] /= mag;

	// find and normalize T = up
	for(var i=0; i<3; i++) T[i] = up[i];
	
	mag = Math.sqrt(T[0]*T[0] + T[1]*T[1] + T[2]*T[2]);
	
	for(var i=0; i<3; i++) T[i] /= mag;

	// find B = N x T (already unit length)
	B[0] = N[1]*T[2] - N[2]*T[1];
	B[1] = N[2]*T[0] - N[0]*T[2];
	B[2] = N[0]*T[1] - N[1]*T[0];

	// we also use this basis to determine the light position
	// (move the light a little bit up and to the right of the eye).
	for( var i=0; i < 3; i++ ) {
		light[i] = eye[i] + B[i] * 0.5;
		light[i] = eye[i] + T[i] * 0.5;
	}
}


// DEAL WITH RENDERING ///////////////////////////////////////////////////////////////////////////

function render() {
	// Render to an off-screen frame buffer (with attached texture)
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
	// gl.viewport(0, 0, canvas.width, canvas.height);
	gl.viewport(0, 0, frameBuffer.frameBuffer.width, frameBuffer.frameBuffer.height);

	gl.useProgram(shader1.program);

	// gl.uniform4f(shader1.uniforms.mu, mu.cur.x, mu.cur.y, mu.cur.z, mu.cur.w);
	gl.uniform4f(shader1.uniforms.mu, mu.cur[0], mu.cur[1], mu.cur[2], mu.cur[3]);
	gl.uniform1i(shader1.uniforms.maxIterations, 20);	 // bounds precision
	gl.uniform1f(shader1.uniforms.epsilon, 0.003);       // bounds precision
	gl.uniform3f(shader1.uniforms.eye, eye[0], eye[1], eye[2]);
	gl.uniform3f(shader1.uniforms.diffuse, 0.81, 0.76, 0.878); // diffuse color. We'll find a cool one later
	gl.uniform3f(shader1.uniforms.light, light[0], light[1], light[2]);

	// Rays are specified by determining the ray from the eye to each of the
	// corners of the image plane (fullscreen quad).  The image plane is
	// unit distance in front of the eye along the look at direction.  The
	// size of the image plane is determined by the field of view (fov) and
	// the aspect ratio of the current window.  To find the rays through a
	// corner, we calculate the world space position of the corner and
	// subtract the eye.  The position of a corner is found by adding
	// 1 times the look at direction, width times the tangent direction, and
	// height times the bitangent direction to the eye location.
	var beta = Math.tan((fov * Math.PI / 180.0) / 2.0); //find height
	var aspect = 2;//canvas.width / canvas.height;
	var alpha = beta * aspect;                          //find width

	gl.uniform3f(gl.getUniformLocation(shader1.program, "rayOrigin"), eye[0], eye[1], eye[2]);

	gl.enableVertexAttribArray(shader1.attribs.rayDirection);
	gl.bindBuffer(gl.ARRAY_BUFFER, rayDirectionBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([
		-alpha*T[0] - beta*B[0] + N[0], -alpha*T[1] - beta*B[1] + N[1], -alpha*T[2] - beta*B[2] + N[2],// -1.0, -1.0,
		 alpha*T[0] - beta*B[0] + N[0],  alpha*T[1] - beta*B[1] + N[1],  alpha*T[2] - beta*B[2] + N[2],//  1.0, -1.0,
		-alpha*T[0] + beta*B[0] + N[0], -alpha*T[1] + beta*B[1] + N[1], -alpha*T[2] + beta*B[2] + N[2],// -1.0,  1.0,
		 alpha*T[0] - beta*B[0] + N[0],  alpha*T[1] - beta*B[1] + N[1],  alpha*T[2] - beta*B[2] + N[2],//  1.0, -1.0,
		 alpha*T[0] + beta*B[0] + N[0],  alpha*T[1] + beta*B[1] + N[1],  alpha*T[2] + beta*B[2] + N[2],//  1.0,  1.0,
		-alpha*T[0] + beta*B[0] + N[0], -alpha*T[1] + beta*B[1] + N[1], -alpha*T[2] + beta*B[2] + N[2] // -1.0,  1.0,
	]));
	gl.vertexAttribPointer(shader1.attribs.rayDirection, 3, gl.FLOAT, false, 0, 0);

	gl.enableVertexAttribArray(shader1.attribs.position);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(shader1.attribs.position, 2, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 6);

	gl.disableVertexAttribArray(shader1.attribs.position);
	gl.disableVertexAttribArray(shader1.attribs.rayDirection);

	// Render texture to a smaller on-screen quad, so we can take advantage of linear minification filtering,
	// instead of antialiasing (which doesn't seem to work so well as of May 2012).
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(shader2.program);

	gl.uniform1f(shader2.uniforms.width, canvas.width);
	gl.uniform1f(shader2.uniforms.height, canvas.height);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, frameBuffer.frameBufferTexture);

	gl.enableVertexAttribArray(shader2.attribs.position);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(shader2.attribs.position, 2, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}


// DEAL WITH SHADER STUFF ////////////////////////////////////////////////////////////////////////

function loadShader(shader, vertex, fragment) {
	shader.program = gl.createProgram();

	var vs = createShader(vertex, gl.VERTEX_SHADER);
	var fs = createShader(fragment, gl.FRAGMENT_SHADER);

	if (vs == null || fs == null) return null;

	gl.attachShader(shader.program, vs);
	gl.attachShader(shader.program, fs);

	gl.deleteShader(vs);
	gl.deleteShader(fs);

	gl.linkProgram(shader.program);

	if (!gl.getProgramParameter(shader.program, gl.LINK_STATUS)) {
		alert("ERROR:\n" +
		"VALIDATE_STATUS: " + gl.getProgramParameter( program, gl.VALIDATE_STATUS ) + "\n" +
		"ERROR: " + gl.getError() + "\n\n" +
		"- Vertex Shader -\n" + vertex + "\n\n" +
		"- Fragment Shader -\n" + fragment);

		return null;
	}

	for (var attrib in shader.attribs) {
		shader.attribs[attrib] = gl.getAttribLocation(shader.program, attrib);
	}

	for (var uniform in shader.uniforms) {
		shader.uniforms[uniform] = gl.getUniformLocation(shader.program, uniform);
	}

	return shader;
}

function createShader( src, type ) {
	var shader = gl.createShader( type );

	gl.shaderSource( shader, src );
	gl.compileShader( shader );

	if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
		alert( ( type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT" ) + " SHADER:\n" + gl.getShaderInfoLog( shader ) );
		return null;
	}

	return shader;
}