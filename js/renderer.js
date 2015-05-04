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
    // _composer  : undefined,
    _raycaster : undefined,
    _mouse     : undefined,
    _mouseTime : undefined,
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

Renderer.create = function( scene, canvas ) {
    Renderer.getDims();

    // Canvas and rendering setup
    Renderer._canvas = canvas;
    Renderer._renderer = new THREE.WebGLRenderer(
        { canvas:canvas, antialias: true,
        preserveDrawingBuffer: true } ); // needed for save image feature below
    Renderer._renderer.setPixelRatio( window.devicePixelRatio );
    Renderer._renderer.setSize( Renderer._width, Renderer._height );
    Renderer._renderer.setClearColor( 0xcae3da );//c5e1d7

    Renderer._renderer.shadowMapEnabled = true;
    Renderer._renderer.shadowMapType = THREE.PCFSoftShadowMap;

    Renderer._renderer.autoClear = false;
    window.addEventListener( "resize",    Renderer.onWindowResize, false );
    canvas.addEventListener( "mouseup",   Renderer.onMouseUp,      false );
    canvas.addEventListener( "mousedown", Renderer.onMouseDown,    false );

    document.body.appendChild( Renderer._renderer.domElement );

    // Create camera and setup controls
    Renderer._camera   = new THREE.PerspectiveCamera ( 55, Renderer._aspect, 0.1, 1000 );
    Renderer._controls = new THREE.TrackballControls ( Renderer._camera, Renderer._renderer.domElement );
    Renderer._camera.position.set( 6, 5, 7);


    // Add rendering stats, so we know the performance
    var container = document.getElementById( "stats" );
    Renderer._stats = new Stats();
    Renderer._stats.domElement.style.position = "absolute";
    Renderer._stats.domElement.style.bottom   = "0px";
    Renderer._stats.domElement.style.right    = "0px";
    container.appendChild( Renderer._stats.domElement );

    // make sure renderer is aware of the scene it is rendering
    Renderer._scene = scene._scene;

    // create raycaster
    Renderer._mouse = new THREE.Vector2;
    Renderer._raycaster = new THREE.Raycaster();

    console.log( "Created renderer!" );
};

Renderer.onWindowResize = function () {
    Renderer.getDims();

    Renderer._camera.aspect = Renderer._aspect;
    Renderer._camera.updateProjectionMatrix();

    Renderer._renderer.setSize( Renderer._width, Renderer._height );
};

Renderer.onMouseDown = function( event ) {
    // remember where and when the mousedown happened
    Renderer._mouse.x = event.clientX;
    Renderer._mouse.y = event.clientY;
    Renderer._mouseTime = new Date().getTime();
};

Renderer.onMouseUp = function( event ) {
    // check to see if the mouse moved from mouse down location
    // and if so this was a drag event (not click) so bail.
    if ( Math.abs(Renderer._mouse.x - event.clientX) +
         Math.abs(Renderer._mouse.y - event.clientY) > 4 ) {
        return;
    }
    // check to see if more than 100ms has passed and if so bail.
    // var now = new Date().getTime();
    // if ( now - Renderer._mouseTime > 100 ) {
    //     return;
    // }

    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    Renderer._mouse.x = ( event.clientX / Renderer._width  ) *  2 - 1;
    Renderer._mouse.y = ( event.clientY / Renderer._height ) * -2 + 1;

    // ray cast
    if ( Gui.selection_possible ) {
        Renderer._raycaster.setFromCamera( Renderer._mouse, Renderer._camera );

        var meshA = Main._mesh;
        var meshB = Main._modified_mesh;
        var ray  = Renderer._raycaster.ray;

        var intersection_dists = [];
        var faces = {};
        for ( var i = 0 ; i < meshB.faces.length ; i++ ) {
            var verts = meshB.verticesOnFace( meshB.faces[i] );
            var v1 = verts[0];
            for ( var j = 1 ; j < verts.length - 1 ; j++ ) {
                var v2 = verts[j];
                var v3 = verts[j+1];
                var t = Renderer.triangleIntersection( v1.position, v2.position, v3.position, ray );
                if (t !== null ) {
                    intersection_dists.push( t );
                    if ( i < meshA.faces.length ) {
                        var key = "dist_" + t;
                        faces[key] = meshA.faces[i];
                    }
                }
            }
        }
        if ( intersection_dists.length != 0 ) {
            intersection_dists.sort(function (a, b) {
              return a - b;
            });
            var key = "dist_" + intersection_dists[0];
            var f = faces [ key ];
            if ( f.selected ) {
                f.selected = false;
            } else {
                f.selected = true;
            }
            Main.controlsChangeCallback();
        }
    }
}

// http://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
Renderer.triangleIntersection = function ( v1, v2, v3, ray ) {
    var e1, e2;  //Edge1, Edge2
    var P, Q, T;
    var det, inv_det, u, v;
    var t;

    //Find vectors for two edges sharing V1
    e1 = new THREE.Vector3();
    e1.subVectors( v2, v1 );
    e2 = new THREE.Vector3();
    e2.subVectors( v3, v1);

    //Begin calculating determinant - also used to calculate u parameter
    P = new THREE.Vector3();
    P.crossVectors( ray.direction, e2 );

    //if determinant is near zero, ray lies in plane of triangle
    det = e1.dot( P );
    //NOT CULLING

    if ( det > -0.000001 && det < 0.000001 ) return null;
    inv_det = 1.0 / det;

    //calculate distance from V1 to ray origin
    T = new THREE.Vector3();
    T.subVectors(ray.origin, v1);// SUB(T, O, V1);

    //Calculate u parameter and test bound
    u = T.dot(P) * inv_det;

    //The intersection lies outside of the triangle
    if( u < 0 || u > 1 ) return null;

    //Prepare to test v parameter
    Q = new THREE.Vector3();
    Q.crossVectors( T, e1 );


    //Calculate V parameter and test bound
    v = ray.direction.dot( Q ) * inv_det;

    //The intersection lies outside of the triangle
    if( v < 0 || u + v  > 1 ) return null;

    t = e2.dot(Q) * inv_det;

    if ( t > 0.000001 ) { //ray intersection
        return t;
    }

    // No hit, no win
    return null;
}


Renderer.update = function () {

    Renderer._renderer.clear();
    Renderer._renderer.render( Renderer._scene, Renderer._camera );

    Renderer._controls.update();
    Renderer._stats.update();

    Scene._light1.position.set( Renderer._camera.position.x,
                                Renderer._camera.position.y,
                                Renderer._camera.position.z);
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

