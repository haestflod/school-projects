///<reference path="References.js" />
if (!window.Irinori) window.Irinori = {};

//Animation key is stored in AnimationCurve & AnimationCurveTransform

//A curve has 0 -> n keys 
Irinori.AnimationKey = function( a_frame, a_frameValue )
{
    this.m_frame = a_frame;
    this.m_frameValue = a_frameValue;
};
