var Scene = Scene || {};

Scene.spheres = function () {
    Raymarcher.setUniform('3f', 'camera' ,0.0, 0.0, -150.0);    
    
    // Matte Sphere
    Raymarcher.resetMaterial();
    // I dunno what is wrong but when I put Raymarcher.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raymarcher.setUniformMaterial( '1i','materialType', Raymarcher.PHONGMATERIAL);
    Raymarcher.setUniformMaterial( '1i','materialReflectType', Raymarcher.NONEREFLECT); 
    Raymarcher.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raymarcher.setUniformMaterial( '1f','shininess', 200 ); 
    Raymarcher.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );    
    Raymarcher.addInfSphere( 1.0 ); // radius

    Raymarcher.setUniform('1i', 'numObjects', Raymarcher.objectID);
    Raymarcher.setUniform('1i', 'isBounded', 0);

    Raymarcher.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1);
    Raymarcher.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 30.0, 1);
    Raymarcher.setUniform('1i', 'numLights', Raymarcher.lightID);
};

Scene.apollonian = function (level) {
    Raymarcher.setUniform('3f', 'camera' ,0.0, 0.0, -15.0);    
    
    // Matte Sphere
    Raymarcher.resetMaterial();
    Raymarcher.setUniformMaterial( '1i','materialType', Raymarcher.PHONGMATERIAL);
    Raymarcher.setUniformMaterial( '1i','materialReflectType', Raymarcher.NONEREFLECT); 
    Raymarcher.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raymarcher.setUniformMaterial( '1f','shininess', 200 ); 
    Raymarcher.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );
    //Raymarcher.addSphere( 0.0, 0.0, 0.0, 1.0 );

    console.log(level);
    Raymarcher.addApollonian( level ); // recursion level
    
    Raymarcher.setUniform('1i', 'numObjects', Raymarcher.objectID);
    
    Raymarcher.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    // Raymarcher.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raymarcher.setUniform('1i', 'numLights', Raymarcher.lightID);
    Raymarcher.setUniform('1i', 'isBounded', 0);

    console.log("here")

};

Scene.menger = function (level) {
    Raymarcher.setUniform('3f', 'camera' ,0.0, 0.0, -15.0);    
    
    // Matte Sphere
    Raymarcher.resetMaterial();
    // I dunno what is wrong but when I put Raymarcher.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raymarcher.setUniformMaterial( '1i','materialType', Raymarcher.PHONGMATERIAL);
    Raymarcher.setUniformMaterial( '1i','materialReflectType', Raymarcher.NONEREFLECT); 
    Raymarcher.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raymarcher.setUniformMaterial( '1f','shininess', 200 ); 
    Raymarcher.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );
    //Raymarcher.addSphere( 0.0, 0.0, 0.0, 1.0 );
    Raymarcher.addMenger( level ); // recursion level

    
    Raymarcher.setUniform('1i', 'numObjects', Raymarcher.objectID);
    
    //Raymarcher.addLight(-20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1.5);
    Raymarcher.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    //Raymarcher.addLight(-10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 20.0, 1);
    Raymarcher.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raymarcher.setUniform('1i', 'numLights', Raymarcher.lightID);
    Raymarcher.setUniform('1i', 'isBounded', 0);
};

Scene.julia3d = function ( ) {
    //Raymarcher.setUniform('3f', 'camera' ,-3.29277, 0.499087, -0.896598 - 15);    
    Raymarcher.setUniform('3f', 'camera' ,0.0,0.0,-16.0); 
    // Matte Sphere
    Raymarcher.resetMaterial();
    // I dunno what is wrong but when I put Raymarcher.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raymarcher.setUniformMaterial( '1i','materialType', Raymarcher.PHONGMATERIAL);
    Raymarcher.setUniformMaterial( '1i','materialReflectType', Raymarcher.NONEREFLECT); 
    Raymarcher.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raymarcher.setUniformMaterial( '1f','shininess', 200 ); 
    Raymarcher.setUniformMaterial( '3f','color', 0.92, 0.0, 0.5  );

    Raymarcher.addJulia3d(); // recursion level

    // Raymarcher.setBound( 2.0, 0.0, 0.0, 0.0 );
    Raymarcher.setUniform('1i', 'isBounded', 0);

    Raymarcher.setUniform('1i', 'numObjects', Raymarcher.objectID);
    
    //Raymarcher.addLight(-20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1.5);
    Raymarcher.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    //Raymarcher.addLight(-10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 20.0, 1);
    Raymarcher.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raymarcher.setUniform('1i', 'numLights', Raymarcher.lightID);


};

Scene.julia2d = function ( ) {
    //Raymarcher.setUniform('3f', 'camera' ,-3.29277, 0.499087, -0.896598 - 15);    
     Raymarcher.setUniform('3f', 'camera' ,0.0, 0.0, -16); 
     //Raymarcher.setUniform('3f','direction',0.0,0.0,0.0);
    // Matte Sphere
    Raymarcher.resetMaterial();
    // I dunno what is wrong but when I put Raymarcher.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raymarcher.setUniformMaterial( '1i','materialType', Raymarcher.PHONGMATERIAL);
    Raymarcher.setUniformMaterial( '1i','materialReflectType', Raymarcher.NONEREFLECT); 
    Raymarcher.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raymarcher.setUniformMaterial( '1f','shininess', 200 ); 
    Raymarcher.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );

    Raymarcher.addJulia(); // recursion level

    // Raymarcher.setBound( 2.0, 0.0, 0.0, 0.0 );
    Raymarcher.setUniform('1i', 'isBounded', 0);

    Raymarcher.setUniform('1i', 'numObjects', Raymarcher.objectID);
    
    //Raymarcher.addLight(-20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1.5);
    Raymarcher.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    //Raymarcher.addLight(-10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 20.0, 1);
    Raymarcher.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raymarcher.setUniform('1i', 'numLights', Raymarcher.lightID);


};



Scene.mandelbrot = function () {
    Raymarcher.setUniform('3f', 'camera' ,0.0, 0.0, -16);//0.0, 0.0, -10.0);    

    // Matte Sphere
    Raymarcher.resetMaterial();
    // I dunno what is wrong but when I put Raymarcher.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raymarcher.setUniformMaterial( '1i','materialType', Raymarcher.PHONGMATERIAL);//BASICMATERIAL);
    Raymarcher.setUniformMaterial( '1i','materialReflectType', Raymarcher.NONEREFLECT); 
    Raymarcher.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raymarcher.setUniformMaterial( '1f','shininess', 200 ); 
    Raymarcher.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );
    //Raymarcher.addSphere( 0.0, 0.0, 0.0, 1.0 );
    Raymarcher.addMandelbrot(); // recursion level

    Raymarcher.setUniform('1i', 'numObjects', Raymarcher.objectID);
    
    //Raymarcher.addLight(-20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1.5);
    Raymarcher.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    //Raymarcher.addLight(-10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 20.0, 1);
    Raymarcher.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raymarcher.setUniform('1i', 'numLights', Raymarcher.lightID);

    Raymarcher.setUniform('1i', 'isBounded', 0);
};

