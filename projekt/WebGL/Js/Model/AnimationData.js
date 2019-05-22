///<reference path="References.js" />
if (!window.Irinori) window.Irinori = {};

//AnimarionRoot has information about the animation itself and has the animation nodes
Irinori.AnimationRoot = function(a_name, a_animationFrameLength, a_frameRate, a_model)
{
    this.m_model = a_model;
    //The name of the animation sequence
    this.m_name = a_name;
    //The time between 1 frame,  1 / a_frameRate
    this.m_deltaFrameTime = 1 / a_frameRate;
    //Length in frames    
    this.m_animationFrameLength = a_animationFrameLength;
    //Length in seconds
    this.m_animationTimeLength = this.m_animationFrameLength * this.m_deltaFrameTime;

    this.m_nextFrameTime = this.m_deltaFrameTime;
    
    //Time in seconds where for example: it's 24 frames per second and you're at 1.0 seconds, then m_currentFrame = (int)m_currentTime / deltaFrameTime to find out the frame! 
    this.m_currentTime = 0;
    //The currentFrame that is based on currentTime
    this.m_currentFrame = 0;
    
    //The different nodes where skeleton / mesh data is changed and the keydata e.t.c.!
    this.m_nodes = [];  
    this.m_nodeIDs = [];  
};

//What makes the animation go forward in it's sequence
Irinori.AnimationRoot.prototype.Update = function(a_elapsedTime)
{
    //Holds nodes temporarily 
    var node;

    this.m_currentTime += a_elapsedTime;

    //If current time is bigger than animation length it starts over at 0! 
    if (this.m_currentTime > this.m_animationTimeLength)
    {       
        this.m_currentTime = this.m_currentTime - this.m_animationTimeLength;       
    }
    //Calculates the frame number that the animation is currently on
    var frame = parseInt(this.m_currentTime / this.m_deltaFrameTime);
    //Check if the frame number that animation is currently on is different from the "current one" 
    if (frame !== this.m_currentFrame)
    {
        this.m_currentFrame = frame;
        this.m_nextFrameTime = frame * this.m_deltaFrameTime + this.m_deltaFrameTime;
        this.ChangeFrame();
    }    
    //Smoothens out the change between 2 frames by linear interpolation (not spherical lerp despite the name!) 
    var slerp = 1 - (this.m_nextFrameTime - this.m_currentTime) / this.m_deltaFrameTime;
    //Loop through all nodes to update them
    for (var i = 0; i < this.m_nodeIDs.length; i++)
    {
        node = this.m_nodes[ this.m_nodeIDs[i] ];
         
        node.Update(slerp );
    }    
};

//Makes all Nodes change frame
Irinori.AnimationRoot.prototype.ChangeFrame = function()
{
    var node;
    var translation, rotation, scale;
    for (var i = 0; i < this.m_nodeIDs.length; i++)
    {
        node = this.m_nodes[ this.m_nodeIDs[i] ];

        node.m_transform.ChangeFrame( this.m_currentFrame, this.m_animationFrameLength );
    }
};
//Resets the timer values & frame values & resets the nodes too
Irinori.AnimationRoot.prototype.Reset = function()
{
    this.m_currentTime = 0;
    this.m_currentFrame = 0;
    this.m_nextFrameTime = this.m_deltaFrameTime;

    for (var i = 0; i < this.m_nodeIDs.length; i++)
    {
        this.m_nodes[ this.m_nodeIDs[i] ].Reset(this.m_animationFrameLength);
    }
};
//Takes an animation from the fbx file and sets it up in the js structure
Irinori.AnimationRoot.CreateFromFbxJson = function(a_fbxAnimation, a_frameRate, a_model)
{
    var i, j;
    var fbxLayer;

    var animationRoot = new Irinori.AnimationRoot(a_fbxAnimation.animationdata.name , a_fbxAnimation.animationdata.animationLength, a_frameRate, a_model );
    //Loops through each layer from the fbx structure, one layer has 1 -> * nodes
    for (i = 0; i < a_fbxAnimation.animationdata.layerCount; i ++)
    {
        fbxLayer = a_fbxAnimation.layers[i];
        //Loop trough each node in the layer
        for (j = 0; j < fbxLayer.layerdata.nodeCount; j ++)
        {
            //Add the nodeIDs to the nodeID list as nodes is dictionary mapped
            animationRoot.m_nodeIDs.push(fbxLayer.nodes[j].nodedata.id);
            //Create a node through the Fbx constructor
            animationRoot.m_nodes[ fbxLayer.nodes[j].nodedata.id ] =  Irinori.AnimationNode.CreateFromFbxJson( fbxLayer.nodes[j], animationRoot.m_model.m_skeletons ) ;
        }
    }

    return animationRoot;
};
