///<reference path="References.js" />

//Renders the pedestal and the shadow from the scene on it!
//EVALUATE: Is it really needed or is a Phongshader or similar enough!
Irinori.PedestalShader = function ()
{
    Irinori.Shader.call( this );
};

//Makes shader inherit from Irinori.Shader!
Irinori.PedestalShader.prototype = new Irinori.Shader();
