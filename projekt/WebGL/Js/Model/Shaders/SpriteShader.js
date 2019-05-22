///<reference path="References.js" />

Irinori.SpriteShader = function ()
{
    //Attributes 
    this.m_vertexPositionAttribute;
    this.m_textureCoordAttribute;
    this.m_normalPositionAttribute;
    //The matrixes
    this.m_uProjMatrix;
    this.m_uViewMatrix;
    this.m_uWorldMatrix;

    Irinori.Shader.call( this );
};

//Makes shader inherit from Irinori.Shader!
Irinori.SpriteShader.prototype = new Irinori.Shader();
/*
Irinori.SpriteShader.prototype.LoadVertexShader = function ( a_gl )
{
    this.m_vertexShader = Irinori.Shader.GetCompiledShaderFromSrc( a_gl, Irinori.Paths.ShaderFolderPath + "simple_vertex.shader", Irinori.Shader.CodeType.Vertex );
};

Irinori.SpriteShader.prototype.LoadFragmentShader = function(a_gl)
{
    this.m_fragmentShader = Irinori.Shader.GetCompiledShaderFromSrc( a_gl, Irinori.Paths.ShaderFolderPath + "sprite_fragment.shader", Irinori.Shader.CodeType.Fragment );
};
*/
Irinori.SpriteShader.prototype.InitShader = function ( a_gl, a_params )
{
    //Check if the parameters had any data for vertex or fragment, if not create it
    a_params.vertex = ( a_params.vertex ) ? a_params.vertex : {};
    a_params.fragment = ( a_params.fragment ) ? a_params.fragment : {};

    //Add the path to the parameters object 
    a_params.vertex.path = Irinori.Paths.ShaderFolderPath + "simple_vertex.shader";
    a_params.fragment.path = Irinori.Paths.ShaderFolderPath + "sprite_fragment.shader";

    if ( !this.LoadShaderProgram( a_gl, a_params ) )
    {
        return;
    }

    a_gl.useProgram( this.m_shaderProgram );

    //Attribute variables
    this.m_vertexPositionAttribute = a_gl.getAttribLocation( this.m_shaderProgram, "aVertexPosition" );
    a_gl.enableVertexAttribArray( this.m_vertexPositionAttribute );

    this.m_textureCoordAttribute = a_gl.getAttribLocation( this.m_shaderProgram, "aTextureCoord" );
    a_gl.enableVertexAttribArray( this.m_textureCoordAttribute );

    this.m_normalPositionAttribute = a_gl.getAttribLocation( this.m_shaderProgram, "aNormalPosition" );
    a_gl.enableVertexAttribArray( this.m_normalPositionAttribute );

    //Uniform variables
    this.m_uProjMatrix = a_gl.getUniformLocation( this.m_shaderProgram, "uProjMatrix" );
    this.m_uViewMatrix = a_gl.getUniformLocation( this.m_shaderProgram, "uViewMatrix" );
    this.m_uWorldMatrix = a_gl.getUniformLocation( this.m_shaderProgram, "uWorldMatrix" );

    this.AddSampler( a_gl, "uDiffuseSampler", Irinori.TextureObject.Type.Diffusemap );

    this.m_loaded = true;
};

Irinori.SpriteShader.prototype.SetMatrixUniforms = function ( a_gl, a_camera )
{
    a_gl.uniformMatrix4fv( this.m_uProjMatrix, false, a_camera.m_projectionMatrix );

    a_gl.uniformMatrix4fv( this.m_uViewMatrix, false, a_camera.m_viewMatrix );
};

//Draws a sprite!
Irinori.SpriteShader.prototype.Draw = function ( a_gl, a_sprite, a_camera )
{
    try
    {       
        var textureType = Irinori.TextureObject.Type.Diffusemap;
        if ( this.m_samplers[textureType] )
        {
            //Gets a texture slot from 0 -> 4 a.t.m.
            a_gl.activeTexture( Irinori.Shader.GetTextureNumber( a_gl, 0 ) );
            
            //Binds the texture to the texture slot j 
            a_gl.bindTexture( a_gl.TEXTURE_2D, a_sprite.m_texture.m_texture );
            //Gives sampler the data from texture slot j
            a_gl.uniform1i( this.m_samplers[textureType], 0 );
        }
        
        //Binds the vertex info!
        a_gl.bindBuffer( a_gl.ARRAY_BUFFER, Irinori.Geometry.PlaneVertexBuffer );
        a_gl.vertexAttribPointer( this.m_vertexPositionAttribute, Irinori.Geometry.PlaneVertexBuffer.itemSize, a_gl.FLOAT, false, 0, 0 );

        //Texture stuff        
        a_gl.bindBuffer( a_gl.ARRAY_BUFFER, Irinori.Geometry.PlaneTextureCoordinates );
        a_gl.vertexAttribPointer( this.m_textureCoordAttribute, Irinori.Geometry.PlaneTextureCoordinates.itemSize, a_gl.FLOAT, false, 0, 0 );
        //World matrix!
        a_gl.uniformMatrix4fv( this.m_uWorldMatrix, false, a_sprite.m_worldMatrix );

        a_gl.drawArrays( a_gl.TRIANGLES, 0, Irinori.Geometry.PlaneVertexBuffer.numItems );
    }
    catch ( e )
    {
        console.error( "Irinori.SpriteShader.Draw: Unexpected error trying to draw sprite " );
        throw e;
    }
};
