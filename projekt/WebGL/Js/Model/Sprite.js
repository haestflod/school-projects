/// <reference path="References.js" />

//A sprite is a plane in 3d space holding 1 texture
//a_gl: the webgl object
//a_scene: the scene so it can add itself to the scene when the sprite has finished loading
//a_position: the position of the sprite
//a_rotation: the rotation in euler degrees
//a_scale: the scale of the sprite where 1 is default
//a_imagePath: the path to the image
Irinori.Sprite = function ( a_gl, a_scene, a_position, a_rotation, a_scale, a_imagePath, a_alwaysFaceCamera )
{
    this.m_loaded = false;
    //[x,y,z] position, top left of image
    this.m_position = a_position;
    //The scale of the sprite
    this.m_scale = [1, 1, 1];
    //The rotation of the sprite, calculate it based on a_rotation
    this.m_rotation = Irinori.Math.GetIdentity4x4Matrix();
    //the world matrix
    this.m_worldMatrix = Irinori.Math.GetIdentity4x4Matrix();
    //If the sprite always faces the camera
    this.m_facingCamera = ( a_alwaysFaceCamera ) ? true : false;
    
    this.SetScale( a_scale );
    this.SetRotation( a_rotation );

    this.UpdateWorldMatrix();

    //the sprite texture
    //check if path is set    
    var that = this;
    
    if ( Irinori.Tools.IsString(a_imagePath) )
    {
        this.m_texture = new Irinori.TextureObject( Irinori.TextureObject.Type.Diffusemap, a_imagePath );
        this.m_texture.InitImage( a_gl, function () { that.FinishedLoading( a_scene ) } );
    }
    else
    {
        console.error("Irinori.Sprite: a_imagePath has to be set")
        //this.m_texture = new Irinori.TextureObject( Irinori.TextureObject.Type.Diffusemap,  );
    }   
   
};
//A rotation quaternion that is then made into a rotation mat4
Irinori.Sprite.prototype.SetRotation = function ( a_rotation )
{    
    quat4.toMat4( a_rotation, this.m_rotation );    
};

Irinori.Sprite.prototype.SetPosition = function ( a_position )
{
    vec3.set( a_position, this.m_position );    
};

Irinori.Sprite.prototype.SetScale = function ( a_scale )
{
    vec3.set( [a_scale, a_scale, a_scale], this.m_scale );
};

Irinori.Sprite.prototype.UpdateWorldMatrix = function ()
{
    Irinori.Tools.UpdateWorldMatrix( this.m_position, this.m_rotation, this.m_worldMatrix, {scale : this.m_scale} );
};

//Functions i called when the texture in the sprite is finished loading, then the Sprite is finished loading.
Irinori.Sprite.prototype.FinishedLoading = function (a_scene)
{
    this.m_loaded = true;
    
    a_scene.AddSprite( this );
};
/*
Irinori.Sprite.prototype.ChangeTexture = function ()
{

};*/
