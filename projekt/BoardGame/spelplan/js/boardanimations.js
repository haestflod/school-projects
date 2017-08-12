///<reference path="references.js" />

window.irinori = window.irinori || {};

irinori.BoardAnimations = function(a_gameview)
{
    this.m_gameview = a_gameview;

    //current movedata that is being animated
    this.m_currentAnimationData = null;
    this.m_currentRobotImg = null;
    //current movecollection data that is being animated, 1 minor cycle basicly!
    this.m_currentMinorCycle = null;
    
    //Time to animate 1 minor cycle / 1 move
    //this.m_minorCycleTimer = 1000;
    //Time to animate each movevement in milliseconds
    this.m_animationTimer = 400;

    this.m_desiredFPS = 1000 / 60;

    this.m_startAnimationTime;

    this.m_xvel;
    this.m_yvel;

    this.m_timeLastFrame;

    this.m_timeRemaining;

    //Gets the sound effect for laser. Refactor: change name and add more generic term for different sounds
    //To be noted: Does not have to be part of a html element to be played, just has to exist :o
    this.m_sound = this.GetLaserSoundEffect();     
}

irinori.BoardAnimations.prototype.GetLaserSoundEffect = function()
{
    var f_laserSound = document.createElement("audio");
    f_laserSound.setAttribute("src", "audio/laser.ogg");      
    f_laserSound.volume = 0.25;    
    f_laserSound.setAttribute("hidden",true);

    return f_laserSound;
}

irinori.BoardAnimations.prototype.AnimateRobots = function(a_players)
{
    ///<summary>Loops through the minorCollections in the majorCollection </summary>
    if (this.m_gameview.m_majorCycleCollection.m_minorCollection.length > 0)
    {
        this.m_currentMinorCycle = this.m_gameview.m_majorCycleCollection.m_minorCollection[0];

        for (i = 0; i < this.m_currentMinorCycle.m_robotPositions.length; i++) 
        {            
            this.DrawRobot(this.m_currentMinorCycle.m_robotPositions[i]);   
        }          

        this.m_gameview.m_majorCycleCollection.m_minorCollection.splice(0, 1);
        //this.m_currentAnimationData = null;
        this.m_timeLastFrame = new Date();
        this.AnimateCurrentCycle(a_players);        
   
    }
    //At the end of major cycle, should draw the robots again, also like a "backup" that they end up at the right spot .. tho if the animation data is wrong it's gonna jump :p
    else
    {
        //Removes all the stuff inside the div.. not the coolest way to do it but would have to write a new function that checks if it exists and stuff!
        this.m_gameview.ClearRobots();
        
        this.m_gameview.DrawRobots(a_players);        
    }
}

irinori.BoardAnimations.prototype.AnimateCurrentCycle = function(a_players)
{    
    ///<summary>Animates a minor cycle completly by taking 1 object at a time from the collection, taking the type and doing animation based on type </summary>
    var i;
    var f_that = this;
    //If an object is done being animated
    if (this.m_currentAnimationData === null)
    {
        //Is there any objects to still animate? If not, back to AnimateRobots()
        if (this.m_currentMinorCycle.m_collection.length > 0)
        {
            //The first object in the collection,
            this.m_currentAnimationData = this.m_currentMinorCycle.m_collection[0];
            
            //If it the object has a robot, get the robot image so it can do animations on that!
            if (this.m_currentAnimationData.m_robot)
            {
                for (i = 0; i < a_players.length; i++) 
                {
                    if (a_players[i].m_robot === this.m_currentAnimationData.m_robot)
                    {
                        this.m_currentRobotImg = document.getElementById("robot_" + a_players[i].m_name);
                        break;
                    }
                }
            }

            //Movement
            if (this.m_currentAnimationData.m_type === irinori.AnimationData.Type.Movement)
            {
                this.m_xvel = (this.m_currentAnimationData.m_newX - this.m_currentAnimationData.m_oldX) / this.m_animationTimer;
                this.m_yvel = (this.m_currentAnimationData.m_newY - this.m_currentAnimationData.m_oldY) / this.m_animationTimer;              
                
                this.m_timeRemaining = this.m_animationTimer;

                this.m_timeLastFrame = new Date();

                setTimeout( function() { f_that.AnimateMovement(a_players) } , this.m_desiredFPS);
            }
            //Rotation
            else if (this.m_currentAnimationData.m_type === irinori.AnimationData.Type.Rotation)
            {        
                //Rotation is different from others, because it's fixed rotation values.. tho COULD implement something in everything but Internet Explorer to rotate degrees slowly but that'd require like 3 different lines
                //For the different CSS:es        
                this.m_currentRobotImg.setAttribute("class", this.m_gameview.GetImgFacingClass(this.m_currentAnimationData.m_newDirection));                
                this.m_currentAnimationData = null;
                this.m_currentRobotImg = null;

                setTimeout(function() { f_that.AnimateCurrentCycle(a_players);  }, this.m_animationTimer * 0.25 );
            }
            //Death
            else if (this.m_currentAnimationData.m_type === irinori.AnimationData.Type.Death)
            {
                //if (this.m_currentAnimationData.m_causeOfDeath === irinori.AnimationData.CauseOfDeath.Hole)
                //{
                this.m_timeRemaining = this.m_animationTimer;
                this.m_timeLastFrame = new Date();

                setTimeout( function() { f_that.AnimateDeath(a_players) } , this.m_desiredFPS );
                //}
            }
            //Laser
            else if (this.m_currentAnimationData.m_type === irinori.AnimationData.Type.Laser)
            {
                //this.m_gameview.m_effects.appendChild(this.m_sound ); 
                this.m_sound.play();        

                var f_offsetX;
                var f_offsetY;

                switch (this.m_currentAnimationData.m_direction) 
                {
                    case irinori.Direction.Left:
                        f_offsetX = -1;
                        f_offsetY = 0;
                        break;
                    case irinori.Direction.Top:
                        f_offsetX = 0;
                        f_offsetY = -1;
                        break;
                    case irinori.Direction.Right:
                        f_offsetX = 1;
                        f_offsetY = 0;
                        break;
                    case irinori.Direction.Bottom:
                        f_offsetX = 0;
                        f_offsetY = 1;
                        break;
                }

                var f_x = this.m_currentAnimationData.m_startX;
                var f_y = this.m_currentAnimationData.m_startY;
                
                var f_leftX = Math.abs(f_x - this.m_currentAnimationData.m_endX);
                var f_leftY = Math.abs(f_y - this.m_currentAnimationData.m_endY);

                var f_image;

                var f_imagePath = irinori.Gameview.imgbasepath + this.m_gameview.GetEffectImgpath(this.m_currentAnimationData.m_laserType);
                var f_imagePathHalf = f_imagePath.replace(".png","") + irinori.Gameview.imghalfLaser;

                while (f_leftX >= 0 || f_leftY >= 0)
                {
                    
                    if (f_leftX > 0 || f_leftY > 0)
                    {
                        f_image = this.m_gameview.GetImageElement(this.m_gameview.GetImgFacingClass(this.m_currentAnimationData.m_direction), f_imagePath , f_x, f_y);
                    }
                    else
                    {
                        f_image = this.m_gameview.GetImageElement(this.m_gameview.GetImgFacingClass(this.m_currentAnimationData.m_direction),f_imagePathHalf , f_x, f_y);
                    }

                    

                    this.m_gameview.m_effects.appendChild(f_image);
                    

                    f_x += f_offsetX;
                    f_y += f_offsetY;

                    f_leftX -= 1;
                    f_leftY -= 1;
                }

                this.m_currentAnimationData.m_smokeImg = this.m_gameview.GetImageElement("effect", irinori.Gameview.imgbasepath + "smoke.png", this.m_currentAnimationData.m_hits[0].m_x, this.m_currentAnimationData.m_hits[0].m_y);
                this.m_currentAnimationData.m_sparkImg = this.m_gameview.GetImageElement("effect", irinori.Gameview.imgbasepath + "sparks_1.png", this.m_currentAnimationData.m_hits[0].m_x, this.m_currentAnimationData.m_hits[0].m_y);
                this.m_currentAnimationData.m_sparkFrame = 0;
                this.m_currentAnimationData.m_currentSparkImg = 0;
                this.m_currentAnimationData.m_sparkImages = 6;
                //Gets the number of frames before swapping image
                this.m_currentAnimationData.m_swapImage = parseInt((this.m_animationTimer / this.m_desiredFPS) / this.m_currentAnimationData.m_sparkImages, 10 ); 

                this.m_gameview.m_effects.appendChild(this.m_currentAnimationData.m_smokeImg);
                this.m_gameview.m_effects.appendChild(this.m_currentAnimationData.m_sparkImg);

                //Extra long to play sound effect
                this.m_timeRemaining = this.m_animationTimer;
                this.m_timeLastFrame = new Date();               

                setTimeout( function() { f_that.AnimateLaser(a_players) }, this.m_desiredFPS);
            }
            //Win
            else if (this.m_currentAnimationData.m_type === irinori.AnimationData.Type.Win) 
            {
                this.m_timeRemaining = this.m_animationTimer;
                this.m_timeLastFrame = new Date();

                setTimeout(function () { f_that.AnimateWin(a_players) }, this.m_desiredFPS);
            }
            else
            {
                console.log("irinori.Boardanimations.AnimateCurrentCycle: m_currentAnimationData is unknown type.. so animations stopped working!");
            }

            this.m_currentMinorCycle.m_collection.splice(0, 1);
            
        }
        //Current minorcycle is empty, so time to get a new one
        else
        {            
            this.AnimateRobots(a_players);
        }
    }
}

irinori.BoardAnimations.prototype.AnimateMovement = function(a_players)
{
    var f_that = this;

    var f_elapsedTime = new Date() - this.m_timeLastFrame;
    this.m_timeRemaining -= f_elapsedTime;

    if (this.m_timeRemaining > 0)
    {              
        var f_progress = this.m_animationTimer - this.m_timeRemaining;         
            
        this.m_currentRobotImg.style.left = this.m_currentAnimationData.m_oldX * irinori.Gameview.totalScale  + (f_progress * this.m_xvel) * irinori.Gameview.totalScale + "px";
        this.m_currentRobotImg.style.top =  this.m_currentAnimationData.m_oldY * irinori.Gameview.totalScale + (f_progress * this.m_yvel) * irinori.Gameview.totalScale + "px";                    

        this.m_timeLastFrame = new Date();

        setTimeout( function() { f_that.AnimateMovement(a_players) } , f_that.m_desiredFPS);
    }
    else
    {
        this.m_currentRobotImg.style.left = this.m_currentAnimationData.m_newX * irinori.Gameview.totalScale + "px"; 
        this.m_currentRobotImg.style.top = this.m_currentAnimationData.m_newY * irinori.Gameview.totalScale + "px"; 

        this.m_currentAnimationData = null;
        this.m_currentRobotImg = null;

        this.AnimateCurrentCycle(a_players);
    }
}

irinori.BoardAnimations.prototype.AnimateDeath = function(a_players)
{
    var f_that = this;
    var f_elapsedTime = new Date() - this.m_timeLastFrame;
    this.m_timeRemaining -= f_elapsedTime;

    if (this.m_timeRemaining > 0)
    {
        if (this.m_currentAnimationData.m_causeOfDeath === irinori.AnimationData.CauseOfDeath.Hole)
        {
            //Should now go from 0 -> 1
            var f_progress = (this.m_animationTimer - this.m_timeRemaining) / this.m_animationTimer;        

            //Width should start on worldToViewScale size, then gets closer and closer to 0
            this.m_currentRobotImg.style.width = irinori.Gameview.worldToViewScale * (1 - f_progress) + "px";
            this.m_currentRobotImg.style.height = irinori.Gameview.worldToViewScale * (1 - f_progress) + "px";
        }

        this.m_timeLastFrame = new Date();

        setTimeout( function() { f_that.AnimateDeath(a_players) } , f_that.m_desiredFPS);
    }
    else
    {
        this.m_gameview.m_robots.removeChild(this.m_currentRobotImg);

        //Validation that it's the same robot that died that the client is... otherwise stuff can get wrong! (Respawn image deleted if another robot dies completly!)
        if (this.m_gameview.m_clientPlayer.m_robot === this.m_currentAnimationData.m_robot)
        {
            if (this.m_currentAnimationData.m_lives <= 0)
            {
                this.m_gameview.m_robots.removeChild(this.m_gameview.m_respawnImage);
            }
        }

        this.m_currentAnimationData = null;
        this.m_currentRobotImg = null;

        this.AnimateCurrentCycle(a_players);
    }
}

irinori.BoardAnimations.prototype.AnimateLaser = function(a_players)
{
    var f_that = this;

    var f_elapsedTime = new Date() - this.m_timeLastFrame;
    this.m_timeRemaining -= f_elapsedTime;

    if (this.m_timeRemaining > 0)
    {
        var f_progress = (this.m_animationTimer - this.m_timeRemaining) / this.m_animationTimer;  
        this.m_currentAnimationData.m_smokeImg.style.width = irinori.Gameview.worldToViewScale * (1 - f_progress * 0.33) + "px";
        this.m_currentAnimationData.m_smokeImg.style.height = irinori.Gameview.worldToViewScale * (1 - f_progress * 0.33) + "px";

        this.m_currentAnimationData.m_smokeImg.style.top = (this.m_currentAnimationData.m_hits[0].m_y - f_progress * 0.33 ) * irinori.Gameview.totalScale + "px";
        
        this.m_currentAnimationData.m_sparkFrame ++;       

        if (this.m_currentAnimationData.m_sparkFrame > this.m_currentAnimationData.m_swapImage)
        {
            this.m_currentAnimationData.m_currentSparkImg ++;
            this.m_currentAnimationData.m_sparkFrame = 0;
            //this.m_gameview.m_effects.removeChild( this.m_currentAnimationData.m_sparkImg );

            this.m_currentAnimationData.m_sparkImg.setAttribute("src", irinori.Gameview.imgbasepath + "sparks_" + (this.m_currentAnimationData.m_currentSparkImg + 1) + ".png");
        }


        this.m_timeLastFrame = new Date();

        //Do hits animations here! but for now, not!
        setTimeout(function() { f_that.AnimateLaser(a_players) }, this.m_desiredFPS);
    }
    else
    {
        //Clears the effects div
        this.m_gameview.ClearEffects();
        
        f_that.m_sound.pause();
        f_that.m_sound.currentTime = 0;

        this.m_currentAnimationData = null;
        this.AnimateCurrentCycle(a_players);
    }
}

irinori.BoardAnimations.prototype.AnimateWin = function (a_players) {
    var f_that = this;

    var f_elapsedTime = new Date() - this.m_timeLastFrame;
    this.m_timeRemaining -= f_elapsedTime;

    if (this.m_timeRemaining > 0) {

        //Check if the win div is set
        if (!this.m_gameview.m_win.hasChildNodes()) {
            //Create & add the dimmer
            var f_dimmer = document.createElement("div");
            f_dimmer.setAttribute("class", "winDimmer");
            //Set width & height
            f_dimmer.style.width = this.m_gameview.m_lastgamedrawn.m_map.m_width * irinori.Gameview.totalScale + "px";
            f_dimmer.style.height = this.m_gameview.m_lastgamedrawn.m_map.m_height * irinori.Gameview.totalScale + "px";
            this.m_gameview.m_win.appendChild(f_dimmer);

            //Create the text div
            var f_textDiv = document.createElement("div");
            f_textDiv.setAttribute("class", "winTextDiv");
            //Set width & height
            f_textDiv.style.width = f_dimmer.style.width;
            f_textDiv.style.height = f_dimmer.style.height;

            //Create & add the winner's name
            var f_winText = document.createElement("p");
            f_winText.setAttribute("class", "winText");
            f_winText.innerHTML = this.m_gameview.m_lastgamedrawn.m_winner.m_name;
            f_textDiv.appendChild(f_winText);
            //Create & add the win text
            f_winText = document.createElement("p");
            f_winText.setAttribute("class", "winText");
            f_winText.innerHTML = "WINS!";
            f_textDiv.appendChild(f_winText);

            //Add the text div
            this.m_gameview.m_win.appendChild(f_textDiv);
        }


        //Make the opacity go from 0 -> 1 (almost)
        var f_opacity = (this.m_animationTimer - this.m_timeRemaining) / this.m_animationTimer;

        //set dimmer opacity
        this.m_gameview.m_win.childNodes[0].style.opacity = f_opacity * 0.5

        //set text opacity
        this.m_gameview.m_win.childNodes[1].style.opacity = f_opacity;

        this.m_timeLastFrame = new Date();

        setTimeout(function () { f_that.AnimateWin(a_players) }, f_that.m_desiredFPS);
    }
    else {
        this.m_currentAnimationData = null;
        this.AnimateCurrentCycle(a_players);
    }
}

irinori.BoardAnimations.prototype.DrawRobot = function(a_robotPosition)
{
    ///<summary>Draws a robot from a robotPosition which is stored at the start of each minor cycle </summary>
    var f_image = document.getElementById("robot_" + a_robotPosition.m_playername);

    if (!f_image)
    {
        if (a_robotPosition.m_alive)
        {
            f_image = this.m_gameview.GetImageElement(this.m_gameview.GetImgFacingClass(a_robotPosition.m_direction), irinori.Gameview.imgbasepath + this.m_gameview.GetRobotImgpath(a_robotPosition.m_robot) , a_robotPosition.m_posX, a_robotPosition.m_posY );
            f_image.id = "robot_" + a_robotPosition.m_playername;

            this.m_gameview.m_robots.appendChild(f_image);
        }
    }
    else
    {
        if (a_robotPosition.m_alive)
        {
            f_image.style.top = (a_robotPosition.m_posY * irinori.Gameview.totalScale) + "px";
            f_image.style.left = (a_robotPosition.m_posX  * irinori.Gameview.totalScale) + "px";

            f_image.setAttribute("class", this.m_gameview.GetImgFacingClass(a_robotPosition.m_direction) );

            //this.m_robots.appendChild(f_image);
        }
        else
        {           
            this.m_gameview.m_robots.removeChild(f_image);          
        }
    }
    
    //Sadly it has to check this for each robotPositions, but if it would check directly at a reference of robot it potentially died twice in 1 round e.t.c... so.. doesn't work because that could spoil it!
    if (a_robotPosition.m_robot === this.m_gameview.m_clientPlayer.m_robot)
    {
        if (document.getElementById(irinori.Gameview.respawnimageID) )
        {
            if (a_robotPosition.m_lives <= 0)
            {                
                this.m_gameview.m_robots.removeChild(this.m_respawnImage);
            }
            else
            {
                this.m_gameview.m_respawnImage.style.left = (a_robotPosition.m_spawnX * irinori.Gameview.totalScale) + "px";
                this.m_gameview.m_respawnImage.style.top = (a_robotPosition.m_spawnY * irinori.Gameview.totalScale) + "px";
            }
        }
    }
}

/*
irinori.BoardAnimations.prototype.GetLaserImage = function()
{
    
}
*/