///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};

//The 3D scene that has the webgl context, models and shaders.
//Also what renders the scene
Irinori.Scene = function(a_canvas)
{
    //If the canvas doesn't exist which it should it "terminates" the program
    if (!a_canvas)
    {
        console.error( "Irinori.Scene a_canvas is not a canvas" );
        return null;
    } 
    //The canvas that 3D stuff is drawn to
    this.m_canvas = a_canvas;  
    //The gl object that is doing the opengl stuff!
    this.m_gl = null;
    //Inits the m_gl object and puts extensions that are enabled on the m_gl.m_myExtensions object    
    if ( !this.InitWebGL() )
    {
        //If InitWebGL() is false it failed to initilize webgl, basicly webgl is not supported
        return null;
    }
    //Any sprites in the scene
    this.m_sprites = [];
    //The model that is drawn
    this.m_currentModel = null;
    //Stores the models that are loaded here to speed up reloading of a model
    this.m_cachedModels = [];  
    //The shaders, loaded on demand. It will check if shader of shadertype exists, if it doesn't, load it!
    this.m_shaders = [];
    //The shader that is currently in use when rendering
    this.m_currentShaderType = Irinori.Shader.Shadertype.Phong;
    //The time of last render frame, default value is like 00:00.0 1970-01-01.  
    this.m_lastRender = 0;
    //If the render should re-render by calling requestAnimframe
    this.m_isReRendering = false;
    //The amount of "threads" that are currently using Render(), for example if user presses 5 keys it would call Render() 5 times and then it's 5 individual Render functions and to remove the extra
    //it doesn't invoke Render() again until it's only 1 renderThread
    this.m_renderThreads = 0;    
    //Used for example when there is no animation yet the model is rotating because of user setting
    //Would be a conflict in rendering code that it wants to pause it because no animations yet it should still re-render
    this.m_canPauseRender = true;
    //Used to determine if loading gif should be drawn or hidden
    this.m_loadingImageVisible = false;
    //Used to see if gl_blending is enabled
    this.m_blendModeOn = false;
    //The settings for the scene
    this.m_sceneSettings = new Irinori.SceneSettings( this );
    //Camera object which handles rotation, view and projection matrix
    this.m_camera = new Irinori.Camera( vec3.create( [0, 2, -4] ), 0, 0, 0, this.m_canvas.width, this.m_canvas.height );
    //The directional light in the scene
    var lightColor = 1;
    this.m_directionalLight = new Irinori.DirectionalLight( vec3.create( [1, 5, 5] ), vec3.create( [lightColor, lightColor, lightColor] ) );

    //Function calls

    //Clear the canvas & paint it black
    this.ClearRenderTarget();
    //Add the sprite shader
    this.TryAddShader( Irinori.Shader.Shadertype.Sprite );
};
//What Y-height value the "ground plane" is at
Irinori.Scene.PedestalHeight = 0;

//Inits the webgl object and sets up the extensions aswell
Irinori.Scene.prototype.InitWebGL = function()
{   
    ///<summary>Initiates the webgl object</summary>  
    try 
    {        
        this.m_gl = this.m_canvas.getContext("experimental-webgl"); 
        if (this.m_gl === null)
        {
            this.m_gl = this.m_canvas.getContext("webgl");
        }           
    }
    catch(e){}
    
    // If we don't have a GL context, give up now  
    if (!this.m_gl) 
    {
        alert("Unable to initialize WebGL. Your browser may not support it");
        console.error( "Irinori.Scene.InitWebGL: Unable to initialize WebGL. Application will not start" );
        return false;
    }    
    this.m_gl.blendFunc( this.m_gl.SRC_ALPHA, this.m_gl.ONE_MINUS_SRC_ALPHA );    
    this.m_gl.enable( this.m_gl.DEPTH_TEST );

    //enables culling so it doesn't draw the backside aswell 
    this.m_gl.enable(this.m_gl.CULL_FACE);
    this.m_gl.cullFace(this.m_gl.BACK);     

    return true;
};
//Shows the loadingscreen GIF
Irinori.Scene.prototype.ShowLoadingGif = function()
{
    //Gets the position of canvas, a possible optimization is to save this when scene is loaded... but hey, maybe it's being moved around!
    var position = Irinori.Tools.GetElementPosition( this.m_canvas );
    //Cache it, for speeeed
    var image = Irinori.HTMLTags.irinori_maincontent_loadingImg;
    //Half the size to move image to the left to center it
    var size = image.width * 0.5;

    image.style.marginLeft = 0;
    image.style.left = ( (position.x + this.m_canvas.width / 2) - size) + "px";
    image.style.top =  ( (position.y + this.m_canvas.height / 2) - size) + "px";
    
    Irinori.HTMLTags.irinori_maincontentDiv.appendChild( image );

    this.m_loadingImageVisible = true;
};
//Hides the loadingscreen GIF
Irinori.Scene.prototype.HideLoadingGif = function()
{
    //Safeguard against removing an element that does not exist
    if (this.m_loadingImageVisible)
    {
        Irinori.HTMLTags.irinori_maincontentDiv.removeChild( Irinori.HTMLTags.irinori_maincontent_loadingImg );

        this.m_loadingImageVisible = false;
    }    
};
//Checks if shader is already in the m_shaders list. If isn't it will add it. 
//Returns true if it added the new shader,  false if it's already added
Irinori.Scene.prototype.TryAddShader = function ( a_shadertype )
{
    var added = false;

    if ( this.m_shaders[a_shadertype] === undefined )
    {
        //The shader add the shader!
        added = true;
        var params = {};

        switch ( a_shadertype )
        {
            case Irinori.Shader.Shadertype.Phong:
                //"activate" skeletal animation
                params.vertex = { preprocessors: [Irinori.Shader.Preprocessors.skeletal_animation] };
                this.m_shaders[a_shadertype] = new Irinori.PhongShader();
                break;
            case Irinori.Shader.Shadertype.Sprite:
                this.m_shaders[a_shadertype] = new Irinori.SpriteShader();
                break;
            //If the shadertype is unknown, set added to false
            default:
                console.error( "Irinori.Scene.ChangeShader: Not a known shadertype" );
                added = false;
        }
        //If the shadertype existed also init the shader
        if ( added )
        {
            this.m_shaders[a_shadertype].InitShader( this.m_gl, params );
        }
    }   
    
    return added;
}

//Changes the active shader
Irinori.Scene.prototype.ChangeShader = function ( a_shadertype )
{
    
    //If it failed to add the shader it means it already exists
    if ( !this.TryAddShader( a_shadertype ) )
    {        
        //Check if current is the same as trying to change to
        if ( this.m_currentShaderType !== a_shadertype )
        {
            this.m_gl.useProgram( this.m_shaders[ a_shadertype ].m_shaderProgram );
        }        
    }   

    this.m_currentShaderType = a_shadertype;
};
//******************
//Model functionlity

//Adds a model.. called that incase I some day wants more than 1 model! Happens when user clicks on a model thumbnail
Irinori.Scene.prototype.AddModel = function(a_modelListItem)
{    
    //Checks if currentModel doesn't exist or that the path of current model is not the same as the selected model
    if (this.m_currentModel === null || this.m_currentModel.m_path !== a_modelListItem.m_path)
    {
        //Pauses the render thread
        this.Pause();        
        //Check if model is cached or not in the memory
        if (this.m_cachedModels[a_modelListItem.m_path] === undefined)
        {
            this.ClearRenderTarget();

            var that = this;
            var readyCallback = function () { that.IsModelReady(); };

            //Start by showing the loading gif as this might take some time!
            this.ShowLoadingGif();
           
            this.m_currentModel = new Irinori.Model(a_modelListItem.m_name, a_modelListItem.m_path, this);
            //Caches the model. Currently might be buggy if big file and swapping while it's still being dl'd.
            this.m_cachedModels[a_modelListItem.m_path] = this.m_currentModel;
            this.m_currentModel.LoadTextures( this.m_gl, a_modelListItem.m_textures, readyCallback );
            
            //This makes m_gl.useProgram() happen automatically.
            this.ChangeShader(a_modelListItem.m_shaderType);                               
            this.m_currentModel.LoadModel( this.m_gl, readyCallback );
            
            //Now when the model is ready to be loaded it should call IsModelReady()             
        }
        else
        {
            this.m_currentModel = this.m_cachedModels[a_modelListItem.m_path];
            //Gotta change to the shaderprogram of the model that is being changed to. Or it's gonna be stuck on old one!
            this.ChangeShader( this.m_currentShaderType );          
            //TODO:Possible some logic here about if model is already loaded then do InitLoadedModel() otherwise just "wait"

            this.InitLoadedModel();            
        }             
    }
};

Irinori.Scene.prototype.IsModelReady = function ()
{   
    if ( this.m_currentModel.CheckIfReady() && this.m_shaders[this.m_currentShaderType].m_loaded )
    {
        this.HideLoadingGif();
        //There is a problem that I'd like TryToPause() to be in 0 renders but a.t.m. it has to be 1 here or it's gonna be black since it never rendered anything
        this.InitLoadedModel();
    }
}

//Handles logic for re-loading a cached model or when a model is finished loading and may attempt to pause the renderer
Irinori.Scene.prototype.InitLoadedModel = function ()
{
    var renderOnce = false;

    //Check if the model has any animations
    if ( this.m_currentModel.m_animations.length !== 0 )
    {
        //If there are no animations or no selected animation, attempt to pause the renderer
        if ( this.m_currentModel.m_currentAnimation === null )
        {
            renderOnce = true;
        }

        //Setup animationChooser
        Irinori.AnimationChooser.s_animationChooser.SetupChooser( this.m_currentModel );
    }
    else
    {
        renderOnce = true;
    }

    if ( this.m_sceneSettings.TryToDisablePause() )
    {
        renderOnce = false;
    }

    this.Play( renderOnce );

};
//End of Model functionality
//**************************

//Adds a finished sprite to m_sprites and renders the scene once
Irinori.Scene.prototype.AddSprite = function ( a_sprite )
{
    this.m_sprites.push( a_sprite );
    //Since sprites have no animations it only has to render the scene once.    
    this.Play( true );
};
//Removes a sprite from m_sprites;
Irinori.Scene.prototype.RemoveSprite = function( a_sprite)
{
    var removed = false;

    for (var i = 0; i < this.m_sprites.length;)
    {
        if (this.m_sprites[i] === a_sprite)
        {
            this.m_sprites.splice( i, 1 );
            removed = true;
            break;
        }
        else
        {
            i++;
        }
    }
    //If a sprite was removed, then render once
    if ( removed )
    {
        this.Play( true );
    }

}

//Starts a render thread to continously render
//[a_renderOnce]: true if not re-rendering!
Irinori.Scene.prototype.Play = function ( a_renderOnce )
{   
    //If a_renderOnce is false, 0, undefined or null! or anything else that is false!
    if ( !a_renderOnce )
    {
        //Sets the bool to re-render
        this.m_isReRendering = true;
    }    
    //Check if a thread is already rendering, if 0 are then start a render!
    if ( this.m_renderThreads === 0 )
    {        
        //Start the "render" thread!
        this.ManualRender();
    }
};

//Stops the render threads
Irinori.Scene.prototype.Pause = function ()
{
    this.m_isReRendering = false;    
};
//Tries to stop the renderer but may not be allowed to
//[a_forcePause]: a bool if it should 
Irinori.Scene.prototype.TryToPause = function ()
{
    //Checks for false, or undefined at same time!    
    if ( this.m_canPauseRender )
    {
        this.Pause( );
    }     
};

Irinori.Scene.prototype.TryToAllowPause = function ()
{
    var canPause = true;
    //TODO: logic if animation is paused then can't pause
    //canPause = false;

    if ( canPause )
    {
        this.EnablePause();
    }
    //returns true/false if it could pause
    return canPause;
};
//Sets m_canpauseRender = true, allowing the TryToPause() to pause
Irinori.Scene.prototype.EnablePause = function ()
{
    this.m_canPauseRender = true;
}
//Sets this.m_canPauseRender = false
Irinori.Scene.prototype.DisablePause = function ()
{
    this.m_canPauseRender = false;
};

//Starts a render thread to call the Render()
Irinori.Scene.prototype.ManualRender = function()
{     
    this.m_renderThreads++;

    var currentTime = new Date();
    if ( currentTime - this.m_lastRender > 100 )
    {
        this.m_lastRender = currentTime;
    }
    
    this.Render( new Date() );    
};
//Paints the canvas in a color, default is black
Irinori.Scene.prototype.ClearRenderTarget = function ( r, g ,b ,a )
{
    if ( !r ) r = 0;
    if ( !g ) g = 0;
    if ( !b ) b = 0;
    if ( a === undefined ) a = 1;

    this.m_gl.viewport( 0, 0, this.m_camera.m_width, this.m_camera.m_height );
    //The color of the background
    this.m_gl.clearColor(r, g, b, a );
    this.m_gl.clear( this.m_gl.COLOR_BUFFER_BIT | this.m_gl.DEPTH_BUFFER_BIT );
};
//Enable the blendmode
Irinori.Scene.prototype.EnableBlendMode = function ()
{
    //If the blendmode is disabled then activate it, no need otherwise
    if ( !this.m_blendModeOn )
    {
        this.m_blendModeOn = true;
        this.m_gl.enable( this.m_gl.BLEND );
    }
};
//Disables blendmode
Irinori.Scene.prototype.DisableBlendMode = function ()
{
    //Check if blendmode is activated, if it is, disable!
    if ( this.m_blendModeOn )
    {
        this.m_blendModeOn = false;
        this.m_gl.disable( this.m_gl.BLEND );
    }
};

//This function is called by ManualRender and Irinori.Tools.requestAnimFrame
//a_elapsedTime: should be new Date();    
Irinori.Scene.prototype.Render = function(a_elapsedTime)
{
    //Paints the canvas black
    this.ClearRenderTarget();
    
    var elapsedTime = a_elapsedTime - this.m_lastRender;
    //if greater than 100 milli seconds
    if ( elapsedTime > 100 )
    {
        elapsedTime = 100;
    }
    //If this.m_lastRender for some reason was in the future elapsed would be negative
    else if ( elapsedTime < 0 )
    {
        elapsedTime = 0;
    }
    
    //Converts milliseconds into seconds
    elapsedTime *= 0.001;
    //Renders the model
    this.RenderModel( elapsedTime, this.m_currentModel );

    this.RenderSprites();
        
    this.m_lastRender = a_elapsedTime;

    //Check if re-rendering and if renderThreads is only 1,  if it's more don't re-render and decrease the renderThread count
    //Also don't re-render if it's not supposed to!
    if ( this.m_isReRendering && this.m_renderThreads === 1 )
    {
        Irinori.Tools.requestAnimFrame( this );
    }
    else
    {       
        this.m_renderThreads--;                
    }

    //DEBUG: Just debug tool to see if it ever goes below 0!
    if ( this.m_renderThreads < 0 )
    {
        console.error( "Irinori.Scene.Render: renderThreads is below 0 :" + this.m_renderThreads );
    }   
};

//Renders a model
Irinori.Scene.prototype.RenderModel = function ( a_elapsedTime, a_model )
{
    if ( a_model )
    {
        if ( a_model.m_ready && this.m_shaders[this.m_currentShaderType].m_loaded )
        {            
            this.ChangeShader( Irinori.Shader.Shadertype.Phong );
            this.DisableBlendMode();
            //If model is supposed to rotate
            if ( this.m_sceneSettings.m_modelIsRotating )
            {
                a_model.Rotate(
                    [a_elapsedTime * this.m_sceneSettings.m_rotationSpeed[0],
                        a_elapsedTime * this.m_sceneSettings.m_rotationSpeed[1],
                        a_elapsedTime * this.m_sceneSettings.m_rotationSpeed[2]
                    ] );
            }

            //try catch isn't really neccesary but it's hard to catch opengl errors otherwise
            try
            {
                if ( a_model.m_currentAnimation !== null )
                {
                    a_model.m_currentAnimation.Update( a_elapsedTime );
                }

                this.m_shaders[this.m_currentShaderType].Draw( this.m_gl, a_model, this.m_camera, this.m_directionalLight );
            }
            catch ( e )
            {
                console.error( "Irinori.Scene.Render: Error when drawing model error: " + e.message );
                this.Pause();
            }
        }
        else
        {

        }
    }//end of if ( this.m_currentModel !== null )
    else
    {
        this.Pause();
    }
};
//Renders all of the sprites
Irinori.Scene.prototype.RenderSprites = function ()
{
    //Checks if the shader is loaded
    if ( !this.m_shaders[Irinori.Shader.Shadertype.Sprite].m_loaded )
    {
        return;
    }

    this.ChangeShader( Irinori.Shader.Shadertype.Sprite );
    this.EnableBlendMode();
    
    this.m_shaders[this.m_currentShaderType].SetMatrixUniforms( this.m_gl, this.m_camera);

    for ( var i = 0; i < this.m_sprites.length; i++ )
    {
        var sprite = this.m_sprites[i];

        //All sprites should be loaded when they are in this list tho!
        if ( sprite.m_loaded )
        {
            this.RenderSprite( sprite );
        }
        //DEBUG: just to see if this happens!
        else
        {
            console.log( "Irinori.Scene.RenderSprites: sprite not loaded" );
        }
    }
};
//Renders a sprite
Irinori.Scene.prototype.RenderSprite = function ( a_sprite )
{
    try
    {        
        this.m_shaders[Irinori.Shader.Shadertype.Sprite].Draw( this.m_gl, a_sprite, this.m_camera );
    }
    catch ( e )
    {
        console.error( "Irinori.Scene.RenderSprite: sprite failed to draw, it has been removed" );
        this.RemoveSprite( a_sprite );
    }

    
};
