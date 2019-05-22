///<reference path="References.js" />
if (!window.Irinori) window.Irinori = {};

//Transform differs from Curve that the transform stores a dual quaternion and curve stores single values 
Irinori.AnimationCurveTransform = function()
{
    //How many keys there are
    this.m_keyCount = 0;
    //Array of AnimationKey objects
    this.m_keys = [];

    this.m_value = Irinori.Math.DualQuat.Create();
    //The value from Math.DualQuat.Lerp
    this.m_slerpValue = this.m_value;
    //reference to next key
    this.m_nextKey = undefined;

    this.m_hasChanged = false;
};
//Used to change keyframe for a node
Irinori.AnimationCurveTransform.prototype.ChangeFrame = function (a_frameNumber, a_length)
{
    //This whole flow is not so good - authors oppinion

    //Check if the frame that's being changed to has a keyframe or not
    if (this.m_keys[a_frameNumber] !== undefined)
    {        
        this.m_value = this.m_keys[a_frameNumber].m_frameValue;    
        this.m_slerpValue = this.m_value;    
    }
    //If the new framenumber is longer than the animation length
    if (a_frameNumber + 1 >= a_length)
    {
        //Just an optimization so if the length of animation is only 1 frame or less, it will not do slerp 
        if (a_length <= 1)
        {
            a_frameNumber = -1;
        }
        else
        {
            a_frameNumber = 0;
        }
    }
    //if there is no key at framenumber + 1 nextKey will be undefined
    this.m_nextKey = this.m_keys[a_frameNumber + 1];    

    if (this.m_nextKey !== undefined)
    {
        this.m_hasChanged = true;
    }
    //If it is undefined it has no value to slerp between
    else
    {
        this.m_hasChanged = false;
    }
};
//Reset the frame to 0
Irinori.AnimationCurveTransform.prototype.Reset = function( a_value, a_animationFrameLength )
{
    this.m_value = a_value;
    //If the keys have a value on frame 0, m_value will change to that instead of a_value
    this.ChangeFrame(0, a_animationFrameLength);
};
//Used when adding animation keyframes to m_keys
Irinori.AnimationCurveTransform.prototype.AddKey = function( a_key )
{
    this.m_keys[a_key.m_frame] = a_key;
};
//Returns a AnimationCurve dualquaternion transform
Irinori.AnimationCurveTransform.CreateFromFbxJson = function ( a_fbxCurve )
{
    var animationCurveTransform = new Irinori.AnimationCurveTransform();

    animationCurveTransform.m_keyCount = a_fbxCurve.keyCount;

    for ( var i = 0; i < animationCurveTransform.m_keyCount; i++ )
    {
        animationCurveTransform.AddKey( new Irinori.AnimationKey( a_fbxCurve.keys[i].frame, a_fbxCurve.keys[i].frameValue ) );
    }

    return animationCurveTransform;
};
