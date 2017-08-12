 //Intellisense stuff
 ///<reference path="references.js" />

// Initialize namespace.
if ( window.irinori === undefined ) {
	//var irinori = {};
    window.irinori = {};
}

//Enum direction
//DO NOT CHANGE ORDER because this particular order is used in executeRegister and other places! SO DO NOT CHANGE ORDER
irinori.Direction = { "Left" : 0, "Top" : 1, "Right" : 2, "Bottom" : 3 };

/**
 * Object: Game engine.
 */
 //The constructor
irinori.engine = function () 
{   
    //holds a game to handle
    this.m_currentGame; 

    this.m_gameview = new irinori.Gameview();    
};

irinori.engine.prototype.SetCurrentGame = function(a_game)
{
    this.m_currentGame = a_game;
}

irinori.engine.prototype.DoMajorCycle = function()
{
    //My way: this.DoMinorCycle(0);
    //In the end of DoMinorCycle : if (a_registerID < this.m_currentGame.m_amountOfRegisters) SetTimeout( this.DoMinorCycle(a_registerID + 1 ) ;
    //Also at the end of DoMinorCycle, Draw! 
    
    var i;
    for (i = 0; i < this.m_currentGame.m_amountOfRegisters; i++) {
        //if the game has been won
        if (this.m_currentGame.m_winner) {
            break;
        }
        this.DoMinorCycle(i);
    }

    this.MajorCleanup();

    this.m_gameview.Draw(this.m_currentGame);
}

irinori.engine.prototype.DoMinorCycle = function (a_registerID) {
    //move robots
    var i;
    var j;
    var f_tempRobots = [];
    var f_robot;

    // ExecuteRegister
    //first we need to sort the robots, so that we can execute the registers in order of the priority
    //loop through all robots
    for (i = 0; i < this.m_currentGame.m_players.length; i++) {
        //get robot
        f_robot = this.m_currentGame.m_players[i].m_robot;

        //Adds a position of the robot before anything happens to it and the robot player to easy get the name of robot!
        this.m_gameview.m_majorCycleCollection.AddRobotPosition(f_robot, this.m_currentGame.m_players[i]);

        //if the robot may execute it's register
        if (f_robot.m_alive === true && f_robot.m_powerDownStatus !== irinori.PowerDownStatus.True && f_robot.m_hasBeenDead !== true) {
            //If the robot list is not empty, need to sort & search after priority!
            if (f_tempRobots.length > 0) {
                //if the current robot's register card has lower priority than the last robot in the priority list
                if (f_robot.m_registers[a_registerID].m_card.m_priority <= f_tempRobots[f_tempRobots.length - 1].m_registers[a_registerID].m_card.m_priority) {
                    //add the current robot in the end
                    f_tempRobots.push(f_robot);
                }
                else {
                    //loop through all robots in the priority list
                    for (j = 0; j < f_tempRobots.length; j++) {
                        //if the current robot's register card has higher priority than someone in the list
                        if (f_robot.m_registers[a_registerID].m_card.m_priority > f_tempRobots[j].m_registers[a_registerID].m_card.m_priority) {

                            //add the current robot at j and push the other robots 1 step further back
                            //so highest priority is first in f_tempRobots
                            f_tempRobots.splice(j, 0, f_robot);

                            break; //to avoid duplicates
                        }
                    }
                }
            }
            else {
                f_tempRobots.push(f_robot);
            }


        } //if the robot may execute it's register
    } //robots

    //now they should be sorted, so go through each robot in the priority list!
    for (i = 0; i < f_tempRobots.length; i++) {
        //do what the register card say, in order!
        this.ExecuteRegister(f_tempRobots[i], a_registerID);

        //So you can animate each players moving & pushing robots!
        //this.m_gameview.m_turnmovements.NewMovementPart();
    }


    // MoveExpressConveyorBelts
    this.MoveConveyorBelts(true);    

    // MoveConveyorbelts
    this.MoveConveyorBelts(false);
    

    // PushPushers
    this.PushPushers(a_registerID);    

    // RotateGears
    this.RotateGears();

    // FireBoardLasers
    this.FireBoardLasers();

    // FireRobotLasers
    this.FireRobotLasers();

    // CheckFlags
    this.CheckFlags();

    // Clean up (handle dead robots, reset variables, etc)
    this.MinorCleanup();   

    this.m_gameview.m_majorCycleCollection.AddMinorCycle();    
}

irinori.engine.prototype.TryToMoveRobot = function(a_robot, a_direction, a_moveCount)
{
    var f_posData = this.CanMoveRobot(a_robot, a_direction, a_moveCount, true);

    if (f_posData.m_moveCount > 0)
    {
        this.MoveRobot(a_robot, f_posData.m_posX, f_posData.m_posY);
        if (f_posData.m_pushedRobot !== null)
        {
            this.MoveRobot(f_posData.m_pushedRobot, f_posData.m_pushedRobotData.m_posX, f_posData.m_pushedRobotData.m_posY);
        }
    }
    
}

irinori.engine.prototype.ExecuteRegister = function(a_robot, a_registerID)
{
    var f_card = a_robot.m_registers[a_registerID].m_card;
    var f_reverseDirection = undefined;

    switch (f_card.m_type)
    {
        case irinori.RegisterCardtype.Move3:
            this.TryToMoveRobot(a_robot, a_robot.m_direction, 3);
            break;
        case irinori.RegisterCardtype.Move2:           
            this.TryToMoveRobot(a_robot, a_robot.m_direction, 2);
            break;
        case irinori.RegisterCardtype.Move1:
            this.TryToMoveRobot(a_robot, a_robot.m_direction, 1);
            break;
        case irinori.RegisterCardtype.BackUp:
            //sets f_reversedirection to the opposite, not robots direction itself as it doesn't turn, just moved backwards!
            if (a_robot.m_direction === irinori.Direction.Left)
            {
                f_reverseDirection = irinori.Direction.Right;
            }
            else if (a_robot.m_direction === irinori.Direction.Right)
            {
                f_reverseDirection = irinori.Direction.Left;
            }
            else if (a_robot.m_direction === irinori.Direction.Top)
            {
                f_reverseDirection = irinori.Direction.Bottom;
            }
            else
            {
                f_reverseDirection = irinori.Direction.Top;
            }

            this.TryToMoveRobot(a_robot, f_reverseDirection, 1);

            break;
        case irinori.RegisterCardtype.TurnRight:
            //rotate the robot (right)
            this.RotateRobot(a_robot, 1);
            break;
        case irinori.RegisterCardtype.TurnLeft:
            //rotate the robot (left)
            this.RotateRobot(a_robot, -1);
            break;
        case irinori.RegisterCardtype.UTurn:
            //rotate the robot (left x2)
            this.RotateRobot(a_robot, -2);
            break;
        default:
            throw "irinori.engine.ExecuteRegister got a bad cardtype";

    }
}

//Moves a robot to a_x, a_y. So this function requires to have validated positions BEFORE, as this one stricly only moves them
irinori.engine.prototype.MoveRobot = function(a_robot, a_x, a_y)
{    
    var f_oldX = a_robot.m_posX;
    var f_oldY = a_robot.m_posY;  

    //if the tile that robot has reference of the robot, set it to null as it's moving. 
    if (this.m_currentGame.m_map.m_tiles[a_robot.m_posX][a_robot.m_posY].r_robot === a_robot)
    {
        this.m_currentGame.m_map.m_tiles[a_robot.m_posX][a_robot.m_posY].r_robot = null;
    }
    
    a_robot.m_posX = a_x;
    a_robot.m_posY = a_y;

    this.m_gameview.m_majorCycleCollection.AddAnimationData( irinori.AnimationData.CreateMovement(a_robot, f_oldX, f_oldY, a_x, a_y) );

    //Kill robot dun dun!
    if (!this.m_currentGame.m_map.IsTile(a_x, a_y) || this.m_currentGame.m_map.m_tiles[a_x][a_y].m_type === irinori.TileType.Hole)
    {
        //death by a hole..
        a_robot.m_alive = false;
                
        this.m_gameview.m_majorCycleCollection.AddAnimationData( irinori.AnimationData.CreateDeath(a_robot, irinori.AnimationData.CauseOfDeath.Hole) );
    }
    else
    {
        this.m_currentGame.m_map.m_tiles[a_x][a_y].r_robot = a_robot;
        //this.m_gameview.m_majorCycleCollection.AddAnimationData( irinori.AnimationData.CreateMovement(a_robot, f_oldX, f_oldY, a_x, a_y) );
    }    
}

/*  
    CanMoveRobot
*/

//Returns new position of the robot, and along with any possible robot that got pushed!
irinori.engine.prototype.CanMoveRobot = function(a_robot, a_direction, a_tileMoveCount, a_pushRobots)
{
    


    //Short description:
    //Sets a position data with position, then gets direction robot is moving L/R  or U/D  is grouped together
    //Then it loops a_tileMoveCount times and adds the new position, then checks for collision e.t.c.
    //If it can't move cause of tile or robot it reverts the position it added & movecount
    //If a robot is found, it calls CanMoveRobot but for the robot and sets a_pushRobots to false, if the m_movecount > 0 for the robot that is pushed it could move it! 

    var f_data = new irinori.Positiondata(a_robot.m_posX, a_robot.m_posY);

    if (!a_robot.m_alive)
    {
        return f_data;   
    }

    //Will either be -1 or 1,  
    //-1 if going left or up!  1 right / down
    var f_posAdd = 1;
    var f_currentTile = null;
    var f_nextTile = null;

    var f_currentDirection;
    var f_nextDirection;

    //Moving left or right
    if (a_direction === irinori.Direction.Left || a_direction === irinori.Direction.Right)
    {
        //The directions are set to what walls to check for when moving from tile to tile
        if (a_direction === irinori.Direction.Left)
        {
            f_posAdd = -1;
            f_currentDirection = irinori.Direction.Left;
            f_nextDirection = irinori.Direction.Right;
        }
        else
        {
            f_currentDirection = irinori.Direction.Right;
            f_nextDirection = irinori.Direction.Left;
        }
              
        for (; a_tileMoveCount > 0; a_tileMoveCount--) 
        {
            //Set tile before adding f_posAdd, then do it again to get 'next tile'
            f_currentTile = this.m_currentGame.m_map.m_tiles[f_data.m_posX][f_data.m_posY];
            f_data.m_posX += f_posAdd;
            f_data.m_moveCount++;
             
            //Has to check if tile is blocking towards 'next tile'  and if it is, can't move there!
            //This check USED to be further down but as we had a border with holes then this wasn't neccesary prior to IsTile (as IsTile never should have been needed to be checked thanks to hole order)
            if (this.m_currentGame.m_map.IsTileBlocking(f_currentTile, f_currentDirection ) )
            {
                f_data.m_posX -= f_posAdd;
                f_data.m_moveCount--;
                break;
            }

             //Not finished, start of "no black hole border" 
            //Check if new position is on the map, if it isn't it's counted as "insta kill zone, which MoveRobot will handle, so just break the loop!"
            if (!this.m_currentGame.m_map.IsTile(f_data.m_posX, f_data.m_posY) )
            {               
               break;
            }
             
            //set temporary tile to do collision logic with          
            f_nextTile = this.m_currentGame.m_map.m_tiles[f_data.m_posX][f_data.m_posY];            

            //If moving left you can collide with right wall on current tile and left wall on next tile!
            if (this.m_currentGame.m_map.IsTileBlocking(f_nextTile, f_nextDirection ) )
            {
                f_data.m_posX -= f_posAdd;
                f_data.m_moveCount--;
                break;
            }
            //If the tile of next type is a hole! 
            else if (f_nextTile.m_type === irinori.TileType.Hole )
            {
                //Should probaly kill robot here, but it's movable too but can't move further :p
                break;
            }
            //Everything collision wise seems to be ok
            else if (f_nextTile.r_robot !== null)
            {                    
                if (a_pushRobots)
                {
                    f_data.m_pushedRobotData = this.CanMoveRobot(f_nextTile.r_robot, a_direction, a_tileMoveCount, false);
                    f_data.m_moveCount += f_data.m_pushedRobotData.m_moveCount - 1;

                    //Should be +=  -1 -> (a_tilecount - 1)  in span 
                    f_data.m_posX += f_posAdd * (f_data.m_pushedRobotData.m_moveCount - 1);

                    if (f_data.m_pushedRobotData.m_moveCount > 0)
                    {
                        f_data.m_pushedRobot = f_nextTile.r_robot;
                    }
                    else
                    {
                        f_data.m_pushedRobotData = null;
                    }
                }
                else
                {
                    f_data.m_posX -= f_posAdd;
                    f_data.m_moveCount--;
                    
                } 
                break;                   
            }            
        }
    }
    //Otherwise moving up or down!
    else
    {
        //If top is negative y! Time to change direction also sets what 'walls' to check when moving to a new tile
        if (a_direction === irinori.Direction.Top)
        {
            f_posAdd = -1;
            f_currentDirection = irinori.Direction.Top;
            f_nextDirection = irinori.Direction.Bottom;
        }
        else
        {
            f_currentDirection = irinori.Direction.Bottom;
            f_nextDirection = irinori.Direction.Top;
        }            

        for (; a_tileMoveCount > 0; a_tileMoveCount--) 
        {
            //Set tile before adding f_posAdd, then do it again to get 'next tile'
            f_currentTile = this.m_currentGame.m_map.m_tiles[f_data.m_posX][f_data.m_posY];
            f_data.m_posY += f_posAdd;
            f_data.m_moveCount++;

            if (this.m_currentGame.m_map.IsTileBlocking(f_currentTile, f_currentDirection ) )
            {
                f_data.m_posY -= f_posAdd;
                f_data.m_moveCount--;
                break;
            }

            if (!this.m_currentGame.m_map.IsTile(f_data.m_posX, f_data.m_posY) )
            {               
               break;
            }

            //set temporary tiles to do collision logic with            
            f_nextTile = this.m_currentGame.m_map.m_tiles[f_data.m_posX][f_data.m_posY];           
               
            //If moving left you can collide with right wall on current tile and left wall on next tile!
            if (this.m_currentGame.m_map.IsTileBlocking(f_nextTile, f_nextDirection ) )
            {
                f_data.m_posY -= f_posAdd;
                f_data.m_moveCount--;
                break;
            }
            //If the tile of next type is a hole! 
            else if (f_nextTile.m_type === irinori.TileType.Hole)
            {
                //Should probaly kill robot here, but it's movable too but can't move further :p
                break;
            }
            //Everything collision wise seems to be ok
            else if (f_nextTile.r_robot !== null)
            {                    
                if (a_pushRobots)
                {
                    f_data.m_pushedRobotData = this.CanMoveRobot(f_nextTile.r_robot, a_direction, a_tileMoveCount, false);
                    //It's minus one cause it was already added at the very top
                    f_data.m_moveCount += f_data.m_pushedRobotData.m_moveCount - 1;

                    //Should be +=  -1 -> (a_tilecount - 1)  in span 
                    f_data.m_posY += f_posAdd * (f_data.m_pushedRobotData.m_moveCount - 1);

                    if (f_data.m_pushedRobotData.m_moveCount > 0)
                    {
                        f_data.m_pushedRobot = f_nextTile.r_robot;
                    }
                    else
                    {
                        f_data.m_pushedRobotData = null;
                    }                   
                }
                else
                {
                    f_data.m_posY -= f_posAdd;
                    f_data.m_moveCount--;
                    
                }
                break;                    
            }            
        }//end for
    }//end else

    return f_data;
}

/*  
    CanConveyorBeltRobotMove
*/

//Almost the same as CanMoverobot but only 1 tile movement and stuff!
//currently is NOT checking for robots in tiled
//TODO: make it check for the arriving tile if that one has conveyor belt on it, if it DOESN*T, then check if it has robot on it, and if it does return moveCount 0!
irinori.engine.prototype.CanConveyorMoveRobot = function(a_robot, a_direction)
{
    var f_data = new irinori.Positiondata(a_robot.m_posX, a_robot.m_posY);

    if (!a_robot.m_alive)
    {
        return f_data;
    }

    //Will either be -1 or 1,  
    //-1 if going left or up!  1 right / down
    var f_posAdd = 1;
    var f_currentTile = null;
    var f_nextTile = null;

    var f_currentDirection;
    var f_nextDirection;

    //Moving left or right
    if (a_direction === irinori.Direction.Left ||a_direction === irinori.Direction.Right)
    {
        if (a_direction === irinori.Direction.Left)
        {
            f_posAdd = -1;
            f_currentDirection = irinori.Direction.Left;
            f_nextDirection = irinori.Direction.Right;
        }
        else
        {
            f_currentDirection = irinori.Direction.Right;
            f_nextDirection = irinori.Direction.Left;
        }
                
        //set temporary tiles to do collision logic with
        f_currentTile = this.m_currentGame.m_map.m_tiles[f_data.m_posX][ f_data.m_posY];

        if (this.m_currentGame.m_map.IsTileBlocking(f_currentTile, f_currentDirection ) )
        {
            return f_data;
        }

        f_data.m_posX += f_posAdd;
        f_data.m_moveCount++;

        //if "death border" move there
        if (!this.m_currentGame.m_map.IsTile(f_data.m_posX, f_data.m_posY) )
        {          
            return f_data
        }

        f_nextTile = this.m_currentGame.m_map.m_tiles[f_data.m_posX][ f_data.m_posY];        

        //If moving left you can collide with right wall on current tile and left wall on next tile!
        if (this.m_currentGame.m_map.IsTileBlocking(f_nextTile, f_nextDirection ) )
        {
            f_data.m_posX -= f_posAdd;
            f_data.m_moveCount--;
            return f_data;            
        }            
    }
    //Otherwise moving up or down!
    else
    {
        //If top is negative y! 
        if (a_direction === irinori.Direction.Top)
        {
            f_posAdd = -1;
            f_currentDirection = irinori.Direction.Top;
            f_nextDirection = irinori.Direction.Bottom;
        }
        else
        {
            f_currentDirection = irinori.Direction.Bottom;
            f_nextDirection = irinori.Direction.Top;
        }
        
        //set temporary tiles to do collision logic with
        f_currentTile = this.m_currentGame.m_map.m_tiles[f_data.m_posX][ f_data.m_posY];

        if (this.m_currentGame.m_map.IsTileBlocking(f_currentTile,  f_currentDirection ) )
        {           
            return f_data;       
        }

        f_data.m_posY += f_posAdd;
        f_data.m_moveCount++;

        if (!this.m_currentGame.m_map.IsTile(f_data.m_posX,  f_data.m_posY) )
        {            
            return f_data;
        }

        f_nextTile = this.m_currentGame.m_map.m_tiles[f_data.m_posX][ f_data.m_posY];

        //If moving left you can collide with right wall on current tile and left wall on next tile!
        if (this.m_currentGame.m_map.IsTileBlocking(f_nextTile, f_nextDirection ) )
        {
            f_data.m_posY -= f_posAdd;
            f_data.m_moveCount--;
            return f_data;
        }       
    }

    return f_data;
}


/*
    MoveConveyorBelts
*/

irinori.engine.prototype.MoveConveyorBelts = function(a_expressOnly)
{
    ///<summary>Moves robots ontop a conveyorbelt</summary>
    ///<param type="bool" value="a_expressOnly">Moves ONLY Express Conveyorbelts if true, otherwise both types</param>
    
    //got ConveyorHelperData in each slot so not robots references only! -- got a bad name cause of lazy refactorers and bad name imagination
    var f_robots = [];

    var f_tempConveyoHelperData = null;

    var i = 0;
    var j = 0;
    var f_tempTile;
    
    //Used in the big check so -> <- doesn't happen
    var f_currentTile;
    //same for f_direction, it makese the <- into -> to see if current & next is the same direction!
    var f_direction;

    var f_restart = false;

    var f_posData = null;
    var f_found = false;

    //Cached robot!
    var f_robot = null; 
       
    for (i = 0; i < this.m_currentGame.m_players.length; i++) 
    {
        if( !this.m_currentGame.m_players[i].m_robot.m_alive)
        {
            continue;
        }

        //get tile
        f_tempTile = this.m_currentGame.m_map.GetRobotTile(this.m_currentGame.m_players[i].m_robot);

        if (f_tempTile.m_type === irinori.TileType.ExpressConveyorBelt)
        {
            //fill the CollisionHelpData (moving along the conveyorbelt's direction)
            this.FindCollidingRobots(this.m_currentGame.m_players[i].m_robot, f_tempTile.m_direction, f_robots);
        }
        //Does same stuff as function above but also for normal conveyorbelt tiles!
        else if (f_tempTile.m_type === irinori.TileType.ConveyorBelt && !a_expressOnly)
        {
            //fill the CollisionHelpData (moving along the conveyorbelt's direction)
            this.FindCollidingRobots(this.m_currentGame.m_players[i].m_robot, f_tempTile.m_direction, f_robots);
        }
    }

    //Now the robots that can be moved should be in a list!
    //So start by looping through to see if there's more than 1 robot at same destination, then remove these from the list!
    for (i = 0; i < f_robots.length;) 
    {
        if (f_robots[i].m_robots.length !== 1)
        {
            f_robots.splice(i, 1);
        }
        else
        {
            i++;
        }
    }

    //Now the list should have only single 1 robot per destination, time get into more logic to root out more special cases!
    for (i = 0; i < f_robots.length; ) 
    {
        //If tile is off the map and it knows not more than 1 is going there as previous for loop deleted multiples, no need to check more!
        //Which is why, If the position is on the map, check the position you land on if other robots are 'moving' aswell!
        if (this.m_currentGame.m_map.IsTile(f_robots[i].m_tileX,f_robots[i].m_tileY) )
        {
            f_tempTile = this.m_currentGame.m_map.m_tiles[f_robots[i].m_tileX][f_robots[i].m_tileY];
        
            if (f_tempTile.r_robot !== null )
            {
                f_found = false;
                f_currentTile = this.m_currentGame.m_map.GetRobotTile(f_robots[i].m_robots[0]);              
               
               //Checks if the tile it's going to is in opposite direction of itself and if it's a conveyor belt, meaning -> <- collision and they can't swap positions
                if (a_expressOnly && f_currentTile.m_type === irinori.TileType.ExpressConveyorBelt)
                {                    
                    if (f_tempTile.m_type === irinori.TileType.ExpressConveyorBelt)
                    {
                        f_found === true;
                    }
                    
                }
                //Same check but for normal conveyorbelt and not just express
                else 
                {
                    if (f_tempTile.m_type === irinori.TileType.ExpressConveyorBelt || f_tempTile.m_type === irinori.TileType.ConveyorBelt)
                    {
                        f_found = true;
                    }
                }
                
                //If it found that the tiles are possibly gonna be -> <- colliding it checks here if they really are
                if (f_found)
                {                    
                    //Start by getting direction, if it's the same, do more checks
                    f_direction = f_tempTile.m_direction + 2;                           

                    if (f_direction > 3)
                    {
                        f_direction -= 4;
                    }

                    //As the direction was flipped, meaning R got L,  so if they are now the same direction an -> <- collision happened
                    if (f_direction === f_currentTile.m_direction)
                    {
                        f_found = true;
                    }
                    else
                    {
                        f_found = false;
                    }
                }                

                
                //Not the prettiest way of doing it but..
                //If f_found is still false after the if check above, do regular forloop!  cause if f_found is true it means they can't move, so splice away i and restart loop
                if (!f_found)
                {
                    for (j = 0; j < f_robots.length; j++) 
                    {
                        if (j === i)
                        {
                            continue;
                        }

                        if (f_tempTile.r_robot === f_robots[j].m_robots[0])
                        {
                            f_found = true;
                            break;
                        }                
                    }
                }
                //If f_found == true
                else
                {
                    //Has to set f_found to false so it does the function below...!
                    f_found = false;
                }       

                

                //If f_found is false it means it found a robot that can't move, thus it cannot move aswell!
                if (!f_found)
                {
                    f_restart = true;                
                    f_robots.splice(i, 1);
                }
            }
        }       
           
        if (f_restart)
        {
            i = 0;
            f_restart = false;
        }    
        else
        {
            i++;        
        }
    }

    //Finally move the robots that can truly move!
    for (i = 0; i < f_robots.length; i++) 
    {
        f_tempConveyoHelperData = f_robots[i];
        f_robot = f_tempConveyoHelperData.m_robots[0];
        

        f_currentTile = this.m_currentGame.m_map.GetRobotTile(f_robot);
        
        if (this.m_currentGame.m_map.IsTile(f_tempConveyoHelperData.m_tileX,f_tempConveyoHelperData.m_tileY) )
        {
            f_tempTile = this.m_currentGame.m_map.m_tiles[f_tempConveyoHelperData.m_tileX][f_tempConveyoHelperData.m_tileY];

            if (f_tempTile.m_type === irinori.TileType.ConveyorBelt || f_tempTile.m_type === irinori.TileType.ExpressConveyorBelt)
            {
                f_found = false;
                f_direction = f_currentTile.m_direction;

                //First try to the right
                f_direction++;

                if(f_direction > 3)
                {
                    f_direction -= 4;
                }

                if (f_direction === f_tempTile.m_direction && f_direction )
                {
                    //rotate robot right
                    this.RotateRobot(f_robot, 1);

                    f_found = true;
                }

                if (!f_found)
                {
                    f_direction = f_currentTile.m_direction;

                    //Then try to the left
                    f_direction--;

                    if(f_direction < 0)
                    {
                        f_direction = 3;
                    }

                    if (f_direction === f_tempTile.m_direction)
                    {
                        //rotate robot left
                        this.RotateRobot(f_robot, -1);                       
                    }
                }
            }           
        }    
                 
        this.MoveRobot(f_robot, f_tempConveyoHelperData.m_tileX, f_tempConveyoHelperData.m_tileY);    
    }
}

/*
    RotateGears
*/

irinori.engine.prototype.RotateGears = function () {
    var i;
    var f_robot;
    var f_tile;

    //loop through all robots
    for (i = 0; i < this.m_currentGame.m_players.length; i++) {
        //get robot
        f_robot = this.m_currentGame.m_players[i].m_robot;

        if (!f_robot.m_alive) {
            continue;
        }

        //get tile
        f_tile = this.m_currentGame.m_map.GetRobotTile(f_robot);

        //if the robot is on a GearLeft tile
        if (f_tile.m_type === irinori.TileType.GearLeft) {
            //rotate left
            this.RotateRobot(f_robot, -1);
        }
        //if the robot is on a GearRight tile
        else if (f_tile.m_type === irinori.TileType.GearRight) {
            //rotate right
            this.RotateRobot(f_robot, 1);
        }
    }
}


irinori.engine.prototype.FireBoardLasers = function () {
    var i;
    var f_dir;
    var j;
    var f_offsetX;
    var f_offsetY;
    var f_reverseDirection;
    var f_robot;
    var f_tile;

    //loop through all robots
    for (i = 0; i < this.m_currentGame.m_players.length; i++) {
        //get robot
        f_robot = this.m_currentGame.m_players[i].m_robot;

        if (!f_robot.m_alive)
        {
            continue;
        }

        //search in all 4 directions from the robot for a laser
        for (f_dir = 0; f_dir < 4; f_dir++) {
            //set offsets (used to go thorugh tiles in a direction)
            switch (f_dir) {
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

            //check the other tiles in the direction from the robot, until we hit something
            for (j = 1; true; j++) {

                //check for any SideObject pointing towards the robot
                if (this.m_currentGame.m_map.IsTileBlocking(this.m_currentGame.m_map.m_tiles[(f_robot.m_posX + f_offsetX * j) - f_offsetX][(f_robot.m_posY + f_offsetY * j) - f_offsetY], [f_dir])) {
                    //get the tile
                    f_tile = this.m_currentGame.m_map.m_tiles[(f_robot.m_posX + f_offsetX * j) - f_offsetX][(f_robot.m_posY + f_offsetY * j) - f_offsetY];

                    //check for laser (x1)
                    if (f_tile.HasSideObject(f_dir, irinori.SideObject.Laserx1)) {
                        //shoot the robot for 1 damage
                        f_robot.ChangeHealth(-1);
                    }
                    //check for laser (x2)
                    else if (f_tile.HasSideObject(f_dir, irinori.SideObject.Laserx2)) {
                        //shoot the robot for 2 damage
                        f_robot.ChangeHealth(-2);
                    }
                    //check for laser (x3)
                    else if (f_tile.HasSideObject(f_dir, irinori.SideObject.Laserx3)) {
                        //shoot the robot for 3 damage
                        f_robot.ChangeHealth(-3);
                    }
                    
                    break; //a wall blocked the way (we might have found a laser but then the laser itself is blocking the way for any other lasers to hit)
                }
                else {
                    //check if there is another tile
                    if (this.m_currentGame.m_map.IsTile(f_robot.m_posX + f_offsetX * j, f_robot.m_posY + f_offsetY * j)) {

                        //set the reverse direction
                        f_reverseDirection = f_dir + 2;
                        if (f_reverseDirection > irinori.Direction.Bottom) {
                            f_reverseDirection -= (irinori.Direction.Bottom + 1);
                        }

                        //check if there ISN'T any SideObject pointing away from the robot (it will block the possibility of any lasers hitting you from this directon)
                        if (!this.m_currentGame.m_map.IsTileBlocking(this.m_currentGame.m_map.m_tiles[f_robot.m_posX + f_offsetX * j][f_robot.m_posY + f_offsetY * j], [f_reverseDirection])) {
                            //there was no wall..

                            //check for robot
                            if (this.m_currentGame.m_map.m_tiles[f_robot.m_posX + f_offsetX * j][f_robot.m_posY + f_offsetY * j].r_robot === null) {
                                continue; //at this point we start searching the next tile (the continue is not acctually required.. I think.. But it makes my head feel good)
                            }
                            else {
                                break; //a robot blocked the way
                            }
                        }
                        else {
                            break; //a wall blocked the way
                        }
                    }
                    else {
                        break; //end of map
                    }
                }
            } //tiles
        } //directions
    } //robots
}


irinori.engine.prototype.FireRobotLasers = function () {
    var i;
    var j;
    var f_offsetX;
    var f_offsetY;
    var f_reverseDirection;
    var f_robot;
    var f_allowedPlayers = [];

    var f_x;
    var f_y;

    //loop through all robots
    for (i = 0; i < this.m_currentGame.m_players.length; i++) {
        //check if the player's robot is alive (dead robots shouldn't shoot)
        if (this.m_currentGame.m_players[i].m_robot.m_alive === true) {
            //add the player
            f_allowedPlayers.push(this.m_currentGame.m_players[i]);
        }
    }

    //loop through all players that are allowed to shoot
    for (i = 0; i < f_allowedPlayers.length; i++) {
        //get robot
        f_robot = f_allowedPlayers[i].m_robot;

        //set offsets (used to go thorugh tiles in a direction)
        switch (f_robot.m_direction) {
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

        //check the other tiles in front of the robot, until we hit something
        for (j = 1; true; j++) {
            f_x = f_robot.m_posX + f_offsetX * j;
            f_y = f_robot.m_posY + f_offsetY * j;

            //check for a next tile (starts checking the tile next to the robot and then continues)
            if (this.m_currentGame.m_map.IsTile(f_x, f_y)) {
                //let's see if we can reach this tile
                //we will have to check for 2 walls, to make sure that we can reach the tile

                //check for any first wall (the wall on the tile before the tile we are trying to reach)
                if (!this.m_currentGame.m_map.IsTileBlocking(this.m_currentGame.m_map.m_tiles[f_x - f_offsetX][f_y - f_offsetY], [f_robot.m_direction])) {
                    //set the reverse direction
                    f_reverseDirection = f_robot.m_direction + 2;
                    if (f_reverseDirection > irinori.Direction.Bottom) {
                        f_reverseDirection -= (irinori.Direction.Bottom + 1);
                    }

                    //check for any second wall (the wall on the tile we are trying to reach)
                    if (!this.m_currentGame.m_map.IsTileBlocking(this.m_currentGame.m_map.m_tiles[f_x][f_y], [f_reverseDirection])) {
                        //we reached the tile!

                        //check for robot
                        if (this.m_currentGame.m_map.m_tiles[f_x][f_y].r_robot !== null) {
                            //shoot the robot with all we got!
                            this.m_currentGame.m_map.m_tiles[f_x][f_y].r_robot.ChangeHealth(-f_robot.m_laserPower);

                            this.m_gameview.m_majorCycleCollection.AddAnimationData( irinori.AnimationData.CreateLaser( f_robot.m_direction, f_robot.m_posX + f_offsetX, f_robot.m_posY + f_offsetY, f_x, f_y, [new irinori.HitData(f_x, f_y, irinori.HitData.ParticleType.Smoke)], irinori.SideObject.Laserx1 )  );
                            break; //we hit a robot
                        }
                    }
                    else {
                        break; //the wall got blasted
                    }
                }
                else {
                    break; //the wall got blasted
                }
            }
            else {
                break; //end of map
            }
        } //tiles
    } //robots
}


irinori.engine.prototype.CheckFlags = function () {
    var i;
    var f_robot;

    //loop through all robots
    for (i = 0; i < this.m_currentGame.m_players.length; i++) {
        //get robot
        f_robot = this.m_currentGame.m_players[i].m_robot;

        //check if the robot is dead
        if (!f_robot.m_alive) {
            continue; //we dont want dead robots to repair and gain bonus cards now do we?
        }

        //check if the robot stands on a checkpoint
        if (this.m_currentGame.m_map.m_tiles[f_robot.m_posX][f_robot.m_posY].m_checkpoint !== 0) {
            //set respawn position to this tile
            f_robot.m_spawnX = f_robot.m_posX;
            f_robot.m_spawnY = f_robot.m_posY;

            //check if we got the next checkpoint
            if (f_robot.m_nextCheckpoint === this.m_currentGame.m_map.m_tiles[f_robot.m_posX][f_robot.m_posY].m_checkpoint) {
                //set nextCheckpoint
                f_robot.m_nextCheckpoint++;

                //check if this was the last checkpoint
                if (this.m_currentGame.m_map.m_amountOfCheckpoints === this.m_currentGame.m_map.m_tiles[f_robot.m_posX][f_robot.m_posY].m_checkpoint) {
                    //this robot has won the game!

                    //set the robot's player as the winner
                    this.m_currentGame.m_winner = this.m_currentGame.m_players[i];

                    //create win animation
                    this.m_gameview.m_majorCycleCollection.AddAnimationData(irinori.AnimationData.CreateWin(this.m_currentGame));
                }
            }
        }

        //check for repair tile
        if (this.m_currentGame.m_map.m_tiles[f_robot.m_posX][f_robot.m_posY].m_type === irinori.TileType.Repair) {
            //set respawn position to this tile
            f_robot.m_spawnX = f_robot.m_posX;
            f_robot.m_spawnY = f_robot.m_posY;

            //repair the robot
            f_robot.ChangeHealth(1);
        }
        //check for repair and equip tile
        else if (this.m_currentGame.m_map.m_tiles[f_robot.m_posX][f_robot.m_posY].m_type === irinori.TileType.RepairAndEquip) {
            //set respawn position to this tile
            f_robot.m_spawnX = f_robot.m_posX;
            f_robot.m_spawnY = f_robot.m_posY;

            //repair the robot
            f_robot.ChangeHealth(1);

            //give the robot a bonus card 
            //NOTE: but only if it's the 5th register, but we might want to give away only 1 in each mayorcycle instead of only giving them at the 5th
            //TODO: give it an actual card..
            f_robot.m_bonusCards.push(null);
        }

    } //robots
}


irinori.engine.prototype.MinorCleanup = function () {
    var i;
    var f_robot;

    //loop through all robots
    for (i = 0; i < this.m_currentGame.m_players.length; i++) {
        //get robot
        f_robot = this.m_currentGame.m_players[i].m_robot;

        //if the robot is dead
        if (f_robot.m_alive === false) {
            //change it's health to 0 (to not make it look confusing)
            f_robot.ChangeHealth(-f_robot.MaxHealth);
            //set the power down status to false (when you die the powerdown will be canceled)
            f_robot.m_powerDownStatus = irinori.PowerDownStatus.False;
            //the robot has been dead this turn
            f_robot.m_hasBeenDead = true;

            //if the robot's reference is on the tile it died on
            if (this.m_currentGame.m_map.IsTile(f_robot.m_posX, f_robot.m_posY) && this.m_currentGame.m_map.m_tiles[f_robot.m_posX][f_robot.m_posY].r_robot === f_robot) {
                //remove it's referense on the tile
                this.m_currentGame.m_map.m_tiles[f_robot.m_posX][f_robot.m_posY].r_robot = null;
            }

            //check if the robot can respawn
            if (f_robot.m_lives - 1 > 0) {
                //check if the robot can respawn on the spawn position
                if (this.m_currentGame.m_map.m_tiles[f_robot.m_spawnX][f_robot.m_spawnY].r_robot === null) {
                    //remove a life
                    f_robot.m_lives--;

                    //respawn the robot
                    f_robot.Respawn();

                    //set robot reference on tile
                    this.m_currentGame.m_map.m_tiles[f_robot.m_posX][f_robot.m_posY].r_robot = f_robot;
                }
            }
            else {
                //the robot has lost the game, we should probably do something here..

                //FINISH HIM! :P
                //otherwise he will have 1 life left (because we only remove life when respawning)
                f_robot.m_lives = 0;
            }
        }
    } //robots
}


/*
    PushPushers
*/
//it's nearly identical to MoveConveyorBelts, the only real difference is that we search for a side object instead of a tile type
//NOTE if anything is wrong with the logic in MoveConveyorBelts, it's probably wrong here aswell so be sure to check both functions
irinori.engine.prototype.PushPushers = function (a_register) {
    //got ConveyorHelperData in each slot so not robots references only!
    var f_robots = [];
    var i = 0;
    var j = 0;
    var f_tempTile;

    var f_restart = false;

    var f_posData = null;
    var f_found = false;
    var f_direction;

    var f_pusherType;

    //set pusher type to find (+1 because the register goes from 0 -> 4, inverting the order of even and odd)
    if ((a_register + 1) % 2 === 0) {
        f_pusherType = irinori.SideObject.PusherEven;
    }
    else {
        f_pusherType = irinori.SideObject.PusherOdd;
    }

    //loop through all robots
    for (i = 0; i < this.m_currentGame.m_players.length; i++) {
        if (!this.m_currentGame.m_players[i].m_robot.m_alive) {
            continue;
        }

        //get tile
        f_tempTile = this.m_currentGame.m_map.GetRobotTile(this.m_currentGame.m_players[i].m_robot);

        //check left side for pusher
        if (f_tempTile.m_left === f_pusherType) {
            //fill the CollisionHelpData (push right)
            this.FindCollidingRobots(this.m_currentGame.m_players[i].m_robot, irinori.Direction.Right, f_robots);
        }
        //check top side for pusher
        else if (f_tempTile.m_top === f_pusherType) {
            //fill the CollisionHelpData (push bottom)
            this.FindCollidingRobots(this.m_currentGame.m_players[i].m_robot, irinori.Direction.Bottom, f_robots);
        }
        //check right side for pusher
        else if (f_tempTile.m_right === f_pusherType) {
            //fill the CollisionHelpData (push left)
            this.FindCollidingRobots(this.m_currentGame.m_players[i].m_robot, irinori.Direction.Left, f_robots);
        }
        //check bottom side for pusher
        else if (f_tempTile.m_bottom === f_pusherType) {
            //fill the CollisionHelpData (push top)
            this.FindCollidingRobots(this.m_currentGame.m_players[i].m_robot, irinori.Direction.Top, f_robots);
        }

    } //robots

    //Now the robots that can be moved should be in a list!
    //So start by looping through to see if there's more than 1 robot at same destination, then remove these from the list!
    for (i = 0; i < f_robots.length; ) {

        if (f_robots[i].m_robots.length !== 1) {
            f_robots.splice(i, 1);
        }
        else {
            i++;
        }
    }

    //Now the list should have only single 1 robot per destination, time get into more logic to root out more special cases!
    for (i = 0; i < f_robots.length; ) {

        if (this.m_currentGame.m_map.IsTile(f_robots[i].m_tileX, f_robots[i].m_tileY)) {
            f_tempTile = this.m_currentGame.m_map.m_tiles[f_robots[i].m_tileX][f_robots[i].m_tileY];



            if (f_tempTile.r_robot !== null) {

                f_found = false;


                //this part clears the swap special case
                switch (f_robots[i].m_direction) {
                    case irinori.Direction.Left:
                        //if the tile we are going to has a pusher (of the same type) on the left slot
                        if (f_tempTile.m_left === f_pusherType) {
                            //don't allow movement!
                            f_restart = true;
                            f_robots.splice(i, 1);
                        }
                        break;
                    case irinori.Direction.Top:
                        //if the tile we are going to has a pusher (of the same type) on the top slot
                        if (f_tempTile.m_top === f_pusherType) {
                            //don't allow movement!
                            f_restart = true;
                            f_robots.splice(i, 1);
                        }
                        break;
                    case irinori.Direction.Right:
                        //if the tile we are going to has a pusher (of the same type) on the right slot
                        if (f_tempTile.m_right === f_pusherType) {
                            //don't allow movement!
                            f_restart = true;
                            f_robots.splice(i, 1);
                        }
                        break;
                    case irinori.Direction.Bottom:
                        //if the tile we are going to has a pusher (of the same type) on the bottom slot
                        if (f_tempTile.m_bottom === f_pusherType) {
                            //don't allow movement!
                            f_restart = true;
                            f_robots.splice(i, 1);
                        }
                        break;
                }


                //this part clears the circle special case
                for (j = 0; j < f_robots.length; j++) {
                    if (j === i) {
                        continue;
                    }

                    if (f_tempTile.r_robot === f_robots[j].m_robots[0]) {
                        f_found = true;
                        break;
                    }
                }


                //If f_found is false it means it found a robot that can't move, thus it cannot move aswell!
                if (!f_found) {
                    f_restart = true;
                    f_robots.splice(i, 1);
                }
            }
        }

        if (f_restart) {
            i = 0;
            f_restart = false;
        }
        else {
            i++;
        }
    }

    //Finally move the robots that can truly move!
    for (i = 0; i < f_robots.length; i++) {
        this.MoveRobot(f_robots[i].m_robots[0], f_robots[i].m_tileX, f_robots[i].m_tileY);
    }
}


irinori.engine.prototype.FindCollidingRobots = function (a_robot, a_direction, a_conveyorbeltHelpDatas) {
    var i;
    //get position data for this robot's movement
    var f_posData = this.CanConveyorMoveRobot(a_robot, a_direction);
    var f_found = false;
    //if we could move 1 tile
    if (f_posData.m_moveCount > 0) 
    {
        //this part is to ignore robot collisions on holes                
         //if it's not on a tile
         if (!this.m_currentGame.m_map.IsTile(f_posData.m_posX, f_posData.m_posY) 
         //or.. if it's a hole!
         || this.m_currentGame.m_map.m_tiles[f_posData.m_posX][f_posData.m_posY].m_type === irinori.TileType.Hole) 
        {               
                //add a new ConveyorHelpDatas
                //NOTE: when robots collide on a hole, they should both fall (thus no collision is made)
                a_conveyorbeltHelpDatas.push(new irinori.ConveyorbeltHelpData(f_posData.m_posX, f_posData.m_posY, a_robot, a_direction));
                //return as there's no need to do more!
                return;             
        }

        //go through all ConveyorHelpData
        for (i = 0; i < a_conveyorbeltHelpDatas.length; i++) {
            //if there is a collision
            if (a_conveyorbeltHelpDatas[i].m_tileX === f_posData.m_posX && a_conveyorbeltHelpDatas[i].m_tileY === f_posData.m_posY) {
                f_found = true;                
                          

                a_conveyorbeltHelpDatas[i].m_robots.push(a_robot); //add the robot to the collision
                break;
            }
        }

        //if we didn't find any collision
        if (!f_found) {
            a_conveyorbeltHelpDatas.push(new irinori.ConveyorbeltHelpData(f_posData.m_posX, f_posData.m_posY, a_robot, a_direction));
        }
    }
}


irinori.engine.prototype.MajorCleanup = function () {
    var i;
    var j;
    var f_robot;

    //loop through all robots
    for (i = 0; i < this.m_currentGame.m_players.length; i++) {
        //get robot
        f_robot = this.m_currentGame.m_players[i].m_robot;

        //reset the hasBeenDead variable
        f_robot.m_hasBeenDead = false;

        //handle power down status
        switch (f_robot.m_powerDownStatus) {
            case irinori.PowerDownStatus.Initiate:
                //start power down
                f_robot.m_powerDownStatus = irinori.PowerDownStatus.True;
                //restore health
                f_robot.ChangeHealth(irinori.Robot.prototype.MaxHealth);
                break;
            case irinori.PowerDownStatus.True:
                //return the robot to normal state
                f_robot.m_powerDownStatus = irinori.PowerDownStatus.False;
                break;
        }

        //clear registers (except the locked ones)
        //loop through all registers
        for (j = 0; j < f_robot.m_registers.length; j++) {
            //if the register is not locked
            if (!f_robot.m_registers[j].m_locked) {
                //clear the card
                f_robot.m_registers[j].m_card = undefined;
            }
        }
    }
}


//NOTE: a_rotation is how much it will turn (and which way). 
//      1 => rotates -90 degrees (right)
//      -1 => rotates 90 degrees (left)
//      -2 => rotates 180 degrees (left)    etc..
irinori.engine.prototype.RotateRobot = function (a_robot, a_rotation) {
    //rotate the robot
    var f_oldRotation = a_robot.m_direction;
    a_robot.m_direction += a_rotation;

    //in case the robot's direction is not a direction
    while (a_robot.m_direction < irinori.Direction.Left || a_robot.m_direction > irinori.Direction.Bottom) {
        if (a_rotation < 0) {
            a_robot.m_direction += 4;
        }
        else {
            a_robot.m_direction -= 4;
        }
    }

    var f_newRotation = a_robot.m_direction;

    this.m_gameview.m_majorCycleCollection.AddAnimationData( irinori.AnimationData.CreateRotation(a_robot, f_oldRotation, f_newRotation) );
}