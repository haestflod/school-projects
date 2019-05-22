///<reference path="References.js" />
if (!window.Irinori) window.Irinori = {};

Irinori.Skeleton = function(a_id ,a_parentID)
{
    
    //Id to tell what id it is in models m_skeletons array
    this.m_id = a_id;
    //The parent ID if it has a parent
    this.m_parentID = a_parentID;    
    //References to bones that are using this skeleton , so when the skeleton updates it loops through references to update them
    this.m_boneLinks = [];    
    
    //Used by the bone
    this.m_localTransform;
    //The original value, incase you restart an animation e.t.c.
    this.m_defaultTransform;   
};

Irinori.Skeleton.prototype.AddBoneLink = function(a_bone)
{
    if (a_bone.m_id !== this.m_id)
    {
        console.error("Skeleton.AddBoneLink: the bone does not have the same ID as this skeleton"); 
        return;
    }

    this.m_boneLinks.push(a_bone);
};

Irinori.Skeleton.prototype.SetTransform = function( a_transform )
{    
    Irinori.Math.DualQuat.set( a_transform, this.m_localTransform );
};

Irinori.Skeleton.prototype.UpdateBones = function()
{
    ///<summary>Updates the bones that are associated with this skeleton. This function should be called if the skeleton transform changes</summary>
    for (var i = 0; i < this.m_boneLinks.length; i++)
    {      
        this.m_boneLinks[i].SetOffset();
    }
};

Irinori.Skeleton.CreateEmptySkeleton = function(a_id, a_parentID)
{
    ///<summary>Creates an "identity" skeleton that affects nothing. Used for example when a model has no skeletons at all since code expects it to be at least 1 skeleton</summary>
    var skeleton = new Irinori.Skeleton(a_id, a_parentID);

    skeleton.m_localTransform = Irinori.Math.DualQuat.GetIdentity();
    skeleton.m_defaultTransform = Irinori.Math.DualQuat.Create ( skeleton.m_localTransform );
    
    return skeleton;
};

Irinori.Skeleton.CreateFromFbxJson = function(a_fbxSkeleton)
{
    ///<summary>Creates a skeleton based from json data</summary>

    var skeleton = new Irinori.Skeleton( a_fbxSkeleton.id ,a_fbxSkeleton.parentID);
    
    skeleton.m_localTransform = (a_fbxSkeleton.localTransform) ? a_fbxSkeleton.localTransform : Irinori.Math.DualQuat.CreateFromQuatTrans(  Irinori.Math.Vector3.EulerToQuaternion( a_fbxSkeleton.localRotation ), a_fbxSkeleton.localTranslation );

    skeleton.m_defaultTransform = Irinori.Math.DualQuat.Create ( skeleton.m_localTransform );

    return skeleton;
};
