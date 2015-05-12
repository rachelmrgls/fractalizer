var Raymarcher = Raymarcher || {};
// ID
Raymarcher.objectID = 0;
Raymarcher.lightID = 0;

// fractals
Raymarcher.JULIA    = 1;


Raymarcher.curMaterial = {};

// for animation
Raymarcher.frame = 0;

Raymarcher.mouseDown = false;
Raymarcher.lastMouseX = null;
Raymarcher.lastMouseY = null;


Raymarcher.handleMouseDown = function(event) {
	Raymarcher.mouseDown = true;
	Raymarcher.lastMouseX = event.clientX;
	Raymarcher.lastMouseY = event.clientY;
};

Raymarcher.handleMouseUp = function(event) {
	Raymarcher.mouseDown = false;
};

Raymarcher.handleZoom = function(delta) {
	mat4.translate(Raymarcher.RotationMatrix, [0.0, 0.0, 0.5 * delta]);
};

Raymarcher.handleMouseMove = function(event) {
	var newX   = event.clientX;
	var newY   = event.clientY;
	var deltaX = newX - Raymarcher.lastMouseX
	var deltaY = newY - Raymarcher.lastMouseY;
    var moved  = deltaX != 0 || deltaY != 0;
    
	if (!Raymarcher.mouseDown || !moved) {
		return;
	}

    var degToRad = function(degrees) { return degrees * Math.PI / 180; }
	var newRotationMatrix = mat4.create();
	mat4.identity(newRotationMatrix);
	mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
	mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);
	mat4.multiply(newRotationMatrix, Raymarcher.RotationMatrix, Raymarcher.RotationMatrix);

	Raymarcher.lastMouseX  = newX
	Raymarcher.lastMouseY  = newY;
	Raymarcher.needsToDraw = true;
};

Raymarcher.createShader = function (src, shaderType, debug) {
    var shader = this.gl.createShader( shaderType );
    this.gl.shaderSource(shader, src);
    this.gl.compileShader(shader);
    
    // check compile status and report error
    var ok = this.gl.getShaderParameter( shader, this.gl.COMPILE_STATUS );
    
    if (debug || !ok) {
        var log = this.gl.getShaderInfoLog( shader );
        var msg = debug ? 'Debug status of ' : 'Compile error in ';
        msg += 'shader type ' + shaderType + ': ' + log;
        alert(msg);
        console.log(msg);
    }
    return shader;
};

Raymarcher.loadShader = function (shader, vsSrc, fsSrc, debug) {
    shader.program = this.gl.createProgram();

    var vs = this.createShader(vsSrc, this.gl.VERTEX_SHADER);
    var fs = this.createShader(fsSrc, this.gl.FRAGMENT_SHADER);

    if (vs == null || fs == null) return null;

    this.gl.attachShader(shader.program, vs);
    this.gl.attachShader(shader.program, fs);

    this.gl.deleteShader(vs);
    this.gl.deleteShader(fs);

    this.gl.linkProgram(shader.program);

    // check link status and report error
    var ok = this.gl.getProgramParameter(shader.program, this.gl.LINK_STATUS);

    if (debug || !ok) {
        var log = this.gl.getShaderInfoLog( shader );
        var msg = debug ? 'Debug status:\n' : 'Compile error:\n';
        msg += 'VALIDATE_STATUS: ' + this.gl.getProgramParameter( program, this.gl.VALIDATE_STATUS ) + 
                '\n' + 'ERROR: ' + this.gl.getError() + '\n';
        alert(msg);
        console.log(msg);
    }

    for (var attrib in shader.attribs) {
        shader.attribs[attrib] = this.gl.getAttribLocation(shader.program, attrib);
    }

    for (var uniform in shader.uniforms) {
        shader.uniforms[uniform] = this.gl.getUniformLocation(shader.program, uniform);
    }

    return shader;
};

Raymarcher.init = function (shapeName, debug) {
    canvas = document.getElementById('canvas');
    // canvas.width = 512;
    // canvas.height = 256;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialise WebGL
    try {
        this.gl = canvas.getContext('experimental-webgl');
    } catch(error) { }
    if (!this.gl) throw "cannot create webgl context";

    this.vertexBuffer       = this.createVertexBuffer();
    this.rayDirectionBuffer = this.createRayDirectionBuffer();
    this.frameBuffer        = this.createFrameBuffer();

    this.mainShader = this.getShader(shapeName,debug);
    this.shader2    = this.getShader2(debug);

    Raymarcher.RotationMatrix = mat4.create();
    mat4.identity(Raymarcher.RotationMatrix);

    canvas.onmousedown = Raymarcher.handleMouseDown;
    document.onmouseup = Raymarcher.handleMouseUp;
    document.onmousemove = Raymarcher.handleMouseMove;
};




Raymarcher.createVertexBuffer = function() {
    var buffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
        -1.0,  1.0
    ]), this.gl.STATIC_DRAW);

    return buffer;
};

Raymarcher.createRayDirectionBuffer = function () {
    var buffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0
    ]), this.gl.DYNAMIC_DRAW);

    return buffer;
};

Raymarcher.createFrameBuffer = function () {
    var frameBuffer = this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
    frameBuffer.width = 1024;
    frameBuffer.height = 512;

    var frameBufferTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, frameBufferTexture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, frameBuffer.width, frameBuffer.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

    var renderbuffer = this.gl.createRenderbuffer();
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, frameBufferTexture, 0);

    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    return { frameBuffer: frameBuffer, frameBufferTexture: frameBufferTexture }
};

Raymarcher.getShader = function (shapeName, debug) {
    if (shapeName == 'julia3D') {
        return Raymarcher.getJuliaShader(debug);
    }
    console.log("shape not found. returning undefined")
};

Raymarcher.getJuliaShader = function(debug) {
    var juliaShader = {
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
    this.loadShader(juliaShader,
        Parser.parseTxt('shaders/vert-julia3D.glsl'),
        Parser.parseTxt('shaders/frag-julia3D.glsl'),
        debug
    );
    return juliaShader;
};

Raymarcher.getShader2 = function (debug) {
    var shader2 = {
        program: null,
        attribs: {
            position: null },
        uniforms: {
            width: null,
            height: null}
    };
    this.loadShader(shader2,
        Parser.parseTxt('shaders/vs-2.glsl'),
        Parser.parseTxt('shaders/fs-2.glsl'),
        debug
    );
    return shader2;
};




Raymarcher.setUniform = function ( varType ,varName, v0, v1, v2 ) {
    var unifName = 'uniform' + varType;
    v0 = v0 || 0.0;
    v1 = v1 || 0.0;
    v2 = v2 || 0.0;
    // v1 and v2 may be undefined because we only need 1 argument, but this is ok
    this.gl[unifName]( this.gl.getUniformLocation(this.program, varName), v0, v1, v2  );
};

Raymarcher.setUniformShape = function ( shapeType, rad, u0, u1, u2, w0, w1, w2 ) {

    var oID = "objects[" + this.objectID +"].shape.";
    
    this.setUniform('1i', oID + "shapeType", shapeType);
    this.setUniform('3f', oID + "v1", u0, u1, u2);
    this.setUniform('3f', oID + "v2", w0, w1, w2);
    this.setUniform('1f', oID + "rad", rad);
    if (this.objectID > 24) {
        alert("warning: we have exceeded the maximum number of objects listed in the shader. To change this number you need to change it in two places: this line and also MAX_OBJECTS value in shaders/raytracer.glsl ");
        return;
    }
    this.objectID++;
    this.copyMaterialToNextID();
};

Raymarcher.copyMaterialToNextID = function() {
    for ( var varName in this.curMaterial ) {
        if (!this.curMaterial.hasOwnProperty(varName)) continue;
        var property = this.curMaterial[varName];
        var t  = property.type;
        var v0 = property.v0;
        var v1 = property.v1;
        var v2 = property.v2;
        this.setUniform(t, "objects[" + this.objectID +"].material."+varName, v0, v1, v2);
    }
};

Raymarcher.setUniformMaterial = function ( varType , varName, v0, v1, v2) {
    this.setUniform(varType, "objects[" + this.objectID +"].material."+varName, v0, v1, v2);
    var mat = { type: varType, v0: v0, v1: v1, v2: v2 };
    this.curMaterial[varName] = mat;
    //console.log('save material for object ID ' + this.objectID + ":\n" + JSON.stringify(mat));
};

Raymarcher.resetMaterial = function ( ) {
    Raymarcher.setUniformMaterial( '1i','materialType', Raymarcher.LAMBERTMATERIAL);
    Raymarcher.setUniformMaterial( '1i','materialReflectType', Raymarcher.NONEREFLECT);
    Raymarcher.setUniformMaterial( '1f','reflectivity', 0.0);   
    Raymarcher.setUniformMaterial( '3f','color', 0.4, 0.4, 0.4 );
	Raymarcher.setUniformMaterial( '3f','specular', 0.0, 0.0, 0.0 );
	Raymarcher.setUniformMaterial( '1f','shininess', 10000 ); 
    Raymarcher.setUniformMaterial( '1f','refractionRatio', 0.0 );
    Raymarcher.setUniformMaterial( '1i','special', this.NONE );  
};


Raymarcher.render = function () {
    // Render to an off-screen frame buffer (with attached texture)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer.frameBuffer);
    this.gl.viewport(0, 0, this.frameBuffer.frameBuffer.width, this.frameBuffer.frameBuffer.height);

    this.gl.useProgram(this.mainShader.program);

    // this.gl.uniform4f(this.mainShader.uniforms.mu, mu.cur.x, mu.cur.y, mu.cur.z, mu.cur.w);
    this.gl.uniform4f(this.mainShader.uniforms.mu, Raymarcher.mu.cur[0], Raymarcher.mu.cur[1], Raymarcher.mu.cur[2], Raymarcher.mu.cur[3]);
    this.gl.uniform1i(this.mainShader.uniforms.maxIterations, 20);    // bounds precision
    this.gl.uniform1f(this.mainShader.uniforms.epsilon, 0.003);       // bounds precision
    this.gl.uniform3f(this.mainShader.uniforms.eye, eye[0], eye[1], eye[2]);
    this.gl.uniform3f(this.mainShader.uniforms.diffuse, 1.0, 0.52, 0.0); // diffuse color
    this.gl.uniform3f(this.mainShader.uniforms.light, light[0], light[1], light[2]);

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

    this.gl.uniform3f(this.gl.getUniformLocation(this.mainShader.program, "rayOrigin"), eye[0], eye[1], eye[2]);

    this.gl.enableVertexAttribArray(this.mainShader.attribs.rayDirection);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rayDirectionBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array([
        -alpha*T[0] - beta*B[0] + N[0], -alpha*T[1] - beta*B[1] + N[1], -alpha*T[2] - beta*B[2] + N[2],// -1.0, -1.0,
         alpha*T[0] - beta*B[0] + N[0],  alpha*T[1] - beta*B[1] + N[1],  alpha*T[2] - beta*B[2] + N[2],//  1.0, -1.0,
        -alpha*T[0] + beta*B[0] + N[0], -alpha*T[1] + beta*B[1] + N[1], -alpha*T[2] + beta*B[2] + N[2],// -1.0,  1.0,
         alpha*T[0] - beta*B[0] + N[0],  alpha*T[1] - beta*B[1] + N[1],  alpha*T[2] - beta*B[2] + N[2],//  1.0, -1.0,
         alpha*T[0] + beta*B[0] + N[0],  alpha*T[1] + beta*B[1] + N[1],  alpha*T[2] + beta*B[2] + N[2],//  1.0,  1.0,
        -alpha*T[0] + beta*B[0] + N[0], -alpha*T[1] + beta*B[1] + N[1], -alpha*T[2] + beta*B[2] + N[2] // -1.0,  1.0,
    ]));
    this.gl.vertexAttribPointer(this.mainShader.attribs.rayDirection, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.enableVertexAttribArray(this.mainShader.attribs.position);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(this.mainShader.attribs.position, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    this.gl.disableVertexAttribArray(this.mainShader.attribs.position);
    this.gl.disableVertexAttribArray(this.mainShader.attribs.rayDirection);

    // Render texture to a smaller on-screen quad, so we can take advantage of linear minification filtering,
    // instead of antialiasing (which doesn't seem to work so well as of May 2012).
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.shader2.program);

    this.gl.uniform1f(this.shader2.uniforms.width, canvas.width);
    this.gl.uniform1f(this.shader2.uniforms.height, canvas.height);

    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.frameBuffer.frameBufferTexture);

    this.gl.enableVertexAttribArray(this.shader2.attribs.position);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.vertexAttribPointer(this.shader2.attribs.position, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
}

Raymarcher.update = function () {
    requestAnimationFrame(Raymarcher.update);

    Raymarcher.calculateView();

    Raymarcher.render();
}

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

Raymarcher.translate = [ 0.0, 0.0, 1.3 ];
// Raymarcher.RotationMatrix = [
//     1.0, 0.0, 0.0, 0.0,
//     0.0, 1.0, 0.0, 0.0,
//     0.0, 0.0, 1.0, 0.0,
//     0.0, 0.0, 0.0, 1.0
// ];

Raymarcher.mu = {
    cur: [ 0.0, 0.0, 0.0, 0.0 ]
}

Raymarcher.calculateView = function () {
    // First apply the view transformations to the initial eye, look at, and
    // up.  These will be used later to determine the basis.

    var eyeStart =    [ 0.0, 0.0, 1.0, 1.0 ];    // eye starts on the unit sphere
    var lookatStart = [ 0.0, 0.0, 0.0, 1.0 ];    // initially look at the origin
    var upStart =     [ 0.0, 1.0, 0.0, 0.0 ];    // up is initially along the y-axis

    // var eyeStart =    [ 0.0, 0.0, 1.0, 0.0 ];    // eye starts on the unit sphere
    // var lookatStart = [ 0.0, 0.0, 0.0, 0.0 ];    // initially look at the origin
    // var upStart =     [ 0.0, 1.0, 0.0, 0.0 ];    // up is initially along the y-axis

    // translate the eye and look at points
    eyeStart[0] += Raymarcher.translate[0];
    eyeStart[1] += Raymarcher.translate[1];
    eyeStart[2] += Raymarcher.translate[2];
    lookatStart[0] += Raymarcher.translate[0];
    lookatStart[1] += Raymarcher.translate[1];
    lookatStart[2] += Raymarcher.translate[2];


    // var newRotationMatrix = mat4.create();
    // mat4.identity(newRotationMatrix);
    // console.log(Raymarcher.RotationMatrix)
    // console.log(newRotationMatrix)

    // rotate eye, lookat, and up by multiplying them with the current rotation matrix
    for( var i=0; i < 4; i++ ) {
        eye[i]    = 0.0;
        lookAt[i] = 0.0;
        up[i]     = 0.0;

        for( var j=0; j<4; j++ ) {
            eye[i]    += Raymarcher.RotationMatrix[i*4+j] * eyeStart[j];
            lookAt[i] += Raymarcher.RotationMatrix[i*4+j] * lookatStart[j];
            up[i]     += Raymarcher.RotationMatrix[i*4+j] * upStart[j];
        }
    }


    // FIX, THIS STUFF IS SILLY

    // var rotationMatrix = new THREE.Matrix4();
    // var eyeStart2 = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);
    // var translate2 = new THREE.Vector4(Raymarcher.translate[0], Raymarcher.translate[1], Raymarcher.translate[2], 0.0);
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












