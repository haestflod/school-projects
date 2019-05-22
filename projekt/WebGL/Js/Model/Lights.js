/// <reference path="References.js" />
window.Irinori = window.Irinori || {};

Irinori.PointLight = function(a_lightPosition, a_lightColor, a_radius)
{
    ///<summary> Struct of a pointlight (Spherical lightning) </summary>
    ///<param type="vec3" name="a_lightPosition" >Position of the light</param>
    ///<param type="vec3" name="a_lightColor" >Color of the light</param>
    ///<param type="float" name="a_radius" >The spherical radius of how far the light reaches</param>
    this.m_lightPosition = a_lightPosition;
    this.m_lightColor = a_lightColor;
    this.m_radius = a_radius;
    
};

//A directional light, like the sun shines in 1 direction!
//a_lightDirection: a vector that is normalized
//a_lightColor: the lightcolor, ranges from 0 -> 1
Irinori.DirectionalLight = function(a_lightDirection, a_lightColor)
{   
    this.m_lightDirection = vec3.normalize(a_lightDirection);
    this.m_lightColor = a_lightColor;    
};

