/// <reference path="References.js" />
window.Irinori = window.Irinori || {};
window.Irinori.HTMLTags = window.Irinori.HTMLTags || {};
//Get the tags that are used by many files here, then store them locally cached in the function they are used

//Currently called by scriptloader
Irinori.HTMLTags.LoadTags = function()
{
    //The body tag!  would be a tiny problem if there were 2 body tags... but there never are!      
    Irinori.HTMLTags.body = document.body;
    //The canvas that content is rendered to
    Irinori.HTMLTags.glcanvas = document.getElementById( "glcanvas" );
    //The div that has the app inside it
    Irinori.HTMLTags.irinori_maincontentDiv = document.getElementById("irinori_maincontent");
    //This tag is gonna be removed & re-added to irinori_maincontent quite a bit
    Irinori.HTMLTags.irinori_maincontent_loadingImg = document.getElementById( "irinori_maincontent_loading" );
    //The list that has .. had the items!
    Irinori.HTMLTags.modellistDiv = document.getElementById( "modellist" );
    //The div that has the different animation choices!
    Irinori.HTMLTags.animationChoicesDiv = document.getElementById( "animationChoices" );
    //The toolbar div
    Irinori.HTMLTags.toolbarDiv = document.getElementById( "toolbar" );
    //The different messages the application can have or something... (under toolbar)
    Irinori.HTMLTags.toolbar_contentDiv = document.getElementById( "toolbar_content" );
    //Button for show/hide the model settings
    Irinori.HTMLTags.toolbar_scenesettingsA = document.getElementById( "toolbar_scenesettings" );
    //The button for instructions on the toolbar
    Irinori.HTMLTags.toolbar_instructionsA = document.getElementById( "toolbar_instructions" );
    //Button for toggling between the different listviewers
    Irinori.HTMLTags.toolbar_listviewertoggleA = document.getElementById( "toolbar_listviewertoggle" );
};
