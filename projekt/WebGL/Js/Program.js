///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};

Irinori.StartProgram = function()
{
    Irinori.Compatibility.CheckCompatibility();

    //The scene that is passed around to few classes as a reference!  
    var m_scene = new Irinori.Scene( Irinori.HTMLTags.glcanvas );
    
    if (m_scene !== null)
    {
        //Irinori.Sprite.InitPlane( m_scene.m_gl );
        Irinori.Geometry.SetupGeometries( m_scene.m_gl );

        //Intilizes the controls such as keyboard for the application
        var m_viewerControls = new Irinori.ViewerControls();
        m_viewerControls.Initilize( m_scene );
        
        var m_sceneSettingsView = new Irinori.SceneSettingsView( m_scene.m_sceneSettings );
        
        //Initilizes the toolbar
        var m_toolbar = new Irinori.Toolbarhandler();
        
        //Initilizes the modellist viewer picker
        var m_modelListView = new Irinori.ModelListView(m_scene);
        
        //The buttons on the toolbar
        var m_toolbarButtons = new Irinori.ToolbarButtons( m_toolbar );
        
        //Time to init the toolbar buttons!
        m_toolbarButtons.InitButtons( m_modelListView, m_sceneSettingsView );
        //Create the pedestal
        new Irinori.Sprite( m_scene.m_gl, m_scene, [0, Irinori.Scene.PedestalHeight, 0], Irinori.Math.Vector3.EulerToQuaternion( [270, 0, 0] ), 8, Irinori.Paths.TextureFolder + "gray_tex.png" );
    }    
};
