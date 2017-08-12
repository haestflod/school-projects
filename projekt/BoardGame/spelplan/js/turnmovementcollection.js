/// <reference path="references.js" />

if (window.irinori === undefined)
{
    window.irinori = {};
}

irinori.HitData = function(a_x, a_y, a_type)
{
    this.m_particleType = a_type || irinori.HitData.ParticleType.None;

    this.m_x = a_x;
    this.m_y = a_y;
}

//Particle effect basicly
irinori.HitData.ParticleType = { "None": 0, "Smoke" : 1, };

//Should be refactored to AnimationData
irinori.AnimationData = function(a_robot, a_movementDataType)
{   
    ///<summary>Create this class by using the Create functions</summary> 
    this.m_robot = a_robot;    

    this.m_type = a_movementDataType;

}

irinori.AnimationData.Type = { "Movement" : 0, "Rotation" : 1, "Death" : 2, "Laser" : 3, "Win" : 4 };
irinori.AnimationData.CauseOfDeath = { "Hole" : 0 , "Laser" : 1, "Other" : 2};
//irinori.AnimationData.LaserType = { "one" : 0};

irinori.AnimationData.CreateMovement = function(a_robot, a_oldX, a_oldY, a_newX, a_newY)
{
   
    if (!a_robot)
    {
        throw "irinori.AnimationData.CreateMovement: a_robot must be defined";
    }
    else if (a_oldX === undefined)
    {
        throw "irinori.AnimationData.CreateMovement: a_oldX must be a number";
    }
    else if (a_oldY === undefined)
    {
        throw "irinori.AnimationData.CreateMovement: a_oldY must be a number";
    }
    else if (a_newX === undefined)
    {
        throw "irinori.AnimationData.CreateMovement: a_newX must be a number";
    }
    else if (a_newY === undefined)
    {
        throw "irinori.AnimationData.CreateMovement: a_newY must be a number";
    }

    var f_data = new irinori.AnimationData(a_robot, irinori.AnimationData.Type.Movement);
    f_data.m_oldX = a_oldX;
    f_data.m_oldY = a_oldY;

    f_data.m_newX = a_newX;
    f_data.m_newY = a_newY;    

    return f_data;
}

irinori.AnimationData.CreateRotation = function(a_robot, a_oldDirection, a_newDirection)
{
    var f_data = new irinori.AnimationData(a_robot, irinori.AnimationData.Type.Rotation);
    f_data.m_oldDirection = a_oldDirection;
    f_data.m_newDirection = a_newDirection;

    return f_data;
}

irinori.AnimationData.CreateDeath = function(a_robot, a_causeOfDeath)
{
    if (!a_robot)
    {
        throw "irinori.AnimationData.CreateDeath: a_robot is undefined";
    }

    var f_data = new irinori.AnimationData(a_robot, irinori.AnimationData.Type.Death);
    f_data.m_causeOfDeath = a_causeOfDeath;
    //Life hasn't been subtracted yet when this happens
    f_data.m_lives = a_robot.m_lives - 1;

    return f_data;
}

irinori.AnimationData.CreateWin = function(a_game)
{
    if (!a_game)
    {
        throw "irinori.AnimationData.CreateWin: a_game is undefined";
    }
    else if(!a_game.m_winner)
    {
        throw "irinori.AnimationData.CreateWin: a_game.m_winner is has not been set";
    }

    var f_data = new irinori.AnimationData(null, irinori.AnimationData.Type.Win);
    f_data.m_game = a_game;

    return f_data;
}

irinori.AnimationData.CreateLaser = function(a_direction, a_startX, a_startY, a_endX, a_endY, a_hits, a_laserType)
{
    ///<summary>Creates a laser event from startPos -> endPos. Takes an array of hit positions to create particle effects there and an amount of lasers to pick the right image.</summary>
    ///<param type="Direction" name="a_direction">The direction the laser beam is traveling at</param>
    ///<param type="int" name="a_startX">X position for start pos</param>
    ///<param type="int" name="a_startY">Y position for start pos</param>
    ///<param type="int" name="a_endX">X position for end pos</param>
    ///<param type="int" name="a_endY">Y position for end pos</param>
    ///<param type="HitData" name="a_hits" >Array with X & Y positions that were hit by the laser </param>
    ///<param type="SideObject" name="a_laserType" >The lasertype, for example:1 for 1 beam!</param>
    var f_data = new irinori.AnimationData(null, irinori.AnimationData.Type.Laser);

    f_data.m_direction = a_direction;

    f_data.m_startX = a_startX;
    f_data.m_startY = a_startY;
    
    f_data.m_endX = a_endX;
    f_data.m_endY = a_endY;

    f_data.m_hits = a_hits;
    f_data.m_laserType = a_laserType;

    return f_data;
   
}

irinori.RobotPosition = function(a_robot, a_name)
{
    this.m_robot = a_robot;
    this.m_posX = a_robot.m_posX;
    this.m_posY = a_robot.m_posY;

    this.m_direction = a_robot.m_direction;

    this.m_alive = a_robot.m_alive;
    this.m_lives = a_robot.m_lives;

    this.m_spawnX = a_robot.m_spawnX;
    this.m_spawnY = a_robot.m_spawnY;

    this.m_playername = a_name;
}

//********************
//MinorCycleCollection
//*********************
irinori.MinorCycleCollection = function()
{
    ///<summary>Has a collection of animationData in it, and a currentCollection that data is being written to in each minor cycle. 
    ///So at the end of the cycle the currentCollection is added to m_collection  </summary>
    this.m_currentCollection = [];
    this.m_collection = [];
    this.m_robotPositions = [];
}

irinori.MinorCycleCollection.prototype.AddData = function(a_animationData)
{
    this.m_currentCollection.push(a_animationData);
}

irinori.MinorCycleCollection.prototype.AddRobotPosition = function (a_robot, a_player)
{
    this.m_robotPositions.push(new irinori.RobotPosition(a_robot, a_player.m_name) );
}


irinori.MinorCycleCollection.prototype.NewSegment = function()
{
    ///<summary>Adds a new segment to the minorcycle collection, like after robots moved on conveyor belts e.t.c.! </summary>
    for (var i = 0; i < this.m_currentCollection.length; i++) 
    {
        this.m_collection.push(this.m_currentCollection[i] );
    }

    //this.m_collection.push(this.m_currentCollection);

    this.m_currentCollection = [];
}

//********************
//MajorCycleCollection
//*********************

//Has an array of 
irinori.MajorCycleCollection = function()
{
    this.m_currentMinorCollection = new irinori.MinorCycleCollection();

    //An array with minorcyclecollection based on registers
    this.m_minorCollection = [];
}

//Adds a movementdata to the currentMovementcollection! 
irinori.MajorCycleCollection.prototype.AddAnimationData = function(a_animationData)
{
    this.m_currentMinorCollection.AddData(a_animationData);
}

irinori.MajorCycleCollection.prototype.AddRobotPosition = function(a_robot, a_player)
{
    this.m_currentMinorCollection.AddRobotPosition(a_robot, a_player);
}


//Should be called at end of DoMinorCycle
irinori.MajorCycleCollection.prototype.AddMinorCycle = function()
{
    
    if (this.m_currentMinorCollection.m_currentCollection.length > 0)
    {
        this.m_currentMinorCollection.NewSegment();
    }

    if (this.m_currentMinorCollection.m_collection.length > 0)
    {        
        this.m_minorCollection.push(this.m_currentMinorCollection);

        this.m_currentMinorCollection = new irinori.MinorCycleCollection();  
    }    
}

irinori.MajorCycleCollection.prototype.ClearCollection = function()
{
    this.m_minorCollection = [];

    this.m_currentMinorCollection = new irinori.MinorCycleCollection();
}