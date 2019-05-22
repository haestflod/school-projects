/// <reference path="References.js" />

Irinori.Toolbarhandler = function()
{
    this.m_toolbarDiv = Irinori.HTMLTags.toolbarDiv;
    this.m_toolbar_contentDiv = Irinori.HTMLTags.toolbar_contentDiv;
    //What tag is currently "displaing a message", if same tag tries to display a message again it will clear the message tag, thus hiding it!
    this.m_currentMessengerTag = null;

    this.m_tooltipDiv = document.createElement("div");
    this.m_tooltipDiv.setAttribute("class", "toolbar_tooltip");
    //The <a> tag(button) that is currently being mouse overed
    this.m_currentTooltipTag = null;       
    
};

//Creates a tooltip over the mouseovered tag
Irinori.Toolbarhandler.prototype.CreateTooltip = function(a_tag, a_text)
{      
    var position = Irinori.Tools.GetElementPosition( a_tag );

    //+ 5 because of the margin that focused icon has
    this.m_tooltipDiv.style.left = (position.x + 5) + "px";
    //-27 because the height of the tooltip div is 25 and 2 extra pixels just to have a margin from the button
    this.m_tooltipDiv.style.top = (position.y - 27) + "px";

    this.m_tooltipDiv.innerHTML = "<p>" + a_text + "</p>";

    if (this.m_currentTooltipTag === null)
    {
        this.m_toolbarDiv.appendChild( this.m_tooltipDiv );
    }    

    this.m_currentTooltipTag = a_tag;
};

//Removes the created tooltip when mouseleaving
Irinori.Toolbarhandler.prototype.RemoveTooltip = function(a_tag)
{
    //Compare tag with current tag to see if they are the same, if they are, remove the div from toolbar
    if (a_tag === this.m_currentTooltipTag)
    {       
        //Remove logic
        this.m_toolbarDiv.removeChild( this.m_tooltipDiv );
        //Sets current tag to null
        this.m_currentTooltipTag = null;
    } 
};


Irinori.Toolbarhandler.prototype.ClearMessage = function ()
{
    while ( this.m_toolbar_contentDiv.hasChildNodes() )
    {
        this.m_toolbar_contentDiv.removeChild( this.m_toolbar_contentDiv.firstChild );
    }
    this.m_currentMessengerTag = null;
};

//Sets the toolbar_contentDiv html code!
Irinori.Toolbarhandler.prototype.AddMessage = function ( a_message, a_messengerTag )
{   
    //Clear the toolbar_content of all it's previous nodes
    while ( this.m_toolbar_contentDiv.hasChildNodes() )
    {
        this.m_toolbar_contentDiv.removeChild( this.m_toolbar_contentDiv.firstChild );
    }

    this.m_toolbar_contentDiv.appendChild( a_message ); //.innerHTML = a_message;
    this.m_currentMessengerTag = a_messengerTag;
};

//Adds a message if a new messenger uses this function, removes the message if same messenger uses it, making it a toggle!
Irinori.Toolbarhandler.prototype.HandleMessage = function ( a_message, a_messengerTag )
{
    if ( this.m_currentMessengerTag !== a_messengerTag )
    {
        this.AddMessage( a_message, a_messengerTag );
    }
    else
    {
        this.ClearMessage();
    }
};
//Adds the functionality of a toolbar button, like mouseover effect and onClick function
Irinori.Toolbarhandler.prototype.AddToolbarButton = function (a_aTag, a_clickFunction)
{
    var that = this;
    var image = a_aTag.getElementsByTagName("img")[0];

    Irinori.Tools.addEvent(a_aTag, "mouseover", function ()
    {
        image.setAttribute("class", "toolbar_focused");
        that.CreateTooltip(this, image.alt);

    });

    Irinori.Tools.addEvent(a_aTag, "mouseout", function ()
    {
        image.setAttribute("class", "toolbar_unfocused");
        that.RemoveTooltip(this);
    });
    
    //If for some reason not having a click function!
    if (a_clickFunction)
    {
        Irinori.Tools.addEvent(a_aTag, "click", a_clickFunction);
    }
};
