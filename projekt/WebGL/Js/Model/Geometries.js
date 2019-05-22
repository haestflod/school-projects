///<reference path="References.js" />
window.Irinori = window.Irinori || {};
window.Irinori.Geometry = window.Irinori.Geometry || {};

//Sets up all the common geometries
Irinori.Geometry.SetupGeometries = function ( a_gl )
{
    Irinori.Geometry.SetupPlane( a_gl );
};
//Sets up the planes buffers
Irinori.Geometry.SetupPlane = function ( a_gl )
{
    //    v1----- v0
    //   /       /
    //  v2------v3   

    //These vertexbuffers & normal buffers & texturecoords were found from exporting a fbx file -> json and then use firebug to find out what the values there were.

    //The vertex positions
    var vertexBuffer = [
                        0.5, 0.5, 0,
                        -0.5, 0.5, 0,
                        -0.5, -0.5, 0,
                        -0.5, -0.5, 0,
                        0.5, -0.5, 0,
                        0.5, 0.5, 0
    ];
    //Normals for each vertex!
    var normalbuffer = [
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1
    ];

    //Texture coordinates of a plane!
    var textureCoords = [
                        0, 0,
                        1, 0,
                        1, 1,
                        1, 1,
                        0, 1,
                        0, 0
    ];

    //Sets up the buffers,  vertex, normal and texturecoordinates
    Irinori.Geometry.PlaneVertexBuffer = a_gl.createBuffer();
    a_gl.bindBuffer( a_gl.ARRAY_BUFFER, Irinori.Geometry.PlaneVertexBuffer );
    a_gl.bufferData( a_gl.ARRAY_BUFFER, new Float32Array( vertexBuffer ), a_gl.STATIC_DRAW );
    Irinori.Geometry.PlaneVertexBuffer.itemSize = 3;
    Irinori.Geometry.PlaneVertexBuffer.numItems = vertexBuffer.length / 3;

    Irinori.Geometry.PlaneNormalBuffer = a_gl.createBuffer();
    a_gl.bindBuffer( a_gl.ARRAY_BUFFER, Irinori.Geometry.PlaneNormalBuffer );
    a_gl.bufferData( a_gl.ARRAY_BUFFER, new Float32Array( normalbuffer ), a_gl.STATIC_DRAW );
    Irinori.Geometry.PlaneNormalBuffer.itemSize = 3;
    Irinori.Geometry.PlaneNormalBuffer.numItems = normalbuffer.length / 3;

    Irinori.Geometry.PlaneTextureCoordinates = a_gl.createBuffer();
    a_gl.bindBuffer( a_gl.ARRAY_BUFFER, Irinori.Geometry.PlaneTextureCoordinates );
    a_gl.bufferData( a_gl.ARRAY_BUFFER, new Float32Array( textureCoords ), a_gl.STATIC_DRAW );
    Irinori.Geometry.PlaneTextureCoordinates.itemSize = 2;
    Irinori.Geometry.PlaneTextureCoordinates.numItems = textureCoords.length * 0.5;
};
