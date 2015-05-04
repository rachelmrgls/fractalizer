// Empty mesh constuctor
function Mesh() {
    this.clear();
}

// Vertex constuctor, only stores position
// Should not be used directly, vertices should be added via addVertex method
function Vertex( x, y, z ) {
    this.id        = -1;
    this.position  = new THREE.Vector3( x, y, z );
    this.normal    = new THREE.Vector3();
    this.color     = new THREE.Vector3( Math.random(), Math.random(), Math.random() );
    this.curvature = 0.0;

    this.halfedge  = undefined;
}

// Face Constuctor
// Should not be used directly, faces should be added via addFace method
function Face() {
    this.id        = -1;
    this.normal    = new THREE.Vector3();
    this.area      = 0.0;
    this.selected  = false;

    this.halfedge  = undefined;
}

// HalfEdge Constuctor
// Should not be used directly, faces should be added via addFace method
function HalfEdge() {
    this.id     = -1;

    this.vertex   = undefined;
    this.next     = undefined;
    this.opposite = undefined;
    this.face     = undefined;
}

////////////////////////////////////////////////////////////////////////////////
// Data Structure Modification
////////////////////////////////////////////////////////////////////////////////

Mesh.prototype.clear = function() {
    this.vertices   = [];
    this.halfedges  = [];
    this.faces      = [];
}

Mesh.prototype.addVertex = function ( position ) {
   var v = new Vertex( position.x, position.y, position.z );
   v.id = this.vertices.length;

   this.vertices.push( v );

   return v;
};

Mesh.prototype.addFace = function () {
    var f = new Face();
    f.id = this.faces.length;
    this.faces.push(f);
    f.halfedge = undefined;

   return f;
};

Mesh.prototype.addHalfEdge = function ( origin, destination, face ) {
    var he = new HalfEdge();
    he.id = this.halfedges.length;
    this.halfedges.push (he);

    he.vertex = destination;
    he.face = face;
    origin.halfedge = he;

    he.next     = undefined;
    he.opposite = undefined;

    return he;
};

Mesh.prototype.splitEdge = function ( v1, v2, factor ) {
    if ( factor === undefined ) factor = 0.5;
    // get all relevant info
    var he1 = this.edgeBetweenVertices( v1, v2 );
    var he2 = he1.opposite;
    var f1  = he1.face;
    var f2  = he2.face;
    var he1_next = he1.next;
    var he2_next = he2.next;

    // compute new vertex position
    var new_pos = new THREE.Vector3( 0, 0, 0 );
    var p1 = new THREE.Vector3( 0, 0 ,0 );
    p1.copy( v1.position );
    var p2 = new THREE.Vector3( 0, 0 ,0 );
    p2.copy( v2.position );

    new_pos.add( p1.multiplyScalar( factor ) );
    new_pos.add( p2.multiplyScalar( 1 - factor ) );

    // create new vertex and halfedges
    var v3  = this.addVertex( new_pos );
    var he3 = this.addHalfEdge( v3, v2, f1 );
    var he4 = this.addHalfEdge( v3, v1, f2 );

    he1.vertex = v3;
    he2.vertex = v3;

    // relink everything
    he3.next = he1_next;
    he1.next = he3;
    he1.opposite = he4;
    he4.opposite = he1;

    he4.next = he2_next;
    he2.next = he4;
    he2.opposite = he3;
    he3.opposite = he2;

    f1.halfedge = he3;
    f2.halfedge = he4;

    return v3;

};

Mesh.prototype.splitFace = function ( f1, v1, v2 ) {

    // create new face, and edges
    var f2       = this.addFace();
    var he1      = this.addHalfEdge( v2, v1 );
    var he2      = this.addHalfEdge( v1, v2 );
    he1.opposite = he2;
    he2.opposite = he1;

    // Go around the current face and set previous / next of the new edge.
    var he = f1.halfedge;
    var first = he;
    var he1_prev, he2_prev;
    do {
        if ( he.vertex === v1) { he2_prev = he; };
        if ( he.opposite.vertex === v2 ) { he2.next = he; };
        if ( he.vertex === v2 ) { he1_prev = he };
        if ( he.opposite.vertex === v1 ) { he1.next = he };
        var he = he.next;
    } while ( he !== first );

    // assign new halfedges to faces
    f1.halfedge = he1;
    f2.halfedge = he2;

    // relink old half edges
    he1_prev.next = he1;
    he2_prev.next = he2;

    // go around each face and make sure halfedges point to a correct one
    var he = he1;
    var first = he;
    do {
        he.face = f1;
        he = he.next;
    } while (he !== first );

    var he = he2;
    var first = he;
    do {
        he.face = f2;
        he = he.next;
    } while ( he !== first );

    return f2;
};


Mesh.prototype.copy = function( mesh ) {
    this.vertices  = [];
    this.faces     = [];
    this.halfedges = [];
    var v_id, f_id, he_id;

    // create list of vertices
    for ( v_id in mesh.vertices ) {
        var v_org = mesh.vertices[ v_id ];
        var v_cpy = this.addVertex( v_org.position );
        v_cpy.normal.copy( v_org.normal );
        v_cpy.color.copy( v_org.color );
        v_cpy.curvature = v_org.curvature;
    }

    // create list of faces
    for ( f_id in mesh.faces ) {
        var f_org = mesh.faces[f_id];
        var f_cpy = this.addFace();
        if ( f_org.normal !== undefined ) {
            f_cpy.normal = new THREE.Vector3( f_org.normal.x,
                                              f_org.normal.y,
                                              f_org.normal.z );
        }
        f_cpy.selected = f_org.selected;
    }

    // create all half edges
    for ( he_id in mesh.halfedges ) {
         var he_org = mesh.halfedges[ he_id ];
         var f_org  = he_org.face;
         var f_cpy  = this.faces[ f_org.id ];

         var he_cpy = this.addHalfEdge( this.vertices[ he_org.opposite.vertex.id ],
                                        this.vertices[ he_org.vertex.id ],
                                        f_cpy );
    }

    // relink halfedges
    for ( he_id in mesh.halfedges ) {
        var he_org = mesh.halfedges[ he_id ];
        var he_cpy = this.halfedges[ he_id ];
        he_cpy.next = this.halfedges[ he_org.next.id ];
        he_cpy.opposite = this.halfedges[ he_org.opposite.id ];
    }

    // add face reference to halfedges
    for ( f_id in mesh.faces ) {
        var f_org = mesh.faces[f_id];
        var f_cpy = this.faces[f_id];
        f_cpy.halfedge = this.halfedges[ f_org.halfedge.id ];
    }
};

////////////////////////////////////////////////////////////////////////////////
// Utility functions
////////////////////////////////////////////////////////////////////////////////

Mesh.prototype.angleBetweenEdges = function ( v, he1, he2)
{
    var p0 = v.position;
    var p1 = he1.vertex.position;
    var p2 = he2.vertex.position;
    var v1 = new THREE.Vector3();
    var v2 = new THREE.Vector3();
    v1.subVectors( p1, p0 );
    v2.subVectors( p2, p0 );

    // Return angle between vectors
    var d1 = v1.length();
    if ( Math.abs(d1) < 0.000001 ) return 0.0;
    var d2 = v2.length();
    if ( Math.abs(d1) < 0.000001 ) return 0.0;
    var cosine = v1.dot(v2) / (d1 * d2);
    if (cosine >= 1.0) {
        return 0.0;
    } else if (cosine <= -1.0) {
        return RN_PI;
    } else {
        return Math.acos(cosine);
    }
}

Mesh.prototype.calculateFaceCentroid = function ( f ) {
    var verts    = this.verticesOnFace( f );
    var centroid = new THREE.Vector3( 0, 0, 0 );
    for ( var i = 0 ; i < verts.length ; ++i ) {
        centroid.add( verts[i].position );
    }
    centroid.divideScalar( verts.length );
    return centroid;
};


Mesh.prototype.calculateFaceNormal = function ( f ) {
    // Get vertices of queried face
    var vertices = this.verticesOnFace( f );

    // Since every face has at least three vertices, we can get positions of first three.
    // Here we assume that face is planar, even if number of vertices is greater than 3.

    // We find two edges that are not colinear, and their cross product is the normal.
    var nverts = vertices.length;
    var normal = new THREE.Vector3();
    //return normal;
    for (var start = 0; start < nverts; start++) {
        var i0 = (start+0) % nverts;
        var i1 = (start+1) % nverts;
        var i2 = (start+2) % nverts;
        var p0 = vertices[i0].position;
        var p1 = vertices[i1].position;
        var p2 = vertices[i2].position;

        var vec1 = new THREE.Vector3();
        vec1.subVectors( p0, p1 );

        var vec2 = new THREE.Vector3();
        vec2.subVectors( p0, p2 );

        normal.crossVectors( vec1, vec2 );

        if (normal.length() > 1e-06) {
            normal.normalize();
            return normal;
        }

    }

    return normal;
};

Mesh.prototype.updateFaceNormals = function() {
   for ( var i = 0; i < this.faces.length; ++i ) {
      this.faces[i].normal = this.calculateFaceNormal( this.faces[i] );
   }
};

Mesh.prototype.updateNormals = function() {
    this.updateFaceNormals();
    this.updateVertexNormals();
};

// number of faces that are selected
Mesh.prototype.numSelectedFaces = function () {
    var count = 0;
    for ( var i = 0 ; i < this.faces.length ; ++i ) {
        if ( this.faces[i].selected ) {
            count++;
        }
    }
    return count;
};

// list of faces that are selected
Mesh.prototype.getModifiableFaces = function () {
    var faces = [];
    for ( var i = 0 ; i < this.faces.length ; ++i ) {
        if ( this.faces[i].selected ) {
            faces.push( this.faces[i] );
        }
    }

    if ( faces.length === 0 ) {
        return this.faces;
    }
    return faces;
};

// list of vertices on faces that are selected
Mesh.prototype.getModifiableVertices = function() {
    var verts_movable = [];
    for ( var i = 0 ; i < this.faces.length ; ++i ) {
        if ( this.faces[i].selected ) {
            var verts = this.verticesOnFace( this.faces[i] );
            for ( var j = 0 ; j < verts.length ; ++j ) {
                verts_movable[ verts[j].id ] = 1;
            }
        }
    }
    var verts = [];
    if ( verts_movable.length === 0 ) {
        verts = this.vertices;
    } else {
        for ( var i = 0 ; i < verts_movable.length ; ++i ) {
            if ( verts_movable[i] === 1 ) {
                verts.push( this.vertices[i] );
            }
        }
    }
    return verts;
};

// set list of faces that are selected
Mesh.prototype.setSelectedFaces = function (sel) {
    for ( var i = 0 ; i < this.faces.length ; ++i ) {
        this.faces[i].selected = false;
    }
    if (sel === undefined) return;
    for ( var i = 0 ; i < sel.length ; ++i ) {
        var id = sel[i];
        this.faces[id].selected = true;
    }
};


////////////////////////////////////////////////////////////////////////////////
// Conversions / Constructors
// These are functions used to create meshes - students should have no need to
// modify this code
////////////////////////////////////////////////////////////////////////////////

Mesh.prototype.buildFromVerticesAndFaces = function ( vertices, faces ) {

    var start = new Date().getTime();

    var n_vertices = vertices.length;
    var n_faces    = faces.length;

    // lets have an edge map, mapping the i,j vertex to a half edge
    function emIJ2Key(i,j) {
        return i + '_' + j;
    }

    function emKey2IJ(key) {
        var parts = key.split('_');
        var ret   = [ parts[0], parts[1] ];
        return ret;
    }

    var edgeMap = {};

    for ( var i = 0 ; i < n_vertices ; ++i ) {
        this.addVertex( vertices[i] );
    }

    for ( var i = 0 ; i < n_faces ; ++i ) {
        var cur_face_ind = faces[i];
        var cur_vertices = [];

        for ( var j = 0 ; j < cur_face_ind.length ; j++ ) {
            cur_vertices.push( this.vertices[cur_face_ind[j]] );
        }

        var f = this.addFace();

        // add halfedges between consecutive vertices
        var n_vertices = cur_vertices.length;
        for ( var j = 0 ; j < n_vertices; j++ ) {
            var next_j = (j + 1) % (n_vertices);
            var he = this.addHalfEdge( cur_vertices[j], cur_vertices[next_j], f );
            edgeMap[ emIJ2Key( cur_vertices[j].id, cur_vertices[next_j].id ) ] = he;
            f.halfedge = he;
        }

        // relink edges around face
        for ( var j = 0 ; j < n_vertices; j++ ) {
            var next_j = (j + 1) % (n_vertices);
            cur_vertices[j].halfedge.next     = cur_vertices[next_j].halfedge;
        }
    }

    for ( var key in edgeMap ) {
        var he1  = edgeMap[ key ];
        var ind  = emKey2IJ( key );
        var key2 = emIJ2Key( ind[1], ind[0] );
        var he2  = edgeMap[ key2 ];
        he1.opposite = he2;
    }

    this.calculateFacesArea();
    this.updateNormals();

    var end = new Date().getTime();
    var elapsed = end - start;

    console.log( "Conversion took " + elapsed + " ms. Mesh contains " + this.vertices.length + " vertices" );
};

Mesh.prototype.fromOBJ = function ( filename, meshLoadCallback ) {

    filename = 'obj/' + filename; // all obj files are in the obj folder

    var start = new Date().getTime();

    var manager = new THREE.LoadingManager();

    // load using the three js loading manager plus pass reference to current mesh
    var loader = new OBJLoader ( manager );
    var mesh   = this;

    loader.load ( filename, function( vertices, faces ) {
        mesh.buildFromVerticesAndFaces( vertices, faces );
        meshLoadCallback();
    });
};

// this code is ugly since translateions and rotations need to be treated separately
Mesh.prototype.applyFilters = function( values ) {
    //console.log(values);
    if ( values == undefined ) return;

    // first parse translations & rotations
    var translation = new THREE.Vector3 ( values.translateX, values.translateY, values.translateZ );
    var rotation    = new THREE.Vector3 ( values.rotateX, values.rotateY, values.rotateZ  );
    if ( translation.x !== 0 || translation.y !== 0 || translation.z !== 0  ) {
        Filters.translate( this, translation );
    }

    if ( rotation.x !== 0 || rotation.y !== 0 || rotation.z !== 0 ) {
        Filters.rotate( this, rotation );
    }

    //then all other values
    for ( var prop in values) {
        if ( (prop in Gui.defaults ) && ( values[prop] !== Gui.defaults[prop]) ) {
            var val = values[prop];
            if ( prop === "translateX"  ||  prop === "translateY" ||  prop === "translateZ" ||
                 prop === "rotateX" || prop === "rotateY" || prop === "rotateZ") {
                continue;
            }
            Filters[prop]( this, val );
        }
    }
}

Mesh.prototype.toBufferGeometry = function ( values ) {
    // useful variables and default settings
    var v_pos, v_nor, v_col;
    var i = 0, j = 0, k = 0, sel_k = 0, l = 0, idx = 0;

    // the modifiers will be applied to the copy of the original mesh
    var mesh_cpy = new Mesh();
    mesh_cpy.copy ( this );

    mesh_cpy.applyFilters(values);

    var n_faces = mesh_cpy.faces.length;

    var n_triangles = 0;
    var n_selected_triangles = 0;
    for ( i = 0 ; i < n_faces ; ++i ) {
        var vertices = mesh_cpy.verticesOnFace( mesh_cpy.faces[i] );
        // need to figure number of vertices for a face
        if ( mesh_cpy.faces[i].selected ) {
            n_selected_triangles += vertices.length - 2;
        } else {
            n_triangles += vertices.length - 2;
        }
    }

    // main buffer geo
    var geometry         = new THREE.BufferGeometry();
    var selectedGeometry = new THREE.BufferGeometry();

    var vertex_positions = new Float32Array( n_triangles * 3 * 3 ); // each face - 3 vertices - 3 attributes
    var sel_vertex_positions = new Float32Array( n_selected_triangles * 3 * 3 ); // each face - 3 vertices - 3 attributes
    var vertex_normals   = new Float32Array( n_triangles * 3 * 3 ); // each face - 3 vertices - 3 attributes
    var sel_vertex_normals   = new Float32Array( n_selected_triangles * 3 * 3 ); // each face - 3 vertices - 3 attributes
    var vertex_colors    = new Float32Array( n_triangles * 3 * 3 ); // each face - 3 vertices - 3 attributes
    var sel_vertex_colors    = new Float32Array( n_selected_triangles * 3 * 3 ); // each face - 3 vertices - 3 attributes

    var faceNormalsGeo   = new THREE.Geometry();
    var vertexNormalsGeo = new THREE.Geometry();
    var wireframeGeo     = new THREE.Geometry();

    for ( i = 0 ; i < n_faces ; i++ ) {
        var f = mesh_cpy.faces[i];

        // Face normals
        if ( values.showFN ) {
            var fn_p1 = mesh_cpy.calculateFaceCentroid ( f );
            var fn_p2 = new THREE.Vector3 ();
            fn_p2.copy ( f.normal );
            if ( fn_p2.length() > 1e-06 ) fn_p2.normalize();
            fn_p2.normalize();
            fn_p2.multiplyScalar( 0.2 * values.scale );
            fn_p2.add( fn_p1 );

            faceNormalsGeo.vertices.push( fn_p1 );
            faceNormalsGeo.vertices.push( fn_p2 );
        }

        // triangulate faces
        var verts = [];
        var f_verts = mesh_cpy.verticesOnFace( f );

        verts[0] = f_verts[0];

        var positions_ptr = vertex_positions;
        var normals_ptr   = vertex_normals;
        var colors_ptr    = vertex_colors;
        idx = k;

        if ( f.selected ) {
            positions_ptr = sel_vertex_positions;
            normals_ptr   = sel_vertex_normals;
            colors_ptr    = sel_vertex_colors;
            idx = sel_k;
        }

        for ( j = 1 ; j < f_verts.length - 1 ; ++j ) {
            var next_j = j + 1;
            verts[1] = f_verts[j];
            verts[2] = f_verts[next_j];

            for ( l = 0 ; l < 3 ; ++l ) {
                v_pos = verts[l].position;
                if ( values.shading === "smooth" ) {
                    v_nor = verts[l].normal;
                } else {
                    v_nor = f.normal;
                }
                v_col = verts[l].color;

                colors_ptr[ idx ]     = v_col.x;
                colors_ptr[ idx + 1 ] = v_col.y;
                colors_ptr[ idx + 2 ] = v_col.z;

                normals_ptr[ idx ]     = v_nor.x;
                normals_ptr[ idx + 1 ] = v_nor.y;
                normals_ptr[ idx + 2 ] = v_nor.z;

                positions_ptr[ idx ]     = v_pos.x;
                positions_ptr[ idx + 1 ] = v_pos.y;
                positions_ptr[ idx + 2 ] = v_pos.z;

                // vertex normals
                if ( values.showVN ) {
                    var vn_p1 = new THREE.Vector3();
                    var vn_p2 = new THREE.Vector3();

                    vn_p1.copy( v_pos );
                    vn_p2.copy(  verts[l].normal );
                    if ( vn_p2.length() > 1e-0 ) vn_p2.normalize();
                    vn_p2.multiplyScalar( 0.2 * values.scale );
                    vn_p2.add( vn_p1 );
                    vertexNormalsGeo.vertices.push( vn_p1 );
                    vertexNormalsGeo.vertices.push( vn_p2 );
                }
                if ( !f.selected ) {
                    k += 3;
                    idx = k;
                } else {
                    sel_k += 3;
                    idx = sel_k;
                }
            }
        }

   }

    if ( values.wireframe ) {
        // this should be changed to walk around the face
        var done = [];

        for ( j = 0 ; j < mesh_cpy.halfedges.length ; ++j ) {
            if ( done[j] == 1 ) continue;
            wireframeGeo.vertices.push( mesh_cpy.halfedges[j].vertex.position );
            wireframeGeo.vertices.push( mesh_cpy.halfedges[j].opposite.vertex.position );
            done[ mesh_cpy.halfedges[j].id ] = 1;
            done[ mesh_cpy.halfedges[j].opposite.id ] =1;
        }
    }

    geometry.addAttribute( "position", new THREE.BufferAttribute( vertex_positions, 3 ) );
    geometry.addAttribute( "color",    new THREE.BufferAttribute( vertex_colors, 3 ) );
    geometry.addAttribute( "normal",   new THREE.BufferAttribute( vertex_normals, 3 ) );

    selectedGeometry.addAttribute( "position", new THREE.BufferAttribute( sel_vertex_positions, 3 ) );
    selectedGeometry.addAttribute( "color",    new THREE.BufferAttribute( sel_vertex_colors, 3 ) );
    selectedGeometry.addAttribute( "normal",   new THREE.BufferAttribute( sel_vertex_normals, 3 ) );

    return [mesh_cpy, geometry, faceNormalsGeo, vertexNormalsGeo, wireframeGeo,  selectedGeometry ];
};

Mesh.prototype.toOBJ = function ( mesh ) {
        function destroyClickedElement( event ) {
            document.body.removeChild( event.target );
        }

        var objContent = "# Princeton COS426 OBJ model\n\n";

        for ( var i = 0 ; i < this.vertices.length ; ++i ) {
            var p = this.vertices[i].position;
            objContent += 'v ' + p.x + ' ' + p.y + ' ' + p.z + "\n";
        }

        for ( var i = 0 ; i < this.faces.length ; ++i ) {
            objContent += 'f';
            var face  = this.faces[i];
            var verts = this.verticesOnFace( face );
            for ( var j = 0 ; j < verts.length ; ++j ) {
                objContent += ' ' + (verts[j].id + 1);
            }
            objContent += "\n";
        }

        var textFileAsBlob = new Blob([objContent], {type:'text/obj'});
        var fileNameToSaveAs = "mesh.obj";

        var downloadLink = document.createElement("a");
        downloadLink.download = fileNameToSaveAs;
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild( downloadLink );
        downloadLink.click();
    }

// add event listener that will cause 'O' key to download mesh
window.addEventListener( 'keyup', function( event ) {
    // only respond to 'O' key
    if ( event.which == 79 ) {
        Main._modified_mesh.toOBJ();
    }
});
