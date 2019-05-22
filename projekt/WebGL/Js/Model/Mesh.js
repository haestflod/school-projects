///<reference path="References.js" />
if (!window.Irinori) window.Irinori = {};

//A mesh that is part of a Model
Irinori.Mesh = function( a_model )
{	
    if (!a_model)
    {
        console.error( "Irinori.Mesh: a_model is not a model " );
        return;
    }
    
    this.m_vertexBuffer;
    this.m_textureCoordinates;
    this.m_normalBuffer;
    //All the bones associated with this mesh is here, it's a dictionary< int, bone >
    this.m_bones = [];
    //Stores all the IDs to the bones in the m_bones array so it's easy to iterate the array
    this.m_bonesIDs = [];
    
    //The webgl attributes
    this.m_boneWeights;
    this.m_boneIndex;
    //the "min" value is absolute max as starter value
    this.m_minBoundingPos = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
    //Negative MAX_VALUE since MIN_VALUE was closest to 0 
    this.m_maxBoundingPos = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];

    //The webgl uniform for the bones    
    this.m_boneTransforms;

    //The local TRS values for this mesh
    this.m_localTranslation = vec3.create( [0,0,0] );
    this.m_localRotation = Irinori.Math.GetIdentityQuaternion();
    this.m_localScale = vec3.create( [1,1,1] );    
    
    this.m_worldTransformInverse = Irinori.Math.DualQuat.GetIdentity();

    //The rotation matrix that is created from localRotation
    this.m_rotationMatrix = mat4.create();

    ///The world matrix of a mesh, It's m_models.m_worldMatrix +  this localValues
    this.m_worldMatrix = mat4.create();

    //The model that this mesh is attached too
    this.m_model = a_model;
};

Irinori.Mesh.prototype.SetRotationMatrix = function( a_localRotation )
{	
    ///<summary>Sets the rotationMatrix based on localRotation, if a_radianRotation is not undefined it sets the localRotation to a_radianRotation first</summary>    
    if (a_localRotation)
    {
        quat4.set(a_localRotation, this.m_localRotation);
    }

    quat4.toMat4(this.m_localRotation, this.m_rotationMatrix);   
};

//Uses the models world matrix that the mesh is connected to and adds it's locals values to it to get the final world matrix
Irinori.Mesh.prototype.UpdateWorldMatrix = function()
{	
    Irinori.Tools.UpdateWorldMatrix( this.m_localTranslation, this.m_rotationMatrix, this.m_worldMatrix, { scale: this.m_localScale, startMatrix: this.m_model.m_worldMatrix } );
    
    //Updates the worldTransformInverse aswell
    Irinori.Math.DualQuat.set( Irinori.Math.DualQuat.CreateFromQuatTrans( this.m_localRotation, this.m_localTranslation) , this.m_worldTransformInverse);
    Irinori.Math.DualQuat.Inverse( this.m_worldTransformInverse);
};

Irinori.Mesh.prototype.UpdateBoneUniforms = function()
{	
    ///<summary>Updates the TRS uniforms</summary>
    var i;
    var bone;
    
    this.m_boneTransforms = [];
    
    //Set the index 0 as as a nothing at all  
    this.m_boneTransforms.push(Irinori.Math.DualQuat.GetIdentity() );

    for (i = 0; i < this.m_bonesIDs.length; i++)
    {
        //This makes sure that it doesn't add more bonetransforms than there are bones
        if (i >= Irinori.Shader.s_maxBones - 1)
        {
            break;
        }        

        bone = this.m_bones[this.m_bonesIDs[i] ];
        
        this.m_boneTransforms.push ( bone.m_transformOffset );
    }   
};

//******************
//FROM OBJ
//******************
Irinori.Mesh.CreateFromObj = function(a_objData, a_model ,a_gl)
{
    if (!a_model)
    {
        console.error( "Irinori.Mesh.CreateFromObj: a_model is not a model ");
        return null;    
    }

    var mesh = new Irinori.Mesh( a_model );

    mesh.SetRotationMatrix();
    mesh.UpdateWorldMatrix();
    //The data from each line in the obj file
    var lineData;
    var data;
    //Used at like when you need to split even more like at linedata = f 13/14 15/16
    //so data would be 13/14, 15/16. So need additionalData to get 13, 14  and 15,16!
    var additionalData;

    //Used when reading the IDs from faces
    var id;
    var i, j;
    //x,y,z vertex positions, used for instance when setting min & max bounding box values
    var x, y, z;
        
    //Will hold the values of vertexbuffer
    var vertexBuffer = [];
    //Will read IDs from face and fill it with data from vertexBuffer
    var verticeIndexBuffer = [];
        
    //Value from vt x y
    var textCoords = [];
    //Will read IDs from face and fill it with data from textCoords
    var textureIndex = [];

    var normals = [];

    var normalIndex = [];

    //An array that's gonna have a lot of 0s in it because skeletons doesn't exist for obj file but is needed by the shader still
    var boneWeights = [];
    var boneIndices = [];

    //var stringtest;
    for (i = 0; i < a_objData.length; i++) 
    {
        lineData = a_objData[i];
            
        data = lineData.split(" ");
            
        //First vertices, then texture cordinates, then normal cordinates, then faces ids!'
        //v x y z
        if (data[0] ==="v")
        {
            vertexBuffer.push(parseFloat(data[1]) );
            vertexBuffer.push(parseFloat(data[2]) );
            vertexBuffer.push(parseFloat(data[3]) );
        }
        //vt x y
        else if (data[0] === "vt")
        {
            textCoords.push(parseFloat(data[1]) );
            textCoords.push(parseFloat(data[2]) );
        }
        //vn x y z
        else if (data[0] === "vn")
        {
            normals.push(parseFloat(data[1]) );
            normals.push(parseFloat(data[2]) );
            normals.push(parseFloat(data[3]) );
        }
        //f vID  || vID/vtID  || (vID/vnID/vtID  || vID//vtID)   
        else if (data[0] === "f")
        {
            //Needed mainly cause of additionalData split, to be noted tho: obj model
            for (j = 1; j < data.length; j++)
            {
                additionalData = data[j].split("/");

                //* 3 because it's 3 vertexes per ID (xyz) and -3 because the ID starts on 1 in the .obj file
                id = parseInt( additionalData[0] * 3, 10 ) - 3;
                
                x = vertexBuffer[id];
                y = vertexBuffer[id + 1];
                z = vertexBuffer[id + 2];

                verticeIndexBuffer.push(x);
                verticeIndexBuffer.push(y);
                verticeIndexBuffer.push( z );

                //Check if vertex is tinier than current min value
                if (x < mesh.m_minBoundingPos[0] ) mesh.m_minBoundingPos[0] = x;
                if (y < mesh.m_minBoundingPos[1] ) mesh.m_minBoundingPos[1] = y;
                if (z < mesh.m_minBoundingPos[2] ) mesh.m_minBoundingPos[2] = z;
                //Check if bigger than current max
                if ( x > mesh.m_maxBoundingPos[0] ) mesh.m_maxBoundingPos[0] = x;
                if ( y > mesh.m_maxBoundingPos[1] ) mesh.m_maxBoundingPos[1] = y;
                if ( z > mesh.m_maxBoundingPos[2] ) mesh.m_maxBoundingPos[2] = z;

                if (additionalData.length === 2)
                {
                    //Texture index === [1]
                    id = parseInt(additionalData[1] * 2, 10) - 2;
                    textureIndex.push(textCoords[id] );
                    textureIndex.push(textCoords[id + 1] );
                }
                else if (additionalData.length === 3)
                {
                    //Texture index === [1]
                    //Normal index = [2]
                        
                    //Texture
                    id = parseInt(additionalData[1] * 2, 10) - 2;
                    textureIndex.push(textCoords[id] );
                    textureIndex.push(textCoords[id + 1] );

                    //Normal
                    id = parseInt(additionalData[2] * 3, 10) - 3;
                    normalIndex.push(-normals[id] );
                    normalIndex.push(-normals[id + 1] );
                    normalIndex.push(-normals[id + 2] );
                }

                //Pushes boneweights of 0 to all vertexes at the faces
                boneWeights.push( 0 );
                boneWeights.push( 0 );
                boneWeights.push( 0 );
                boneWeights.push( 0 );
                
                boneIndices.push( 0 );
                boneIndices.push( 0 );
                boneIndices.push( 0 );
                boneIndices.push( 0 );

            }
        }
        //Reason for no else is that if some bad value would come in it doesn't get read and potentially crashes! 
    }//End for loop    
    
    //Set the boneuniform value (an identity DQ) since shader is expecting one potentially
    mesh.UpdateBoneUniforms();

    try
    {
        //Creates the vertex buffer that is to be used!
        mesh.m_vertexBuffer = a_gl.createBuffer();
        a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_vertexBuffer);
        a_gl.bufferData(a_gl.ARRAY_BUFFER, new Float32Array(verticeIndexBuffer), a_gl.STATIC_DRAW);
        mesh.m_vertexBuffer.itemSize = 3;
        mesh.m_vertexBuffer.numItems = verticeIndexBuffer.length / 3;

        //If it has any texture info
        if (textureIndex.length > 0)
        {
            mesh.m_textureCoordinates = a_gl.createBuffer();
            a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_textureCoordinates);
            a_gl.bufferData(a_gl.ARRAY_BUFFER, new Float32Array(textureIndex), a_gl.STATIC_DRAW);

            mesh.m_textureCoordinates.itemSize = 2;
            mesh.m_textureCoordinates.numItems = textureIndex.length * 0.5;
        }

        if (normalIndex.length > 0)
        {
            mesh.m_normalBuffer = a_gl.createBuffer();
            a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_normalBuffer);
            a_gl.bufferData(a_gl.ARRAY_BUFFER, new Float32Array(normalIndex), a_gl.STATIC_DRAW);
            mesh.m_normalBuffer.itemSize = 3;
            mesh.m_normalBuffer.numItems = normalIndex.length / 3;
        }         
        
        //Creates the buffer for boneWeights which is useless cause it's all 0s in the obj file but still needed by the shader.
        mesh.m_boneWeights = a_gl.createBuffer();
        a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_boneWeights);
        a_gl.bufferData(a_gl.ARRAY_BUFFER, new Float32Array(boneWeights), a_gl.STATIC_DRAW);
        mesh.m_boneWeights.itemSize = 4;
        mesh.m_boneWeights.numItems = boneWeights.length * 0.25;
        
        //Reuses the boneWeights array cause boneIndex is useless here aswell so it always points at 0! Was no reason to do it twice afterall!
        mesh.m_boneIndex = a_gl.createBuffer();
        a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_boneIndex);
        a_gl.bufferData(a_gl.ARRAY_BUFFER, new Float32Array(boneIndices), a_gl.STATIC_DRAW);
        mesh.m_boneIndex.itemSize = 4;
        mesh.m_boneIndex.numItems = boneIndices.length * 0.25;

    }
    catch (e)
    {
        console.error("Irinori.Model.CreateFromObj: When setting buffers error: " + e.message );
        return null;
    }

    return mesh;
};

//******************
//FROM FBX JSON
//******************
Irinori.Mesh.CreateFromFbxJson = function(a_fbxMesh, a_model ,a_gl)
{
    ///<summary>Returns a mesh based on the json data</summary>
    /*Order: 
            Declare all the variables
            Inits TRS and Matrixes
            Sets bones up
            Sets the vertex & normal buffers data & uv data
            Sets the final gl buffers with all data combined!

    */
    if (!a_model)
    {
        console.error( "Irinori.Mesh.CreateFromObj: a_model is not a model ");
        return null;    
    } 
    
    if (!a_fbxMesh.meshdata)
    {
        console.error ("Model.CreateFromFbxJson: meshdata does not exist :( ");
        return null;
    }   

    var i = j = k = l = 0,    
    index = 0,
    vertexIndex = 0;
    //Temporary vertex positions
    var x, y, z;
    var normalBuffer = [];
    var verticeIndexBuffer = [];
    var fbxBone;
    var tempBone;
    //Used when getting the weight values from each bone to put it in the mesh.m_weightValues and mesh.m_weightIndex arrays. So it has weightvalues and weightindices in each field
    //DUNNO THE PROPER NAME FOR IT YET!
    var boneIndicesAndWeights = [];
    //The weights array that is sent to be made into gl attribute buffer
    var boneWeights = [];
    //Indices array for gl attribute buffer
    var boneIndices = [];
    //If something hasn't been "warned" about to the console or other warn systems before.. as it'd be just ugly to warn it 1000 times if it happened 1000 times instead of once
    var firstWarning = true;
    //Sorting variables
    var maxValue, t_temp, lastSpot;

    var tempSkeleton;
    //An array that has the IDs of the roots of a skeleton. Only the root parent of a bone hierarchy.
    var boneRoots = [];
    //A boolean if it "found" what it was looking for
    var found;
    //Used by forloops instead of accessing the eg. length property all the time
    var count = 0;
    var parentID;

    //Creates the mesh
    var mesh = new Irinori.Mesh( a_model  );

    mesh.m_localTranslation = a_fbxMesh.localTranslation;
    mesh.m_localRotation = a_fbxMesh.localRotation;
    mesh.m_localScale = a_fbxMesh.localScale;

    mesh.m_bindpose = a_fbxMesh.bindpose;

    //Does it three times, for the xyz components
    for (i = 0; i < 3; i++)
    {
        //Converts the degrees to radians
        mesh.m_localRotation[i] = Irinori.Math.ConvertDegreeToRadian( mesh.m_localRotation[i]);
    }
    //Changes the rotation from a euler rotation to a quaternion
    mesh.m_localRotation = Irinori.Math.Vector3.RadianToQuaternion( mesh.m_localRotation );

    mesh.SetRotationMatrix();
    mesh.UpdateWorldMatrix();

    /*
        START OF BONE STUFF ***************************
    */

    count = a_fbxMesh.meshdata.boneCount;
    //Set up the bones that have weight values on this mesh!
    for (i = 0; i < count; i++)
    {
        fbxBone = a_fbxMesh.bones[i];
        //Create a bone at the id spot!
        mesh.m_bones[ fbxBone.bonedata.id ] = Irinori.Bone.CreateFromFbxJson(fbxBone , mesh);
        //Adds the id to a list that tracks the ids of the bones that are affecting this mesh with 1 or more weight values
        mesh.m_bonesIDs.push( fbxBone.bonedata.id );
    }    
    
    //count is still a_fbxMesh.meshdata.boneCount
    //Looping through the bones that has data again but this time to set the parents if they already aren't set and to find out the root node and set the child & parents
    for (i = 0; i < count; i++)
    {
        
        tempBone = mesh.m_bones[ a_fbxMesh.bones[i].bonedata.id ];

        parentID = tempBone.m_parentID;

        //Loop until you find the root node
        while (parentID > 0)
        {
            //If there is no bone there, create a bone with no weight values just the values from the skeleton from the model
            if (!mesh.m_bones[parentID] )
            {
                mesh.m_bones[parentID] = Irinori.Bone.CreateEmptyBone( mesh, parentID);
            }
            
            //If the tempBone has no parent, set mesh.m_bones[parentID] as parent to tempBone
            if (tempBone.m_parent === null)
            {
                //Sets parent and adds itself as a child to its parent!
                tempBone.AddParent( mesh.m_bones[parentID] );
            }                      
            
            //Now sets the "parent bone" of tempBone as tempBone
            tempBone = mesh.m_bones[parentID];

            //Set the new parentID, if it's 0 or less tempBone is the root node
            parentID = tempBone.m_parentID;
            
        }
        
        found = false;

        //Loop through to see if the root node of that particular skeleton branch is already in the "known root nodes" 
        for (j = 0; j < boneRoots.length; j++)
        {
            //tempBone is the last bone from the while loop above this code
            if (boneRoots[j] === tempBone.m_id)
            {
                found = true;
                break;
            }  
        }

        if (!found)
        {
            boneRoots.push(tempBone.m_id);
        }

    }

    //Loop through an array that ONLY has the root of a bone to set the offset!
    for (i = 0; i < boneRoots.length; i++)
    {
        mesh.m_bones[ boneRoots[i] ].SetOffset();
    }    
    
    //Update BoneUniforms when it's all set up, thanks to arrays being references I think this only has to be called here and never again
    mesh.UpdateBoneUniforms();
    /*
        END OF BONE STUFF **********************
    */
      

    //TODO: Add more uvchannels support
    if (a_fbxMesh.meshdata.uvChannelCount > 0)
    {
        var uvBuffer = a_fbxMesh.uvChannels[0];
    }

    index = 0;
    firstWarning = true;
    //Loops through all the faces
    for (i = 0; i < a_fbxMesh.meshdata.facesCount; i++)
    {           
        
        //Loops through all the points on a face   
        for (j = 0; j < a_fbxMesh.meshdata.verticesPerFace; j++)
        {                                                   
            vertexIndex = a_fbxMesh.verticeIndex[index];

            /*
                Start of Bone weights & index setters!
            */

            //Reset the bonedata array
            boneIndicesAndWeights = [];

            //Loop through the bones, check if the weightValues is not undefined, if it's not it affects it!
            for (k = 0; k < mesh.m_bonesIDs.length; k++)
            {                
                //cache the bone so it's cleaner code to access the variables in it and potentially faster!
                tempBone = mesh.m_bones[ mesh.m_bonesIDs[k] ];

                if (tempBone.m_weightValues[vertexIndex] !== undefined)
                {
                    //Adds the Index, the vertexindex which I'm not too sure if needed and the weightvalue a.t.m.
                    //Index + 1, because 0 will be a uniform that's empty!                     
                    boneIndicesAndWeights.push([k + 1, tempBone.m_weightValues[vertexIndex] ]);
                } 
            }

            //If it has more than 4 values which should never or rarely happen
            if (boneIndicesAndWeights.length > 4 )
            {
                if (firstWarning === true)
                {                   
                    console.warn( "Mesh.CreateFromFbxJson: A face vertex had more than 4 bones affecting it. Chose the 4 ones that has highest weight values: " + boneIndicesAndWeights.length );
                    firstWarning = false;
                }
                
                //Selection Sort
                //Sort the data to pick the 4 ones with highest values
                for (k = 0; k < boneIndicesAndWeights.length; k++)
                {
                    //If the first 4 values have been sorted, exit for loop
                    if (k >= 4)
                    {
                        break;
                    }

                    maxValue = boneIndicesAndWeights[k];
                    lastSpot = k;
                    //Loops through the array to find right spot for k
                    for (l = k + 1;l < boneIndicesAndWeights.length; l++)
                    {
                        t_temp = boneIndicesAndWeights[l];
                        //If value2 is bigger than the first value , move value-2 to first value-1's spot up in the list, eventually 
                        //[1] because that's wher ethe weightvalue is stored
                        if (t_temp[1] > maxValue[1])
                        {
                            //sets the tempvalue to the new "max value"
                            maxValue = t_temp;
                            lastSpot = l;
                        }
                    }
                    
                    //If it found a value that was bigger than the k value, then swap it!
                    if (lastSpot !== k)
                    {                        
                        boneIndicesAndWeights[lastSpot] = boneIndicesAndWeights[k];
                        boneIndicesAndWeights[k] = maxValue;
                    }                  
                }

            }            
            
            //Loop 4 times and check if the array has data there, if not put in 0s
            for (k = 0; k < 4; k++)
            {    
                
                if (boneIndicesAndWeights[k])
                {                 
                    boneIndices.push(boneIndicesAndWeights[k][0] );
                    boneWeights.push(boneIndicesAndWeights[k][1] );
                                      
                }
                else
                {
                    boneIndices.push(0);
                    boneWeights.push(0);
                }
            }
            /*
                End of Bone weights & index setters!
            */


            //Multiply the index by 3 because vertices & normals are stored in 3 values per index so 0-> 2 is for index 0,  3-5 is for 1 e.t.c. (x, y, z values)
            vertexIndex *= 3;

            x = a_fbxMesh.vertices[vertexIndex];
            y = a_fbxMesh.vertices[vertexIndex + 1];
            z = a_fbxMesh.vertices[vertexIndex + 2];

            verticeIndexBuffer.push( x );
            verticeIndexBuffer.push( y );
            verticeIndexBuffer.push( z );

            //Calculate BoundingBox values
            //Check if vertex is tinier than current min value
            if ( x < mesh.m_minBoundingPos[0] ) mesh.m_minBoundingPos[0] = x;
            if ( y < mesh.m_minBoundingPos[1] ) mesh.m_minBoundingPos[1] = y;
            if ( z < mesh.m_minBoundingPos[2] ) mesh.m_minBoundingPos[2] = z;
            //Check if bigger than current max
            if ( x > mesh.m_maxBoundingPos[0] ) mesh.m_maxBoundingPos[0] = x;
            if ( y > mesh.m_maxBoundingPos[1] ) mesh.m_maxBoundingPos[1] = y;
            if ( z > mesh.m_maxBoundingPos[2] ) mesh.m_maxBoundingPos[2] = z;


            normalBuffer.push( -a_fbxMesh.normals[vertexIndex] );
            normalBuffer.push( -a_fbxMesh.normals[vertexIndex + 1] );
            normalBuffer.push( -a_fbxMesh.normals[vertexIndex + 2] );

            index++;
        }            
    } 
     
    //Buffers and stuff loaded
    try
    {
        //Creates the vertex buffer that is to be used!
        mesh.m_vertexBuffer = a_gl.createBuffer();
        a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_vertexBuffer);
        a_gl.bufferData( a_gl.ARRAY_BUFFER, new Float32Array( verticeIndexBuffer ), a_gl.STATIC_DRAW );
        mesh.m_vertexBuffer.itemSize = 3;
        mesh.m_vertexBuffer.numItems = verticeIndexBuffer.length / 3;

        //If it has any texture info
        if (a_fbxMesh.meshdata.uvChannelCount > 0)
        {
            mesh.m_textureCoordinates = a_gl.createBuffer();
            a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_textureCoordinates);
            a_gl.bufferData( a_gl.ARRAY_BUFFER, new Float32Array( uvBuffer ), a_gl.STATIC_DRAW );

            mesh.m_textureCoordinates.itemSize = 2;
            //*0.5 is faster than / 2! 
            mesh.m_textureCoordinates.numItems = uvBuffer.length * 0.5;
        }

        if (normalBuffer.length > 0)
        {
            mesh.m_normalBuffer = a_gl.createBuffer();
            a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_normalBuffer);
            a_gl.bufferData( a_gl.ARRAY_BUFFER, new Float32Array( normalBuffer ), a_gl.STATIC_DRAW );
            mesh.m_normalBuffer.itemSize = 3;
            mesh.m_normalBuffer.numItems = normalBuffer.length / 3;
        }
        //Currently needs to have normals in the model
        else
        {
            console.error("Models.CreateFromFbxJson: Can't find any normal data");
            return null;
        }        
        
        mesh.m_boneWeights = a_gl.createBuffer();
        a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_boneWeights);
        a_gl.bufferData( a_gl.ARRAY_BUFFER, new Float32Array( boneWeights ), a_gl.STATIC_DRAW );
        mesh.m_boneWeights.itemSize = 4;
        mesh.m_boneWeights.numItems = boneWeights.length * 0.25;

        mesh.m_boneIndex = a_gl.createBuffer();
        a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_boneIndex);
        a_gl.bufferData( a_gl.ARRAY_BUFFER, new Float32Array( boneIndices ), a_gl.STATIC_DRAW );
        mesh.m_boneIndex.itemSize = 4;
        mesh.m_boneWeights.numItems = boneIndices.length * 0.25;

    }
    catch (e)
    {
        console.error("Irinori.Model.CreateFromObj: When setting buffers error: " + e.message );
        return null;
    }

    return mesh;
};
