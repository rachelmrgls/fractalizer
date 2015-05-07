var Scene = Scene || {};


Scene.default = function () {
    Raytracer.setUniform('3f', 'camera' ,0.0, 0.0, -150.0);    
    
    // Matte Sphere
    Raytracer.resetMaterial();
    // I dunno what is wrong but when I put Raytracer.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raytracer.setUniformMaterial( '1i','materialType', Raytracer.PHONGMATERIAL);
    Raytracer.setUniformMaterial( '1i','materialReflectType', Raytracer.NONEREFLECT); 
    Raytracer.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raytracer.setUniformMaterial( '1f','shininess', 200 ); 
    Raytracer.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );
    
    //Raytracer.addSphere( 0.0, 0.0, 0.0, 5.0 );
    Raytracer.addInfSphere( 1.0 ); // radius

    Raytracer.setUniform('1i', 'numObjects', Raytracer.objectID);
    
    //Raytracer.addLight(-20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1.5);
    Raytracer.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    //Raytracer.addLight(-10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 20.0, 1);
    Raytracer.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raytracer.setUniform('1i', 'numLights', Raytracer.lightID);
};


Scene.menger = function () {
    Raytracer.setUniform('3f', 'camera' ,0.0, 0.0, -15.0);    
    
    // Matte Sphere
    Raytracer.resetMaterial();
    // I dunno what is wrong but when I put Raytracer.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raytracer.setUniformMaterial( '1i','materialType', Raytracer.BASICMATERIAL);
    Raytracer.setUniformMaterial( '1i','materialReflectType', Raytracer.NONEREFLECT); 
    Raytracer.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raytracer.setUniformMaterial( '1f','shininess', 200 ); 
    Raytracer.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );
    //Raytracer.addSphere( 0.0, 0.0, 0.0, 1.0 );
    Raytracer.addMenger( 4. ); // recursion level

    
    Raytracer.setUniform('1i', 'numObjects', Raytracer.objectID);
    
    //Raytracer.addLight(-20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1.5);
    Raytracer.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    //Raytracer.addLight(-10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 20.0, 1);
    Raytracer.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raytracer.setUniform('1i', 'numLights', Raytracer.lightID);
};


Scene.julia = function ( value ) {
    Raytracer.setUniform('3f', 'camera' ,0.0, 0.0, -15.0);    
    
    // Matte Sphere
    Raytracer.resetMaterial();
    // I dunno what is wrong but when I put Raytracer.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raytracer.setUniformMaterial( '1i','materialType', Raytracer.PHONGMATERIAL);
    Raytracer.setUniformMaterial( '1i','materialReflectType', Raytracer.NONEREFLECT); 
    Raytracer.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raytracer.setUniformMaterial( '1f','shininess', 200 ); 
    Raytracer.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );
    //Raytracer.addSphere( 0.0, 0.0, 0.0, 1.0 );
    Raytracer.addJulia(); // recursion level

    Raytracer.setUniform('1f','value',value);

    Raytracer.setUniform('1i', 'numObjects', Raytracer.objectID);
    
    //Raytracer.addLight(-20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1.5);
    Raytracer.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    //Raytracer.addLight(-10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 20.0, 1);
    Raytracer.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raytracer.setUniform('1i', 'numLights', Raytracer.lightID);
};



Scene.mandelbrot = function () {
    Raytracer.setUniform('3f', 'camera' ,0.175679, -1.04465, -1.61391 - 15);//0.0, 0.0, -10.0);    

    // Matte Sphere
    Raytracer.resetMaterial();
    // I dunno what is wrong but when I put Raytracer.BASICMATERIAL instead of PHONG
    // its just white?? idk why so i will not fix but someone else can if they feel inclined.
    Raytracer.setUniformMaterial( '1i','materialType', Raytracer.PHONGMATERIAL);//BASICMATERIAL);
    Raytracer.setUniformMaterial( '1i','materialReflectType', Raytracer.NONEREFLECT); 
    Raytracer.setUniformMaterial( '3f','specular', 0.8, 0.8, 0.8 ); 
    Raytracer.setUniformMaterial( '1f','shininess', 200 ); 
    Raytracer.setUniformMaterial( '3f','color', 0.2, 0.4, 0.5 );
    //Raytracer.addSphere( 0.0, 0.0, 0.0, 1.0 );
    Raytracer.addMandelbrot(); // recursion level

    Raytracer.setUniform('1i', 'numObjects', Raytracer.objectID);
    
    //Raytracer.addLight(-20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 10.0, 1.5);
    Raytracer.addLight( 20.0, 20.0, 5.0, 1.0, 1.0, 1.0, 40.0, 2);
    //Raytracer.addLight(-10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 20.0, 1);
    Raytracer.addLight( 10.0, 20.0, -10.0, 1.0, 1.0, 1.0, 40.0, 1);
    Raytracer.setUniform('1i', 'numLights', Raytracer.lightID);
};

