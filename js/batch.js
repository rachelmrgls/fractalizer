// This is the Batch javascript file used for the batch version
// of the mesh processing assignment for COS426.
//
// Unless you are expecially interested, do not bother to
// read it closely. It's mostly just boilerplate to handle
// processing the comamnds in the URL and load inages.


var Batch = Batch || {
	_geometry : undefined,
	_material : undefined,
	video : undefined,
};

Batch.initCamera = function()
{
	//http://davidwalsh.name/browser-camera
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	Batch.video = document.createElement("video");
	var	videoObj = { "video": true };
	var	errBack = function(error) {
			console.log("Video capture error: ", error.code); 
		};
	
	Batch.cameraReady = false;
	// Put video listeners into place
	if(navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function(stream) {
			Batch.video.src = stream;
		}, errBack);
	} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function(stream){
			Batch.video.src = window.webkitURL.createObjectURL(stream);
		}, errBack);
	}
	else if(navigator.mozGetUserMedia) { // Firefox-prefixed
		navigator.mozGetUserMedia(videoObj, function(stream){
			Batch.video.src = window.URL.createObjectURL(stream);
		}, errBack);
	}
	
	Batch.videoImage = document.createElement( 'canvas' );
	Batch.videoImage.width = 256;
	Batch.videoImage.height = 256;
	
	Batch.videoImageContext = Batch.videoImage.getContext( '2d' );
	Batch.videoImageContext.fillStyle = '#000000';
	Batch.videoImageContext.fillRect( 0, 0, Batch.videoImage.width, Batch.videoImage.height );

	Batch.videoTexture = new THREE.Texture( Batch.videoImage );
	Batch.videoTexture.wrapS = Batch.videoTexture.wrapT = THREE.RepeatWrapping;
}

Batch.updateCamera = function() {
	if ( Batch.cameraReady )  {
		Batch.videoImageContext.drawImage( Batch.video, 0, 0, Batch.video.videoWidth,Batch.video.videoHeight, 0,0, Batch.videoImage.width,Batch.videoImage.height );
		Batch.videoTexture.needsUpdate = true;
	}
	if (Batch.video.readyState === Batch.video.HAVE_ENOUGH_DATA) {
		setTimeout(function() { Batch.cameraReady = true; }, 200);
	}
};

// gui file selection changed; load new model
Batch.meshChangeCallback = function( filename, callback ) {
	Batch.mesh_name = filename;
	if(filename.indexOf("THREE") === 0) {
		//object in THREE
		if( filename == "THREE.box" )
			Batch._geometry = new THREE.BoxGeometry( 5, 5, 5 );
		else if( filename == "THREE.cylinder")
			Batch._geometry = new THREE.CylinderGeometry( 3, 3, 5, 64 );
		else if( filename == "THREE.dodecahedron")
			Batch._geometry = new THREE.DodecahedronGeometry( 4 );
		else if( filename == "THREE.icosahedron")
			Batch._geometry = new THREE.IcosahedronGeometry( 4 );
		else if( filename == "THREE.octahedron")
			Batch._geometry = new THREE.OctahedronGeometry( 4 );
		else if( filename == "THREE.tetrahedron")
			Batch._geometry = new THREE.TetrahedronGeometry( 4 );
		else if( filename == "THREE.torus")
			Batch._geometry = new THREE.TorusGeometry( 3, 1, 16, 50 );
		else if( filename == "THREE.torusknot")
			Batch._geometry = new THREE.TorusKnotGeometry( 3, 1, 100, 32 );
		else if( filename == "THREE.sphere")
			Batch._geometry = new THREE.SphereGeometry( 3, 64, 64 );
					
		Batch.controlsChangeCallback();
	
		if(callback !== undefined) callback();
	}else
	{
		var manager = new THREE.LoadingManager();
		var loader = new THREE.OBJLoader( manager );
		loader.load( 'obj/'+filename, function ( object ) {
			Batch._geometry = object.children[0].geometry;
			
			//normalize to [-normal_R,normal_R]
			var normal_R = 5;
			var minV = 1e100, maxV = -1e100;
			var positions = Batch._geometry.attributes.position.array;
			
			for(var i=0;i < positions.length;i++) {
				minV = Math.min(minV,positions[i]);
				maxV = Math.max(maxV,positions[i]);
			}
			for(var i=0;i < positions.length;i++) {
				positions[i] = ( positions[i] - minV ) / (maxV - minV) * 2 * normal_R - normal_R;
			}
			
			//move to center
			for(var i=0;i <3;i++) {
				var avg_position = 0.0;
				var avg_tot = 0;
				for(var j=i;j < positions.length;j+=3) {
					avg_position += positions[j];
					avg_tot ++; 
				}
				avg_position /= avg_tot;
				for(var j=i;j < positions.length;j+=3) positions[j] -= avg_position;
			}
			
			Batch.controlsChangeCallback();
		
			if(callback !== undefined) callback();
		});
	}
	
};

Batch.fetchTexture = function(textureName)
{
	var texture;
	
	if(textureName == "camera") {
		//setup webcam
		if(Batch.video == undefined) Batch.initCamera();
		
		if(Batch.video.paused) Batch.video.play();
		Renderer.usingCamera = true;
		texture = Batch.videoTexture;
	}else
	{
		if(Batch.video !== undefined) Batch.video.pause();
		Renderer.usingCamera = false;
		
		if(textureName == "default") {
			var default_texture = {
				"Strongman.obj":"texture/Strongman.jpg",
				"sheep.obj":"texture/sheep.jpg",
			};
			
			if( (Batch.mesh_name in default_texture) && (Batch.shadingMethod !== "EnvMap") )
				texture = THREE.ImageUtils.loadTexture( default_texture[Batch.mesh_name] );
			else
				texture = THREE.ImageUtils.loadTexture( "texture/white.jpg" );
		}
		else texture = THREE.ImageUtils.loadTexture( "texture/"+textureName );
	}
	
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	return texture;
}

Batch.controlsChangeCallback = function()
{
	Batch.shadingMethod = Batch.values.shadingModel;

	var meshs = [];
	
	var uniforms = {
			inflate : {type: 'f', value: Batch.values.inflate},
		    ambient :     { type: "c", value: new THREE.Color( Batch.values.ambient ) },
		    diffuse :     { type: "c", value: new THREE.Color( Batch.values.diffuse ) },
		    specular :     { type: "c", value: new THREE.Color( Batch.values.specular ) },
		    lightDir : {type: "v3", value : Renderer.lightDir},
			texture : {type: 't', value: Batch.fetchTexture( Batch.values.texture) },
			shininess: {type: 'f', value: Batch.values.shininess},		
	};
	
	Batch._material = new THREE.ShaderMaterial( {
		uniforms:       uniforms,
		vertexShader:   Parser.parseTxt('shaders/'+Batch.shadingMethod+"-vert.txt"),
		fragmentShader: Parser.parseTxt('shaders/'+Batch.shadingMethod+"-frag.txt"),
	});
	meshs.push( new THREE.Mesh(Batch._geometry,Batch._material) );
	
	Renderer.updateScene( meshs );
}

// parse the command out of the url
Batch.parseUrl = function() {
    var url  = document.URL;
    var cmds = Parser.getCommands(url);

    Batch.obj = cmds[0].meshFile;
    if ( Batch.obj == undefined ) {
        Batch.obj = Gui.meshList[0]; // defaut to cube
    }
	
	if(cmds.length>1) Batch.values = cmds[1];
	else Batch.values = {};
	
	for(var prop in Gui.values)
		if(Batch.values[prop] == undefined)
			Batch.values[prop] = Gui.values[prop];
}


// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();
	
    // setup renderer
    Renderer.create( document.getElementById("canvas"), Batch.updateCamera );

    // load new mesh
	Batch.parseUrl();
    Batch.meshChangeCallback( Batch.obj );

    Renderer.update();
};
