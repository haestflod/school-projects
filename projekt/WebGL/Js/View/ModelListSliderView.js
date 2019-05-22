/// <reference path="References.js" />
window.Irinori = window.Irinori || {};

//A Sliderlayout of all the modellistitems from modelListView
Irinori.ModelListSliderView = function( a_modelListView )
{
    //Reference to the modelListView
    this.m_modelListView = a_modelListView;
    //Area between the two buttons
    this.m_modellistContentDiv = document.createElement("div");
    this.m_modellistContentDiv.setAttribute("id","modellist_slider_content");
    //The button on the left side
    this.m_modellistLeftDiv = document.createElement("div");
    this.m_modellistLeftDiv.setAttribute("id","modellist_slider_left");
    //Button on right side
    this.m_modellistRightDiv = document.createElement("div");
    this.m_modellistRightDiv.setAttribute("id","modellist_slider_right");

    //128 pixels / item
    this.m_itemSize = 128;

    //The current items that are visible
    this.m_itemSlots = [];
    this.m_currentSliderIndex = 0;
};

Irinori.ModelListSliderView.s_modellistLeftImage = document.createElement( "img" );
Irinori.ModelListSliderView.s_modellistLeftImage.setAttribute("alt", "Click me to slide to the left");
Irinori.ModelListSliderView.s_modellistLeftImage.setAttribute("src", "Images/modellist_left.png");

Irinori.ModelListSliderView.s_modellistRightImage = document.createElement("img");
Irinori.ModelListSliderView.s_modellistRightImage.setAttribute("alt", "Click me to slide to the right");
Irinori.ModelListSliderView.s_modellistRightImage.setAttribute("src", "Images/modellist_right.png");

Irinori.ModelListSliderView.prototype.Init = function()
{     
    //Gets the amount of items that fits in the list,  canvas width - 50 (50 because the slider buttons are 25 pixels each)
    //+2 on the itemsize thanks to the selection border when an item is selected
    this.m_listMaxCount = parseInt( (this.m_modelListView.m_scene.m_canvas.width - (25 * 2) ) / (this.m_itemSize + 2) );    

    this.InitSlots();    
};
//Sets up the "slots" that items go to and invokes function to setup the slider buttons aswell
Irinori.ModelListSliderView.prototype.InitSlots = function()
{
    //Check if there's more items than there is spots, if so, create the slider
    if (this.m_modelListView.m_items.length > this.m_listMaxCount)
    {
        this.InitSliderButtons();
    }    
    
    var listDiv;
    //Calculates the margin to the left side size by first calculating how many pixels remain and then divide it by amount of items + 2
    //+ 2 because of left side, and right side
    //If there are 5 items and max is 12 it will put the first 5 items next to each others instead of evenly distributing
    //tho that's useful if a grid view instead os implemented
    var marginLeft = parseInt( (this.m_modelListView.m_scene.m_canvas.width - (25 * 2) - (this.m_itemSize + 2) * this.m_listMaxCount ) / (this.m_listMaxCount + 2) );
    marginLeft += "px";

    //Create X amount of divs to put the items in.
    for (var i = 0; i < this.m_listMaxCount; i++)
    {
        //If there are fewer items than max count, do not create more item div tags
        if (i >= this.m_modelListView.m_items.length)
        {
            break;
        }

        listDiv = document.createElement("div");
        listDiv.style.width = this.m_itemSize + "px";
        listDiv.style.height = this.m_itemSize + "px";
        
        listDiv.style.marginLeft = marginLeft;
        listDiv.setAttribute("class", "item");
        
        //Adds the div to the current itemslot
        this.m_itemSlots.push( listDiv );
        
        this.m_modellistContentDiv.appendChild(listDiv);
    }  
        
    this.UpdateList(); 
};
//Sets up the buttons visuals and functionality
Irinori.ModelListSliderView.prototype.InitSliderButtons = function()
{
    var that = this;
    //Start by setting up the "go to left" function
    var leftA = document.createElement("a");
    leftA.setAttribute("href", "#");

    leftA.appendChild(Irinori.ModelListSliderView.s_modellistLeftImage);

    this.m_modellistLeftDiv.appendChild(leftA);

    Irinori.Tools.addEvent(leftA, "click", function()
    {
        that.SlideLeft();
    } );
    //The go to right button!
    var rightA = document.createElement("a");
    rightA.setAttribute("href", "#");
    
    rightA.appendChild(Irinori.ModelListSliderView.s_modellistRightImage);

    Irinori.Tools.addEvent(rightA, "click", function()
    {
        that.SlideRight();
    } );

    this.m_modellistRightDiv.appendChild(rightA);
};

//Renders the divs & all stuff related!  Should only be invoked when toggling between different layouts
Irinori.ModelListSliderView.prototype.Render = function()
{
    this.m_modelListView.ClearView();
    //Have to be in this order or content div gets messed up with the position
    this.m_modelListView.m_listview.appendChild( this.m_modellistLeftDiv );   
    this.m_modelListView.m_listview.appendChild( this.m_modellistRightDiv ); 
    this.m_modelListView.m_listview.appendChild( this.m_modellistContentDiv );  
    
    this.UpdateList(); 
    
};

//When going left / right has to update the list
Irinori.ModelListSliderView.prototype.UpdateList = function()
{    
    var currentID;
    for (var i = 0; i < this.m_itemSlots.length; i++)
    {
        currentID = (this.m_currentSliderIndex + i) % this.m_modelListView.m_items.length;

        if (this.m_itemSlots[i].hasChildNodes() )
        {
            this.m_itemSlots[i].replaceChild( this.m_modelListView.m_items[currentID] ,this.m_itemSlots[i].firstChild  );
        }
        else
        {
            this.m_itemSlots[i].appendChild( this.m_modelListView.m_items[currentID] );
        }
    }    
};
//What happens when you click on the go left button
Irinori.ModelListSliderView.prototype.SlideLeft = function()
{
    this.m_currentSliderIndex--;

    if (this.m_currentSliderIndex < 0)
    {
        this.m_currentSliderIndex = this.m_modelListView.m_items.length - 1;
    }

    this.UpdateList();
};
//What happens when you click on the go right button!
Irinori.ModelListSliderView.prototype.SlideRight = function()
{
    this.m_currentSliderIndex++;

    if (this.m_currentSliderIndex >= this.m_modelListView.m_items.length)
    {
        this.m_currentSliderIndex = 0;
    }

    this.UpdateList();
};
