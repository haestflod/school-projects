///<reference path="References.js" />
window.Irinori = window.Irinori || {};

//A gridded layout of all the modelListItems from ModelListView
Irinori.ModelListGridView = function( a_modelListView )
{
    //What defines how the elements are placed in this view is mainly defined by the css
    this.m_modelListView = a_modelListView;    

    this.m_contentDiv = document.createElement("div");
    this.m_contentDiv.setAttribute("id", "modellist_grid_content");
};

//This mainly has to be called because of only 1 object can exist once in a HTML document, so if SliderView has one of the items, then this function makes sure it gets to GridView
Irinori.ModelListGridView.prototype.UpdateList = function()
{
    for (var i = 0; i <  this.m_modelListView.m_items.length; i++)
    {
        this.m_contentDiv.appendChild( this.m_modelListView.m_items[i] );
    }
};

//Renders the divs & all stuff related!  Should only be invoked when toggling between different layouts
Irinori.ModelListGridView.prototype.Render = function()
{
    this.m_modelListView.ClearView();

    this.m_modelListView.m_listview.appendChild( this.m_contentDiv );

    this.UpdateList();
};
