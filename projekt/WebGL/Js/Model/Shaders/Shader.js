///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};

Irinori.Shader = function()
{
    //The compiled shader from the shader code
    this.m_vertexShader = null;
    this.m_fragmentShader = null;   
    //If model is loaded or not
    this.m_loaded = false;    
    
    //Sampler references to the samplers in shader code
    //stored as dictionary< TextureObject.Type, Reference >   
    this.m_samplers = [];

    //DEBUG:A number of availible uniforms
    this.m_availibleUniforms = Irinori.Shader.s_maxUniforms;
    //The shaderprogram that has a vertex & fragment shader in it
    this.m_shaderProgram = null;    
};

//Enumerator on what kind of shaders exists
Irinori.Shader.Shadertype = { "Phong": 0, "Sprite": 1 };
//The different types of shader code types there are
Irinori.Shader.CodeType = { "Vertex": 0, "Fragment": 1 };

//Maximum of uniforms that opengl es 2.0 allows
Irinori.Shader.s_maxUniforms = 128;
//The maximum amount of bone ... which shouldn't be here ideally!
Irinori.Shader.s_maxBones = 40;
//Different preprocessors
Irinori.Shader.Preprocessors = { skeletal_animation: "#define SKELETAL" };

/*
    Functions that a more specific shader has to overload
*/
//The function to create the shader, it loads the shader code and sets up all the other information
Irinori.Shader.prototype.InitShader = function(a_gl, a_params ) {};

/*
    Functions that needs parameters to be overloaded aswell
*/
//The draw function of the shader
//Tip for function construction: ( a_gl, a_thing, a_camera, a_lights )
Irinori.Shader.prototype.Draw = function(a_gl) {};
//Takes the data from model and sets the uniform data
Irinori.Shader.prototype.SetMatrixUniforms = function ( a_gl ) {};
/*
    Functions that are constant!
*/
//DEBUG:Used as a debugging tool.. to calculate how many uniforms that are used!
Irinori.Shader.prototype.DecreaseAvailibleUniforms = function ( a_amount )
{
    this.m_availibleUniforms -= a_amount;
};
//Sets the m_shaderProgram and loads vertex & fragment shader
Irinori.Shader.prototype.LoadShaderProgram = function ( a_gl, a_params )
{
    if ( !a_gl)
    {
        console.error( "Irinori.PhongShader.InitShader: Needs a_gl object!" );
        return false;
    }
    
    this.m_vertexShader = Irinori.Shader.LoadShader( a_gl, Irinori.Shader.CodeType.Vertex , a_params.vertex );
    this.m_fragmentShader = Irinori.Shader.LoadShader( a_gl, Irinori.Shader.CodeType.Fragment, a_params.fragment );

    if ( !this.m_vertexShader || !this.m_fragmentShader )
    {
        console.error( "Irinori.Shader.LoadShaderProgram: Failed to compile vertex or fragment shader" );
        return false;
    }

    this.m_shaderProgram = a_gl.createProgram();
    a_gl.attachShader( this.m_shaderProgram, this.m_vertexShader );
    a_gl.attachShader( this.m_shaderProgram, this.m_fragmentShader );
    a_gl.linkProgram( this.m_shaderProgram );

    // If creating the shader program failed, alert  
    if ( !a_gl.getProgramParameter( this.m_shaderProgram, a_gl.LINK_STATUS ) )
    {
        console.error( "Irinori.Shader.LoadShaderProgram: Unable to initialize the shader program! " + a_gl.getProgramInfoLog( this.m_shaderProgram ) );

        try
        {
            a_gl.deleteProgram( this.m_shaderProgram );
            a_gl.deleteProgram( this.m_vertexShader );
            a_gl.deleteProgram( this.m_fragmentShader );
        }
        catch ( e )
        {
            console.warn( "Irinori.Shader.LoadShaderProgram: Could not delete the shader program: " );
        }
        return false;
    }

    return true;
};

//Add a sampler of a specific type
Irinori.Shader.prototype.AddSampler = function ( a_gl, a_samplerName, a_textureType )
{
    if ( a_textureType === undefined )
    {
        console.error( "Irinori.Shader.AddSampler: a_textureType can not be undefined" );
        return;
    }

    var sampler = a_gl.getUniformLocation( this.m_shaderProgram, a_samplerName );

    if ( sampler !== null )
    {
        //Add the sampler to the samplers list
        this.m_samplers[a_textureType] = sampler;
    }
    else
    {
        console.warn( "Irinori.Shader.AddSampler: Could not reach " + a_samplerName + " , was probably optimized away in the shadercode" );
    }
};
//Static functions

//Loads a shader and then returns it
Irinori.Shader.LoadShader = function ( a_gl, a_codeType , a_params )
{
    var shader = Irinori.Shader.GetCompiledShaderFromSrc( a_gl, a_params.path, a_codeType, Irinori.Shader.GetPreprocessors( a_params.preprocessors ) );

    return shader;
};

//<summary>Gets shader source code from tag ID from a script tag. Then checks the script type to make it vertex or fragment shader </summary>
//a_gl: the webGL object 
//a_path: The path to the shader src file
//a_codeType: the type of shader, eg: vertex / fragment
//a_header: a header with additional shader code that is added before the actual code
Irinori.Shader.GetCompiledShaderFromSrc = function(a_gl, a_path, a_codeType, a_header)
{	
    var shader = null;
    
    Irinori.Ajax.ReadFile(a_path, function (a_shaderCode)
    {        
        var theSource = a_shaderCode;
         
        switch (a_codeType)
        {
            case Irinori.Shader.CodeType.Vertex:
                shader = a_gl.createShader(a_gl.VERTEX_SHADER);
                break;
            case Irinori.Shader.CodeType.Fragment:
                shader = a_gl.createShader(a_gl.FRAGMENT_SHADER);
                break;
            // Unknown shader type
            default:
                console.error("Shader.GetCompiledShaderFromSrc: found an unknown shader type, not vertex or fragment shader");
                return null;  
        }        

        // Send the source to the shader object  
        a_gl.shaderSource(shader, a_header + theSource);

        // Compile the shader program  
        a_gl.compileShader(shader);
        
        // See if it compiled successfully  
        if (!a_gl.getShaderParameter(shader, a_gl.COMPILE_STATUS))
        {
            console.error( "Irinori.GetCompiledShaderFromSrc: An error occurred compiling the shaders: " + a_gl.getShaderInfoLog( shader ) );
            a_gl.deleteShader( shader );
            return null;
        }

        
    }, false);
    
    return shader;
};

//Loops through an array of preprocessors and returns a string 
Irinori.Shader.GetPreprocessors = function ( a_preprocessors )
{
    var header = "";
    //Check if a_preprocessors isn't undefined
    if ( a_preprocessors )
    {
        for ( var i = 0; i < a_preprocessors.length; i++ )
        {
            header += a_preprocessors[i] + "\n";
        }
    }    

    return header;
};

//Used in shaders draw function to get a texture slot memory adress
//Returns a_gl.TEXTURE[X]  where [X] = a_id
Irinori.Shader.GetTextureNumber = function(a_gl, a_id)
{  
    if (a_id < 0 || a_id > 24)
    {
       console.error("Shader.GetTextureNumber: a_id is not within 0 -> 24, the amount of texture slots availible");
       return null;
    }
    
    switch(a_id)
    {        
        case 0:
            return a_gl.TEXTURE0;
        case 1:
            return a_gl.TEXTURE1;
        case 2:
            return a_gl.TEXTURE2;
        case 3:
            return a_gl.TEXTURE3;   
    }
};


