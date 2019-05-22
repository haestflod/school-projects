///<reference path="References.js" />
if (!window.Irinori) window.Irinori = {};

Irinori.Bone = function( a_mesh , a_id , a_parentID)
{    
    //The id of this bone object in the meshes m_bones list!
    this.m_id = a_id;
    //The reference to the skeleton object
    this.m_skeletonLink = a_mesh.m_model.m_skeletons[a_id];
    //Adds itself to it's skeletonLink
    this.m_skeletonLink.AddBoneLink(this);
    
    //a reference to the parent Bone
    this.m_parent = null;
    //The parentID is needed to fetch the bone parent, after that it's not so useful
    this.m_parentID = a_parentID;
    
    //The childs, duh! 
    this.m_childBones = [];

    //indicesCount... do not know if useful or not a.t.m. as you can get the count from length from array
    this.m_linkIndicesCount = 0;
    //How much it's affecting the vertex, 1.0 is 100% and 0.01 is 1%
    //linkIndex 5 is at weightValues[5] and 12745 would be at [12745] 
    this.m_weightValues = [];    

    //The local "offset", fetched from skeletonLink variables
    //DEPRECATED?
    /*this.m_localTranslation;
    this.m_localRotation;
    this.m_localScale;*/
    //Pointing to the dual quaternion made from skeletonLinks local rotation & translation
    this.m_localTransform;  
    
    //The transform of parents worldtransform + localTransform
    this.m_worldTransform = Irinori.Math.DualQuat.GetIdentity();
    //The transform of where the original bone point is kinda, rotate bone around this or something like that!
    //It's bindpose in the .fbx file
    this.m_bindTransform = Irinori.Math.DualQuat.GetIdentity();
    
    //The total offset based worldtrasnform, bindtrasnform and meshes inverse transform
    this.m_transformOffset = Irinori.Math.DualQuat.GetIdentity();

    //The owner mesh that bone is affecting
    this.m_mesh = a_mesh;
};

Irinori.Bone.prototype.AddChild = function( a_bone )
{
    ///<summary>Pushes the bone into child array</summary>
    this.m_childBones.push( a_bone );
};

Irinori.Bone.prototype.AddParent = function(a_bone)
{
    ///<summary>Sets the m_parent variable and adds itself as a child to the parent</summary>
    this.m_parent = a_bone;
    this.m_parent.AddChild(this);
};

Irinori.Bone.prototype.SetOffset = function()
{
    ///<summary>Sets the offset of the bone and then calls the children of the bone to tell them to set their new offset aswell</summary>
    
    //Makes the transformOffset & worldTransform identities so they don't keep any of their old values
    Irinori.Math.DualQuat.set( Irinori.Math.DualQuat.GetIdentity() , this.m_transformOffset );
    Irinori.Math.DualQuat.set( Irinori.Math.DualQuat.GetIdentity() , this.m_worldTransform );
    
    //worldTransform = parent * local
    //transformOffset = meshTransformInverse * worldTransform * bindTransform

    if (this.m_parent !== null)
    {
        Irinori.Math.DualQuat.Multiply(this.m_worldTransform, this.m_parent.m_worldTransform );
    }         
    //Does the final calculation to get the world transform for this bone
    Irinori.Math.DualQuat.Multiply(this.m_worldTransform, this.m_localTransform);
    
    Irinori.Math.DualQuat.Multiply( this.m_transformOffset, this.m_mesh.m_worldTransformInverse );

    Irinori.Math.DualQuat.Multiply(this.m_transformOffset, this.m_worldTransform);
    
    Irinori.Math.DualQuat.Multiply(this.m_transformOffset, this.m_bindTransform);
    
    //Loop through all children to set their new one aswell
    for (var i = 0; i < this.m_childBones.length; i++)
    {
        this.m_childBones[i].SetOffset();
    }
};

Irinori.Bone.prototype.GetSkeletonLocals = function()
{
    ///<summary>Sets the locals of the bone to the locals of the skeleton. It's because the animation pushes data to a skeleton so need to fetch it from there! </summary>
    /*this.m_localTranslation = this.m_skeletonLink.m_localTranslation;
    this.m_localRotation = this.m_skeletonLink.m_localRotation;
    this.m_localScale = this.m_skeletonLink.m_localScale;*/
    this.m_localTransform = this.m_skeletonLink.m_localTransform;
};

Irinori.Bone.CreateEmptyBone = function( a_mesh, a_id )
{
    ///<summary>Creates a bone with 0 weight values, but it's needed to create the whole link incase the mesh doesn't have all bones to the root</summary>

    //If there isn't a skeleton at the specific ID ... something is wrong, like the fbx file has typeFlags:Null instead of Limb
    if ( !a_mesh.m_model.m_skeletons[a_id])
    {
        console.error("Bone.CreateEmptyBone: It can't find the skeleton, this skeleton hierarchy is corrupted");
        return;
    }

    //Create the bone!
    var bone = new Irinori.Bone( a_mesh, a_id, a_mesh.m_model.m_skeletons[a_id].m_parentID );

    //bone.m_transform = Irinori.Math.DualQuat.GetIdentity();

    //Set those locals from the skeletonLink
    bone.GetSkeletonLocals();

    //Return dat bone to the mesh m_bones array!, Oh thy bones!
    return bone;
};



Irinori.Bone.CreateFromFbxJson = function( a_fbxBone, a_mesh)
{
    ///<summary>Creates a bone from a jsonfile bone</summary>
    var bone = new Irinori.Bone( a_mesh, a_fbxBone.bonedata.id, a_fbxBone.bonedata.parentID);

    var linkIndice, weightValue;

    //Set the indicesCount!
    bone.m_linkIndicesCount = a_fbxBone.bonedata.linkIndicesCount;
    
    //bone.m_transform = a_fbxBone.transform;
    bone.m_bindTransform = a_fbxBone.bindtransform;

    for (var i = 0; i < bone.m_linkIndicesCount; i++)
    {
        linkIndice = a_fbxBone.linkIndices[i];
        
        //And the values!
        bone.m_weightValues[linkIndice] = a_fbxBone.weightValues[i];
    }    

    bone.GetSkeletonLocals();

    return bone;
};
