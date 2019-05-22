///<reference path="References.js" />
if (!window.Irinori) window.Irinori = {};
//A TextureObject that holds a webgl texture
Irinori.TextureObject = function(a_textureType, a_path)
{
    //Check if a_path is a string!
    if (!Irinori.Tools.IsString( a_path ))
    {
        console.error("Irinori.TextureObject: a_path needs to be a string");
    }
    //The path to the image resource to be loaded through <img>
    this.m_path = a_path;
    this.m_textureType = a_textureType;

    this.m_loaded = false;    
    
    this.m_texture = null;        
};

//Enumerator for what types of textures there are
Irinori.TextureObject.Type = { "Diffusemap" : 0, "Normalmap" : 1, "Specularmap": 2 };
//Inits the HTML image and when the image is finished loading it calls LoadTexture()
//a_gl: the webgl context
//[a_readyCallback]: a function to be invoked when image is finished loading
Irinori.TextureObject.prototype.InitImage = function(a_gl, a_readyCallback)
{
    var image = new Image();

    image.src = this.m_path;
    //"destroys" the texture objects path, no need to waste resources!
    this.m_path = undefined;
    var that = this;
    
    Irinori.Tools.addEvent( image, "load", function()
    {       
        that.LoadTexture( a_gl, image );

        if ( a_readyCallback )
        {
            a_readyCallback();
        }
    });
    
};

//Sets the m_texture variable as a glTexture
//Is automatically called on the images onload function from InitImage()
Irinori.TextureObject.prototype.LoadTexture = function(a_gl, a_image)
{    
    this.m_texture = a_gl.createTexture();

    a_gl.bindTexture(a_gl.TEXTURE_2D, this.m_texture);
    //Flips it cause it's upside down, so this is a -fix- so it's no need to flip it in the shader
    a_gl.pixelStorei(a_gl.UNPACK_FLIP_Y_WEBGL, true);
    a_gl.texImage2D(a_gl.TEXTURE_2D, 0, a_gl.RGBA, a_gl.RGBA, a_gl.UNSIGNED_BYTE,  a_image);
    a_gl.texParameteri(a_gl.TEXTURE_2D, a_gl.TEXTURE_MAG_FILTER, a_gl.LINEAR);
    a_gl.texParameteri(a_gl.TEXTURE_2D, a_gl.TEXTURE_MIN_FILTER, a_gl.LINEAR_MIPMAP_NEAREST);
    a_gl.generateMipmap(a_gl.TEXTURE_2D);
    a_gl.bindTexture(a_gl.TEXTURE_2D, null);   
    
    this.m_loaded = true;
};
