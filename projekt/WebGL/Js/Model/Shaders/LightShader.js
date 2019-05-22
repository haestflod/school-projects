///<reference path="References.js" />

//A shader for a light to render it from the lights perspective
//Basicly Phongshader code but it renders depth from object instead
Irinori.LightShader = function ()
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
Irinori.LightShader.prototype = new Irinori.Shader();
