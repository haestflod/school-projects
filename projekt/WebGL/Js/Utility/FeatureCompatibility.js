/// <reference path="References.js" />
window.Irinori = window.Irinori || {};
window.Irinori.Compatibility = window.Irinori.Compatibility || {};
//If CheckComaptibility function has been run!
Irinori.Compatibility.hasChecked = false;

//Checks for HTML compatibility with certain elements
//Called by ScriptLoader or MinifierProgram
Irinori.Compatibility.CheckCompatibility = function ()
{
    //Check for slider compatibility used at:
    //scenesettingsview
    var slider = Irinori.Tools.CreateHTMLElement( "input", ["type", "range"] );
    Irinori.Compatibility.sliderSupport = slider.type === "range" ? true : false;

    Irinori.Compatibility.hasChecked = true;
};
