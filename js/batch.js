// sound things
var gfx;
var ctx; //audio context 
var buf; //audio buffer 
var fft; //fft audio node 
var samples = 128; 
var setup = false; //indicate if audio is set up yet  
var src;
var startOffset = 0;
var startTime = 0;
var zoom = 1.0;
var paused = false;

//init the sound system 
function init(music) { 
    try { 
        ctx = new AudioContext();//webkitAudioContext(); //is there a better API for this? 
        //setupCanvas();
        startOffset = 0; 
        loadFile(music); 
    } catch(e) { 
        alert('you need webaudio support' + e); 
    } 
}

//load the mp3 file 
var music;
function loadFile(title) { 
    var req = new XMLHttpRequest(); //
    music = "music/" + title; // Forever (Pt. II) Feat. Kaleem Taylor.mp3
    req.open("GET",music,true);//"Ten Feet Tall (Elephante Remix)
    //we can't use jquery because we need the arraybuffer type 
    req.responseType = "arraybuffer"; 
    req.onload = function() { 
        //decode the loaded data 
        ctx.decodeAudioData(req.response, function(buffer) { 
            buf = buffer; 
            play(); 
        }); 
    }; 
    req.send(); 
} 

function play() {

    startTime = ctx.currentTime;
    //var source = context.createBufferSource();
    // Connect graph
    //source.buffer = this.buffer;
    //src.loop = true;
    //source.connect(context.destination);
    // Start playback, but make sure we stay in bound of the buffer.
    //source.start(0, startOffset % buffer.duration);


    //create a source node from the buffer 
    src = ctx.createBufferSource();  
    src.buffer = buf; 
     
    //create fft 
    fft = ctx.createAnalyser(); 
    fft.fftSize = samples; 
     
    src.loop = true;

    //connect them up into a chain 
    src.connect(fft); 
    fft.connect(ctx.destination); 
     
    //play immediately 
    src.start(0, startOffset % buf.duration);
    //src.start(0);//src.noteOn(0); 
    setup = true; 
    paused = false;
}  

//http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_2
function pause() {
    if (!src) return;

    src.stop();
    // Measure how much time passed since the last pause.
    startOffset += ctx.currentTime - startTime;
    paused = true;
}
// defining the julia presets
var julia_def = [[-0.4,0.6],[0.285,0.01],[.4145,.3436],[0.37,0.1428],[-0.70176,-0.3842],[-0.8,0.156],[-0.6732,0.3444]];
var julia_idx;

window.onload = function() {
    var cmd = Parser.getCommands(document.URL)[0];
    // var batchCMD = cmd.scene || "default";

    julia_idx = 0;

    var value1 = cmd.value1 || julia_def[julia_idx][0];
    var value2 = cmd.value2 || julia_def[julia_idx][1];

    var batchCMD = cmd.scene || "menger";

    var level = parseFloat(cmd.level) || Gui.values.level;
        
    var value = [parseFloat(value1), parseFloat(value2)];
    var height = cmd.height || window.innerHeight;//600;
    var width  = cmd.width  || window.innerWidth;//600;
        
    var animated = parseInt(cmd.animated) || 0;

    var debug = cmd.debug||false;

    Raymarcher.init(height, width, debug, value, batchCMD );
    createScene(batchCMD, level);
    
    var songInd = cmd.song || 0;

    console.log(song)

    if ( animated ) init(Gui.musicList[songInd]);
    drawScene();
    

    function createScene ( sceneID, level ) {
        Scene[sceneID.toString()](level);
    }

    function drawScene() {
        var data = new Uint8Array(samples); 
        if (setup) fft.getByteFrequencyData(data); 

        if (!animated || !paused) Raymarcher.render(animated,data);
        
        requestAnimationFrame(drawScene);
    }
    
    function snapShot() {
        // get the image data
        try {
            var dataURL = document.getElementById('canvas').toDataURL();
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
            snapShot();
        }
        //space.32 ..> p.80
        else if ( event.which == 80 ) {
            if (animated) {
                if (paused) {
                play();
                } else {
                    pause();
                }
            }
        }
    });
    window.addEventListener( 'keydown', function( event ) {
        var zoom = this.zoom;
        // only respond to 'I' key
        if (event.which == 38) {
            // up arrow key
            Raymarcher.handleZoom(0.0,-zoom,0.0);   
        } else if (event.which == 40) {
            // down arrow key
            Raymarcher.handleZoom(0.0,zoom,0.0);    
        } else if (event.which == 37) {
            // left arrow key pressed
            Raymarcher.handleZoom(zoom,0.0,0.0);
        } else if (event.which == 39) {
            // right arrow key pressed
            Raymarcher.handleZoom(-zoom,0.0,0.0);
        } else if (event.which == 188) {
            // left carat
            Raymarcher.handleZoom(0.0,0.0,-zoom);
            this.zoom = zoom * 1.02;
        } else if (event.which == 190) {
            // right carat
            Raymarcher.handleZoom(0.0,0.0,zoom);
            this.zoom = zoom/1.02;
        } 

        /*  d = 68; f = 70
        j = 74; k = 75  */
        
        else if (event.which == 68) {
            Raymarcher.handleValue(-1.0,0.0);
        } else if (event.which == 70) {
            Raymarcher.handleValue(1.0,0.0);
        } else if (event.which == 74) {
            Raymarcher.handleValue(0.0,-1.0);
        } else if (event.which == 75) {
            Raymarcher.handleValue(0.0,1.0);
        } 

        // user pressed the enter key
        else if (event.which == 13) {
            // rotate defaults for julia
            julia_idx = (julia_idx + 1) % julia_def.length;
            Raymarcher.value[0] = julia_def[julia_idx][0];
            Raymarcher.value[1] = julia_def[julia_idx][1];
            Raymarcher.needsToDraw = true;
        }

    });
}