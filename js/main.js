var Main = Main || {
	_geometry : undefined,
	_material : undefined,
	video : undefined,
};

Main.initCamera = function()
{
	// access web camera http://davidwalsh.name/browser-camera
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	Main.video = document.createElement("video");
	var	videoObj = { "video": true };
	var	errBack = function(error) {
			console.log("Video capture error: ", error.code); 
		};
	
	Main.cameraReady = false;
	// put video listeners into place
	if ( navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function(stream) {
			Main.video.src = stream;
		}, errBack);
	} else if ( navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function(stream){
			Main.video.src = window.webkitURL.createObjectURL(stream);
		}, errBack);
	}
	else if ( navigator.mozGetUserMedia) { // Firefox-prefixed
		navigator.mozGetUserMedia(videoObj, function(stream){
			Main.video.src = window.URL.createObjectURL(stream);
		}, errBack);
	}
    
	// create a virtal canvas 
	Main.videoImage = document.createElement( 'canvas' );
	Main.videoImage.width  = 256; // need to be power of 2
	Main.videoImage.height = 256; // need to be power of 2
	
	Main.videoImageContext = Main.videoImage.getContext( '2d' );
	Main.videoImageContext.fillStyle = '#000000';
	Main.videoImageContext.fillRect( 0, 0, Main.videoImage.width, Main.videoImage.height );
    // build texture from it
	Main.videoTexture = new THREE.Texture( Main.videoImage );
	Main.videoTexture.wrapS = Main.videoTexture.wrapT = THREE.RepeatWrapping;
};
// call when animate
Main.updateCamera = function() {
	if ( Main.cameraReady )  {
		Main.videoImageContext.drawImage( Main.video, 0, 0, Main.video.videoWidth,Main.video.videoHeight, 0,0, Main.videoImage.width,Main.videoImage.height );
		Main.videoTexture.needsUpdate = true;
	}
	if (Main.video.readyState === Main.video.HAVE_ENOUGH_DATA) {
		setTimeout(function() { Main.cameraReady = true; }, 200);
	}
};

// mesh file selection changed; load new model
Main.meshChangeCallback = function( filename, callback ) {
	Main.mesh_name = filename;
	if ( filename.indexOf("THREE") === 0 ) {
		//object in THREE
		if( filename == "THREE.box" )
			Main._geometry = new THREE.BoxGeometry( 5, 5, 5 );
		else if( filename == "THREE.cylinder")
			Main._geometry = new THREE.CylinderGeometry( 3, 3, 5, 64 );
		else if( filename == "THREE.dodecahedron")
			Main._geometry = new THREE.DodecahedronGeometry( 4 );
		else if( filename == "THREE.icosahedron")
			Main._geometry = new THREE.IcosahedronGeometry( 4 );
		else if( filename == "THREE.octahedron")
			Main._geometry = new THREE.OctahedronGeometry( 4 );
		else if( filename == "THREE.tetrahedron")
			Main._geometry = new THREE.TetrahedronGeometry( 4 );
		else if( filename == "THREE.torus")
			Main._geometry = new THREE.TorusGeometry( 3, 1, 16, 50 );
		else if( filename == "THREE.torusknot")
			Main._geometry = new THREE.TorusKnotGeometry( 3, 1, 100, 32 );
		else if( filename == "THREE.sphere")
			Main._geometry = new THREE.SphereGeometry( 3, 64, 64 );

			
		Main.controlsChangeCallback();
	
		if ( callback !== undefined ) callback();
	} else {
		var manager = new THREE.LoadingManager();
		var loader = new THREE.OBJLoader( manager );
		loader.load( 'obj/'+filename, function ( object ) {
			Main._geometry = object.children[0].geometry;
			
			//normalize to [-normal_R,normal_R]
			var normal_R = 5;
			var minV = 1e100, maxV = -1e100;
			var positions = Main._geometry.attributes.position.array;
			
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
			
			
			Main.controlsChangeCallback();
		
			if ( callback !== undefined ) callback();
		});
	}
	
};

Main.fetchTexture = function(textureName)
{
	var texture;
	
	if(textureName == "camera") {
    	// setup webcam
		if(Main.video == undefined) Main.initCamera();
		
		if(Main.video.paused) Main.video.play();
		Renderer.usingCamera = true;
		texture = Main.videoTexture;
	}else
	{
		if(Main.video !== undefined) Main.video.pause();
		Renderer.usingCamera = false;
		
		if(textureName == "default") {
			var default_texture = {
				"Strongman.obj":"texture/Strongman.jpg",
				"sheep.obj":"texture/sheep.jpg",
			};
			
			if( (Main.mesh_name in default_texture) && (Main.shadingMethod !== "EnvMap") )
				texture = THREE.ImageUtils.loadTexture( default_texture[Main.mesh_name] );
			else
				texture = THREE.ImageUtils.loadTexture( "texture/white.jpg" );
		}
		else texture = THREE.ImageUtils.loadTexture( "texture/"+textureName );
	}
	
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	return texture;
}

// construct scene given loaded geometry 
Main.controlsChangeCallback = function()
{
	//Main.shadingMethod = Gui.values.shadingModel;

	var meshs = [];
	
	var uniforms = {
			inflate : {type: 'f', value: Gui.values.inflate},
		    ambient :     { type: "c", value: new THREE.Color( Gui.values.ambient ) },
		    diffuse :     { type: "c", value: new THREE.Color( Gui.values.diffuse ) },
		    specular :     { type: "c", value: new THREE.Color( Gui.values.specular ) },
		    lightDir : {type: "v3", value : Renderer.lightDir},
			texture : {type: 't', value: Main.fetchTexture(Gui.values.texture) },
			shininess: {type: 'f', value: Gui.values.shininess},
	};
	
	Main._material = new THREE.ShaderMaterial( {
		uniforms:       uniforms,
		vertexShader:   Parser.parseTxt('shaders/'+Main.shadingMethod+"-vert.txt"),
		fragmentShader: Parser.parseTxt('shaders/'+Main.shadingMethod+"-frag.txt"),
	});
	meshs.push( new THREE.Mesh(Main._geometry,Main._material) );
		
	Renderer.updateScene( meshs );
}

// when HTML is finished loading, do this
window.onload = function() {
    Student.updateHTML();
	
    // setup renderer and gui
    Gui.init( Main.meshChangeCallback, Main.controlsChangeCallback );
    Renderer.create( document.getElementById("canvas"), Main.updateCamera );

    // load new mesh
    Main.meshChangeCallback( Gui.meshList[0] );

    Renderer.update();
};
