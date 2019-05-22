/// <reference path="References.js" />
if (!window.Irinori) window.Irinori = {};

//Is a dropdown list with the animations of a selected model
Irinori.AnimationChooser = function()
{
    this.m_animationChoicesDiv = Irinori.HTMLTags.animationChoicesDiv;
    //The dropdown list of all the animations
    this.m_choicesSelect = document.createElement("select");

    this.m_titleText = Irinori.Tools.CreateHTMLElement("p", "<strong>Animations:</strong><br/>" );

    this.m_selectedIndex = -1;

    this.m_currentModel = null;

    var that = this;
    //Adds the event handler on "change"
    Irinori.Tools.addEvent( this.m_choicesSelect, "change", function() { that.ChangeAnimation(); } );
    
};
//The animationChooser object
Irinori.AnimationChooser.s_animationChooser = new Irinori.AnimationChooser();

//Clears the animationChooser and then sets up new values based on the new model
Irinori.AnimationChooser.prototype.SetupChooser = function(a_model)
{
    //To make sure that it's clear of any previous data
    this.Clear();

    this.m_currentModel = a_model;

    this.m_animationChoicesDiv.appendChild( this.m_titleText );
    this.m_animationChoicesDiv.appendChild( this.m_choicesSelect );

    var selectedAnimationIndex = this.m_currentModel.m_currentAnimationIndex;
    
    for ( var i = 0; i < this.m_currentModel.m_animations.length; i++ )
    {        
        this.AddAnimation( this.m_currentModel.m_animations[i].m_name, selectedAnimationIndex );
    }

};
//Add an animation to the dropdown list
Irinori.AnimationChooser.prototype.AddAnimation = function(a_name, a_selected)
{
    //Get what the "new index" after inserting 
    var newIndex = this.m_choicesSelect.options.length;

    if ( a_selected === undefined )
    {
        a_selected = 0;
    }

    //Checks if the new index is same as selected, if it is then select it!
    if ( newIndex === a_selected )
    {        
        this.m_choicesSelect.options[newIndex] = new Option( a_name, newIndex, false, true );
    }
    else
    {
        this.m_choicesSelect.options[newIndex] = new Option( a_name, newIndex, false, false );
    }    
};
//Clear the old model info
Irinori.AnimationChooser.prototype.Clear = function()
{
    while (this.m_animationChoicesDiv.hasChildNodes() )
    {
        this.m_animationChoicesDiv.removeChild( this.m_animationChoicesDiv.firstChild );
    }
    //Clears the options
    this.m_choicesSelect.options.length = 0;;
    
    this.m_selectedIndex = -1;    
    this.m_currentModel = null;
};

//Happens when user changes the dropdown list
Irinori.AnimationChooser.prototype.ChangeAnimation = function()
{  
    if (this.m_choicesSelect.selectedIndex !== this.m_selectedIndex && this.m_choicesSelect.selectedIndex !== -1 && this.m_currentModel !== null )
    {
        this.m_selectedIndex = this.m_choicesSelect.selectedIndex;
        this.m_currentModel.ChangeAnimation(this.m_selectedIndex);
    }
};
