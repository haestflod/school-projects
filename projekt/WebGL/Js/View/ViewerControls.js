///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};

/*
keycodes:

w=87
q=81
E=69
a=65
s=83
d=68

arrow-up = 38
arrow-down = 40
arrow-left = 37
arrow-right = 39

*/

Irinori.ViewerControls = function()
{
    //the scene to modify with the controlls, also has the canvas in it
    this.m_scene = null,

    //Keycodes for moving different directions
    this.m_strafeRightKey, this.m_strafeLeftKey, this.m_forwardKey, this.m_backwardsKey;

    this.m_turnUpwardsKey, this.m_turnDownwardsKey, this.m_turnLeftKey, this.m_turnRightKey;

    this.m_speedModifierKey;

    //These are used to prevent keys up & down from moving the webpage up and down if pressed and in camera movement
    this.m_arrowUpKey, this.m_arrowDownKey;
    
    //Left, Right, forward, backwards pressed!
    this.m_strafeLeftPressed = this.m_strafeRightPressed = this.m_forwardPressed = this.m_backwardsPressed = false;
    //Turn up, down, left, right pressed!
    this.m_turnUpwardsPressed = this.m_turnDownwardsPressed = this.m_turnLeftPressed = this.m_turnRightPressed = false;

    this.m_speedModifierPressed = false;
    //The time when a key was pressed last
    this.m_lastKeyPressed = null;
    //A counter of how many keys are totally pressed at the same time, if this is 0 no keys are pressed
    //If 0 keys are pressed and ViewerControlEvent is running it will stop
    this.m_keysPressed = 0;
    this.m_keyPressTimerID = null;      
};

Irinori.ViewerControls.prototype.Initilize = function(a_scene)
{
    ///<summary>Initilizes the class and sets all the events on the tags and stuff! </summary>      
    var that = this;
    this.m_scene = a_scene;        
        
    var body = Irinori.HTMLTags.body

    this.SetControlKeys();        

    //When clicking on a key to move camera around
    Irinori.Tools.addEvent(body, "keydown", function(e)
    {
        //To check if any of the keys were pressed
        var pressed = false;
        if (e.keyCode === that.m_strafeLeftKey && !that.m_strafeLeftPressed)
        {
            that.m_strafeLeftPressed = true;
            that.m_keysPressed++;
            pressed = true;
        }
        if (e.keyCode === that.m_strafeRightKey && !that.m_strafeRightPressed)
        {
            that.m_strafeRightPressed = true;
            that.m_keysPressed++;
            pressed = true;
        }

        if (e.keyCode === that.m_forwardKey && !that.m_forwardPressed)
        {
            that.m_forwardPressed = true;
            that.m_keysPressed++;
            pressed = true;
        }
            
        if (e.keyCode === that.m_backwardsKey && !that.m_backwardsPressed)
        {
            that.m_backwardsPressed = true;
            that.m_keysPressed++;
            pressed = true;
        }
             
        if (e.keyCode === that.m_turnUpwardsKey && !that.m_turnUpwardsPressed )
        {                    
            that.m_turnUpwardsPressed = true;
            that.m_keysPressed++;
            pressed = true;
        }

        if (e.keyCode === that.m_turnDownwardsKey && !that.m_turnDownwardsPressed )
        {                    
            that.m_turnDownwardsPressed = true;
            that.m_keysPressed++;
            pressed = true;
        }    

        if (e.keyCode === that.m_turnLeftKey && !that.m_turnLeftPressed )
        {                    
            that.m_turnLeftPressed = true;
            that.m_keysPressed++;
            pressed = true;
        }

        if (e.keyCode === that.m_turnRightKey && !that.m_turnRightPressed )
        {                    
            that.m_turnRightPressed = true;
            that.m_keysPressed++;
            pressed = true;
        }
            
        //If a key is pressed and timer isn't already running
        if (pressed && that.m_keyPressTimerID === null)
        {
            that.m_lastKeyPressed = new Date();
            that.m_keyPressTimerID = setTimeout(function() { that.ViewerControlEvent(); }, 0);
        }
        //This is to stop the screen from scrolling up or down when pressing up or down key! 
        if (e.keyCode === that.m_arrowUpKey || e.keyCode === that.m_arrowDownKey)
        {
            Irinori.Tools.stop_event(e);
        }
            
    } );

    //When letting go of a key
    Irinori.Tools.addEvent(body, "keyup", function(e)
    {                     
        if (e.keyCode === that.m_strafeLeftKey && that.m_strafeLeftPressed)
        {
            that.m_strafeLeftPressed = false;
            that.m_keysPressed--;
        }

        if (e.keyCode === that.m_strafeRightKey && that.m_strafeRightPressed)
        {
            that.m_strafeRightPressed = false;
            that.m_keysPressed--;
        }

        if (e.keyCode === that.m_forwardKey && that.m_forwardPressed)
        {                
            that.m_forwardPressed = false;
            that.m_keysPressed--;
        }

        if (e.keyCode === that.m_backwardsKey && that.m_backwardsPressed)
        {
            that.m_backwardsPressed = false;
            that.m_keysPressed--;
        }

        if (e.keyCode === that.m_turnUpwardsKey && that.m_turnUpwardsPressed )
        {                    
            that.m_turnUpwardsPressed = false;
            that.m_keysPressed--;
        }

        if (e.keyCode === that.m_turnDownwardsKey && that.m_turnDownwardsPressed )
        {                    
            that.m_turnDownwardsPressed = false;
            that.m_keysPressed--;
        }

        if (e.keyCode === that.m_turnLeftKey && that.m_turnLeftPressed)
        {
            that.m_turnLeftPressed = false;
            that.m_keysPressed--;
        }
            
        if (e.keyCode === that.m_turnRightKey && that.m_turnRightPressed )
        {                    
            that.m_turnRightPressed = false;
            that.m_keysPressed--;
        }
                                                
    } );       
};

Irinori.ViewerControls.prototype.ViewerControlEvent = function()
{
    var that = this;
    
    var noRender = false;
    //If camera changed direction
    var setCameraDirection = false;
    
    //If no keys are pressed stop this event!
    if (this.m_keysPressed > 0 )
    {          
        var elapsedTime = new Date() - this.m_lastKeyPressed;
        //Makes it from 16ms -> 0.016s
        elapsedTime *= 0.001;

        if (this.m_strafeLeftPressed)
        {
            this.m_scene.m_camera.MoveLeft(elapsedTime);
        }

        if (this.m_strafeRightPressed)
        {
            this.m_scene.m_camera.MoveRight(elapsedTime);
        }

        if (this.m_forwardPressed)
        {
            this.m_scene.m_camera.MoveForward(elapsedTime);
            setCameraDirection = true;
        }

        if (that.m_backwardsPressed)
        {
            this.m_scene.m_camera.MoveBackwards(elapsedTime);
            setCameraDirection = true;
        }

        if (this.m_turnUpwardsPressed)
        {
            this.m_scene.m_camera.TurnUpwards(elapsedTime);
            setCameraDirection = true;
        }

        if (this.m_turnDownwardsPressed)
        {
            this.m_scene.m_camera.TurnDownwards(elapsedTime);
            setCameraDirection = true;
        }

        if (this.m_turnLeftPressed)
        {
            this.m_scene.m_camera.TurnLeft(elapsedTime);
            setCameraDirection = true;
        }

        if (this.m_turnRightPressed)
        {
            this.m_scene.m_camera.TurnRight(elapsedTime);
            setCameraDirection = true;
        }
               
        //This was a bad idea, it caused camera to roll
        if (setCameraDirection)
        {
            this.m_scene.m_camera.SetCameraDirection(); 
        }   
        
        this.m_scene.m_camera.SetViewMatrix();            
        this.m_scene.ManualRender();            
       

        this.m_lastKeyPressed = new Date();
        this.m_keyPressTimerID = setTimeout(function(){ that.ViewerControlEvent(); }, 16);
    }
    else
    {
        //Sets the keypressTimerID to null so keydown knows it can call this function!
        this.m_keyPressTimerID = null;
    }
};  

//Incase of different browsers or something, might need different keys then if statements can be used here
Irinori.ViewerControls.prototype.SetControlKeys = function()
{    
    this.m_strafeLeftKey = "A".charCodeAt( 0 );
    this.m_strafeRightKey = "D".charCodeAt( 0 );
    this.m_forwardKey = "W".charCodeAt( 0 );
    this.m_backwardsKey = "S".charCodeAt( 0 );
    this.m_turnUpwardsKey = this.m_arrowUpKey =38;
    this.m_turnDownwardsKey = this.m_arrowDownKey = 40;
    this.m_turnLeftKey = 37;
    this.m_turnRightKey = 39; 
};
