var Renderer = Renderer || {
    // internal variables
    _canvas    : undefined,
    _renderer  : undefined,
    _controls  : undefined,
    _camera    : undefined,
    _stats     : undefined,
    _scene     : undefined,
    _width     : undefined,
    _height    : undefined,
    _aspect    : undefined,
};

Renderer.getDims = function() {
    var width  = window.innerWidth;
    var height = window.innerHeight;

    if (Gui.values.windowSize !== "full") {
        var parts = Gui.values.windowSize.split('x');
        width  = parseInt(parts[0]);
        height = parseInt(parts[1]);
    }
    Renderer._width  = width;
    Renderer._height = height;
    Renderer._aspect = width/height;
};

Renderer.cameraPos = new THREE.Vector3( 6, 5, 7 );
Renderer.lightDir  = new THREE.Vector3( -1, 1, 1 );

Renderer.resetCamera = function() {
	Renderer._camera.position.set( Renderer.cameraPos.x, Renderer.cameraPos.y, Renderer.cameraPos.z);
}

Renderer.create = function( canvas, gl ) {
    Renderer.getDims();

    // Canvas and rendering setup
    Renderer._canvas = canvas;
    renderer._gl = gl;





    // Renderer._renderer = new THREE.WebGLRenderer(
    //     { canvas:canvas, antialias: true,
    //     preserveDrawingBuffer: true } ); // needed for save image feature below
    // Renderer._renderer.setPixelRatio( window.devicePixelRatio );
    // Renderer._renderer.setSize( Renderer._width, Renderer._height );
    // Renderer._renderer.setClearColor( 0x000000 );

    window.addEventListener( "resize", Renderer.onWindowResize, false );

    document.body.appendChild( Renderer._renderer.domElement );

    // Create camera and setup controls
    // Renderer._camera   = new THREE.PerspectiveCamera ( 45, Renderer._aspect, 1, 10000 );
    // Renderer._controls = new THREE.TrackballControls ( Renderer._camera, Renderer._renderer.domElement );
    // Renderer.resetCamera();


    // Add rendering stats, so we know the performance
    // var container = document.getElementById( "stats" );
    // Renderer._stats = new Stats();
    // Renderer._stats.domElement.style.position = "absolute";
    // Renderer._stats.domElement.style.bottom   = "0px";
    // Renderer._stats.domElement.style.right    = "0px";
    // container.appendChild( Renderer._stats.domElement );
    

    console.log( "Created renderer!" );
};



function render() {
    // Render to an off-screen frame buffer (with attached texture)
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer.frameBuffer);
    // gl.viewport(0, 0, canvas.width, canvas.height);
    gl.viewport(0, 0, frameBuffer.frameBuffer.width, frameBuffer.frameBuffer.height);

    gl.useProgram(shader1.program);

    // gl.uniform4f(shader1.uniforms.mu, mu.cur.x, mu.cur.y, mu.cur.z, mu.cur.w);
    gl.uniform4f(shader1.uniforms.mu, mu.cur[0], mu.cur[1], mu.cur[2], mu.cur[3]);
    gl.uniform1i(shader1.uniforms.maxIterations, 20);    // bounds precision
    gl.uniform1f(shader1.uniforms.epsilon, 0.003);       // bounds precision
    gl.uniform3f(shader1.uniforms.eye, eye[0], eye[1], eye[2]);
    gl.uniform3f(shader1.uniforms.diffuse, 0.81, 0.76, 0.878); // diffuse color. We can find a cool color later
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








Renderer.onWindowResize = function () {
    Renderer.getDims();

    Renderer._camera.aspect = Renderer._aspect;
    Renderer._camera.updateProjectionMatrix();

    Renderer._renderer.setSize( Renderer._width, Renderer._height );
};

Renderer.update = function () {

    Renderer._renderer.clear();
	
    Renderer._renderer.render( Renderer._scene, Renderer._camera );
    
    Renderer._controls.update();
	
    requestAnimationFrame( Renderer.update );
}

Renderer.snapShot = function () {
    // get the image data
    try {
        var dataURL = Renderer._renderer.domElement.toDataURL();
    }
    catch( err ) {
        alert('Sorry, your browser does not support capturing an image.');
        return;
    }

    // this will force downloading data as an image (rather than open in new window)
    var url = dataURL.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    window.open( url );
}

// add event listener that will cause 'I' key to download image
window.addEventListener( 'keyup', function( event ) {
    // only respond to 'I' key
    if ( event.which == 73 ) {
        Renderer.snapShot();
    }
});

