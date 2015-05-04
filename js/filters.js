var Filters = Filters || {}


Filters.translate = function( mesh, t ) {
    var verts = mesh.getModifiableVertices();

    var n_vertices = verts.length;
    for ( var i = 0 ; i < n_vertices ; ++i ) {
        verts[i].position.add( t );
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.rotate = function( mesh, rotate ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Rotation is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.scale = function( mesh, s ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Scaling is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.curvature = function ( mesh ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Curvature is not implemented yet');
}

Filters.noise = function ( mesh, factor ) {

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Noise is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.smooth = function ( mesh, iter ) {

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Smooth is not implemented yet');
    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.sharpen = function ( mesh, iter ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Sharpen is not implemented yet');
    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.bilateral = function ( mesh, iter ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('BilateralSmooth is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.inflate = function (  mesh, factor ) {

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Inflate is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.twist = function (  mesh, factor ) {

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Twist is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.wacky = function ( mesh, factor ) {

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Wacky is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.triangulate = function ( mesh ) {

    var faces = mesh.getModifiableFaces();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('triangulate is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.extrude = function ( mesh, factor ) {

    var faces   = mesh.getModifiableFaces();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Extrude is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.truncate = function ( mesh, factor ) {

    var verts = mesh.getModifiableVertices();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Truncate is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.bevel = function ( mesh ) {

    var faces = mesh.getModifiableFaces();

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Bevel is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.splitLong = function ( mesh ) {

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('Split Long Edges is not implemented yet');

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.triSubdiv = function ( mesh, levels ) {

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        // ----------- STUDENT CODE END ------------
        Gui.alertOnce ('Triangle subdivide is not implemented yet');
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.loop = function ( mesh, levels ) {

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        // ----------- STUDENT CODE END ------------
        Gui.alertOnce ('Triangle subdivide is not implemented yet');
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.quadSubdiv = function ( mesh, levels ) {

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        // ----------- STUDENT CODE END ------------
        Gui.alertOnce ('Quad subdivide is not implemented yet');
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};

Filters.catmullClark = function ( mesh, levels ) {

    for ( var l = 0 ; l < levels ; l++ ) {
        var faces = mesh.getModifiableFaces();
        // ----------- STUDENT CODE BEGIN ------------
        // ----------- STUDENT CODE END ------------
        Gui.alertOnce ('Catmull-Clark subdivide is not implemented yet');
    }

    mesh.calculateFacesArea();
    mesh.updateNormals();
};
