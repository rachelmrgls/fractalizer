"use strict";

var Gui = Gui || {};

// list of meshes available in the GUI
Gui.sceneList = [
    "menger",
    "default",
    "mandelbrot",
    "julia",
    "julia3d",
    "apollonian",
];

// list of meshes available in the GUI
Gui.musicList = [
    "All Too Well",
    "Rather Be",
];

Gui.windowSizes = [ "full","400x400","600x400","600x600","800x600","800x800" ];

// due to a bug in dat GUI we need to initialize floats to non-interger values (like 0.5)
// (the variable Gui.defaults below then carries their default values, which we set later)
Gui.values = {
    // general gui
    scene   : Gui.sceneList[0],
    windowSize : Gui.windowSizes[0],
    song  : Gui.musicList[0],
    reset      : function () {},
    guiToBatch : function() {},

    // dummy variables
    'COS 426 Project' : function () {},
    'Rachel Marguiles' : function () {},
    'Sonia Skoularikis' : function () {},
    'Thomas Greenspan' : function () {},
    'Fractals' : function () {},

    value1    : 0.5,
    recursion     : 0.5,
    value2   : 0.5,
    animated : false,
};


// defaults only hold actual mesh modifiers, no display
Gui.defaults = {

    value1    : 0.0,
    recursion     : 0.0,
    value2   : 0.0,

    animated : false,

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

Gui.init = function ( controlsChangeCallback ) {
    // create top level controls
    var gui     = new dat.GUI( { width: 300 } );

    var gc = {};

    var folderTI = gui.addFolder('TITLE');
    folderTI.add( Gui.values, 'COS 426 Project' );
    folderTI.add( Gui.values, 'Fractals' );
    folderTI.add( Gui.values, 'Rachel Marguiles' );
    folderTI.add( Gui.values, 'Sonia Skoularikis' );
    folderTI.add( Gui.values, 'Thomas Greenspan' );
    

    var size    = gui.add( Gui.values, 'windowSize', Gui.windowSizes ).name("Window Size");
    var reset   = gui.add( Gui.values, 'reset' ).name("Reset");
    var gToB    = gui.add( Gui.values, 'guiToBatch' );

    var folderFT = gui.addFolder('FEATURES');

    gc.featL   = folderFT.add( Gui.values, 'scene', Gui.sceneList ).name("Feature");
    gc.animated = folderFT.add( Gui.values, "animated" ).name( "Animated" );

    gc.recursion     = folderFT.add( Gui.values, "recursion", 0.0, 1.0 ).name( "Recursion level" ).step( 0.01 ).setValue( Gui.defaults.recursion );
    gc.value1    = folderFT.add( Gui.values, "value1", -1.0, 1.0 ).name( "Value 1" ).step( 0.01 ).setValue( Gui.defaults.value1 );
    gc.value2   = folderFT.add( Gui.values, "value2", -1.0, 1.0 ).name( "Value 2" ).step( 0.01 ).setValue( Gui.defaults.value2 );

    var folderMU = gui.addFolder('MUSIC');

    gc.music    = folderMU.add( Gui.values, 'song', Gui.song ).name("Music");

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
        console.log("here")
        resetGuiValues();
        handleControlsChange();

        Gui.selection_possible = true;
    };

    // REGISTER CALLBACKS FOR WHEN GUI CHANGES:


    // back button pressed
    reset.onChange( function () {
        var cmd = Gui.toCommandString();
        if (cmd.length > 0) {
            // Gui had non-default values so reset to defaults
            resetAll();
            return;
        }
    } );

    // setup the callback function for all display related gui changes
    for ( var prop in gc ) {
        gc[prop].onChange( handleControlsChange );
    }

    // button which creates the corresponding url of current gui
    gToB.onChange( function() {
        var url = 'batch.html?scene=' + Gui.values.scene;

        for (var i = 0; i < Gui.applyList.length; i++) {
            if (i > 0) {
                url += '&apply';
            }
            url += Gui.applyList[i];
        }

        var cmd = Gui.toCommandString();

        if (cmd.length > 0) {
            url += cmd;
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

