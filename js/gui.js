"use strict";

var Gui = Gui || {};

// list of meshes available in the GUI
Gui.meshList = [
    "cube.obj",
    "cylinder.obj",
    "sphere.obj",
    "tetrahedron.obj",
    "dodecahedron.obj",
    "large_cube.obj",
    "teapot.obj",
    "hand.obj",
    "cheetah.obj",
    "cow.obj",
    "horse.obj",
    "octopus.obj",
    "bunny.obj",
    "armadillo.obj",
    "custom.obj",
];

Gui.windowSizes = [ "full","400x400","600x400","600x600","800x600","800x800" ];

Gui.applyList = [];

// due to a bug in dat GUI we need to initialize floats to non-interger values (like 0.5)
// (the variable Gui.defaults below then carries their default values, which we set later)
Gui.values = {
    // general gui
    meshFile   : Gui.meshList[0],
    windowSize : Gui.windowSizes[0],
    reset      : function () {},
    exclusive  : false,
    deselect   : function() {},
    apply      : function() {},
    guiToBatch : function() {},

    // basic transformations
    translateX : 0.5,
    translateY : 0.5,
    translateZ : 0.5,

    rotateX : 0.5,
    rotateY : 0.5,
    rotateZ : 0.5,

    scale : 0.5,

    // warps
    inflate : 0.5,
    twist   : 0.5,
    wacky   : 0.5,

    // filters
    smooth    : 0.5,
    noise     : 0.5,
    sharpen   : 0.5,
    bilateral : 0.5,

    // topomodifier
    truncate    : 0.5,
    extrude     : 0.5,
    bevel       : 0.0,
    splitLong   : 0.5,
    triangulate : false,

    // subdivisions
    triSubdiv    : 1,
    loop         : 1,
    quadSubdiv   : 1,
    catmullClark : 1,

    // vertex colors
    curvature : false,

    //display that will affect mesh
    shading   : "flat",
    showVN    : false,
    showFN    : false,
    wireframe : false,
};

Gui.displayOptions = {
    showGrid   : true,
    showAxis   : true,
    meshColor  : "#85bb6a", //#66cc33",
    showVC     : false,
};

// defaults only hold actual mesh modifiers, no display
Gui.defaults = {
    translateX : 0.0,
    translateY : 0.0,
    translateZ : 0.0,

    rotateX : 0.0,
    rotateY : 0.0,
    rotateZ : 0.0,

    scale : 1.0,

    inflate : 0.0,
    twist   : 0.0,
    wacky   : 0.0,

    smooth    : 0.0,
    noise     : 0.0,
    sharpen   : 0.0,
    bilateral : 0.0,

    truncate    : 0.0,
    extrude     : 0.0,
    bevel       : 0.0,
    splitLong   : 0.0,
    triangulate : false,

    triSubdiv    : 0,
    loop         : 0,
    quadSubdiv   : 0,
    catmullClark : 0,

    curvature : false,
};

Gui.selection_possible = true;

Gui.alertOnce = function( msg ) {
    var mainDiv = document.getElementById('main_div');
    mainDiv.style.opacity = "0.3";
    var alertDiv = document.getElementById('alert_div');
    alertDiv.innerHTML = '<p>'+msg + '</p><button id="ok" onclick="Gui.closeAlert()">ok</button>';
    alertDiv.style.display = 'inline';
};

Gui.closeAlert = function () {
    var mainDiv = document.getElementById('main_div');
    mainDiv.style.opacity = "1";
    var alertDiv = document.getElementById('alert_div');
    alertDiv.style.display = 'none';
};

// construct a string that represents the non-default GUI settings
Gui.toCommandString = function () {
    var url = '';
    for ( var prop in Gui.defaults ) {
        if( Gui.values[prop] !== undefined && Gui.values[prop] !== Gui.defaults[prop]) {
            url += "&";
            var val = Gui.values[prop];

            if( !isNaN(parseFloat(val)) && val.toString().indexOf('.')>=0 ) {
                val = val.toFixed(2);
             }
            url += prop + "=" + val;
        }
    }
    return url;
}

Gui.getModifiableFacesString = function() {
    if (Main._mesh.numSelectedFaces() == 0) {
        return '';
    }
    var sel = Main._mesh.getModifiableFaces();
    var ids = sel.map(function(face) {return face.id;}); // replaces the faces with their ids
    var str = '&selected=(' + ids.join() + ')';
    return str;
}

Gui.parseSelected = function(sel) {
    if (sel == undefined) return sel;
    sel = sel.replace(/[\(\)]/g,'');
    sel = sel.split(',');
    sel = sel.map(function (s) {return parseInt(s);});
    return sel;
}

Gui.init = function ( meshChangeCallback, controlsChangeCallback, displayChangeCallback ) {
    // create top level controls
    var gui     = new dat.GUI( { width: 300 } );
    var size    = gui.add( Gui.values, 'windowSize', Gui.windowSizes ).name("Window Size");
    var meshF   = gui.add( Gui.values, 'meshFile', Gui.meshList ).name("Current Mesh");
    var desel   = gui.add( Gui.values, 'deselect' ).name("Deselect All");
    var apply   = gui.add( Gui.values, 'apply').name("Apply");
    var reset   = gui.add( Gui.values, 'reset' ).name("Back to Last Apply");
    var exclu   = gui.add( Gui.values, 'exclusive' ).name("Exclusive");
    var gToB    = gui.add( Gui.values, 'guiToBatch' );

    // define folders
    var folderTR = gui.addFolder('TRANSFORMATIONS');
    var folderFR = gui.addFolder('FILTERS');
    var folderWR = gui.addFolder('WARPS');
    var folderTP = gui.addFolder('TOPOLOGY');
    var folderSD = gui.addFolder('SUBDIVISION');
    var folderDC = gui.addFolder('DISPLAY OPTIONS');

    // gui controls are added to this object below
    var gc = {};
    gc.translateX = folderTR.add( Gui.values, "translateX", -10.0, 10.0 ).name( "Translate X" ).step( 0.05 ).setValue( Gui.defaults.translateX );
    gc.translateY = folderTR.add( Gui.values, "translateY", -10.0, 10.0 ).name( "Translate Y" ).step( 0.05 ).setValue( Gui.defaults.translateY );
    gc.translateZ = folderTR.add( Gui.values, "translateZ", -10.0, 10.0 ).name( "Translate Z" ).step( 0.05 ).setValue( Gui.defaults.translateZ );

    gc.rotateX = folderTR.add( Gui.values, "rotateX", -Math.PI, Math.PI ).name( "Rotate X" ).step( 0.05 ).setValue( Gui.defaults.rotateX );
    gc.rotateY = folderTR.add( Gui.values, "rotateY", -Math.PI, Math.PI ).name( "Rotate Y" ).step( 0.05 ).setValue( Gui.defaults.rotateY );
    gc.rotateZ = folderTR.add( Gui.values, "rotateZ", -Math.PI, Math.PI ).name( "Rotate Z" ).step( 0.05 ).setValue( Gui.defaults.rotateZ );

    gc.scale  = folderTR.add( Gui.values, "scale", 0.1, 10.0 ).name( "Scale" ).step( 0.01 ).setValue( Gui.defaults.scale );

    gc.truncate   = folderTP.add( Gui.values, "truncate", 0.0, 0.49 ).name( "Truncate" ).step( 0.01 ).setValue( Gui.defaults.truncate );
    gc.extrude    = folderTP.add( Gui.values, "extrude", 0.0, 1.0 ).name( "Extrude" ).step( 0.01 ).setValue( Gui.defaults.extrude );
    gc.bevel      = folderTP.add( Gui.values, "bevel", 0, 1.0 ).name( "Bevel" ).step( 0.01 ).setValue( Gui.defaults.bevel );
    gc.splitLong  = folderTP.add( Gui.values, "splitLong", 0, 1.0 ).name( "Split Long Edges" ).step( 0.01 ).setValue( Gui.defaults.splitLong );
    gc.triangulate = folderTP.add( Gui.values, "triangulate" ).name( "Triangulate" );

    gc.triSubdiv   = folderSD.add( Gui.values, "triSubdiv", 0, 6 ).name( "Tri Subdivide" ).step( 1 ).setValue( Gui.defaults.triSubdiv );
    gc.loop        = folderSD.add( Gui.values, "loop", 0, 6 ).name( "Loop" ).step( 1 ).setValue( Gui.defaults.loop );
    gc.quadSubdiv  = folderSD.add( Gui.values, "quadSubdiv", 0, 6 ).name( "Quad Subdivide" ).step( 1 ).setValue( Gui.defaults.quadSubdiv );
    gc.catmullClark = folderSD.add( Gui.values, "catmullClark", 0, 6 ).name( "Catmull-Clark" ).step( 1 ).setValue( Gui.defaults.catmullClark );

    gc.inflate = folderWR.add( Gui.values, "inflate", -1.0, 1.0 ).name( "Inflate" ).step( 0.01 ).setValue( Gui.defaults.inflate );
    gc.twist   = folderWR.add( Gui.values, "twist", -Math.PI, Math.PI ).name( "Twist" ).step( 0.01 ).setValue( Gui.defaults.twist );
    gc.wacky   = folderWR.add( Gui.values, "wacky", -1.0, 1.0 ).name( "Wacky" ).step( 0.01 ).setValue( Gui.defaults.wacky );

    gc.noise     = folderFR.add( Gui.values, "noise", 0.0, 1.0 ).name( "Noise" ).step( 0.01 ).setValue( Gui.defaults.noise );
    gc.smooth    = folderFR.add( Gui.values, "smooth", 0, 10 ).name( "Smooth" ).step( 1 ).setValue( Gui.defaults.smooth );
    gc.sharpen   = folderFR.add( Gui.values, "sharpen", 0, 10 ).name( "Sharpen" ).step( 1 ).setValue( Gui.defaults.sharpen );
    gc.bilateral = folderFR.add( Gui.values, "bilateral", 0, 10 ).name( "BilateralSmooth" ).step( 1 ).setValue( Gui.defaults.bilateral );
    gc.curvature = folderFR.add( Gui.values, "curvature" ).name( "Curvature" );

    gc.showVN    = folderDC.add( Gui.values, "showVN" ).name( "Display VNormals" );
    gc.showFN    = folderDC.add( Gui.values, "showFN" ).name( "Display FNormals" );
    gc.wireframe = folderDC.add( Gui.values, "wireframe" ).name( "Wireframe" );
    gc.shading   = folderDC.add( Gui.values, "shading", [ "flat", "smooth" ] ).name( "Shading" );

    var dc = {};
    dc.showGrid    = folderDC.add( Gui.displayOptions, "showGrid" ).name( "Display Grid" ).setValue( Gui.displayOptions.showGrid );
    dc.showAxis    = folderDC.add( Gui.displayOptions, "showAxis" ).name( "Display Axis" ).setValue( Gui.displayOptions.showAxis );
    dc.showVC      = folderDC.add( Gui.displayOptions, "showVC" ).name("Show Vertex Color").setValue( false );
    dc.meshColor   = folderDC.addColor( Gui.displayOptions, "meshColor" ).name( "Mesh Color" );

    // Helper functions
    var inReset = false;
    var resetGuiValues = function () {
        inReset = true;

        for ( var prop in Gui.defaults ) {
            var control = gc[prop];

            if (control !== undefined) {
                control.setValue( Gui.defaults[prop] );
            }
        }

        inReset = false;
    }

    // check to see if something really changed (for efficiency)
    Gui.oldVals = JSON.parse( JSON.stringify(Gui.values) );
    var handleControlsChange = function () {
        if(inReset) return;
        var guiValsStr = JSON.stringify(Gui.values);
        var oldValsStr = JSON.stringify(Gui.oldVals);
        if ( oldValsStr !== guiValsStr ) {
           if (Gui.values.exclusive) {
                for (var prop in Gui.values) {
                    if ( (prop in Gui.defaults) && Gui.oldVals[prop] !== Gui.values[prop]) {
                        var newVal = Gui.values[prop];
                        resetGuiValues(); // set everything to default
                        Gui.values[prop] = newVal;
                        break;
                    }
                }
            }
            Gui.oldVals = JSON.parse( JSON.stringify(Gui.values) );
            controlsChangeCallback();
        }
        Gui.selection_possible = true;

        for (var prop in Gui.defaults) {
            if ( Gui.values[prop] !== Gui.defaults[prop]) {
                Gui.selection_possible = false;
            }
        }
        // console.log( Gui.selection_possible );
    };

    var deselectAll = function() {
        for ( var i = 0; i < Main._mesh.faces.length; ++i ) {
            Main._mesh.faces[i].selected = false;
        }
        controlsChangeCallback();
    };

    var applyAll = function() {
        Main._mesh.applyFilters( Gui.values );
        var sel = Gui.getModifiableFacesString();
        var cmd = Gui.toCommandString();
        if (cmd.length) {
            Gui.applyList.push(sel + cmd);
        }
        resetGuiValues();
        deselectAll();
        Gui.selection_possible = true;
    };

    var resetAll = function() {
        resetGuiValues();
        handleControlsChange();

        deselectAll();
        Gui.selection_possible = true;
    };

    // REGISTER CALLBACKS FOR WHEN GUI CHANGES:

    // when new mesh is chosen, reset all the other controls and then call the callback
    meshF.onChange( function() {
        Renderer._camera.position.set( 6, 5, 7);
        resetAll();
        meshChangeCallback( Gui.values.meshFile );
    });

    size.onChange( Renderer.onWindowResize );

    desel.onChange( deselectAll );

    apply.onChange( applyAll );

    // back button pressed
    reset.onChange( function () {
        var cmd = Gui.toCommandString();
        if (cmd.length > 0) {
            // Gui had non-default values so reset to defaults
            resetAll();
            return;
        }
        if (Gui.applyList.length == 0) {
            console.log('we have gone back as far as we can go');
            return;
        }
        Gui.applyList.pop(); // remove the most recent thing
        meshChangeCallback( Gui.values.meshFile, function() {
            for ( var i = 0; i < Gui.applyList.length; i++ ) {
                var cmds    = Parser.getCommands( Gui.applyList[i] );
                var applies = Parser.parseCommands( cmds );
                var first   = applies[0];
                var sel     = Gui.parseSelected( first.selected );
                Main._mesh.setSelectedFaces( sel );
                Main._mesh.applyFilters( first );
                resetAll();
            }
        } );
    } );

    // setup the callback function for all display related gui changes
    for ( var prop in gc ) {
        gc[prop].onChange( handleControlsChange );
    }

    for ( var prop in dc ) {
        dc[prop].onChange ( displayChangeCallback );
    }

    // button which creates the corresponding url of current gui
    gToB.onChange( function() {
        var url = 'batch.html?meshFile=' + Gui.values.meshFile;

        for (var i = 0; i < Gui.applyList.length; i++) {
            if (i > 0) {
                url += '&apply';
            }
            url += Gui.applyList[i];
        }

        var cmd = Gui.toCommandString();

        if (cmd.length > 0) {
            url += '&apply' + cmd;
        }

        window.open( url );
    } );

    // function saveOBJ() {
    //     function destroyClickedElement( event ) {
    //         document.body.removeChild( event.target );
    //     }

    //     var objContent = "# Princeton COS426 OBJ model\n\n";

    //     for ( var i = 0 ; i < Main._modified_mesh.vertices.length ; ++i ) {
    //         var p = Main._modified_mesh.vertices[i].position;
    //         objContent += 'v ' + p.x + ' ' + p.y + ' ' + p.z + "\n";
    //     }

    //     for ( var i = 0 ; i < Main._modified_mesh.faces.length ; ++i ) {
    //         objContent += 'f';
    //         var face  = Main._modified_mesh.faces[i];
    //         var verts = Main._modified_mesh.verticesOnFace( face );
    //         for ( var j = 0 ; j < verts.length ; ++j ) {
    //             objContent += ' ' + (verts[j].id + 1);
    //         }
    //         objContent += "\n";
    //     }

    //     var textFileAsBlob = new Blob([objContent], {type:'text/obj'});
    //     var fileNameToSaveAs = "MyModel.obj";

    //     var downloadLink = document.createElement("a");
    //     downloadLink.download = fileNameToSaveAs;
    //     downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    //     downloadLink.onclick = destroyClickedElement;
    //     downloadLink.style.display = "none";
    //     document.body.appendChild( downloadLink );
    //     downloadLink.click();
    // }

    // toOBJ.onChange( saveOBJ );
};


// non-implemented alert functionality
Gui.alertOnce = function( msg ) {
    var mainDiv = document.getElementById('main_div');
    mainDiv.style.opacity = "0.3";
    var alertDiv = document.getElementById('alert_div');
    alertDiv.innerHTML = '<p>'+ msg + '</p><button id="ok" onclick="Gui.closeAlert()">ok</button>';
    alertDiv.style.display = 'inline';
};

Gui.closeAlert = function () {
    var mainDiv = document.getElementById('main_div');
    mainDiv.style.opacity = "1";
    var alertDiv = document.getElementById('alert_div');
    alertDiv.style.display = 'none';
};

