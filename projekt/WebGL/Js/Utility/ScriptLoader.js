/// <reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};
if (window.Irinori.Tools === undefined) window.Irinori.Tools = {};

//Loads all the Javascripts for Irinori
Irinori.Tools.ScriptLoader = function()
{
    //The scripts that are going to be loaded, once loaded it's removed from this list
    this.m_currentScripts = [];
    //The amount of scripts loaded asyncrhonously
    this.m_asyncScriptsCount = 0;
    //The amount of async scripts that has finished loading
    this.m_asyncScriptsLoaded = 0;    
    //A failsafe bool to make sure all the synchronous scripts are loaded
    this.m_syncFinished = false;
    //The tag that the scripts are appended to, I chose the body
    this.m_appendTag = null;

    this.LoadAllScripts();
};
//Checks if the filename is a .js file or not. If it is not
Irinori.Tools.ScriptLoader.prototype.HandleFileExtension = function ( a_filename )
{
    var extension = a_filename.split( "." );
    var extensionLength = extension.length;
    extension = extension[extensionLength - 1];
    
    if ( extensionLength === 1 || extension !== "js" )
    {
        //Appends .js to the filename if filename was abc  or ab.c  
        a_filename = a_filename + ".js";
    }
       
    return a_filename;
};

//Adds a script to m_currentScripts list
Irinori.Tools.ScriptLoader.prototype.AddScript = function (a_filename)
{
    //To find out the file extension
    a_filename = this.HandleFileExtension( a_filename );
    
    var script = Irinori.Tools.CreateHTMLElement( "script", [["src", a_filename], ["type", "text/javascript"], ] );

    var that = this;

    Irinori.Tools.addEvent( script, "load", function ()
    {
        that.LoadScript();
    } );
    
    this.m_currentScripts.push(script);
};
//Adds a script to load asynchronously
Irinori.Tools.ScriptLoader.prototype.AddAsyncScript = function ( a_filename )
{
    a_filename = this.HandleFileExtension( a_filename );

    var that = this;

    var script = Irinori.Tools.CreateHTMLElement( "script", [["src", a_filename], ["type", "text/javascript"], ["async", true]] );

    Irinori.Tools.addEvent( script, "load", function ()
    {
        that.AsyncScriptLoaded();
    } );    

    this.m_asyncScriptsCount++;
    //Adds the script to the body so it starts to be interpreted by the browser
    this.m_appendTag.appendChild( script );
    
};
//Checks if the synchronous and asynchronous scripts are loaded, if they are start the application
Irinori.Tools.ScriptLoader.prototype.TryToStart = function ()
{
    if (this.m_syncFinished && ( this.m_asyncScriptsCount === this.m_asyncScriptsLoaded ) )
    {        
        Irinori.StartProgram();
    }
};
//Invoked when an async script loads
Irinori.Tools.ScriptLoader.prototype.AsyncScriptLoaded = function ()
{
    this.m_asyncScriptsLoaded++;

    this.TryToStart();
};

//Appends a script to the body which will call this function again until no scrips left to load 
Irinori.Tools.ScriptLoader.prototype.LoadScript = function()
{
    //If there is more than 1 or more script left
    if (this.m_currentScripts.length > 0)
    {
        var script = this.m_currentScripts[0];
        this.m_currentScripts.splice( 0, 1 );
        this.m_appendTag.appendChild(script);
    }
    //The last script that was added ends up here!
    else
    {
        this.m_syncFinished = true;
        this.TryToStart();
    }  
};

Irinori.Tools.ScriptLoader.prototype.LoadAllScripts = function()
{    
    //HTML tags are initilized here through document.getElementById
    Irinori.HTMLTags.LoadTags();
    //Does the compatibility checks, depending on result it might load different scripts
    Irinori.Compatibility.CheckCompatibility();

    var scriptsDiv = Irinori.Tools.CreateHTMLElement( "div", ["id", "Irinori_Scripts"] );
    Irinori.HTMLTags.body.appendChild( scriptsDiv );

    this.m_appendTag = scriptsDiv;//Irinori.HTMLTags.body;
    //Loading ALMOST all scripts, loading Minortools and Paths and HTMLTags separate as they provide stuff needed by this class
    //Also not loading FeatureCompatibility.js because I'd have to make a new LoadScript() function as it has to be loaded before certain scripts
    /*
        Async Scripts
    */
    
    //External Library files
    this.AddAsyncScript( Irinori.Paths.JScripts.LibFolder + "glMatrix-9-5-0-min" );
    //Utility stuff
    this.AddAsyncScript( Irinori.Paths.JScripts.UtilityFolder + "Mathlib" );
    this.AddAsyncScript( Irinori.Paths.JScripts.UtilityFolder + "Ajax" );

    //Model stuff
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Bone" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Mesh" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Model" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "AnimationKey" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "AnimationCurveTransform" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "AnimationNode" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "AnimationData" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Skeleton" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Scene" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "SceneSettings" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Sprite" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Camera" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "TextureObject" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Lights" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ModelFolder + "Geometries" );

    //View stuff    
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "AnimationChooser" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "ViewerControls" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "Toolbarhandler" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "ToolbarButtons" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "ModelListItem" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "ModelListView" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "ModelListGridView" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "ModelListSliderView" );
    this.AddAsyncScript( Irinori.Paths.JScripts.ViewFolder + "SceneSettingsView" );
    
    this.AddAsyncScript( Irinori.Paths.JScripts.Root + "Program" );
    /*
        Sync Scripts
    */
    //Shaders
    this.AddScript( Irinori.Paths.JScripts.Model_ShaderFolder + "Shader" );
    this.AddScript( Irinori.Paths.JScripts.Model_ShaderFolder + "PhongShader" );
    this.AddScript( Irinori.Paths.JScripts.Model_ShaderFolder + "SpriteShader" );

    //Stars loading em 1 by 1! in the order they were added through AddScript()
    this.LoadScript();     
};
//The "load" function when webpage has finished loading its HTML elements
Irinori.Tools.addEvent(window, "load", function()
{
    var scriptLoader = new Irinori.Tools.ScriptLoader();
} );


