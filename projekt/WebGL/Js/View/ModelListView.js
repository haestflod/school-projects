///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};

Irinori.ModelListView = function(a_scene)
{    
    this.m_scene = a_scene;    

    this.m_listview = Irinori.HTMLTags.modellistDiv;

    this.m_listingType = Irinori.ModelListView.ListingType.Slider;

    this.m_gridView = new Irinori.ModelListGridView( this );

    this.m_sliderView = new Irinori.ModelListSliderView( this );
          
    //The items
    this.m_items = [];    
        
    //Keeps track of the a tag that is currently "selected"
    this.m_currentlySelected = null;   
    //Creates the list of modellist items
    this.CreateList();        
};
//The different type of listing view types there are
Irinori.ModelListView.ListingType = { "Slider": 0, "Grid": 1 };

//Holds strings of the commands that is used in the "Model List file"
Irinori.ModelListView.CreateListCommands = { "Name": "name", "Path" : "path" ,"ThumbnailPath" : "thumbnail", "Shader" : "shader", "Diffusemap" : "diffusemap" ,
                            "Normalmap" : "normalmap" , "Specularmap" : "specularmap"};

//Holds a string with names from the txt file
Irinori.ModelListView.CreateListShadertype = { "Phong" : "phong" };

//Clears the listviewDiv of any elements
Irinori.ModelListView.prototype.ClearView = function()
{
    //Removes any div tags that are attached to the modellist
    while (this.m_listview.hasChildNodes() )
    {
        this.m_listview.removeChild( this.m_listview.firstChild );
    }
};

//This function happens on start of program only once
Irinori.ModelListView.prototype.CreateList = function()
{
    ///<summary>Creates the list from a textfile that has information about each model list item </summary>
    var that = this;

    //Opens models.txt file to create the thumbnails & model list item associated with each thumbnail.
    Irinori.Ajax.ReadFile(Irinori.Paths.ModelList, function(a_modelList)
    {
        //Split the items by a question mark ? 
        //? was chosen out of *|<>"? as breaker
        var modellistitems = a_modelList.split('?');
        var i = j = itemsRemoved = 0;
        //The different variables that is potentially found from each item
        var name, path,
            thumbnailpath,
            shaderType,
            textures = [];

        //an item from modellistitems in text
        var item;
        //An array that has all the textlines in one item
        var itempart;
        //An array with each word from itempart for example "name" "irinoriModel"  where itempart was "name irinoriModel"
        var partinfo, keyword;
        //A ModelListItem object
        var listitem = null;

        //As written before, first item is not needed!
        for (i = 0; i < modellistitems.length; i++)
        {            
            textures = [];
            //If the model file has no information about what shader 
            shaderType = Irinori.Shader.Shadertype.Phong;
            item = modellistitems[i];
            //Removes \r
            item = item.replace(Irinori.Tools.RemoveRLinebreakRegex,"");
            thumbnailpath = "";
            path = "";
            //Splits it on \n to get all the different lines, Thanks to previously removing \r it should now work on windows & unix without any special code!
            itempart = item.split( "\n" );
            
            for (j = 0; j < itempart.length; j++)
            {
                //TODO: Fix so it only splits once so you can have model names with spaces.
                partinfo = itempart[j].split(" ");
                //Decode first word into a keyword to know what to do with it!
                keyword = partinfo[0].toLowerCase();
                 
                switch(keyword)
                {
                    //Textures
                    case Irinori.ModelListView.CreateListCommands.Normalmap:
                        textures.push(new Irinori.TextureObject(Irinori.TextureObject.Type.Normalmap, partinfo[1]) );
                        break;
                    case Irinori.ModelListView.CreateListCommands.Specularmap:
                        textures.push(new Irinori.TextureObject(Irinori.TextureObject.Type.Normalmap, partinfo[1]) );
                        break;
                    case Irinori.ModelListView.CreateListCommands.Diffusemap:
                        textures.push(new Irinori.TextureObject(Irinori.TextureObject.Type.Diffusemap, partinfo[1]) );
                        break;
                    //Path
                    case Irinori.ModelListView.CreateListCommands.Path:
                        path = partinfo[1];
                        break;
                    //ThumbnailPath
                    case Irinori.ModelListView.CreateListCommands.ThumbnailPath:
                        thumbnailpath = partinfo[1];
                        break;
                    //Shader
                    case Irinori.ModelListView.CreateListCommands.Shader:
                        shaderType = that.ConvertShadertype(partinfo[1]);
                        break;
                    //ModelName
                    case Irinori.ModelListView.CreateListCommands.Name:
                        name = partinfo[1];
                        break;
                    //Can be comment or random letter e.t.c.!
                    default:
                        break;
                }
            }            
            
            //Creates the decoded listitem to be stored in m_items
            listitem = Irinori.ModelListItem.Create( name, path, thumbnailpath, shaderType, textures );
            //if listitem != null then "add it" to the m_items
            if (listitem)
            {
                that.AddItem( listitem );
            } 
            else
            {
                itemsRemoved++;
            }          
        }

        //Checks to see if there's any need to console.log how many items was removed, tho I don't know how to properly validate what is an actual model and what is comments only or something like that
        if ( itemsRemoved !== 0 )
        {
            console.log( "Removed " + itemsRemoved + " items because of insufficient or bad data" );
        }

        //It was either make the ajax synchronous or call the function here to get correct result        
        that.m_sliderView.Init();
        //that.m_gridView.Init();

        that.m_sliderView.Render();

    } , true);
     
};

//Toggles between Slider and Grid view
Irinori.ModelListView.prototype.ToggleSliderGrid = function()
{    
    if (this.m_listingType === Irinori.ModelListView.ListingType.Slider)
    {
        this.m_listingType = Irinori.ModelListView.ListingType.Grid;

        this.m_gridView.Render();    
    }
    else if (this.m_listingType === Irinori.ModelListView.ListingType.Grid)
    {        
        this.m_listingType = Irinori.ModelListView.ListingType.Slider;

        this.m_sliderView.Render();
    }
};

//Converts shadername from models.txt to a Shader.Shadertype
Irinori.ModelListView.prototype.ConvertShadertype = function(a_shadertype)
{   
    ///<summary>Takes a CreaListShadertype and converts it to a Shader.Shadertype</summary>
    ///<param type="ModelListView.CreateListShadertype" name="a_shadertype" >The shader type to be converted</param>
    var lowershadertype = a_shadertype.toLowerCase();

    switch (lowershadertype)
    {
        case Irinori.ModelListView.CreateListShadertype.Phong:
            return Irinori.Shader.Shadertype.Phong;
        default:      
            console.error("Irinori.ModelListHandler.GetShadertype: a_shadername is bad shadertype: '" + lowershadertype + "' so using phong shading");
            //return Irinori.Sha;
    }
};

//Adds the "item" to the item list aswell
Irinori.ModelListView.prototype.AddItem = function(a_modellistItem)
{
    ///<summary>Adds a modelListItem to m_items[] and sets up the HTML code for the item</summary>
    var that = this;
    //Create the <a> tag that is the button
    var aTag = document.createElement("a");
    aTag.setAttribute("href", "#");
    
    //The function to change 
    Irinori.Tools.addEvent(aTag, "click", function(e)
    {
        //Checks if user didn't click on same that's already clicked
        if (this !== that.m_currentlySelected )
        {   
            //If something already was clicked, change the old clicked ones class back to empty (not selected)
            if (that.m_currentlySelected !== null)
            {         
                that.m_currentlySelected.childNodes[0].setAttribute("class","");
            }

            //Set currentlySelected to this <a> tag
            that.m_currentlySelected = this;

            //Gets the modelItem thanks to closure, this is possibly redudant, could just send parameter directly to AddModel scene
            var modelItem = a_modellistItem;
            //Sets "this" to ModelListView as "this" is an <a> tag
            var this = that;

            //Changes the class to selected so user sees what item they have selected
            this.childNodes[0].setAttribute("class", "selected");

            //Clears the animation list and removes it, will be readded if the model has any animations
            Irinori.AnimationChooser.s_animationChooser.Clear();

            //Sends the item to AddModel to be further handled by the scene!
            this.m_scene.AddModel(modelItem);
        }
        
    } );
    
    //Creates the thumbnail image to be placed inside aTag
    var image = new Image();
    image.src = a_modellistItem.m_thumbnailpath;
    image.style.maxWidth = this.m_itemSize + "px";
    image.style.maxHeight = this.m_itemSize + "px";
    
    //Adds the thumbnail to the <a> tag and then adds the <a> tag to the listDiv
    aTag.appendChild(image);
    //If the itemID added is the same as "the start value" simulate a click to load that model!
    if (this.m_items.length === this.m_sliderView.m_currentSliderIndex)
    {
        Irinori.Tools.SimulateClick(aTag);
    }
    
    this.m_items.push( aTag );
};
