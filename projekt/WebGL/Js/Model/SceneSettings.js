/// <reference path="References.js" />

//Different settings in the scene like is model rotating or not
//Also acts like a controller between SceneSettingsView and scene
Irinori.SceneSettings = function ( a_scene )
{
    /*
    //Tiny TODO list of features for SceneSettings:
    Model Rotation
        - Checkbox for rotating
        - Value for rotatespeed
    Free / Fixed camera view mode
        - Checkbox or a button
    Set ModelRotation
        - Set the values in radian or euler
    */
    this.m_scene = a_scene;

    this.m_modelIsRotating = true;
    this.m_rotationSpeed = vec3.create( [0, Irinori.SceneSettings.RotationSpeed.Slow, 0] );
    
    this.m_viewerMode = Irinori.SceneSettings.ViewerMode.Free;
};

//The different types of camera viewer modes. 
//Free is Free Looking where user controls the camera.
//Fixed is static camera position looking slightly down
Irinori.SceneSettings.ViewerMode = { "Free": 0, "Fixed": 1 };
//Rotation speed values, the numbers are radians / second
Irinori.SceneSettings.RotationSpeed = { "None": 0, "Slow": 0.10, "Medium": 0.25, "Fast": 0.5 };

Irinori.SceneSettings.prototype.ToggleModelIsRotating = function ( a_setRotating )
{
    var oldValue = this.m_modelIsRotating;

    if ( a_setRotating === true )
    {
        this.m_modelIsRotating = true;
    }
    else if ( a_setRotating === false )
    {
        this.m_modelIsRotating = false;
    }    

    if ( this.m_modelIsRotating !== oldValue )
    {
        if ( this.m_modelIsRotating )
        {
            this.StartScene();
        }
        else
        {            
            this.PauseScene();
        }
    }    
};
//Updates the rotationSpeed based on enumerator value index
Irinori.SceneSettings.prototype.UpdateRotationSpeed = function ( a_rotationSpeedIndex )
{  
    switch ( a_rotationSpeedIndex )
    {
        case 0:
            this.m_rotationSpeed[1] = Irinori.SceneSettings.RotationSpeed.None;
            break;
        case 1:
            this.m_rotationSpeed[1] = Irinori.SceneSettings.RotationSpeed.Slow;
            break;
        case 2:
            this.m_rotationSpeed[1] = Irinori.SceneSettings.RotationSpeed.Medium;
            break;
        case 3:
            this.m_rotationSpeed[1] = Irinori.SceneSettings.RotationSpeed.Fast;
            break;
        default:
            break;
    }       
}

Irinori.SceneSettings.prototype.PauseScene = function ()
{
    var canPause = false;

    //Check if the scene's variable allow it to pause
    
    if ( !this.m_modelIsRotating )
    {
        if ( this.m_scene.TryToAllowPause() )
        {
            canPause = true;
        }        
    }

    if ( canPause )
    {        
        this.m_scene.TryToPause();
    }   
};

Irinori.SceneSettings.prototype.StartScene = function ()
{
    this.m_scene.DisablePause();
    this.m_scene.Play();    
};

Irinori.SceneSettings.prototype.TryToDisablePause = function()
{
    var disablePause = true;

    if ( this.m_modelIsRotating )
    {
        disablePause = true;
    }

    if ( disablePause )
    {
        this.m_scene.DisablePause();
    }

    return disablePause;
}
