/// <reference path="References.js" />

//The UI to change or look at the scene settings
Irinori.SceneSettingsView = function ( a_sceneSettings )
{
    this.m_sceneSettings = a_sceneSettings;

    this.m_sceneSettingsViewDiv = document.createElement( "div" );

    this.InitViewDiv();
};

Irinori.SceneSettingsView.prototype.InitViewDiv = function ()
{    
    //this.m_sceneSettingsViewDiv.setAttribute("class", "someClass");

    
    if ( Irinori.Compatibility.sliderSupport )
    {
        this.InitRotationSlider();
    }
    else
    {
        //TODO: a proper slider that works in none-supported ones!
        this.InitRotationSlider();
    }    
};

//Creates a slider to control model rotation speed
Irinori.SceneSettingsView.prototype.InitRotationSlider = function ()
{
    /*
    Rotation Speed
    */
    var that = this;
    
    var rotationSpeedDiv = Irinori.Tools.CreateHTMLElement( "div",  ["id", "rotationSpeed"] );

    //Function that is called when slider changes   
    //The header label for rotation speed
    var rotationSpeedHeaderTextP = Irinori.Tools.CreateHTMLElement( "h2", "Rotation Speed" );
   
    //The slider!
    var rotationSpeedInput = Irinori.Tools.CreateHTMLElement( "input", [["type", "range"],
        ["min", 0], ["max", 3], ["step", 1], ["id", "rotationSpeedSlider"]
    ] );

    //The slider value elements    
    var rotationSpeedValueP = Irinori.Tools.CreateHTMLElement( "p", ["id", "rotationSpeedValue"] );

    if ( this.m_sceneSettings.m_modelIsRotating )
    {
        rotationSpeedInput.value = 1;
        rotationSpeedValueP.innerHTML =  "Slow"
    }
    else
    {
        rotationSpeedInput.value = 0;
        rotationSpeedValueP.innerHTML = "None";
    }    

    //The function when slider changes value
    Irinori.Tools.addEvent( rotationSpeedInput, "change", function ()
    {
        var sliderValue = parseInt( this.value );
        
        switch ( sliderValue )
        {
            case 0:
                rotationSpeedValueP.innerHTML = "None";
                break;
            case 1:
                rotationSpeedValueP.innerHTML = "Slow";
                break;
            case 2:
                rotationSpeedValueP.innerHTML = "Medium";
                break;
            case 3:
                rotationSpeedValueP.innerHTML = "Fast";
                break;
            default:
                break;
        }

        if ( sliderValue > 0 )
        {
            that.m_sceneSettings.ToggleModelIsRotating( true );
        }
        else
        {
            that.m_sceneSettings.ToggleModelIsRotating( false );
        }

        that.m_sceneSettings.UpdateRotationSpeed( sliderValue );
    } );  
        
    //Add elements on the RotationSpeedDiv 
    rotationSpeedDiv.appendChild( rotationSpeedHeaderTextP );
    rotationSpeedDiv.appendChild( rotationSpeedInput );
    rotationSpeedDiv.appendChild( rotationSpeedValueP );
    //RotationSpeedDiv to the main div!
    this.m_sceneSettingsViewDiv.appendChild( rotationSpeedDiv );
};

//If the browser doesn't support <input type="range" /> *cough* firefox :( *cough*
Irinori.SceneSettingsView.prototype.InitRotationSliderCustom = function ()
{

};

