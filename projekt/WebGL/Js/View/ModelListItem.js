///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};

//Do not use, use the Create function instead because of the "check if it's valid if statements" returns empty object instead of null
//ModelListItem is a data collection that holds the information from 1 post in the models.txt file
Irinori.ModelListItem = function(a_name, a_path, a_thumbnailpath ,a_shaderType,a_textures)
{
    this.m_name = a_name;
    this.m_path = a_path;
    this.m_thumbnailpath = a_thumbnailpath;
    this.m_shaderType = a_shaderType;
    this.m_textures = a_textures;
};

Irinori.ModelListItem.Create = function(a_name, a_path, a_thumbnailpath ,a_shaderType,a_textures)
{
    ///<summary>Returns a ModelListItem if the paramters are valid, else null</summary>
    ///<param type="string" name="a_name" >Name of the model object</param>
    ///<param type="string" name="a_path" >The path to the model file </param>
    ///<param type="string" name="a_thumbnailpath" >The path to the thumbnail</param>
    ///<param type="Shader.Shadertype" name="a_shaderType" >The shadertype that the model wants to use</param>
    ///<param type="TextureObject[]" name="a_textures" >A collection of textures that the shader will use</param>  
    if (!Irinori.Tools.IsString( a_name ) )
    {
        //console.warn( "Irinori.ModelListItem.Create: a_name: " + a_name + "  is not a valid name" );
        return null;
    }        
    else if (!Irinori.Tools.IsString(a_path) || a_path.length < 3)
    {
        //console.warn("Irinori.ModelListItem.Create: a_path is not a valid path");
        return null;
    }
    else if (!Irinori.Tools.IsString(a_thumbnailpath) || a_thumbnailpath.length < 3)
    {
        //console.warn("Irinori.ModelListItem.Create: a_thumbnailPath is not a valid path");
        return null;
    }
    //The shadertype could be 0 which !a_shadertype would think is false!
    //Possibly not used / needed at all?
    else if (a_shaderType === undefined)
    {
        //console.warn("Irinori.ModelListItem.Create: wrong shadertype");
        return null;       
    }
    else
    {
        return new Irinori.ModelListItem(a_name, a_path, a_thumbnailpath, a_shaderType, a_textures);
    }

};



