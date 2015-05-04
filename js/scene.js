// This js file abstracts away the scene setup of three.js
// If you want to change apperance of the materials, or lighting,
// this is the file to look at.
// Important methods include addition and removal of objects from
// three.js scene, that will be used in main.js

"use strict";
var Scene = Scene || {
    _scene     : undefined,
    _materials : [],
    _axis      : undefined,
    _grid      : undefined,
    _light1    : undefined,
};

// creates default scene
Scene.create = function () {
    Scene._scene  = new THREE.Scene();
    Scene.setupLighting();
    Scene.setupMaterials();
    Scene.addAxis();
    Scene.addGrid();
};

// Lights
Scene.setupLighting = function() {
    var light = new THREE.AmbientLight( 0x303030 ); // soft white light

    this._light1   = new THREE.PointLight( 0xcdcdcd );
    this._light1.position.set( 8, 6, 7 );

    Scene._scene.add( light );
    Scene._scene.add( this._light1 );
};

// Materials
Scene.setupMaterials = function() {
    var default_mat = new THREE.MeshLambertMaterial( { color : 0x85bb6a, side : THREE.DoubleSide } );
    Scene._materials.push( default_mat );

    var fn_mat = new THREE.LineBasicMaterial( {color: new THREE.Color( 0xe9ad45 ), linewidth:4, opacity:0.75, transparent:true });
    Scene._materials.push( fn_mat );

    var vn_mat = new THREE.LineBasicMaterial( {color: new THREE.Color( 0x4858cf ), linewidth:4, opacity:0.75, transparent:true });
    Scene._materials.push( vn_mat );

    var wf_mat = new THREE.LineBasicMaterial( {color: new THREE.Color( 0x030303 ), linewidth:5 });
    Scene._materials.push( wf_mat );

    var sel_mat = new THREE.MeshLambertMaterial( { color : 0x4a27ed, side : THREE.DoubleSide  } );
    Scene._materials.push( sel_mat );

    var vcol_mat = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    Scene._materials.push( vcol_mat );
};

Scene.getDefaultMaterial = function() {
    return Scene._materials[0];
};

Scene.getFaceNormalMaterial = function() {
    return Scene._materials[1];
};

Scene.getVertexNormalMaterial = function() {
    return Scene._materials[2];
};

Scene.getWireframeMaterial = function() {
    return Scene._materials[3];
};

Scene.getSelectionMaterial = function() {
    return Scene._materials[4];
};

Scene.getVColorMaterial = function() {
    return Scene._materials[5];
};

Scene.getMaterial = function( id ) {
    if ( id >= Scene._materials.length || id < 0 ) return scene._materials[0];
    return Scene._materials[id];
};

Scene.addMaterial = function( material ) {
    Scene._materials.push ( material );
};


// Objects
Scene.addObject = function ( object ) {
    object.castShadow    = true;
    object.receiveShadow = false;
    Scene._scene.add( object );
};

Scene.removeObject = function ( object ) {
    Scene._scene.remove( object );
};

// axis and grid
Scene.addAxis = function() {
    var r = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.850, 0.325, 0.098 ), linewidth: 4, opacity: 0.5, transparent: true });
    var g = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.466, 0.674, 0.188 ), linewidth: 4, opacity: 0.5, transparent: true });
    var b = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.000, 0.447, 0.741 ), linewidth: 4, opacity: 0.5, transparent: true });

    var x_axis_geo = new THREE.Geometry();
    var y_axis_geo = new THREE.Geometry();
    var z_axis_geo = new THREE.Geometry();
    x_axis_geo.vertices.push( new THREE.Vector3( -10.5, 0, 0 ) );
    x_axis_geo.vertices.push( new THREE.Vector3(  10.5, 0, 0 ) );

    y_axis_geo.vertices.push( new THREE.Vector3( 0, -10.5, 0 ) );
    y_axis_geo.vertices.push( new THREE.Vector3( 0,  10.5, 0 ) );

    z_axis_geo.vertices.push( new THREE.Vector3( 0, 0, -10.5 ) );
    z_axis_geo.vertices.push( new THREE.Vector3( 0, 0,  10.5 ) );

    var x_axis = new THREE.Line( x_axis_geo, r );
    var y_axis = new THREE.Line( y_axis_geo, b );
    var z_axis = new THREE.Line( z_axis_geo, g );

    this._scene.add( x_axis );
    this._scene.add( y_axis );
    this._scene.add( z_axis );

    this._axis = [x_axis, y_axis, z_axis];
};

Scene.addGrid = function() {
    var w = new THREE.LineBasicMaterial( {color: new THREE.Color( 0.95, 0.95, 0.95 ), linewidth: 5, opacity: 0.3, transparent: true });

    var grid_geo = new THREE.Geometry();
    for ( var i = -10; i <= 10 ; ++i ) {
        if ( i === 0 ) continue;
        grid_geo.vertices.push( new THREE.Vector3( i,  0, -10 ) );
        grid_geo.vertices.push( new THREE.Vector3( i,  0,  10 ) );
        grid_geo.vertices.push( new THREE.Vector3( -10, 0, i ) );
        grid_geo.vertices.push( new THREE.Vector3( 10,  0,  i ) );
    }
    var grid = new THREE.Line( grid_geo, w, THREE.LinePieces );
    this._scene.add( grid );


    this._grid = grid;
};

Scene.showGrid = function () {
    this._grid.visible = true;
};

Scene.hideGrid = function () {
    this._grid.visible = false;
};

Scene.showAxis = function () {
    this._axis[0].visible = true;
    this._axis[1].visible = true;
    this._axis[2].visible = true;
};

Scene.hideAxis = function (){
    this._axis[0].visible = false;
    this._axis[1].visible = false;
    this._axis[2].visible = false;
};

Scene.showVertexColors = function () {
    var material = this.getVColorMaterial();
    Scene._scene.children[6].material = material;
    material.vertexColors   = THREE.VertexColors;
    material.needsUpdate    = true;
};

Scene.hideVertexColors = function () {
    var material = this.getDefaultMaterial();
    Scene._scene.children[6].material = material;
};

// changes color of default material
Scene.changeColor = function( newColor ) {
    this._materials[0].color = new THREE.Color( newColor );
};
