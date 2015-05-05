// This js file abstracts away the rendering aspects of three.js
// Unless you are interested, do not read into this file.

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
Renderer.create = function( canvas, cameraUpdate ) {
	Renderer.usingCamera = false;
	Renderer.cameraUpdate = cameraUpdate;
	
    Renderer.getDims();

    // Canvas and rendering setup
    Renderer._canvas = canvas;
    Renderer._renderer = new THREE.WebGLRenderer(
        { canvas:canvas, antialias: true,
        preserveDrawingBuffer: true } ); // needed for save image feature below
    Renderer._renderer.setPixelRatio( window.devicePixelRatio );
    Renderer._renderer.setSize( Renderer._width, Renderer._height );
    Renderer._renderer.setClearColor( 0x000000 );

    //Renderer._renderer.shadowMapEnabled = true;
    //Renderer._renderer.shadowMapType = THREE.PCFSoftShadowMap;
    //Renderer._renderer.autoClear = false;
    window.addEventListener( "resize", Renderer.onWindowResize, false );

    document.body.appendChild( Renderer._renderer.domElement );

    // Create camera and setup controls
    Renderer._camera   = new THREE.PerspectiveCamera ( 45, Renderer._aspect, 1, 10000 );
    Renderer._controls = new THREE.TrackballControls ( Renderer._camera, Renderer._renderer.domElement );
    Renderer.resetCamera();


    // Add rendering stats, so we know the performance
    /*var container = document.getElementById( "stats" );
    Renderer._stats = new Stats();
    Renderer._stats.domElement.style.position = "absolute";
    Renderer._stats.domElement.style.bottom   = "0px";
    Renderer._stats.domElement.style.right    = "0px";
    container.appendChild( Renderer._stats.domElement );
    */
    
    // make sure renderer is aware of the scene it is rendering
    Renderer._scene = new THREE.Scene();

    console.log( "Created renderer!" );
};

Renderer.updateScene = function(meshArray) {
	Renderer._scene = new THREE.Scene();
	for(var i=0;i < meshArray.length;i++)
		Renderer._scene.add(meshArray[i]);
	Renderer.update();
}

Renderer.onWindowResize = function () {
    Renderer.getDims();

    Renderer._camera.aspect = Renderer._aspect;
    Renderer._camera.updateProjectionMatrix();

    Renderer._renderer.setSize( Renderer._width, Renderer._height );
};

Renderer.update = function () {

    Renderer._renderer.clear();
	
	//update texture if using camera
	if(Renderer.usingCamera)
		Renderer.cameraUpdate();
	
    Renderer._renderer.render( Renderer._scene, Renderer._camera );

    Renderer._controls.update();
    //Renderer._stats.update();
	
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

