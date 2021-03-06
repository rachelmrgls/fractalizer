var Raymarcher = Raymarcher || {};
// ID
Raymarcher.objectID = 0;
Raymarcher.lightID = 0;

// define some primitives

Raymarcher.INFSPHERE = 1;
Raymarcher.SPHERE   = 2;
Raymarcher.MENGER  = 3;
Raymarcher.JULIA = 4;
Raymarcher.MANDELBROT     = 5;
Raymarcher.JULIA3D = 6;
Raymarcher.APOLLONIAN = 7;

// material types - how to light the surface
Raymarcher.BASICMATERIAL   = 1;
Raymarcher.PHONGMATERIAL   = 2;
Raymarcher.LAMBERTMATERIAL = 3;

// special materials
Raymarcher.NONE         = 0;
Raymarcher.CHECKERBOARD = 1;
Raymarcher.MYSPECIAL    = 2;

// reflect types - how to bounce rays
Raymarcher.NONEREFLECT   = 1;
Raymarcher.MIRRORREFLECT = 2;
Raymarcher.GLASSREFLECT  = 3;

Raymarcher.curMaterial = {};

// for animation
Raymarcher.frame = 0;
Raymarcher.needsToDraw = true;

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

    //console.log(Raymarcher.program);
    /*var whatever = Raymarcher.gl.getUniformLocation(Raymarcher.program,"camera" );
    var poop;
    poop = Raymarcher.gl.getUniform(Raymarcher.program, whatever, poop);
   console.log(poop)*/
//   console.log(Raymarcher.RotationMatrix);
    //console.log(whatever);
};  

Raymarcher.handleZoom = function(deltaX,deltaY,deltaZ)
{
    var scale = 0.3;
	mat4.translate(Raymarcher.RotationMatrix, [scale * deltaX, scale * deltaY, scale * deltaZ]);
    Raymarcher.needsToDraw = true;
};

Raymarcher.handleValue = function(dv1,dv2) {
    var scale = 0.001;

    Raymarcher.value[0] += dv1 * scale;
    Raymarcher.value[1] += dv2 * scale;

    Raymarcher.needsToDraw = true;
}

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

Raymarcher.initShader = function ( program, shaderType, src, debug) {
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
    this.gl.attachShader( program, shader );
    return shader;
};

Raymarcher.init = function (height, width, debug, value, scene ) {
	canvas = document.getElementById('canvas');

	this.gl = canvas.getContext( 'experimental-webgl', {preserveDrawingBuffer: true} );
	canvas.width  = width;
	canvas.height = height;

    this.gl.viewportWidth = canvas.width;
    this.gl.viewportHeight = canvas.height;
    
	this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    var vSrc = Parser.parseTxt( 'shaders/Raytrace-vert.txt' );
    var fSrc = Parser.parseTxt( 'shaders/Raytrace-frag.txt' );
	
    this.program = this.gl.createProgram();

    this.initShader( this.program, this.gl.VERTEX_SHADER,   vSrc, debug );
    this.initShader( this.program, this.gl.FRAGMENT_SHADER, fSrc, debug );
	
    this.gl.linkProgram(this.program);	
    this.gl.useProgram(this.program);
    
    this.gl.uniform1f( this.gl.getUniformLocation(this.program,"width" ), width  );
    this.gl.uniform1f( this.gl.getUniformLocation(this.program,"height"), height );
	
    positionLocation = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(positionLocation);

    var bufferGeom = new Float32Array([
        -1.0, -1.0, 
         1.0, -1.0, 
        -1.0,  1.0, 
        -1.0,  1.0, 
         1.0, -1.0, 
         1.0,  1.0]);
    var buffer = this.gl.createBuffer();
    buffer.itemSize = 2;
    buffer.numItems = 6;	
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferGeom, this.gl.STATIC_DRAW);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.uniform1i( this.gl.getUniformLocation(this.program,"frame"), this.frame );

    var julia_default = new Float32Array([-0.05297758802771568, -0.1217767670750618, -0.9911374449729919, 0, 0.8391594886779785, 0.5325657725334167, -0.11028649657964706, 0, 0.5412726998329163, -0.8375768661499023, 0.0739828571677208, 0, 1.461436152458191, -2.261467695236206, 0.19975492358207703, 1]);
    var mandelbrot_default = new Float32Array([0.9881693124771118, -0.07077638059854507, 0.13605934381484985, 0, 0.0015792918857187033, 0.8917974829673767, 0.45243194699287415, 0, -0.15335887670516968, -0.4468644857406616, 0.8813587427139282, 0, -0.5008862614631653, 0.31058448553085327, -0.610450804233551, 1]);
    var apollonian_default = new Float32Array([0.9876883625984192, -0.07101976126432419, 0.13938413560390472, 0, 0, 0.8910065293312073, 0.45399048924446106, 0, -0.15643446147441864, -0.4484011232852936, 0.8800367712974548, 0, 0.23465172946453094, -0.12930415570735931, -1.7286463975906372, 1]);

    Raymarcher.RotationMatrix = mat4.create();
    mat4.identity(Raymarcher.RotationMatrix);
    
    if (scene == "julia3d") {
        mat4.multiply(julia_default,Raymarcher.RotationMatrix, Raymarcher.RotationMatrix);
    } else if (scene == "mandelbrot") {
        mat4.multiply(mandelbrot_default,Raymarcher.RotationMatrix, Raymarcher.RotationMatrix);
    } else if (scene == "apollonian") {
        mat4.multiply(apollonian_default,Raymarcher.RotationMatrix, Raymarcher.RotationMatrix);
    } else {
        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, 0.15 * Math.PI, [1, 0, 0]);
        mat4.rotate(newRotationMatrix, -0.05 * Math.PI, [0, 1, 0]);
        mat4.multiply(newRotationMatrix, Raymarcher.RotationMatrix, Raymarcher.RotationMatrix);
    }

    //console.log(Raymarcher.RotationMatrix);
    
	
    Raymarcher.value = value;

	canvas.onmousedown = Raymarcher.handleMouseDown;
	document.onmouseup = Raymarcher.handleMouseUp;
	document.onmousemove = Raymarcher.handleMouseMove;
};

Raymarcher.addLight = function( px, py, pz, cr, cg, cb, intensity, attenuate ) {
    var lightID = "lights[" + this.lightID +"].";
    this.setUniform('3f', lightID + "position", px, py, pz );
    this.setUniform('3f', lightID + "color", cr, cg, cb);
    this.setUniform('1f', lightID + "intensity", intensity);
    this.setUniform('1f', lightID + "attenuate", attenuate );
    this.lightID++;
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
    if (this.objectID > 19) {
        alert("warning: we have exceeded the maximum number of objects listed in the shader. To change this number you need to change it in two places: this line and also MAX_OBJECTS value in shaders/raytracer.txt ");
        return;
    }
    this.objectID++;
    this.copyMaterialToNextID();

};

Raymarcher.setBound = function ( rad, u0, u1, u2 ) {
    var bID = "bound.";
    this.setUniform('1f', bID + "rad", rad);
    this.setUniform('3f', bID + "center");
    this.setUniform('1i', bID + "shapeType", this.SPHERE);
};

Raymarcher.copyMaterialToNextID = function() {
    //console.log("\n-----\ncopy material for object" + this.objectID);
    for ( var varName in this.curMaterial ) {
        if (!this.curMaterial.hasOwnProperty(varName)) continue;
        //this.curMaterial[varName] = [varType, v0, v1, v2];
        var property = this.curMaterial[varName];
        var t  = property.type;
        var v0 = property.v0;
        var v1 = property.v1;
        var v2 = property.v2;
        this.setUniform(t, "objects[" + this.objectID +"].material."+varName, v0, v1, v2);
        //console.log([t, varName, v0, v1, v2]);
    }
    
};

Raymarcher.addSphere = function( centerX, centerY, centerZ, radius ) {
	this.setUniformShape( this.SPHERE, radius, 0.0, 0.0, 0.0, centerX, centerY, centerZ);
};

Raymarcher.addInfSphere = function( radius ) {
    this.setUniformShape( this.INFSPHERE, radius, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 );
};

Raymarcher.addMenger = function( level ) {
    this.setUniformShape( this.MENGER, 0.0, level, 0.0, 0.0, 0.0, 0.0, 0.0 );
};

Raymarcher.addApollonian = function( level ) {
    this.setUniformShape( this.APOLLONIAN, 0.0, level, 0.0, 0.0, 0.0, 0.0, 0.0 );
};

Raymarcher.addJulia = function() {
    this.setUniformShape( this.JULIA, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 );
};

Raymarcher.addJulia3d = function() {
    this.setUniformShape( this.JULIA3D, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 );
};

Raymarcher.addMandelbrot = function() {
    this.setUniformShape( this.MANDELBROT, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 );
};

Raymarcher.addPlane = function( normX, normY, normZ, dist) {
    var normalizeVector = function(vx, vy, vz) {
        var len = Math.sqrt(vx*vx + vy*vy + vz*vz);
        return [vx/len, vy/len, vz/len];
    };
    var norm = normalizeVector(normX, normY, normZ);
    this.setUniformShape( this.PLANE, dist, norm[0], norm[1], norm[2]);
};

Raymarcher.addCylinder = function( topX, topY, topZ, bottomX, bottomY, bottomZ, radius ) {
    this.setUniformShape( this.CYLINDER, radius, topX, topY, topZ, bottomX, bottomY, bottomZ );
};

Raymarcher.addCone = function( topX, topY, topZ, bottomX, bottomY, bottomZ , radius ) {
     this.setUniformShape( this.CONE, radius, topX, topY, topZ, bottomX, bottomY, bottomZ );
};

Raymarcher.addAxisBox = function( minX, minY ,minZ, maxX, maxY, maxZ ) {
    this.setUniformShape( this.AXISBOX, 0.0,  minX, minY ,minZ, maxX, maxY, maxZ );
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

// http://www.john-smith.me/hassles-with-array-access-in-webgl--and-a-couple-of-workarounds
/*Raymarcher.calculatePow2 = function(numBytes) {
    var nPx = numBytes / 4;
    if (nPx != Math.floor(nPx)) nPx = Math.floor(nPx + 1);
    var powOf2 = Math.log(nPx) + Math.LOG2E;
    if (powOf2 != Math.floor(powOf2)) powOf2 = Math.floor(powOf2 + 1);
    return Math.pow(2,powOf2);
}*/

// we need to use a texture instead of an array
// because GLSL sucks
Raymarcher.createTexture = function( typeddata ) {
    //var nBytes = typeddata.length * typeddata.BYTES_PER_ELEMENT;
    var cv = document.createElement("canvas");
    cv.width = typeddata.length;//Raymarcher.calculatePow2(numBytes);;
    cv.height = 1;
    var c = cv.getContext("2d");
    var img = c.createImageData(cv.width,cv.height);
    var imgd = img.data;
    for (var i = 0; i < typeddata.length; i++) imgd[i] = typeddata[i];
    
    var mytexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, mytexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,img);
    /* These params let the data through (seemingly) unmolested - via
    * http://www.khronos.org/webgl/wiki/WebGL_and_OpenGL_Differences#Non-Power_of_Two_Texture_Support
    */
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    //this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAX_FILTER, this.gl.LINEAR); // this.gl.NEAREST?

    this.gl.bindTexture(this.gl.TEXTURE_2D, null); // 'clear' texture status
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, mytexture);
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "audio"), 0);

    return;
}

Raymarcher.render = function( animated, typeddata ) {
    this.frame++;
    if ( animated ) {
        // create a texture for the audio data
        Raymarcher.createTexture(typeddata)
        this.setUniform('1i', 'frame', this.frame);
    }
	//rotation matrix
    this.setUniform('Matrix4fv', 'uMVMatrix', false, this.RotationMatrix );

    // values for Julia 2d
    this.setUniform('2f','value',this.value[0],this.value[1]);
    this.setUniform('1i', 'isAnimated', animated);


    if (this.needsToDraw || animated) {
	    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.needsToDraw = false;
    }
};