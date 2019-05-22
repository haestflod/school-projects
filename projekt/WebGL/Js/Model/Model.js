///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};

Irinori.Model = function(a_name,a_path, a_scene)
{
    if (!a_path)
    {
        throw "Irinori.Model: a_path is not a path!";
    } 
    //Reference to the scene that owns this model
    this.m_scene = a_scene;
    
    this.m_name = a_name;
    this.m_path = a_path;   
    //The shader texture objects
    this.m_textures = [];    
    //If all textures are finished loading
    this.m_texturesLoaded = false; 
    //If the model has finished loading
    this.m_loaded = false;
    //if model has finished loading AND the textures have also finished loading
    this.m_ready = false;    

    this.m_meshes = [];
    //The skeletons are on the model and not on the mesh as each mesh can have the same skeletons
    this.m_skeletons = [];
    
    this.m_animations = [];
    this.m_currentAnimationIndex = -1;
    this.m_currentAnimation = null;
    //the "min" value is absolute max as starter value
    this.m_minBoundingPos = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
    //Negative MAX_VALUE since MIN_VALUE was closest to 0 
    this.m_maxBoundingPos = [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE];
    //position of the model in worldspace
    this.m_position; 
    //The position of the model in matrix form
    this.m_translateMatrix = mat4.create();
    //The rotation of the model that is changed by SetRotation
    this.m_baseRotationVec = [0, 0, 0];
    //The rotation but in matrix so it doesn't have to convert vec3 -> mat4 all the time
    this.m_baseRotationMat = Irinori.Math.GetIdentity4x4Matrix();
    //How much the model is rotated additional to the baseRotation
    this.m_rotated = [0, 0, 0];
    
    this.m_scale = vec3.create();
    this.m_rotation = mat4.create();
    mat4.identity(this.m_rotation);

    this.m_worldMatrix = mat4.create();

    //Functions called, only downside to this is that it has to do UpdateWorldMatrix 3 times
    this.SetPosition( [0, 0, 0] );
    this.SetScale( vec3.create([1,1,1]) );
    this.SetRotation([0,0,0] );
    
    //this.UpdateWorldMatrix();
};

Irinori.Model.prototype.SetScale = function(a_vec)
{    
    vec3.set( a_vec, this.m_scale );    

    this.UpdateWorldMatrix();
};

Irinori.Model.prototype.SetRotation = function(a_rotation)
{   
    ///<summary> Sets the rotation matrix and then calls UpdateWorldMatrix() afterwards </summary>    
    
    this.m_baseRotation = a_rotation;
    //Used for XYZ rotations gotta do each indivudually tho
    var rotation = Irinori.Math.GetIdentity4x4Matrix();
        
    mat4.identity( this.m_baseRotationMat );
    //X rotation
    mat4.rotateX(rotation, a_rotation[0] );
    mat4.multiply( this.m_baseRotationMat, rotation);
    //Y rotation
    mat4.identity( rotation );
    mat4.rotateY(rotation, a_rotation[1] );
    mat4.multiply( this.m_baseRotationMat, rotation);
    //Z rotation
    mat4.identity( rotation );
    mat4.rotateY(rotation, a_rotation[1] );
    mat4.multiply( this.m_baseRotationMat, rotation );

    this.m_rotated = [0, 0, 0];

    mat4.set( this.m_rotation, this.m_baseRotationMat );
        
    this.UpdateWorldMatrix();
        
};
//Sets the absolute position
Irinori.Model.prototype.SetPosition = function (a_position)
{
    this.m_position = a_position;
    mat4.identity(this.m_translateMatrix);
    mat4.translate(this.m_translateMatrix, this.m_position);  

    this.UpdateWorldMatrix();
};
//Moves a model relatively from a_translation
Irinori.Model.prototype.MoveModel = function(a_translation)
{
    ///<summary>Adds a translationPosition to m_position </summary>
    ///<param name="a_translation" type="vec3" >How much to move the model </param>
    vec3.add(this.m_position, a_translation, this.m_position);

    mat4.translate(this.m_translateMatrix, a_translation);

    this.UpdateWorldMatrix();
};
//Rotate adds the a_rotation to the rotated variable to then finally add the rotation to baseRotation 
Irinori.Model.prototype.Rotate = function ( a_rotation )
{
    //Check if a_rotation isn't a number!
    if ( isNaN( a_rotation[0] ) || isNaN( a_rotation[1] ) || isNaN( a_rotation[2] ) )
    {
        console.error( "Irinori.Model.Rotate: a_rotation is a NaN, aborted" );
        return;
    }

    this.m_rotated[0] += a_rotation[0];
    this.m_rotated[1] += a_rotation[1];
    this.m_rotated[2] += a_rotation[2];

    var rotation = Irinori.Math.GetIdentity4x4Matrix();

    var rotatedMat = Irinori.Math.GetIdentity4x4Matrix();
    
    //X rotation
    mat4.rotateX( rotation, a_rotation[0] );
    mat4.multiply( rotatedMat, rotation );
    //Y rotation
    mat4.identity( rotation );
    mat4.rotateY( rotation, a_rotation[1] );
    mat4.multiply( rotatedMat, rotation );
    //Z rotation
    mat4.identity( rotation );
    mat4.rotateY( rotation, a_rotation[1] );
    mat4.multiply( rotatedMat, rotation );

    mat4.set( this.m_rotation, this.m_baseRotationMat );
    mat4.multiply( this.m_rotation, rotatedMat );

    this.UpdateWorldMatrix();

};
//Updates the world matrix for the Model, also updates all the meshes world matrix
Irinori.Model.prototype.UpdateWorldMatrix = function()
{   
    Irinori.Tools.UpdateWorldMatrix( this.m_position, this.m_rotation, this.m_worldMatrix, { scale: this.m_scale } );

    for (var i = 0; i < this.m_meshes.length; i ++)
    {
        this.m_meshes[i].UpdateWorldMatrix();   
    }       
};
//Changes the animation and resumes the scene if it was paused
Irinori.Model.prototype.ChangeAnimation = function(a_index)
{
    if ( a_index < 0 || a_index > this.m_animations.length )
    {
        console.warn( "Model.ChangeAnimation: a_index was out of bound" );
        return;
    }

    this.m_currentAnimationIndex = a_index;
    this.m_currentAnimation = this.m_animations[a_index];
    this.m_currentAnimation.Reset();

    this.m_scene.Play();
};

Irinori.Model.prototype.UpdateBoneUniforms = function()
{
    for( var i = 0; i < this.m_meshes.length; i ++)
    {
        this.m_meshes[i].UpdateBoneUniforms();
    }
};

//Calculates the bounding box of a model based on its meshes.
//Also rescales model and repositions it
Irinori.Model.prototype.CalculateBoundingBox = function ()
{
    //Loop through each mesh to see if they are at the min/max position!
    for ( var i = 0; i < this.m_meshes.length; i++ )
    {
        var mesh = this.m_meshes[i];

        //Check if vertex is tinier than current min value
        if ( mesh.m_minBoundingPos[0] < this.m_minBoundingPos[0] ) this.m_minBoundingPos[0] = mesh.m_minBoundingPos[0];
        if ( mesh.m_minBoundingPos[1] < this.m_minBoundingPos[1] ) this.m_minBoundingPos[1] = mesh.m_minBoundingPos[1];
        if ( mesh.m_minBoundingPos[2] < this.m_minBoundingPos[2] ) this.m_minBoundingPos[2] = mesh.m_minBoundingPos[2];
        //Check if bigger than current max
        if ( mesh.m_maxBoundingPos[0] > this.m_maxBoundingPos[0] ) this.m_maxBoundingPos[0] = mesh.m_maxBoundingPos[0];
        if ( mesh.m_maxBoundingPos[1] > this.m_maxBoundingPos[1] ) this.m_maxBoundingPos[1] = mesh.m_maxBoundingPos[1];
        if ( mesh.m_maxBoundingPos[2] > this.m_maxBoundingPos[2] ) this.m_maxBoundingPos[2] = mesh.m_maxBoundingPos[2];
    }

    //Now that we have the min & max position, time to calculate how much the model has to be scaled
    //Calculate the length
    var xLength = Math.abs( this.m_minBoundingPos[0] - this.m_maxBoundingPos[0] );
    var yLength = Math.abs( this.m_minBoundingPos[1] - this.m_maxBoundingPos[1] );
    var zLength = Math.abs( this.m_minBoundingPos[2] - this.m_maxBoundingPos[2] );
    var scale = 1;
    //Get the max length to scale the model down by the max length to keep all proportions
    var length = Math.max( xLength, yLength, zLength );
    //If the max length is bigger than what the model BB allows it has to be normalized
    if ( length > Irinori.Model.MaxBBLength )
    {
        //Example:  10 / 40 = 0.25,  make model 4 times smaller!
        scale = Irinori.Model.MaxBBLength / length;
    }
    else
    {
        //If the max part wasn't bigger then check if it's below the minimum treshold
        var length = Math.min( xLength, yLength, zLength );
        //If it's smaller!
        if ( length < Irinori.Model.MinBBLength )
        {
            //example:  2 / 0.5  = 4,   make model 4 times bigger!
            scale = Irinori.Model.MinBBLength / length;
        }
    }
    
    this.SetScale( [scale, scale, scale] );
    
    //Now that the model is scaled properly, time to calculate where to position it
    var minBB = [0, 0, 0];
    var maxBB = [0, 0, 0];
    vec3.set( this.m_minBoundingPos, minBB );
    vec3.set( this.m_maxBoundingPos, maxBB );

    vec3.scale( minBB, scale );
    vec3.scale( maxBB, scale );

    //Calculate center pos of the BB
    //Vector3 center = myBox.Min + (myBox.Max - myBox.Min) / 2;
    var centerPos = vec3.create( minBB ); //= vec3.add( minBB, vec3.subtract( maxBB, minBB ) );
    //(myBox.Max - myBox.Min)
    centerPos[0] += maxBB[0] - minBB[0];
    centerPos[1] += maxBB[1] - minBB[1];
    centerPos[2] += maxBB[2] - minBB[2];
    //Divide by 2
    vec3.scale( centerPos, 0.5 );
    
    //Move center to 0,0,0    
    vec3.subtract( centerPos, centerPos );
    
    //Calculate where min Y pos is
    //The offset of how far above/below the plane the lowest point is, adds a tiny bit so they aren't exactly ontop each others and causes flimmer
    var offset = Irinori.Scene.PedestalHeight - minBB[1] + 0.01;
    
    centerPos[1] += offset;
    //Raise or lower the model so the min Y pos touches the planes position so it's "standing" on the plane!
    this.SetPosition( centerPos );

    //And voil�..  it's not working for Rose or Room!


};

//DEPRACATED & TODO: Make it change the shadertype that the model is rendered by to have each model rendered by individual types
//Since like .obj model files does not need skeletal animations
Irinori.Model.prototype.SetShader = function(a_shader)
{
    this.m_shader = a_shader;
};

//Checks if texture objects are loaded and that the model is loaded, if both are loaded the model is ready!
Irinori.Model.prototype.CheckIfReady = function()
{
    var i = 0;

    var loaded = true;

    for (i = 0; i < this.m_textures.length; i++) 
    {
        //If texture is not loaded
        if (!this.m_textures[i].m_loaded)
        {
            loaded = false;
            break;
        }
    }

    this.m_texturesLoaded = loaded;

    if (this.m_loaded && this.m_texturesLoaded)
    {
        this.m_ready = true;
    }

    return this.m_ready;
};
//Sets the model's textures and then loads them.
Irinori.Model.prototype.LoadTextures = function( a_gl, a_textures, a_readyCallback )
{
    this.m_textures = a_textures; 
    
    for( var i = 0; i < a_textures.length; i++)
    {
        this.m_textures[i].InitImage(a_gl, a_readyCallback);
    }   
};

//Loads the model using a specific importer technique depending on the file extension
Irinori.Model.prototype.LoadModel = function(a_gl, a_readyCallback)
{
    var extension = this.m_path.split(".");
    extension = extension[extension.length - 1];

    switch (Irinori.Model.GetImporterTech(extension) )
    {
        case Irinori.Model.ImporterTechs.Object:
            this.CreateFromObj(a_gl, a_readyCallback);
            break;
        case Irinori.Model.ImporterTechs.Json:
            this.CreateFromFbxJson(a_gl, a_readyCallback);
            break;
        default:
            console.error("Model.LoadModel: Not a known file extension so can't pick model importer technique: " + extension);
    }
};

/********************
        Obj
*********************/

//From .obj files
Irinori.Model.prototype.CreateFromObj = function(a_gl, a_readyCallback)
{
    ///<summary>Creates vertex buffers e.t.c. from an wavefront .obj file </summary>    
    if (!a_gl)
    {
        console.error ("Model.CreateFromObj: Needs a gl object");
        return;
    }

    var that = this;

    //Reading the file synchronously, possibly bad if it's big big models...
    //So possible optimization later on: Make it asynchronous and throw events when you click!
    Irinori.Ajax.ReadFile(this.m_path, function(a_objFile)
    {        
        //The models "this" object 
        var m_that = that;

        var objData = a_objFile.split("\n");

        m_that.m_skeletons[0] = Irinori.Skeleton.CreateEmptySkeleton( 0 );
        
        var mesh = Irinori.Mesh.CreateFromObj( objData, m_that ,a_gl );

        if (mesh !== null)
        {
            m_that.m_meshes.push( mesh );
        }
        else
        {
            console.error("Model.CreateFromObj: Failed to create mesh from obj file");
            return;
        }

        m_that.CalculateBoundingBox();
        m_that.m_loaded = true;
        a_readyCallback();

    }, true);
};//End of Obj Creation

/********************
        FBX
*********************/
//CreateFromFbxJson sets up the model variables from a json file that was exported from a fbx file
Irinori.Model.prototype.CreateFromFbxJson = function(a_gl, a_readyCallback)
{
    if (!a_gl)
    {
        console.error("Model.CreateFromFbxJson: Needs a gl object");
        return;
    }

    var that = this;

    Irinori.Ajax.ReadFile(this.m_path, function(a_object)
    {
        //The models "this" object
        var m_that = that;
        //The fbx model data parsed from json file
        var jsonModel = JSON.parse(a_object);
        var i = 0;
        var j = 0;
        var index = 0;
        var vertexIndex = 0;

        if (!jsonModel)
        {
            console.error("Model.CreateFromFbxJson: Could not parse object '" + m_that.m_path + "' is not a json correct file");
            return;
        }
        //Set up skeletons before meshes, so the bones in meshes can find their "origin" 
        var fbxSkeleton;
        for (i = 0; i < jsonModel.metadata.skeletonCount; i++)
        {
            fbxSkeleton = jsonModel.skeletons[i];

            m_that.m_skeletons[fbxSkeleton.id] = Irinori.Skeleton.CreateFromFbxJson(fbxSkeleton);
        }
        
        //Set up the meshes
        var fbxMesh;
        var mesh = null;
        for (i = 0; i < jsonModel.metadata.meshCount; i++)
        {
            fbxMesh = jsonModel.meshes[i];

            mesh = Irinori.Mesh.CreateFromFbxJson( fbxMesh, m_that ,a_gl );

            if (mesh !== null)
            {
                m_that.m_meshes.push(mesh);
            }
            else
            {
                console.error("Model.CreateFromFbxJson: Failed to setup meshes, bad json data" );
                return;
            }
        }        

        //Set up the animations if it has an animationCount
        if (jsonModel.metadata.animationCount > 0)
        {                 
            var fbxAnimation;

            var animation;

            var fps = jsonModel.metadata.framerate;

            for (i = 0; i < jsonModel.metadata.animationCount; i++)
            {
                fbxAnimation = jsonModel.animations[i];
                //Get the animation name from the animation to add the name to the dropdown list where you choose an animation
                //Irinori.AnimationChooser.s_animationChooser.AddAnimation( fbxAnimation.animationdata.name );
                //Create an animation object from the json text
                animation = Irinori.AnimationRoot.CreateFromFbxJson( fbxAnimation, fps, that );
                //Push that created object into the animation list for this model
                that.m_animations.push( animation );
            }
            //Change the animation to the first one so it starts animating!
            that.ChangeAnimation(0);
        }       
        
        m_that.CalculateBoundingBox();

        m_that.m_loaded = true;
        a_readyCallback();

    }, true );
};
//Maximum size of any dimension of the Boundingbox
Irinori.Model.MaxBBLength = 5;
//Minimum size of any dimesnion of the BoundingBox
Irinori.Model.MinBBLength = 2;

//Enumerator on the current ways of importing a model. 
Irinori.Model.ImporterTechs = { "Object": 0, "Json": 1 };
//What file extensions are "known" to be models
Irinori.Model.KnownModelFileExtensions = { "Object" : "obj", "Txt" : "txt", "Json" : "json" };
//Takes a file extension and returns a Model.ImporterTechnique based on what the file extension was
Irinori.Model.GetImporterTech = function(a_fileExtension)
{        
    switch (a_fileExtension)
    {
        //What model importer technique is txt files associated with?  To change association: Change the return type!
        //Currently txt file is treated as JSON
        case Irinori.Model.KnownModelFileExtensions.Txt:
            return Irinori.Model.ImporterTechs.Json;
        //Object file extension
        case Irinori.Model.KnownModelFileExtensions.Object:
            return Irinori.Model.ImporterTechs.Object;
        //Json file extension
        case Irinori.Model.KnownModelFileExtensions.Json:
            return Irinori.Model.ImporterTechs.Json;
        default:
            return null;
    }
};



