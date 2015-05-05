var Raytracer = Raytracer || {};
// ID
Raytracer.objectID = 0;
Raytracer.lightID = 0;

// define some primitives

Raytracer.INFSPHERE = 1;
Raytracer.SPHERE   = 2;
Raytracer.MENGER  = 3;
Raytracer.CYLINDER = 4;
Raytracer.CONE     = 5;

// material types - how to light the surface
Raytracer.BASICMATERIAL   = 1;
Raytracer.PHONGMATERIAL   = 2;
Raytracer.LAMBERTMATERIAL = 3;

// special materials
Raytracer.NONE         = 0;
Raytracer.CHECKERBOARD = 1;
Raytracer.MYSPECIAL    = 2;

// reflect types - how to bounce rays
Raytracer.NONEREFLECT   = 1;
Raytracer.MIRRORREFLECT = 2;
Raytracer.GLASSREFLECT  = 3;

Raytracer.curMaterial = {};

// for animation
Raytracer.frame = 0;
Raytracer.needsToDraw = true;

Raytracer.mouseDown = false;
Raytracer.lastMouseX = null;
Raytracer.lastMouseY = null;


Raytracer.handleMouseDown = function(event) {
	Raytracer.mouseDown = true;
	Raytracer.lastMouseX = event.clientX;
	Raytracer.lastMouseY = event.clientY;
};

Raytracer.handleMouseUp = function(event) {
	Raytracer.mouseDown = false;
};

Raytracer.handleZoom = function(delta)
{
	mat4.translate(Raytracer.RotationMatrix, [0.0, 0.0, 0.5 * delta]);
    Raytracer.needsToDraw = true;
};

Raytracer.handleMouseMove = function(event) {
	var newX   = event.clientX;
	var newY   = event.clientY;
	var deltaX = newX - Raytracer.lastMouseX
	var deltaY = newY - Raytracer.lastMouseY;
    var moved  = deltaX != 0 || deltaY != 0;
    
	if (!Raytracer.mouseDown || !moved) {
		return;
	}

    var degToRad = function(degrees) { return degrees * Math.PI / 180; }
	var newRotationMatrix = mat4.create();
	mat4.identity(newRotationMatrix);
	mat4.rotate(newRotationMatrix, degToRad(deltaX / 10), [0, 1, 0]);
	mat4.rotate(newRotationMatrix, degToRad(deltaY / 10), [1, 0, 0]);
	mat4.multiply(newRotationMatrix, Raytracer.RotationMatrix, Raytracer.RotationMatrix);

	Raytracer.lastMouseX  = newX
	Raytracer.lastMouseY  = newY;
	Raytracer.needsToDraw = true;
};

Raytracer.initShader = function ( program, shaderType, src, debug) {
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

Raytracer.init = function (height, width, debug) {
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
	
	Raytracer.RotationMatrix = mat4.create();
	mat4.identity(Raytracer.RotationMatrix);
	
	var newRotationMatrix = mat4.create();
	mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, 0.15 * Math.PI, [1, 0, 0]);
	mat4.rotate(newRotationMatrix, -0.05 * Math.PI, [0, 1, 0]);
	mat4.multiply(newRotationMatrix, Raytracer.RotationMatrix, Raytracer.RotationMatrix);
	
	canvas.onmousedown = Raytracer.handleMouseDown;
	document.onmouseup = Raytracer.handleMouseUp;
	document.onmousemove = Raytracer.handleMouseMove;
};

Raytracer.addLight = function( px, py, pz, cr, cg, cb, intensity, attenuate ) {
	var lightID = "lights[" + this.lightID +"].";
    this.setUniform('3f', lightID + "position", px, py, pz );
    this.setUniform('3f', lightID + "color", cr, cg, cb);
    this.setUniform('1f', lightID + "intensity", intensity);
    this.setUniform('1f', lightID + "attenuate", attenuate );
    this.lightID++;
};

Raytracer.setUniform = function ( varType ,varName, v0, v1, v2 ) {
    var unifName = 'uniform' + varType;
    v0 = v0 || 0.0;
    v1 = v1 || 0.0;
    v2 = v2 || 0.0;
    // v1 and v2 may be undefined because we only need 1 argument, but this is ok
    this.gl[unifName]( this.gl.getUniformLocation(this.program, varName), v0, v1, v2  );
};

Raytracer.setUniformShape = function ( shapeType, rad, u0, u1, u2, w0, w1, w2 ) {

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

Raytracer.copyMaterialToNextID = function() {
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

Raytracer.addSphere = function( centerX, centerY, centerZ, radius ) {
	this.setUniformShape( this.SPHERE, radius, 0.0, 0.0, 0.0, centerX, centerY, centerZ);
};

Raytracer.addInfSphere = function( radius ) {
    this.setUniformShape( this.INFSPHERE, radius, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 );
};

Raytracer.addMenger = function( level, scale ) {
    this.setUniformShape( this.MENGER, 0.0, level, scale, 0.0, 0.0, 0.0, 0.0 );
};

Raytracer.addPlane = function( normX, normY, normZ, dist) {
    var normalizeVector = function(vx, vy, vz) {
        var len = Math.sqrt(vx*vx + vy*vy + vz*vz);
        return [vx/len, vy/len, vz/len];
    };
    var norm = normalizeVector(normX, normY, normZ);
    this.setUniformShape( this.PLANE, dist, norm[0], norm[1], norm[2]);
};

Raytracer.addCylinder = function( topX, topY, topZ, bottomX, bottomY, bottomZ, radius ) {
    this.setUniformShape( this.CYLINDER, radius, topX, topY, topZ, bottomX, bottomY, bottomZ );
};

Raytracer.addCone = function( topX, topY, topZ, bottomX, bottomY, bottomZ , radius ) {
     this.setUniformShape( this.CONE, radius, topX, topY, topZ, bottomX, bottomY, bottomZ );
};

Raytracer.addAxisBox = function( minX, minY ,minZ, maxX, maxY, maxZ ) {
    this.setUniformShape( this.AXISBOX, 0.0,  minX, minY ,minZ, maxX, maxY, maxZ );
};

Raytracer.setUniformMaterial = function ( varType , varName, v0, v1, v2) {
    this.setUniform(varType, "objects[" + this.objectID +"].material."+varName, v0, v1, v2);
    var mat = { type: varType, v0: v0, v1: v1, v2: v2 };
    this.curMaterial[varName] = mat;
    //console.log('save material for object ID ' + this.objectID + ":\n" + JSON.stringify(mat));
};

Raytracer.resetMaterial = function ( ) {
    Raytracer.setUniformMaterial( '1i','materialType', Raytracer.LAMBERTMATERIAL);
    Raytracer.setUniformMaterial( '1i','materialReflectType', Raytracer.NONEREFLECT);
    Raytracer.setUniformMaterial( '1f','reflectivity', 0.0);   
    Raytracer.setUniformMaterial( '3f','color', 0.4, 0.4, 0.4 );
	Raytracer.setUniformMaterial( '3f','specular', 0.0, 0.0, 0.0 );
	Raytracer.setUniformMaterial( '1f','shininess', 10000 ); 
    Raytracer.setUniformMaterial( '1f','refractionRatio', 0.0 );
    Raytracer.setUniformMaterial( '1i','special', this.NONE );  
    
};

Raytracer.render = function( animated ) {
    this.frame++;
    if ( animated ) {
        this.setUniform('1i', 'frame', this.frame);
    }
	//rotation matrix
    this.setUniform('Matrix4fv', 'uMVMatrix', false, this.RotationMatrix );
    
    if (this.needsToDraw || animated) {
	    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        this.needsToDraw = false;
    }
};