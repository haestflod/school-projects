/// <reference path="References.js" />

Irinori.ToolbarButtons = function (a_toolbarHandler)
{
    this.m_toolbarHandler = a_toolbarHandler;
};
//Sets up all the buttons in the toolbar and must have the parameter info since it's transfered to the different specialized button
Irinori.ToolbarButtons.prototype.InitButtons = function ( a_modellistview, a_sceneSettingsView )
{
    //Button to show/hide model settings
    this.InitSceneSettings( a_sceneSettingsView );
    //The button to show help instructions
    this.InitInstructions();
    //Inits the toggle button, as it needed the function to toggle
    this.InitListViewerToggle( a_modellistview );    
};
//Sets up the scene settings toolbar button
Irinori.ToolbarButtons.prototype.InitSceneSettings = function ( a_sceneSettingsView )
{
    var toolbarAtag = Irinori.HTMLTags.toolbar_scenesettingsA;

    var that = this;

    var onClick = function ()
    {
        that.m_toolbarHandler.HandleMessage( a_sceneSettingsView.m_sceneSettingsViewDiv, toolbarAtag );
    }

    this.m_toolbarHandler.AddToolbarButton( toolbarAtag, onClick );
};

//Sets up the instruction toolbar button
Irinori.ToolbarButtons.prototype.InitInstructions = function()
{
    //The <a> tag
    var toolbarAtag = Irinori.HTMLTags.toolbar_instructionsA;
    var that = this;

    //document.createElement("p");
    
    var message = "Instructions: To move camera use WASD. To rotate camera use the arrow keys.";
    message += "<br/>To change model click on one of the thumbnails.";

    var messageP = Irinori.Tools.CreateHTMLElement( "p", message );

    //messageP.innerHTML = message;

    var onClick = function ()
    {
        that.m_toolbarHandler.HandleMessage( messageP, toolbarAtag );
    };

    this.m_toolbarHandler.AddToolbarButton( toolbarAtag, onClick );
};

//Sets up the ListViewerToggle toolbar button
Irinori.ToolbarButtons.prototype.InitListViewerToggle = function ( a_modellistview )
{
    //The <a> tag
    var toolbarAtag = Irinori.HTMLTags.toolbar_listviewertoggleA;

    //Seems that it has to be written like this to make the actual click happen! -- Odd!
    var onClick = function ()
    {
        a_modellistview.ToggleSliderGrid();
    }

    this.m_toolbarHandler.AddToolbarButton( toolbarAtag, onClick );
};

