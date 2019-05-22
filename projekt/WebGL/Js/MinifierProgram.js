/// <reference path="References.js" />


//MinifieProgram.js basicly replaces ScriptLoader.js since all the code files are already loaded.
//
Irinori.Tools.addEvent(window, "load", function()
{ 
    Irinori.HTMLTags.LoadTags();

    Irinori.Compatibility.CheckCompatibility();

    Irinori.StartProgram();
} );
