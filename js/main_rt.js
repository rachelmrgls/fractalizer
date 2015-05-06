
// sound things
var gfx;
var ctx; //audio context 
var buf; //audio buffer 
var fft; //fft audio node 
var samples = 128; 
var setup = false; //indicate if audio is set up yet  

//init the sound system 
function init() { 
    console.log("in init"); 
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
    var req = new XMLHttpRequest(); 
    req.open("GET","music/Paradise Awaits (Part 2 Ft. Goldlink).mp3",true); 
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
    //create a source node from the buffer 
    var src = ctx.createBufferSource();  
    src.buffer = buf; 
     
    //create fft 
    fft = ctx.createAnalyser(); 
    fft.fftSize = samples; 
     
    //connect them up into a chain 
    src.connect(fft); 
    fft.connect(ctx.destination); 
     
    //play immediately 
    src.start(0);//src.noteOn(0); 
    setup = true; 
}  


window.onload = function() {
    
    var cmd = Parser.getCommands(document.URL)[0];
    var batchCMD = cmd.scene || "default";
        
    var height = cmd.height || window.innerHeight;//600;
    var width  = cmd.width  || window.innerWidth;//600;
        
    var animated= cmd.animated|| 0; // default animated
    var paused = false;
    var debug = cmd.debug||false;

    Raytracer.init(height, width, debug);
    createScene(batchCMD);
    
    init();
    requestAnimationFrame(drawScene);
    //drawScene();
    
    Student.updateHTML();
    

    function createScene ( sceneID ) {
        Scene[sceneID.toString()]();
    }

/*function setupCanvas() { 
        var canvas = document.getElementById('canvas'); 
        gfx = canvas.getContext('2d'); 
        console.log(gfx)
        requestAnimationFrame(update); //webkitRequestAnimationFrame(update); 
    } 

    function update() { 
        requestAnimationFrame(update);//webkitRequestAnimationFrame(update); 
        if(!setup) return; 
        gfx.clearRect(0,0,800,600); 
        gfx.fillStyle = 'gray'; 
        gfx.fillRect(0,0,800,600); 
         
        var data = new Uint8Array(samples); 
        fft.getByteFrequencyData(data); 
        gfx.fillStyle = 'red'; 
        for(var i=0; i<data.length; i++) { 
            gfx.fillRect(100+i*4,100+256-data[i]*2,3,100); 
        } 
         
    } */

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
            paused = !paused;
        }
    });
    window.addEventListener( 'keydown', function( event ) {
        // only respond to 'I' key
        if (event.which == 38) {
        	Raytracer.handleZoom(1.0);	
        }else if (event.which == 40) {
        	Raytracer.handleZoom(-1.0);	
        }
    });
}