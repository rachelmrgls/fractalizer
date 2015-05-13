"use strict";

var Gui = Gui || {};

// list of meshes available in the GUI
Gui.meshList = [
	"THREE.torus",
    "THREE.sphere",
	"THREE.torusknot",	
	"THREE.icosahedron",
	"Strongman.obj",
	"sheep.obj",
    "male02.obj",
    "female02.obj"
];

Gui.windowSizes = [ "full","400x400","600x400","600x600","800x600","800x800" ];

Gui.applyList = [];

Gui.shadingList = [
	"Basic",
	"Gouraud",
	"Phong",
    "EnvMap",
    "Bump",
    "Wacky",
];
Gui.textureList = [
	"default",
	"uv_grid.jpg",
	"lavatile.jpg",
	"cloud.png",
	"grass.jpg",
	"brick.jpg",
	"earthcloud.jpg",
	"valley.jpg",
	"grandcanyon.jpg",
	"camera",
];

// due to a bug in dat GUI we need to initialize floats to non-interger values (like 0.5)
// (the variable Gui.defaults below then carries their default values, which we set later)
Gui.values = {
    // general gui
    // meshFile   : Gui.meshList[0],
    // windowSize : Gui.windowSizes[0],
    reset      : function () {},
    exclusive  : false,
    guiToBatch : function() {},

	//Shading Model
	// shadingModel : Gui.shadingList[0],
    // muVals : [0.0, 0.0, 0.0, 0.0]
    mu1 : 1.0,
    mu2 : 1.0,
    mu3 : 1.0,
    mu4 : 1.0,
	// texture : Gui.textureList[0],
	// ambient: "#252137",
	// diffuse: "#705d5d",
	// specular: "#4a4a28",
	// shininess: 0.0,
};

// defaults only hold actual mesh modifiers, no display
Gui.defaults = {
    mu1: 0.0,
    mu2: 0.0,
    mu3: 0.0,
    mu4: 0.0,
};

Gui.selection_possible = true;

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


Gui.init = function (controlsChangeCallback ) {
    // create top level controls
    var gui     = new dat.GUI( { width: 200 } );
    // var size    = gui.add( Gui.values, 'windowSize', Gui.windowSizes ).name("Window Size");

    // var shading = gui.add( Gui.values, "shadingModel", Gui.shadingList );

    var gc = {};
    gc.mu1 = gui.add( Gui.values,'mu1',-2.0,2.0).step(0.05).name('r').setValue(  Gui.defaults.mu1 );
    gc.mu2 = gui.add( Gui.values,'mu2',-2.0,2.0).step(0.05).name('i').setValue(  Gui.defaults.mu2 );
    gc.mu3 = gui.add( Gui.values,'mu3',-2.0,2.0).step(0.05).name('j').setValue(  Gui.defaults.mu3 );
    gc.mu4 = gui.add( Gui.values,'mu4',-1.15,1.15).step(0.05).name('k').setValue(  Gui.defaults.mu4 );
	
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
        // console.log('In handleControlsChange')
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
	
    var resetAll = function() {
        resetGuiValues();
        handleControlsChange();
        Gui.selection_possible = true;
    };
   
    // REGISTER CALLBACKS FOR WHEN GUI CHANGES:

    // size.onChange( Renderer.onWindowResize );

	// shading.onChange( controlsChangeCallback );
	
    // setup the callback function for all display related gui changes
    for ( var prop in gc ) {
        gc[prop].onChange( handleControlsChange );
    }

    Gui.gc = gc;

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

