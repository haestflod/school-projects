///<reference path="References.js" />

if (window.Irinori === undefined) window.Irinori = {};

Irinori.PhongShader = function()
{     
    Irinori.Shader.call(this);

    //Hardcoded a.t.m., not sure how to get it from the shader
    this.m_maxBoneCount = Irinori.Shader.s_maxBones;
    //If shader has skeletonAnimations activated
    this.m_skeletonAnimation = false;

    //Attributes in the shader
    this.m_vertexPositionAttribute;
    this.m_textureCoordAttribute;
    this.m_normalPositionAttribute;    

    //Holds [u]niform location in the shader
    this.m_uProjMatrix;
    this.m_uViewMatrix; 
    this.m_uWorldMatrix;

    //uniform for DirectionalLight
    this.m_uDirectionalLight = { "lightDirection": null, "lightColor": null };

    //If skeletal animation is enabled then it will set those variables too
    //this.m_aBoneWeight;
    //this.m_aBoneIndex;
    //this.m_aBoneCount;
    
    //The bone transform uniform   
    //this.m_uBoneTransformsQR = [];
    //this.m_uBoneTransformsQT = [];

    //this.m_qr = new Float32Array(4);
    //this.m_qt = new Float32Array(4);    

      
};
//Makes PhongShader inherit from Irinori.Shader!
Irinori.PhongShader.prototype = new Irinori.Shader();

//Creates the shaderprogram, sets the vertex & fragment shader, Sets all uniforms and attributes from the glsl code, sets all textures 
//a_gl: the webgl object
//[a_params]: parameters for the shader 
Irinori.PhongShader.prototype.InitShader = function ( a_gl, a_params )
{      
    var i;
    //Check if the parameters had any data for vertex or fragment, if not create it
    if (!a_params.vertex) a_params.vertex = {};
    if ( !a_params.fragment ) a_params.fragment = {};    

    //Add the path to the parameters object 
    a_params.vertex.path = Irinori.Paths.ShaderFolderPath + "phong_vertex.shader";
    a_params.fragment.path = Irinori.Paths.ShaderFolderPath + "phong_fragment.shader";

    //If it fails to load the vertex & shader program 
    if ( !this.LoadShaderProgram( a_gl, a_params ) )
    {
        return;
    }    
    //Set the loaded shader as active shader
    a_gl.useProgram(this.m_shaderProgram);

    //Get shader variables!  

    //Attribute variables
    this.m_vertexPositionAttribute = a_gl.getAttribLocation(this.m_shaderProgram, "aVertexPosition");
    a_gl.enableVertexAttribArray(this.m_vertexPositionAttribute);
    
    this.m_textureCoordAttribute = a_gl.getAttribLocation(this.m_shaderProgram, "aTextureCoord");
    a_gl.enableVertexAttribArray(this.m_textureCoordAttribute);

    this.m_normalPositionAttribute = a_gl.getAttribLocation(this.m_shaderProgram, "aNormalPosition");
    a_gl.enableVertexAttribArray(this.m_normalPositionAttribute);    

    //Uniform variables
    this.m_uProjMatrix = a_gl.getUniformLocation(this.m_shaderProgram, "uProjMatrix");
    this.DecreaseAvailibleUniforms(4);

    this.m_uViewMatrix = a_gl.getUniformLocation(this.m_shaderProgram, "uViewMatrix"); 
    this.DecreaseAvailibleUniforms(4);

    this.m_uWorldMatrix = a_gl.getUniformLocation(this.m_shaderProgram, "uWorldMatrix");
    this.DecreaseAvailibleUniforms(4);

    this.m_uDirectionalLight.lightDirection = a_gl.getUniformLocation(this.m_shaderProgram, "uDirectionalLight.m_lightDir");
    this.m_uDirectionalLight.lightColor = a_gl.getUniformLocation(this.m_shaderProgram, "uDirectionalLight.m_lightColor");
    this.DecreaseAvailibleUniforms( 2 );   
    
    //If there are any preprocessors
    if ( a_params.vertex.preprocessors )
    {
        //Loop through the preprocessors to find out which ones there are
        for ( i = 0; i < a_params.vertex.preprocessors.length; i++ )
        {
            if ( a_params.vertex.preprocessors[i] === Irinori.Shader.Preprocessors.skeletal_animation )
            {
                this.m_skeletonAnimation = true;               
            }
        }
        //If skeletal animation
        if ( this.m_skeletonAnimation )
        {
            //Skeletal animation uniforms and attributes

            this.m_aBoneWeight = a_gl.getAttribLocation( this.m_shaderProgram, "aBoneWeight" );
            a_gl.enableVertexAttribArray( this.m_aBoneWeight );

            this.m_aBoneIndex = a_gl.getAttribLocation( this.m_shaderProgram, "aBoneIndex" );
            a_gl.enableVertexAttribArray( this.m_aBoneIndex );

            this.m_aBoneCount = a_gl.getAttribLocation( this.m_shaderProgram, "aBoneCount" );
            a_gl.enableVertexAttribArray( this.m_aBoneCount );

            this.m_qr = new Float32Array(4);
            this.m_qt = new Float32Array(4);    

            this.m_uBoneTransformsQR = [];
            this.m_uBoneTransformsQT = [];

            var location;
            //Gets the location of all the bone transform arrays
            for ( i = 0; i < this.m_maxBoneCount; i++ )
            {
                location = "uBoneTransformsQR[" + i + "]";
                this.m_uBoneTransformsQR[i] = a_gl.getUniformLocation( this.m_shaderProgram, location );

                location = "uBoneTransformsQT[" + i + "]";
                this.m_uBoneTransformsQT[i] = a_gl.getUniformLocation( this.m_shaderProgram, location );
            }

            this.DecreaseAvailibleUniforms( this.m_maxBoneCount * 2 );
        }        
    }

    this.AddSampler( a_gl, "uDiffuseSampler", Irinori.TextureObject.Type.Diffusemap );
    this.AddSampler( a_gl, "uNormalSampler", Irinori.TextureObject.Type.Normalmap );
    this.DecreaseAvailibleUniforms( 2 );

    this.m_loaded = true;       
};

Irinori.PhongShader.prototype.SetMatrixUniforms = function(a_gl,a_camera,a_model, a_directionalLight)
{
    a_gl.uniformMatrix4fv(this.m_uProjMatrix, false, a_camera.m_projectionMatrix);

    a_gl.uniformMatrix4fv(this.m_uViewMatrix, false, a_camera.m_viewMatrix);

    a_gl.uniform3f(this.m_uDirectionalLight.lightDirection, a_directionalLight.m_lightDirection[0], a_directionalLight.m_lightDirection[1], a_directionalLight.m_lightDirection[2]);
    a_gl.uniform3f(this.m_uDirectionalLight.lightColor, a_directionalLight.m_lightColor[0], a_directionalLight.m_lightColor[1], a_directionalLight.m_lightColor[2]);
};

Irinori.PhongShader.prototype.Draw = function(a_gl, a_model, a_camera, a_directionalLight)
{    
    ///<summary> Draws a model using the shader code e.t.c. </summary>
    try
    {
        var i, j, mesh, index,
        textureType,
        transformArray;
                     
        for (i = 0, j = 0; i < a_model.m_textures.length; i++) 
        {        
            textureType = a_model.m_textures[i].m_textureType;
            //Check if a sampler exists for that type of texture     
            if ( this.m_samplers[ textureType ] )
            {
                //Gets a texture slot from 0 -> 4 a.t.m.
                a_gl.activeTexture(Irinori.Shader.GetTextureNumber(a_gl , j));

                //Binds the texture to the texture slot j 
                a_gl.bindTexture(a_gl.TEXTURE_2D, a_model.m_textures[i].m_texture );
                //Gives sampler the data from texture slot j
                a_gl.uniform1i( this.m_samplers[textureType] , j);
                //If it used i instead of j it'd have holes in the texture slots
                j++;
            }          
        }        
        
        this.SetMatrixUniforms(a_gl,a_camera , a_model, a_directionalLight);

        for (i = 0; i < a_model.m_meshes.length; i++)
        {               
            mesh = a_model.m_meshes[i];
            if ( this.m_skeletonAnimation )
            {
                var boneCount = mesh.m_boneTransforms.length;

                for (j = 0; j < boneCount; j++)
                {
                    if (j >= this.m_maxBoneCount)
                    {
                        break;
                    }
                    transformArray =  mesh.m_boneTransforms[j];

                    this.m_qr[0] = transformArray[0];
                    this.m_qr[1] = transformArray[1];
                    this.m_qr[2] = transformArray[2];
                    this.m_qr[3] = transformArray[3];
                
                    this.m_qt[0] = transformArray[4];
                    this.m_qt[1] = transformArray[5];
                    this.m_qt[2] = transformArray[6];
                    this.m_qt[3] = transformArray[7];
                
                    a_gl.uniform4f(this.m_uBoneTransformsQR[j], this.m_qr[0], this.m_qr[1], this.m_qr[2], this.m_qr[3] );

                    a_gl.uniform4f(this.m_uBoneTransformsQT[j], this.m_qt[0], this.m_qt[1], this.m_qt[2], this.m_qt[3]);
                }                       
                //Bone attribute info
                a_gl.bindBuffer(a_gl.ARRAY_BUFFER , mesh.m_boneWeights);
                a_gl.vertexAttribPointer(this.m_aBoneWeight, mesh.m_boneWeights.itemSize , a_gl.FLOAT, false, 0 , 0);

                a_gl.bindBuffer(a_gl.ARRAY_BUFFER , mesh.m_boneIndex);
                a_gl.vertexAttribPointer(this.m_aBoneIndex, mesh.m_boneIndex.itemSize , a_gl.FLOAT, false, 0 , 0);
            }
            //Binds the vertex info!
            a_gl.bindBuffer(a_gl.ARRAY_BUFFER , mesh.m_vertexBuffer);
            a_gl.vertexAttribPointer(this.m_vertexPositionAttribute, mesh.m_vertexBuffer.itemSize , a_gl.FLOAT, false, 0 , 0);

            //Texture stuff
            if (a_model.m_meshes[i].m_textureCoordinates)
            {
                a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_textureCoordinates);
                a_gl.vertexAttribPointer(this.m_textureCoordAttribute, mesh.m_textureCoordinates.itemSize, a_gl.FLOAT, false, 0, 0);
            }            
            //Normal info
            a_gl.bindBuffer(a_gl.ARRAY_BUFFER, mesh.m_normalBuffer);
            a_gl.vertexAttribPointer(this.m_normalPositionAttribute, mesh.m_normalBuffer.itemSize, a_gl.FLOAT, false, 0, 0);
               
            a_gl.uniformMatrix4fv(this.m_uWorldMatrix, false, mesh.m_worldMatrix);
            
            //Draws the MESH
            a_gl.drawArrays(a_gl.TRIANGLES, 0 , mesh.m_vertexBuffer.numItems);
            
            //Wireframe mode test!
            //a_gl.drawArrays(a_gl.LINES, 0 , mesh.m_vertexBuffer.numItems);
        }
    }
    catch (e)
    {        
        console.error("Irinori.PhongShader.Draw: Unexpected error: " + e.message);
    }   
};
