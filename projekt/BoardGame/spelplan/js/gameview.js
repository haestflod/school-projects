/// <reference path="references.js" />

if (window.irinori === undefined)
{
    window.irinori = {};
}

//TODO: Add some border offset too as that actually takes room! 

irinori.Gameview = function()
{   
    this.m_gridDiv = window.document.getElementById("gameboard");    
    
    this.m_staticEffects = window.document.getElementById("staticEffects");    
       
    this.m_effects = window.document.getElementById("effects");

    this.m_robots = window.document.getElementById("robots");

    this.m_win = window.document.getElementById("win");

    this.m_clientPlayer = null;
    this.m_respawnImage = null;    

    this.m_lastgamedrawn = null;      
    
    this.m_majorCycleCollection = new irinori.MajorCycleCollection();
    
    this.m_boardanimations = new irinori.BoardAnimations(this);      
}

irinori.Gameview.imgbasepath = "img/board/";

irinori.Gameview.imghalfLaser = "_half.png  ";

irinori.Gameview.respawnimgpath = "respawn.png";
irinori.Gameview.respawnimageID = "robotRespawn";
//The original worldToViewScale is 50 pixels
irinori.Gameview.originalScale = 50;
//how many pixels 1 tile is
irinori.Gameview.worldToViewScale = 32;
//To change border size: Change variable here, then in the css #gameboard .boardTile 
irinori.Gameview.bordersize = 1;

//If you change scale, DONT do totalSacle *= a_scale,  
//do it totalScale = (worldToViewScale * a_scale) + borderSize
irinori.Gameview.totalScale = irinori.Gameview.worldToViewScale + irinori.Gameview.bordersize;

//Draws a game
irinori.Gameview.prototype.Draw = function(a_game)
{
    var i;    

    if (this.m_lastgamedrawn !== a_game)
    {   
        this.m_clientPlayer = a_game.m_clientPlayer;     
        this.ClearStatics();        
        this.DrawBackground(a_game.m_map);        
        this.DrawRobots(a_game.m_players);   
    }

    this.ClearTemporary();

    this.m_boardanimations.AnimateRobots(a_game.m_players);
    //this.AnimateRobots(a_game.m_players);    
    
    this.m_lastgamedrawn = a_game;
}


irinori.Gameview.prototype.ClearStatics = function()
{
    ///<summary>Clears the elements on the gameboard that is only drawn once, such as tile, sideobjects to a tile e.t.c. </summary>
    var i;

    for (i = 0; i < this.m_gridDiv.childNodes.length;) 
    {
        //Loops through the children and it shouldn't remove statics e.t.c. , tho a possible optimization is to just throw it away, then remake the div :p 
        if (this.m_gridDiv.childNodes[i] === this.m_staticEffects || this.m_gridDiv.childNodes[i] === this.m_effects || this.m_gridDiv.childNodes[i] === this.m_robots || this.m_gridDiv.childNodes[i] === this.m_win)
        {
            i++;
        }
        else
        {            
            this.m_gridDiv.removeChild(this.m_gridDiv.childNodes[i] );
        }
    } 
    
    this.ClearStaticEffects();
    
    this.ClearRobots();
}

irinori.Gameview.prototype.ClearTemporary = function()
{   
    //this.ClearEffects();
}

irinori.Gameview.prototype.ClearStaticEffects = function()
{
    while (this.m_staticEffects.hasChildNodes() )
    {
        this.m_staticEffects.removeChild(this.m_staticEffects.firstChild);
    }  
}

irinori.Gameview.prototype.ClearRobots = function()
{
    while (this.m_robots.hasChildNodes() )
    {
        this.m_robots.removeChild(this.m_robots.firstChild);
    } 
}

irinori.Gameview.prototype.ClearEffects = function()
{
    while (this.m_effects.hasChildNodes() )
    {
        this.m_effects.removeChild(this.m_effects.firstChild);
    }  
}

irinori.Gameview.prototype.DrawBackground = function(a_map)
{
    var x,y;
    var f_tempDiv;

    var f_tempImg;
    var f_imgPath = "";

    var f_offsetX, f_offsetY;

    var f_tempTile;

    this.m_gridDiv.style.width = a_map.m_width * irinori.Gameview.totalScale + 2 + "px";

    for (var y = 0; y < a_map.m_height; y++) 
    {
        for (var x = 0; x < a_map.m_width; x++) 
        {
            f_tempTile = a_map.m_tiles[x][y];

            f_tempDiv = document.createElement("div");
            f_tempDiv.setAttribute("class", "boardtile");
            f_tempDiv.style.width = irinori.Gameview.worldToViewScale + "px";
            f_tempDiv.style.height = irinori.Gameview.worldToViewScale + "px";

            f_imgPath = this.GetTiletypeImgPath(f_tempTile,a_map,x,y);

            f_tempImg = this.GetImageElement("", irinori.Gameview.imgbasepath + f_imgPath);              

            f_tempDiv.appendChild(f_tempImg );     
             
            this.m_gridDiv.appendChild( f_tempDiv);

            this.DrawSideObjects(a_map,f_tempTile, x,y, f_tempDiv); 
        }     
    }


}

//*************
//  DrawSideObjects
//*************

irinori.Gameview.prototype.DrawSideObjects = function(a_map, a_tile, a_x, a_y, a_ownerdiv)
{
    //var f_x = a_offset[0];
    //var f_y = a_offset[1];

    var f_sideObjectDiv = undefined;

    var f_image;
    var f_checkpointdiv;

    if (a_tile.m_left !== irinori.SideObject.None)
    {
        if (f_sideObjectDiv === undefined)
        {
            f_sideObjectDiv = document.createElement("div");
            f_sideObjectDiv.setAttribute("class", "sideobject");
            a_ownerdiv.appendChild(f_sideObjectDiv);
        }

        f_image = this.GetImageElement(this.GetImgFacingClass(irinori.Direction.Left), irinori.Gameview.imgbasepath + this.GetSideobjectImgpath(a_tile.m_left) );        

        f_sideObjectDiv.appendChild(f_image);

        if (this.IsLaser(a_tile.m_left) )
        {
            this.DrawLaserEffect(a_map, a_x, a_y, irinori.Direction.Left, a_tile.m_left, a_ownerdiv);
        }
    }
    if (a_tile.m_right !== irinori.SideObject.None)
    {
        if (f_sideObjectDiv === undefined)
        {
            f_sideObjectDiv = document.createElement("div");
            f_sideObjectDiv.setAttribute("class", "sideobject");
            a_ownerdiv.appendChild(f_sideObjectDiv);
        }

        f_image = this.GetImageElement(this.GetImgFacingClass(irinori.Direction.Right) , irinori.Gameview.imgbasepath + this.GetSideobjectImgpath(a_tile.m_right));

        f_sideObjectDiv.appendChild(f_image);

        if (this.IsLaser(a_tile.m_right) )
        {
            this.DrawLaserEffect(a_map, a_x, a_y, irinori.Direction.Right, a_tile.m_right, a_ownerdiv);
        }
    }

    if (a_tile.m_top !== irinori.SideObject.None)
    {
        if (f_sideObjectDiv === undefined)
        {
            f_sideObjectDiv = document.createElement("div");
            f_sideObjectDiv.setAttribute("class", "sideobject");
            a_ownerdiv.appendChild(f_sideObjectDiv);
        }
        
        f_image = this.GetImageElement(this.GetImgFacingClass(irinori.Direction.Top) , irinori.Gameview.imgbasepath + this.GetSideobjectImgpath(a_tile.m_top) );         

        f_sideObjectDiv.appendChild(f_image);

        if (this.IsLaser(a_tile.m_top) )
        {
            this.DrawLaserEffect(a_map, a_x, a_y, irinori.Direction.Top, a_tile.m_top, a_ownerdiv);
        }
        
    }    
    if (a_tile.m_bottom !== irinori.SideObject.None)
    {
        if (f_sideObjectDiv === undefined)
        {
            f_sideObjectDiv = document.createElement("div");
            f_sideObjectDiv.setAttribute("class", "sideobject");
            a_ownerdiv.appendChild(f_sideObjectDiv);
        }

        f_image = this.GetImageElement(this.GetImgFacingClass(irinori.Direction.Bottom) , irinori.Gameview.imgbasepath + this.GetSideobjectImgpath(a_tile.m_bottom) );           

        f_sideObjectDiv.appendChild(f_image);

        if (this.IsLaser(a_tile.m_bottom) )
        {
            this.DrawLaserEffect(a_map, a_x, a_y, irinori.Direction.Bottom, a_tile.m_bottom, a_ownerdiv);
        }
    }
    if (a_tile.m_checkpoint !== 0)
    {
        if (f_sideObjectDiv === undefined)
        {
            f_sideObjectDiv = document.createElement("div");
            f_sideObjectDiv.setAttribute("class", "sideobject");
            a_ownerdiv.appendChild(f_sideObjectDiv);
        }

        f_checkpointdiv = this.GetCheckpointDiv(a_tile.m_checkpoint);
        f_sideObjectDiv.appendChild(f_checkpointdiv);
    }
}

irinori.Gameview.prototype.IsLaser = function(a_type)
{
    if (a_type === irinori.SideObject.Laserx1 || a_type === irinori.SideObject.Laserx2 || a_type === irinori.SideObject.Laserx3)
    {
        return true;
    }

    return false;
}

/*
    GetImageElement
*/
irinori.Gameview.prototype.GetImageElement = function(a_class, a_src ,a_x, a_y)
{
    ///<summary>Returns an image element, on a specific spot if x & y is set. NEEDS a_class and a_src</summary>
    var f_image;

    if (a_class === undefined)
    {
        throw "Gameview.GetImageElement: a_class must be defined, '' for no class value:" + a_class;
    }    
            
    if (a_src.length === undefined || a_src.length < 3)
    {
        throw "Gameview.GetImageElement: a_src must at least be 3 letters - a.b  value:" + a_src;
    }   

    f_image = document.createElement("img");
    f_image.setAttribute("alt","");

    if (a_class !== "")
    {
        f_image.setAttribute("class", a_class);
    } 
    
    f_image.setAttribute("src", a_src); 
    f_image.style.width = irinori.Gameview.worldToViewScale + "px"; 
    f_image.style.height = irinori.Gameview.worldToViewScale + "px";  

    if (a_x !== undefined && a_y !== undefined)
    {
        f_image.style.top = (a_y * irinori.Gameview.totalScale) + "px";
        f_image.style.left = (a_x  * irinori.Gameview.totalScale)  + "px";
    }      
    
    return f_image;

}

/*
Draw Laser Effect
*/
irinori.Gameview.prototype.DrawLaserEffect = function(a_map, a_x, a_y, a_direction, a_type, m_ownerdiv)
{
    //Used to tell while loop to stop or not!
    //var f_continue = true;
    var f_image;
    
    var f_posAdd = 1;

    //Tiles
    var f_currentDirection;
    var f_nextDirection;

    a_direction += 2;

    if (a_direction > 3)
    {
        a_direction -= 4;        
    }

    if (a_direction === irinori.Direction.Left || a_direction === irinori.Direction.Right)
    {
        if (a_direction === irinori.Direction.Left)
        {
            f_currentDirection = irinori.Direction.Left;
            f_nextDirection = irinori.Direction.Right;
            f_posAdd = -1;
        }
        else
        {
            f_currentDirection = irinori.Direction.Right;
            f_nextDirection = irinori.Direction.Left;
        }

        while (true)
        {
            //Draw on a_x a_y
            f_image = this.GetImageElement(this.GetImgFacingClass(a_direction) , irinori.Gameview.imgbasepath + this.GetEffectImgpath(a_type), a_x, a_y);
                     
            this.m_staticEffects.appendChild(f_image); 
            
            //Check if can move to next a_x
            if (a_map.IsTileBlocking( a_map.m_tiles[a_x][a_y], f_currentDirection) )
            {
                break;
            }
            
            a_x += f_posAdd;

            if (a_x < 0 || a_x >= a_map.m_width)
            {
                break;
            }

            if (a_map.IsTileBlocking(a_map.m_tiles[a_x][ a_y], f_nextDirection) )
            {
                break;
            }
        }
    }
    else
    {
        if (a_direction === irinori.Direction.Top)
        {
            f_currentDirection = irinori.Direction.Top;
            f_nextDirection = irinori.Direction.Bottom;
            f_posAdd = -1;
        }
        else
        {
            f_currentDirection = irinori.Direction.Bottom;
            f_nextDirection = irinori.Direction.Top;
        }

        while (true)
        {
            //Draw on a_x a_y
            f_image = this.GetImageElement(this.GetImgFacingClass(a_direction) , irinori.Gameview.imgbasepath + this.GetEffectImgpath(a_type), a_x, a_y  + (1 / irinori.Gameview.totalScale) );            

            this.m_staticEffects.appendChild(f_image); 
            
            //Check if can move to next a_x
            if (a_map.IsTileBlocking( a_map.m_tiles[a_x][a_y], f_currentDirection) )
            {
                break;
            }
            
            a_y += f_posAdd;

            if (a_y < 0 || a_y >= a_map.m_height)
            {
                break;
            }

            if (a_map.IsTileBlocking(a_map.m_tiles[a_x][ a_y], f_nextDirection) )
            {
                break;
            }
        }  
    }          
}

//************
//  DrawRobot
//************

irinori.Gameview.prototype.DrawRobots = function(a_players)
{
    ///<summary>A draw robots function that draws the robots if the game is just sent incase no cycle has been done yet</summary>
    for (var i = 0; i < a_players.length; i++) 
    {
        if (a_players[i].m_robot.m_alive)
        {        
            f_image = this.GetImageElement(this.GetImgFacingClass(a_players[i].m_robot.m_direction), irinori.Gameview.imgbasepath + this.GetRobotImgpath(a_players[i].m_robot) , a_players[i].m_robot.m_posX, a_players[i].m_robot.m_posY );
            f_image.id = "robot_" + a_players[i].m_name;            

            this.m_robots.appendChild(f_image);    
        }
    }

    if (this.m_clientPlayer.m_robot.m_lives > 0)
    {
        this.m_respawnImage = this.GetImageElement("", irinori.Gameview.imgbasepath + irinori.Gameview.respawnimgpath, this.m_clientPlayer.m_robot.m_spawnX, this.m_clientPlayer.m_robot.m_spawnY);
        this.m_respawnImage.id = irinori.Gameview.respawnimageID;
        this.m_robots.appendChild(this.m_respawnImage); 
    }

}

irinori.Gameview.prototype.GetRobotImgpath = function(a_robot)
{
    //Return based on robot type different looks!
    switch (a_robot.m_type)
    {
        case irinori.Robottype.A:
            return "robot_purple.png";
        case irinori.Robottype.B:
            return "robot_green.png";
        case irinori.Robottype.C:
            return "robot_red.png";
        case irinori.Robottype.D:
            return "robot_black.png";
        case irinori.Robottype.E:
            return "robot_blue.png";
        case irinori.Robottype.F:
            return "robot_brown.png";
        case irinori.Robottype.G:
            return "robot_lightblue.png";
        case irinori.Robottype.H:
            return "robot_yellow.png";
        default:
            console.log("irinori.Gameview.GetRobotImgpath: Bad robot type sent, returned default image");
            return "robot_purple.png";
    }
}

irinori.Gameview.prototype.GetTiletypeImgPath = function(a_tile,a_map,a_x,a_y)
{
    var f_tempAdjacentType;
    var f_tempAdjacentTile;

    var f_adjacentCount = 0;
    var f_direction;
    var f_type = "";

    switch (a_tile.m_type) 
    {
        case irinori.TileType.Normal:
            return "normal.png";            
        case irinori.TileType.Hole:
            return "hole.png";
        case irinori.TileType.ExpressConveyorBelt:
            f_type = "express";
            //thanks to case fallthrough can use same function!        
        case irinori.TileType.ConveyorBelt:
            f_type += "conveyorbelt";


            //Note to self: this logic does indeed work, I thought wrong, fucked it up, had to revert from last revision! sooo... do not touch this cause it does indeed work!
            //Also, it is a bit complex!
            if (a_tile.m_direction === irinori.Direction.Left || a_tile.m_direction === irinori.Direction.Right)
           {
                //adjacentCount index:
                //-1 = down_left/right
                //0 = left/right
                //1 = up_left/right
                //2 = downup_left/right    

                if (a_tile.m_direction === irinori.Direction.Left)
                {
                    f_direction = "left.png";
                }
                else
                {
                    f_direction = "right.png";
                }               
                         
                //tile below                
                if (a_y+1 < a_map.m_height)
                {
                    f_tempAdjacentTile = a_map.m_tiles[a_x][a_y+1];                    
                    
                    if (f_tempAdjacentTile.m_direction === irinori.Direction.Top && (f_tempAdjacentTile.m_type === irinori.TileType.ConveyorBelt || f_tempAdjacentTile.m_type === irinori.TileType.ExpressConveyorBelt) )
                    {
                        f_adjacentCount = 1;
                    }
                }
                //Tile above
                if (a_y-1 >= 0)
                {
                    f_tempAdjacentTile = a_map.m_tiles[a_x][a_y-1];
                    
                    if (f_tempAdjacentTile.m_direction === irinori.Direction.Bottom && (f_tempAdjacentTile.m_type === irinori.TileType.ConveyorBelt || f_tempAdjacentTile.m_type === irinori.TileType.ExpressConveyorBelt) )
                    {
                        if (f_adjacentCount === 1)
                        {
                            f_adjacentCount = 2;
                        }
                        else
                        {
                            f_adjacentCount = -1;
                        }
                    }
                }

                if (f_adjacentCount === 2)
                {
                    //temp as no updown exists yet!
                    return f_type + "_united_" + f_direction;//return "conveyorbelt_left.png";
                }
                else if (f_adjacentCount === 1)
                {
                    return f_type + "_up_" + f_direction;  //left.png";
                }
                else if (f_adjacentCount === -1)
                {
                    return f_type + "_down_" + f_direction; //left.png";
                }
                else
                {
                    return f_type + "_" + f_direction;//   left.png";
                }
                
            }
            //if bottom / right! 
            else
            {
                //adjacent index
                //-1 right_up/down
                ///0 up/down
                ///1 left_up/down
                ///2 left & right  down/up

                if (a_tile.m_direction === irinori.Direction.Top)
                {
                    f_direction = "up.png";
                }
                else
                {
                    f_direction = "down.png";
                }

                //tile to the side
                if (a_x+1 < a_map.m_width)
                {
                    //f_tempAdjacentType = a_map.m_tiles[a_x+1][a_y].m_type;
                    f_tempAdjacentTile = a_map.m_tiles[a_x+1][a_y];
                
                    if (f_tempAdjacentTile.m_direction === irinori.Direction.Left && (f_tempAdjacentTile.m_type === irinori.TileType.ConveyorBelt || f_tempAdjacentTile.m_type === irinori.TileType.ExpressConveyorBelt))
                    {
                        f_adjacentCount = 1;
                    }
                }

                if (a_x-1 >= 0)
                {
                    f_tempAdjacentTile = a_map.m_tiles[a_x-1][a_y];

                    if (f_tempAdjacentTile.m_direction === irinori.Direction.Right && (f_tempAdjacentTile.m_type === irinori.TileType.ConveyorBelt || f_tempAdjacentTile.m_type === irinori.TileType.ExpressConveyorBelt) )
                    {
                        if (f_adjacentCount === 1)
                        {
                            f_adjacentCount = 2;
                        }
                        else
                        {
                            f_adjacentCount = -1;
                        }
                    }
                }

                if (f_adjacentCount === 2)
                {
                    //temp as no updown exists yet!
                    return f_type + "_united_" + f_direction;//return "conveyorbelt_left.png";
                }
                else if (f_adjacentCount === 1)
                {
                    return f_type + "_left_" + f_direction;  
                }
                else if (f_adjacentCount === -1)
                {
                    return f_type + "_right_" + f_direction; 
                }
                else
                {
                    return f_type + "_" + f_direction;
                }                
            }
        case irinori.TileType.GearRight:
            return "gear_left.png"
        case irinori.TileType.GearLeft:
            return "gear_right.png";
        case irinori.TileType.Repair:
            return "repair.png";
        case irinori.TileType.RepairAndEquip:
            return "repairequip.png";
       
    }//End switch  

}//End GetTileTypeImgpath

irinori.Gameview.prototype.GetCheckpointDiv = function(a_checkpointNumber)
{
    var f_div = document.createElement("div");
    f_div.setAttribute("class","checkpoint");
    //f_div.onselectstart = function() { return false; };
    
    var f_image = this.GetImageElement("", irinori.Gameview.imgbasepath + "checkpoint.png");

    var f_p = document.createElement("p");
    f_p.setAttribute("class","checkpointNumber");
    f_p.innerHTML = a_checkpointNumber;

    var f_fontSize = (irinori.Gameview.worldToViewScale / irinori.Gameview.originalScale) * 15;

    f_p.style.fontSize = f_fontSize + "px";

    //Hardcoded numbers *yurk but kind of have to for now!
    if (a_checkpointNumber > 9)
    {
        f_p.style.left = (irinori.Gameview.totalScale / 2) - 6 + "px"        
    }
    else
    {
        f_p.style.left = (irinori.Gameview.totalScale / 2) - 3 + "px";        
    }
    
    f_p.style.top = (irinori.Gameview.totalScale / 2) - f_fontSize + "px";    

    f_div.appendChild(f_image);
    f_div.appendChild(f_p);

    return f_div;
}

irinori.Gameview.prototype.GetSideobjectImgpath = function(a_type)
{
    switch (a_type) 
    {
        case irinori.SideObject.Laserx1:
            return "laser_single.png";
        case irinori.SideObject.Laserx2:
            return "laser_double.png";
        case irinori.SideObject.Laserx3:
            return "laser_triple.png";
        case irinori.SideObject.Wall:
            return "wall.png";
        case irinori.SideObject.PusherOdd:
            return "pusher_odd.png";
        case irinori.SideObject.PusherEven:
            return "pusher_even.png";
        default:
            throw "Wrong type";              
    }
}


irinori.Gameview.prototype.GetImgFacingClass = function(a_direction)
{
    if (a_direction === undefined)
    {
        throw "You have specify a direction";
    }

    if (a_direction === irinori.Direction.Left)
    {
        return "imgFacingLeft";
    }
    else if (a_direction === irinori.Direction.Top)
    {
        return "imgFacingTop";
    }
    else if (a_direction === irinori.Direction.Right)
    {
        return "imgFacingRight";
    }
    else
    {
        return "imgFacingBottom";
    }
}

irinori.Gameview.prototype.GetEffectImgpath = function(a_type)
{
    switch (a_type) 
    {
        case irinori.SideObject.Laserx1:
            return "laserbeam_single.png";
        case irinori.SideObject.Laserx2:
            return "laserbeam_double.png";
        case irinori.SideObject.Laserx3:
            return "laserbeam_triple.png";
        default:
            throw "Bad type in GetEffectImgpath";
            break;        
    }
}