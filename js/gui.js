"use strict";

var Gui = Gui || {};

Gui.sceneList = [
    "default",
    "menger",
];

Gui.windowSizes = [ "full","400x400","600x400","600x600","800x600","800x800" ];

Gui.applyList = [];

// due to a bug in dat GUI we need to initialize floats to non-interger values (like 0.5)
// (the variable Gui.defaults below then carries their default values, which we set later)
Gui.values = {
    // general gui
    windowSize : Gui.windowSizes[0],
    reset      : function () {},
    exclusive  : false,
    guiToBatch : function() {},

	//Shading Model
	scene : Gui.sceneList[0],
};

// defaults only hold actual mesh modifiers, no display
Gui.defaults = {
	scene : Gui.sceneList[0],
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


Gui.init = function ( meshChangeCallback, controlsChangeCallback ) {
    // create top level controls
    var gui     = new dat.GUI( { width: 300 } );
    var size    = gui.add( Gui.values, 'windowSize', Gui.windowSizes ).name("Window Size");
    var meshF   = gui.add( Gui.values, 'meshFile', Gui.meshList ).name("Current Mesh");
    //var exclu   = gui.add( Gui.values, 'exclusive' ).name("Exclusive");
    var gToB    = gui.add( Gui.values, 'guiToBatch' );
    var scene = gui.add( Gui.values, "scene", Gui.sceneList );

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
	
    var resetAll = function() {
        resetGuiValues();
        handleControlsChange();
        Gui.selection_possible = true;
    };
   
    // REGISTER CALLBACKS FOR WHEN GUI CHANGES:

    // when new mesh is chosen, reset all the other controls and then call the callback
    meshF.onChange( function() {
		Renderer.resetCamera();
        resetAll();
        meshChangeCallback( Gui.values.meshFile );
    });

    size.onChange( Renderer.onWindowResize );

	scene.onChange( controlsChangeCallback );
	
    // setup the callback function for all display related gui changes
    for ( var prop in gc ) {
        gc[prop].onChange( handleControlsChange );
    }

    // button which creates the corresponding url of current gui
    gToB.onChange( function() {
        var url = 'raytracer.html?scene=' + Gui.values.scene;

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

