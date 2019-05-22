///<reference path="References.js" />
if (!window.Irinori) window.Irinori = {};

//A node is a link to a bone (skeleton in the model)
Irinori.AnimationNode = function( a_id, a_skeletons )
{
    //this.m_name = a_name;
    this.m_id = a_id;
    
    this.m_skeletonLink = a_skeletons[this.m_id];   
    //If the node's transform had changed at the new frame
    this.m_hasChanged = false;

    this.m_transform = new Irinori.AnimationCurveTransform();
};
//Updates the animation node data based on linear interpolation value
Irinori.AnimationNode.prototype.Update = function(a_slerp)
{
    //If the node is under change
    if (this.m_transform.m_hasChanged)
    {            
        //Do Lerp
        if (this.m_transform.m_nextKey !== undefined)
        {
            this.m_transform.m_slerpValue = Irinori.Math.DualQuat.Lerp( this.m_transform.m_value, this.m_transform.m_nextKey.m_frameValue, a_slerp);
        }
        //If the nextkey is undefined then it will be the value of the current value as a failsafe to make it not animate for some weird reason
        else
        {
            this.m_transform.m_slerpValue = this.m_transform.m_value;
        }                     
    }      
    //This shouldn't have to be an if cause it should always have a skeletonLink
    if (this.m_skeletonLink)
    {
        //Updates the skeleton transform with the slerped value
        this.m_skeletonLink.SetTransform( this.m_transform.m_slerpValue );       

        this.m_skeletonLink.UpdateBones();
    }    
};
//Resets the node value
Irinori.AnimationNode.prototype.Reset = function( a_animationFrameLength)
{   
    this.m_hasChanged = false;

    this.m_transform.Reset( this.m_skeletonLink.m_defaultTransform, a_animationFrameLength );

    if (this.m_skeletonLink)
    {
        this.m_skeletonLink.SetTransform( this.m_transform.m_slerpValue );           
        this.m_skeletonLink.UpdateBones();
    }
};

Irinori.AnimationNode.CreateFromFbxJson = function( a_fbxAnimationNode, a_skeletons )
{
    //a_fbxAnimationNode.nodedata.name ,
    var animationNode = new Irinori.AnimationNode( a_fbxAnimationNode.nodedata.id, a_skeletons );

    animationNode.m_transform = Irinori.AnimationCurveTransform.CreateFromFbxJson( a_fbxAnimationNode.channels.transform );

    return animationNode;
};
