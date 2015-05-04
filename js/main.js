var Main = Main || {
    _mesh : undefined,
    _modified_mesh : undefined,
    _model : [], // should that be grouped -> I believe so.
};


Main.createModel = function () {
    var start = new Date().getTime();

    // generate mesh
    var geometries = Main._mesh.toBufferGeometry( Gui.values );
    Main._modified_mesh = geometries[0];

    // create and add main object
    Main._model[0] = new THREE.Mesh( geometries[1], Scene.getDefaultMaterial() );

    // create and add face normals
    Main._model[1] = new THREE.Line( geometries[2], Scene.getFaceNormalMaterial(), THREE.LinePieces );

    // create and add vertex normals
    Main._model[2] = new THREE.Line( geometries[3], Scene.getVertexNormalMaterial(), THREE.LinePieces );

    // create and add wireframe geometry
    Main._model[3] = new THREE.Line( geometries[4], Scene.getWireframeMaterial(), THREE.LinePieces );

    // create and add selection geometry
    Main._model[4] = new THREE.Mesh( geometries[5], Scene.getSelectionMaterial() );

    // add models back
    for ( var i = 0 ; i < Main._model.length ; ++i ) {
        Scene.addObject ( Main._model[i] );
    }

    // update visuals
    Main.displayChangeCallback();

    var end = new Date().getTime();
    var elapsed = end - start;


    console.log( "Mesh processing took " + elapsed + " ms" );
};

Main.removeModel = function() {
    for ( var i = 0 ; i < Main._model.length ; ++i ) {
        Scene._scene.remove( Main._model[i] );
    }
}

// gui file selection changed; load new model
Main.meshChangeCallback = function( filename, callback ) {
    Main.removeModel();

    Main._mesh = new Mesh();

    Main._mesh.fromOBJ( filename, function() {
        Main.createModel();
        if ( callback !== undefined ) {
            callback();
        }
    });
};

// called when the gui params change and we need to update mesh
Main.controlsChangeCallback = function() {
    // delete old model
    Main.removeModel();

    // new model!
    Main.createModel();
};

Main.displayChangeCallback = function() {

    if ( Gui.displayOptions.showGrid ) {
        Scene.showGrid();
    } else {
        Scene.hideGrid();
    }

    if ( Gui.displayOptions.showAxis ){
        Scene.showAxis();
    } else {
        Scene.hideAxis();
    }

    Scene.changeColor( Gui.displayOptions.meshColor );

    if ( Gui.displayOptions.showVC ) {
        Scene.showVertexColors();
    } else {
        Scene.hideVertexColors();
    }
}

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();

    // setup renderer, scene and gui
    Gui.init( Main.meshChangeCallback,
              Main.controlsChangeCallback,
              Main.displayChangeCallback );
    Scene.create();
    Renderer.create( Scene, document.getElementById("canvas") );

    // load new mesh
    Main.meshChangeCallback( Gui.meshList[0] );

    Renderer.update();
};
