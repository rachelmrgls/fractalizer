
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

//init the sound system 
function init() { 
    try { 
        ctx = new AudioContext();//webkitAudioContext(); //is there a better API for this? 
        //setupCanvas(); 
        loadFile(); 
    } catch(e) { 
        alert('you need webaudio support' + e); 
    } 
}

//load the mp3 file 
function loadFile() { 
    var req = new XMLHttpRequest(); //Ten Feet Tall (Elephante Remix)
    req.open("GET","music/Forever (Pt. II) Feat. Kaleem Taylor.mp3",true);//
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
}  

//http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_2
function pause() {
    src.stop();
    // Measure how much time passed since the last pause.
    startOffset += ctx.currentTime - startTime;
}

window.onload = function() {
    
    var cmd = Parser.getCommands(document.URL)[0];

    var batchCMD = cmd.scene || "default";

    var value1 = cmd.value1 || -0.4;
    var value2 = cmd.value2 || 0.6;
        
    var value = [parseFloat(value1), parseFloat(value2)];
    var height = cmd.height || window.innerHeight;//600;
    var width  = cmd.width  || window.innerWidth;//600;
        
    var animated= parseInt(cmd.animated) || 0;

    var paused = false;
    var debug = cmd.debug||false;

    Raytracer.init(height, width, debug, value);
    createScene(batchCMD);
    
    if ( animated ) init();
    drawScene();
    
    Student.updateHTML();
    

    function createScene ( sceneID ) {
        Scene[sceneID.toString()]();
    }

    function drawScene() {
        var data = new Uint8Array(samples); 
        if (setup) fft.getByteFrequencyData(data); 

        if (!animated || !paused) Raytracer.render(animated,data);
        
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
        else if ( event.which == 32 ) {
            if (paused) {
                play();
            } else {
                pause();
            }

            paused = !paused;
        }
    });
    window.addEventListener( 'keydown', function( event ) {
        // only respond to 'I' key
        if (event.which == 38) {
            // up arrow key
        	Raytracer.handleZoom(0.0,0.0,1.0);	
        }else if (event.which == 40) {
            // down arrow key
        	Raytracer.handleZoom(0.0,0.0,-1.0);	
        }else if (event.which == 37) {
            // left arrow key pressed
            Raytracer.handleZoom(1.0,0.0,0.0);
        }else if (event.which == 39) {
            // right arrow key pressed
            Raytracer.handleZoom(-1.0,0.0,0.0);
        }

    /*  d = 68; f = 70
        j = 74; k = 75  */
        if (!animated) {
            if (event.which == 68) {
                Raytracer.handleValue(-1.0,0.0);
            } else if (event.which == 70) {
                Raytracer.handleValue(1.0,0.0);
            } else if (event.which == 74) {
                Raytracer.handleValue(0.0,-1.0);
            } else if (event.which == 75) {
                Raytracer.handleValue(0.0,1.0);
            } 
        }
    });
}