// In this file you will implement traversal and analysis paer to your assignment.
// Make sure to familairize yourself with other utility funcitons in mesh.js
// they might be useful for second part of your assignemnt!

////////////////////////////////////////////////////////////////////////////////
// Traversal
////////////////////////////////////////////////////////////////////////////////

Mesh.prototype.verticesOnFace = function ( f ) {
    var vertices = [];
    var he = f.halfedge;
    var first = he;
    while ( true ) {
        vertices.push( he.vertex );
        var he = he.next;
        if ( he === first ) break;
    }
    return vertices;
};

Mesh.prototype.edgesOnFace = function ( f ) {
    var halfedges = [];

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------

    return halfedges;
};

Mesh.prototype.facesOnFace = function ( f ) {
    var faces = [];

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------

    return faces;
};

Mesh.prototype.verticesOnVertex = function ( v ) {
    var vertices = [];

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------

    return vertices;
};

Mesh.prototype.edgesOnVertex = function ( v ) {
    var halfedges = [];

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------

    return halfedges;
};

Mesh.prototype.facesOnVertex = function ( v ) {
    var faces = [];

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------

    return faces;
};

Mesh.prototype.verticesOnEdge = function ( e ) {
    var vertices = []

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------

    return vertices;
};

Mesh.prototype.facesOnEdge = function ( e ) {
    var faces = [];
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    return faces;
};

Mesh.prototype.edgeBetweenVertices = function ( v1, v2 ) {
    var out_he = undefined;
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    return out_he;
};

////////////////////////////////////////////////////////////////////////////////
// Analysis
////////////////////////////////////////////////////////////////////////////////
Mesh.prototype.calculateFaceArea = function ( f ) {
    var area = 0.0;
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    return area;
};

Mesh.prototype.calculateFacesArea = function ( f ) {
    for ( var i = 0; i < this.faces.length; ++i ) {
        this.faces[i].area = this.calculateFaceArea( this.faces[i] );
    }
}

Mesh.prototype.calculateVertexNormal = function( v ) {
    // STUDENTS: this next line is wrong. It sets the normal at a vertex
    // to point in the Y direction, rather than the correct vertex normal.
    // (It is just to get something to show when when you click the show
    // vertex normals box in the GUI.) You need to change this to find
    // the correct vertex normal, as part of the assignment.
    var v_normal = new THREE.Vector3( 0, 1, 0 );
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    return v_normal;
};

Mesh.prototype.updateVertexNormals = function() {
   for ( var i = 0; i < this.vertices.length; ++i ) {
      this.vertices[i].normal = this.calculateVertexNormal( this.vertices[i] );
   }
};

Mesh.prototype.calculateVertexArea = function ( v ) {
    var area = 0.0;
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    return area;
};


Mesh.prototype.averageEdgeLength = function ( v ) {
    var avg = 0.0;
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
    return avg;
}

Mesh.prototype.triangulateFace = function ( f ) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- STUDENT CODE END ------------
};
