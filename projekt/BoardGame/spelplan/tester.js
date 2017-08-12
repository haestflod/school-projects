 ///<reference path="js/references.js" />

if ( window.irinori === undefined ) {	
    window.irinori = {};
}

if ( window.irinori.testing === undefined ) {
	window.irinori.testing = {};
}

irinori.testing.MasterTest = function()
{
    irinori.testing.EngineTest();

    irinori.testing.GameviewTest();
}

irinori.testing.EngineTest = function () {
    var f_gameview = new irinori.Gameview();

    var m_engine = new irinori.engine();
    var i;
    //set the tests
    var m_tests = [irinori.testing.EngineTest.TestMoveRobot, irinori.testing.EngineTest.TestFireRobotLasers, irinori.testing.EngineTest.TestFireBoardLasers, irinori.testing.EngineTest.TestCanMoveRobot, irinori.testing.EngineTest.TestCanConveyorMoveRobot, irinori.testing.EngineTest.TestMoveConveyorBelts, irinori.testing.EngineTest.TestRotateGears, irinori.testing.EngineTest.TestCheckFlags, irinori.testing.EngineTest.TestPushPushers];

    //loop through each test
    for (i = 0; i < m_tests.length; i++) {
        //create/reset testgame variables
        irinori.testing.initTestgame();

        //put it in the engine
        m_engine.SetCurrentGame(irinori.testing.testgame);

        //do test
        m_tests[i](m_engine);
    }
}

irinori.testing.EngineTest.TestMoveRobot = function(a_engine)
{
    //Cases:
    //Try to move Robot A to random position, if it works. it moved and reference on old position is gone! 
    //Move RobotB to RobotA, then RobotA to old RobotB    if RobotBs new map pos is still RobotBs reference and Robots As new pos is not RobotBs ref it works!
    //Move RobotA to a hole and if it survives or tile has reference of robot it fails
    
    //console.log("Start Test MoveRobot");
    var f_ok = true;

    var f_game = irinori.testing.testgame;
    var f_caseID = 0;

    var f_playerA = new irinori.Player("A");
    f_playerA.initRobot(1, 1, irinori.Direction.Right);
    f_game.AddPlayer(f_playerA);

    var f_playerB = new irinori.Player("B");
    f_playerB.initRobot(3, 1, irinori.Direction.Right);    
    f_game.AddPlayer(f_playerB);

    //old pos is 1,1
    a_engine.MoveRobot(f_playerA.m_robot, 5,5);

    if (f_game.m_map.m_tiles[1][1].r_robot !== null || f_playerA.m_robot.m_posX !== 5 || f_playerA.m_robot.m_posY !== 5 || f_game.m_map.m_tiles[5][5].r_robot !== f_playerA.m_robot)
    {
        console.log("case " + f_caseID + ": Moving robot from point1 to point2 - FAILED");
        f_ok = false;
    }
    f_caseID++;

    //Old pos is 3,1
    a_engine.MoveRobot(f_playerB.m_robot, 5,5);
    //old pos is 5,5
    a_engine.MoveRobot(f_playerA.m_robot, 3,1);

    if (f_game.m_map.m_tiles[5][5].r_robot !== f_playerB.m_robot || f_playerB.m_robot.m_posX !== 5 || f_playerB.m_robot.m_posY !== 5 || f_game.m_map.m_tiles[3][1].r_robot !== f_playerA.m_robot || f_playerA.m_robot.m_posX !== 3 || f_playerA.m_robot.m_posY !== 1)
    {
        console.log("case " + f_caseID + ": Moving B to A, A to old B, checking references if they are set correctly - FAILED");
        f_ok = false;
    }
    f_caseID++;

    f_game.m_map.m_tiles[1][1].m_type = irinori.TileType.Hole;
    //old pos is 3,1
    a_engine.MoveRobot(f_playerA.m_robot, 1,1);

    if (f_game.m_map.m_tiles[3][1].r_robot !== null || f_game.m_map.m_tiles[1][1].r_robot !== null || f_playerA.m_robot.m_alive)
    {
       console.log("case " + f_caseID + ": Moving A to a hole and it should have died - FAILED");
       f_ok = false;
    }
    f_caseID++;

    if (f_ok)
    {
        console.log("Test MoveRobot - OK!");
    }
    else
    {
        console.log("Test MoveRobot - FAILEDY FAILED");
    }
}


//*****************
// TESTCANMOVEROBOT
//*****************
irinori.testing.EngineTest.TestCanMoveRobot = function(a_engine)
{
    //To be noted: I kind of messed up the order a bit so the "borderless test" isn't in the described directions
    //It's Left, Top, Right, Bottom currently... Too lazy to change, tho if test fails and we need it to be in right order 
    //Then it should be changed!    

    //console.log("Start Test CanMoveRobot");

    var f_testOK = true;

    var f_game = irinori.testing.testgame;
    var f_positionData;
    
    var f_directionString;

    //*************************
    //Direction to the right
    ///************************
    //right test case has extra stuff as it's first time the players are created!
    var f_directionOK = true;

    f_directionString = "right";

    var f_playerA = new irinori.Player("A");
    f_playerA.initRobot(1, 1, irinori.Direction.Right);
    f_game.AddPlayer(f_playerA);

    var f_playerB = new irinori.Player("B");
    f_playerB.initRobot(3, 1, irinori.Direction.Right);    
    f_game.AddPlayer(f_playerB);

    var f_playerC = new irinori.Player("C");
    f_playerC.initRobot(4,1,irinori.Direction.Right);

    //If Yop moves 3 tiles should be blocked by a wall
    f_game.m_map.m_tiles[4][1].m_right = irinori.SideObject.Wall;
    
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 1, true);    

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 2 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moves 1 tile to the right FAILED");
        f_testOK = false;
        f_directionOK = false;
    }
    

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 2, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 3 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot === null || f_positionData.m_pushedRobotData.m_moveCount !== 1 || f_positionData.m_pushedRobotData.m_posX !== 4 || f_positionData.m_pushedRobotData.m_posY !== 1
    || f_positionData.m_pushedRobotData.m_pushedRobotData !== null || f_positionData.m_pushedRobotData.m_pushedRobot !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " FAILED");
        f_directionOK = false;
        f_testOK = false;
    }  

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 3 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot === null || f_positionData.m_pushedRobotData.m_moveCount !== 1 || f_positionData.m_pushedRobotData.m_posX !== 4 || f_positionData.m_pushedRobotData.m_posY !== 1
    || f_positionData.m_pushedRobotData.m_pushedRobotData !== null || f_positionData.m_pushedRobotData.m_pushedRobot !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " Wall Blocked third movement FAILED");
        f_directionOK = false;
        f_testOK = false;
    }    

    f_game.AddPlayer(f_playerC);
    
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 2 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " ROBOT C Blocked third movement FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    f_playerA.m_robot.m_direction  = irinori.Direction.Left;
    //This should take robot off the map
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== -1 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moving off the map and should end up 1 tile outside FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    if (!f_directionOK)
    {
        console.log("Tests moving to the " + f_directionString + " FAILED");
    }    
    
    ///****************************
    //Direction Left
    ///***************************
    //Reset variables as C entered the scene
    f_directionOK = true;
    
    f_directionString = "left";

    irinori.testing.initTestgame();   
    a_engine.SetCurrentGame(irinori.testing.testgame);
    f_game = irinori.testing.testgame;

    f_playerA.initRobot(4,1,irinori.Direction.Left);
    f_game.AddPlayer(f_playerA);

    f_playerB.initRobot(2,1,irinori.Direction.Bottom);
    f_game.AddPlayer(f_playerB);

    f_playerC.initRobot(1,1,irinori.Direction.Top);    

    f_game.m_map.m_tiles[1][1].m_left = irinori.SideObject.Wall;    

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 1, true);    

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 3 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moves 1 tile to the " + f_directionString + " FAILED");
        f_testOK = false;
        f_directionOK = false;
    }

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 2, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 2 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot === null || f_positionData.m_pushedRobotData.m_moveCount !== 1 || f_positionData.m_pushedRobotData.m_posX !== 1 || f_positionData.m_pushedRobotData.m_posY !== 1
    || f_positionData.m_pushedRobotData.m_pushedRobotData !== null || f_positionData.m_pushedRobotData.m_pushedRobot !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 2 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot === null || f_positionData.m_pushedRobotData.m_moveCount !== 1 || f_positionData.m_pushedRobotData.m_posX !== 1 || f_positionData.m_pushedRobotData.m_posY !== 1
    || f_positionData.m_pushedRobotData.m_pushedRobotData !== null || f_positionData.m_pushedRobotData.m_pushedRobot !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " Wall Blocked third movement FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    //Time to add C to add 
    f_game.AddPlayer(f_playerC);
    
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 3 || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " ROBOT C Blocked third movement FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    f_playerA.m_robot.m_direction  = irinori.Direction.Top;
    //This should take robot off the map
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 4 || f_positionData.m_posY !== -1 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moving off the map and should end up 1 tile outside FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    if (!f_directionOK)
    {
        console.log("Tests moving to the " + f_directionString + " FAILED");
    }
        
    /// ****** ************
    //Direction Bottom
    ///*********************
    //Reset variables as C entered the scene
    f_directionOK = true;

    f_directionString = "bottom";

    irinori.testing.initTestgame();   
    a_engine.SetCurrentGame(irinori.testing.testgame);
    f_game = irinori.testing.testgame;

    f_playerA.initRobot(1,1,irinori.Direction.Bottom);
    f_game.AddPlayer(f_playerA);

    f_playerB.initRobot(1,3,irinori.Direction.Left);
    f_game.AddPlayer(f_playerB);

    f_playerC.initRobot(1,4,irinori.Direction.Right);
    

    //If Yop moves 3 tiles should be blocked by a wall
    f_game.m_map.m_tiles[1][4].m_bottom = irinori.SideObject.Wall;

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 1, true);    

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 2 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moves 1 tile to the " + f_directionString + " FAILED");
        f_testOK = false;
        f_directionOK = false;
    }

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 2, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 3 || f_positionData.m_pushedRobot === null || f_positionData.m_pushedRobotData.m_moveCount !== 1 || f_positionData.m_pushedRobotData.m_posX !== 1 || f_positionData.m_pushedRobotData.m_posY !== 4
    || f_positionData.m_pushedRobotData.m_pushedRobotData !== null || f_positionData.m_pushedRobotData.m_pushedRobot !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 3 || f_positionData.m_pushedRobot === null || f_positionData.m_pushedRobotData.m_moveCount !== 1 || f_positionData.m_pushedRobotData.m_posX !== 1 || f_positionData.m_pushedRobotData.m_posY !== 4
    || f_positionData.m_pushedRobotData.m_pushedRobotData !== null || f_positionData.m_pushedRobotData.m_pushedRobot !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " Wall Blocked third movement FAILED");
        f_directionOK = false;
        f_testOK = false;
    }    

    //Time to add C to add 
    f_game.AddPlayer(f_playerC);
    
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 2 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " ROBOT C Blocked third movement FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    f_playerA.m_robot.m_direction  = irinori.Direction.Right;
    //Width should be 14, so posX = 12
    f_playerA.m_robot.m_posX = irinori.testing.testgame.m_map.m_width - 2;

    //This should take robot off the map
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);   

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== irinori.testing.testgame.m_map.m_width || f_positionData.m_posY !== 1 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moving off the map and should end up 1 tile outside FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    if (!f_directionOK)
    {
        console.log("Tests moving to the " + f_directionString + " FAILED");
    }

    ///*******************'
    //Direction Top
    ///*******************
    f_directionOK = true;

    f_directionString = "top";

    irinori.testing.initTestgame();   
    a_engine.SetCurrentGame(irinori.testing.testgame);
    f_game = irinori.testing.testgame;

    f_playerA.initRobot(1,4,irinori.Direction.Top);
    f_game.AddPlayer(f_playerA);

    f_playerB.initRobot(1,2,irinori.Direction.Bottom);
    f_game.AddPlayer(f_playerB);

    f_playerC.initRobot(1,1,irinori.Direction.Leftp);   

    f_game.m_map.m_tiles[1][1].m_top = irinori.SideObject.Wall;

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 1, true);    

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 3 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moves 1 tile to the " + f_directionString + " FAILED");
        f_testOK = false;
        f_directionOK = false;
    }

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 2, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 2 || f_positionData.m_pushedRobot === null || f_positionData.m_pushedRobotData.m_moveCount !== 1 || f_positionData.m_pushedRobotData.m_posX !== 1 || f_positionData.m_pushedRobotData.m_posY !== 1
    || f_positionData.m_pushedRobotData.m_pushedRobotData !== null || f_positionData.m_pushedRobotData.m_pushedRobot !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " FAILED");
        f_directionOK = false;
        f_testOK = false;
    }

    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 2 || f_positionData.m_pushedRobot === null || f_positionData.m_pushedRobotData.m_moveCount !== 1 || f_positionData.m_pushedRobotData.m_posX !== 1 || f_positionData.m_pushedRobotData.m_posY !== 1
    || f_positionData.m_pushedRobotData.m_pushedRobotData !== null || f_positionData.m_pushedRobotData.m_pushedRobot !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " Wall Blocked third movement FAILED");
        f_directionOK = false;
        f_testOK = false;
    }
    
    //Time to add C to add 
    f_game.AddPlayer(f_playerC);
    
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 3 || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moves 2 tile to the " + f_directionString + " and RobotB gets pushed 1 tile to the " + f_directionString + " ROBOT C Blocked third movement FAILED");
        f_directionOK = false;
        f_testOK = false;
    }    

    f_playerA.m_robot.m_direction  = irinori.Direction.Bottom;
    //Width should be 14, so posX = 12
    f_playerA.m_robot.m_posY = irinori.testing.testgame.m_map.m_height - 2;

    //This should take robot off the map
    f_positionData = a_engine.CanMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction, 3, true);   

    if (f_positionData.m_moveCount !== 2 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== irinori.testing.testgame.m_map.m_height || f_positionData.m_pushedRobot !== null || f_positionData.m_pushedRobotData !== null)
    {
        console.log("Test case:  RobotA moving off the map and should end up 1 tile outside FAILED");
        f_directionOK = false;
        f_testOK = false;
    }   

    if (!f_directionOK)
    {
        console.log("Tests moving to the " + f_directionString + " FAILED");
    }
    
    ///******************
    // TEST FINISHED
    ///******************

    if (f_testOK)
    {
        console.log("Test CanMoveRobot - OK!");
    }
    else
    {
        console.log("Test CanMoveRobot - FAILED!");
    }

}


//*****************************
//  TEST  CanConveyorMoveRobot
//*****************************

irinori.testing.EngineTest.TestCanConveyorMoveRobot = function(a_engine)
{
    //Empty shell of CanConveyorMoveRobot!
    //console.log("Start Test CanConveyorMoveRobot");
    var f_ok = true;

    var f_directionString;

    var f_game = irinori.testing.testgame;
    var f_positionData;

    var f_testID = 1;

     //*************************
    //Direction to the right
    ///************************
    //right test case has extra stuff as it's first time the players are created!
    var f_directionOK = true;

    f_directionString = "right";

    var f_playerA = new irinori.Player("A");
    f_playerA.initRobot(1, 1, irinori.Direction.Right, irinori.Robottype.A);
    f_game.AddPlayer(f_playerA);   

    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);    

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 2 || f_positionData.m_posY !== 1)
    {
        console.log("case 1:  RobotA was moved 1 tile to the " + f_directionString + " FAILED");
        f_testOK = false;
        f_directionOK = false;       
    }  

    //If Yop moves 3 tiles should be blocked by a wall
    f_game.m_map.m_tiles[1][1].m_right = irinori.SideObject.Wall;
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);
    
    if (f_positionData.m_moveCount !== 0 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 1)
    {
        console.log("case 2:  RobotA was attempted to be moved 1 tile to the " + f_directionString + " but blocked by a wall FAILED");
        f_directionOK = false;
        f_testOK = false;        
    }
    
    f_playerA.m_robot.m_posX = f_game.m_map.m_width - 1;
   
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== f_game.m_map.m_width || f_positionData.m_posY !== 1)
    {
        console.log("case 3:  RobotA was moved off the map grid to the " + f_directionString + " FAILED");
        f_directionOK = false;
        f_testOK = false;   
    }

    if (!f_directionOK)
    {
        console.log("Tests to the " + f_directionString + " FAILED");
    }     
    
    //*************************
    //Direction to the left
    ///************************
    var f_directionOK = true;

    f_directionString = "left";

    irinori.testing.initTestgame();   
    a_engine.SetCurrentGame(irinori.testing.testgame);
    f_game = irinori.testing.testgame;

    f_playerA.initRobot(2, 1, irinori.Direction.Left, irinori.Robottype.A);
    f_game.AddPlayer(f_playerA);

    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);    

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 1)
    {
        console.log("case 4:  RobotA was moved 1 tile to the " + f_directionString + " FAILED");
        f_testOK = false;
        f_directionOK = false;       
    }  

    //If Yop moves 3 tiles should be blocked by a wall
    f_game.m_map.m_tiles[1][1].m_right = irinori.SideObject.Wall;
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);
    
    if (f_positionData.m_moveCount !== 0 || f_positionData.m_posX !== 2 || f_positionData.m_posY !== 1)
    {
        console.log("case 5:  RobotA was attempted to be moved 1 tile to the " + f_directionString + " but blocked by a wall FAILED");
        f_directionOK = false;
        f_testOK = false;        
    }
    
    f_playerA.m_robot.m_posX = 0;
   
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== -1 || f_positionData.m_posY !== 1)
    {
        console.log("case 6:  RobotA was moved off the map grid to the " + f_directionString + " FAILED");
        f_directionOK = false;
        f_testOK = false;   
    }


    if (!f_directionOK)
    {
        console.log("Tests to the " + f_directionString + " FAILED");
    }  

    //*************************
    //Direction to the top
    ///************************
    var f_directionOK = true;

    f_directionString = "top";

    irinori.testing.initTestgame();   
    a_engine.SetCurrentGame(irinori.testing.testgame);
    f_game = irinori.testing.testgame;

    f_playerA.initRobot(1, 2, irinori.Direction.Top, irinori.Robottype.A);
    f_game.AddPlayer(f_playerA);

    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);    

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 1)
    {
        console.log("case 7:  RobotA was moved 1 tile to the " + f_directionString + " FAILED");
        f_testOK = false;
        f_directionOK = false;       
    }  

    //If Yop moves 3 tiles should be blocked by a wall
    f_game.m_map.m_tiles[1][1].m_bottom = irinori.SideObject.Wall;
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);
    
    if (f_positionData.m_moveCount !== 0 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 2)
    {
        console.log("case 8.1:  RobotA was attempted to be moved 1 tile to the " + f_directionString + " but blocked by a wall FAILED");
        f_directionOK = false;
        f_testOK = false;        
    }

    f_game.m_map.m_tiles[1][2].m_top = irinori.SideObject.Wall;
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);
    
    if (f_positionData.m_moveCount !== 0 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 2)
    {
        console.log("case 8.2:  RobotA was attempted to be moved 1 tile to the " + f_directionString + " but blocked by a wall FAILED");
        f_directionOK = false;
        f_testOK = false;        
    }
    
    f_playerA.m_robot.m_posY = 0;
   
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== -1)
    {
        console.log("case 9:  RobotA was moved off the map grid to the " + f_directionString + " FAILED");
        f_directionOK = false;
        f_testOK = false;   
    }


    if (!f_directionOK)
    {
        console.log("Tests to the " + f_directionString + " FAILED");
    }

    //*************************
    //Direction to the Bottom
    ///************************
    var f_directionOK = true;

    f_directionString = "bottom";

    irinori.testing.initTestgame();   
    a_engine.SetCurrentGame(irinori.testing.testgame);
    f_game = irinori.testing.testgame;

    f_playerA.initRobot(1, 1, irinori.Direction.Bottom, irinori.Robottype.A);
    f_game.AddPlayer(f_playerA);

    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);    

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 2)
    {
        console.log("case 10:  RobotA was moved 1 tile to the " + f_directionString + " FAILED");
        f_testOK = false;
        f_directionOK = false;       
    }  

    //If Yop moves 3 tiles should be blocked by a wall
    f_game.m_map.m_tiles[1][2].m_top = irinori.SideObject.Wall;
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);
    
    if (f_positionData.m_moveCount !== 0 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 1)
    {
        console.log("case 11.1:  RobotA was attempted to be moved 1 tile to the " + f_directionString + " but blocked by a wall FAILED");
        f_directionOK = false;
        f_testOK = false;        
    }

    f_game.m_map.m_tiles[1][1].m_bottom = irinori.SideObject.Wall;
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);
    
    if (f_positionData.m_moveCount !== 0 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== 1)
    {
        console.log("case 11.2:  RobotA was attempted to be moved 1 tile to the " + f_directionString + " but blocked by a wall FAILED");
        f_directionOK = false;
        f_testOK = false;        
    }
    
    f_playerA.m_robot.m_posY = f_game.m_map.m_height - 1;
   
    f_positionData = a_engine.CanConveyorMoveRobot(f_playerA.m_robot, f_playerA.m_robot.m_direction);

    if (f_positionData.m_moveCount !== 1 || f_positionData.m_posX !== 1 || f_positionData.m_posY !== f_game.m_map.m_height)
    {
        console.log("case 12:  RobotA was moved off the map grid to the " + f_directionString + " FAILED");
        f_directionOK = false;
        f_testOK = false;   
    }

    if (!f_directionOK)
    {
        console.log("Tests to the " + f_directionString + " FAILED");
    }
    
    if (f_ok)
    {
        console.log("CanConveyorMoveRobot Test - OK! ");
    }
    else
    {
        console.log("CanConveyorMoveRobot Test - FAILED! ");
    }

}

/*
    TestMoveConveyorBelts
*/

irinori.testing.EngineTest.TestMoveConveyorBelts = function (a_engine) {
    //Test cases covered:
    //Normal movement
    //Normal movement but a wall to stop the cogwheel
    //A fork movement, nothing moves! A & B tries to same position
    //A circle movement, A -> B -> C -> D -> A   in old position!
    //Same but with a wall, making othing move! 
    //A swap scenario

    //TODO: Fix rotation when they move tho has to implement that in MoveConveyorBelts first tho! 

    //console.log("Start TestMoveConveyorBelts");

    var f_game = irinori.testing.testgame;

    var f_ok = true;
    var f_caseID = 0;

    var f_playerA = new irinori.Player("A");
    f_playerA.initRobot(1, 1, irinori.Direction.Left, irinori.Robottype.A);
    f_game.AddPlayer(f_playerA);

    var f_playerB = new irinori.Player("B");
    f_playerB.initRobot(2, 1, irinori.Direction.Left, irinori.Robottype.B);
    f_game.AddPlayer(f_playerB);

    var f_playerC = new irinori.Player("C");
    f_playerC.initRobot(3, 1, irinori.Direction.Left, irinori.Robottype.A);
    f_game.AddPlayer(f_playerC);

    var f_xstart = 0;
    var f_xend = 4;

    var f_ystart = 1;
    var f_yend = 1;

    var y, x;

    for (var y = f_ystart; y <= f_yend; y++) {
        for (var x = f_xstart; x <= f_xend; x++) {
            f_game.m_map.m_tiles[x][y].m_direction = irinori.Direction.Left;
            f_game.m_map.m_tiles[x][y].m_type = irinori.TileType.ConveyorBelt;
        }
    }

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 0 || f_playerA.m_robot.m_posY !== 1 || f_playerB.m_robot.m_posX !== 1 || f_playerB.m_robot.m_posY !== 1 || f_playerC.m_robot.m_posX !== 2 || f_playerC.m_robot.m_posY !== 1) {
        console.log("case " + f_caseID + ": A & B & C moved 1 tile each - FAILED");
        f_ok = false;
    }
    f_caseID++;

    a_engine.MoveRobot(f_playerA.m_robot, 1, 1);
    a_engine.MoveRobot(f_playerB.m_robot, 2, 1);
    a_engine.MoveRobot(f_playerC.m_robot, 3, 1);

    f_game.m_map.m_tiles[0][1].m_right = irinori.SideObject.Wall;

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 1 || f_playerA.m_robot.m_posY !== 1 || f_playerB.m_robot.m_posX !== 2 || f_playerB.m_robot.m_posY !== 1 || f_playerC.m_robot.m_posX !== 3 || f_playerC.m_robot.m_posY !== 1) {
        console.log("case " + f_caseID + ": A & B & C moved 0 tiles because A was stopped by wall - FAILED");
        f_ok = false;
    }
    f_caseID++;

    //reset variables!
    f_game.m_map.m_tiles[0][1].m_right = irinori.SideObject.None;

    a_engine.MoveRobot(f_playerB.m_robot, 2, 2);

    f_game.m_map.m_tiles[1][1].m_direction = irinori.Direction.Right;
    f_game.m_map.m_tiles[2][1].m_direction = irinori.Direction.Top;

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 1 || f_playerA.m_robot.m_posY !== 1 || f_playerC.m_robot.m_posX !== 3 || f_playerC.m_robot.m_posY !== 1) {
        console.log("case " + f_caseID + ": A & C moved 0 tiles because they tried to go to same tile - FAILED");
        f_ok = false;
    }
    f_caseID++;

    //RIGHT BOT LEFT TOP!   from 1,1
    f_game.m_map.m_tiles[2][1].m_direction = irinori.Direction.Bottom;

    f_game.m_map.m_tiles[2][2].m_direction = irinori.Direction.Left;
    f_game.m_map.m_tiles[2][2].m_type = irinori.TileType.ConveyorBelt;

    f_game.m_map.m_tiles[1][2].m_direction = irinori.Direction.Top;
    f_game.m_map.m_tiles[1][2].m_type = irinori.TileType.ConveyorBelt;

    a_engine.MoveRobot(f_playerB.m_robot, 2, 1);
    a_engine.MoveRobot(f_playerC.m_robot, 2, 2);

    var f_playerD = new irinori.Player("D");
    f_playerD.initRobot(1, 2, irinori.Direction.Left, irinori.Robottype.A);
    f_game.AddPlayer(f_playerD);

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 2 || f_playerA.m_robot.m_posY !== 1 || f_playerB.m_robot.m_posX !== 2 || f_playerB.m_robot.m_posY !== 2 || f_playerC.m_robot.m_posX !== 1 || f_playerC.m_robot.m_posY !== 2 || f_playerD.m_robot.m_posX !== 1 || f_playerD.m_robot.m_posY !== 1) {
        console.log("case " + f_caseID + ": A & B & C & D moved 1 tile in a circle D -> A - B e.t.c. - FAILED");
        f_ok = false;
    }
    f_caseID++;

    a_engine.MoveRobot(f_playerA.m_robot, 1, 1);
    a_engine.MoveRobot(f_playerB.m_robot, 2, 1);
    a_engine.MoveRobot(f_playerC.m_robot, 2, 2);
    a_engine.MoveRobot(f_playerD.m_robot, 1, 2);

    f_game.m_map.m_tiles[1][1].m_right = irinori.SideObject.Laserx2;

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 1 || f_playerA.m_robot.m_posY !== 1 || f_playerB.m_robot.m_posX !== 2 || f_playerB.m_robot.m_posY !== 1 || f_playerC.m_robot.m_posX !== 2 || f_playerC.m_robot.m_posY !== 2 || f_playerD.m_robot.m_posX !== 1 || f_playerD.m_robot.m_posY !== 2) {
        console.log("case " + f_caseID + ": A & B & C & D moved 0 tiles in a circle D -> A - B because wall at A stopped A - FAILED");
        f_ok = false;
    }
    f_caseID++;


    f_game.m_map.m_tiles[1][1] = new irinori.Tile(irinori.TileType.ConveyorBelt, irinori.Direction.Right);
    f_game.m_map.m_tiles[2][1] = new irinori.Tile(irinori.TileType.ConveyorBelt, irinori.Direction.Left);

    a_engine.MoveRobot(f_playerA.m_robot, 1, 1);
    a_engine.MoveRobot(f_playerB.m_robot, 2, 1);
    a_engine.MoveRobot(f_playerC.m_robot, 5, 5); //move em away
    a_engine.MoveRobot(f_playerD.m_robot, 5, 5); //move em away

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 1 || f_playerA.m_robot.m_posY !== 1 || f_playerB.m_robot.m_posX !== 2 || f_playerB.m_robot.m_posY !== 1) {
        console.log("case " + f_caseID + ": A & B swapped positions -> <- and not allowed to. - FAILED");
        f_ok = false;
    }
    f_caseID++;

    a_engine.MoveRobot(f_playerA.m_robot, 1, 1);
    a_engine.MoveRobot(f_playerB.m_robot, 1, 2);

     f_game.m_map.m_tiles[1][1].m_direction = irinori.Direction.Bottom;
    f_game.m_map.m_tiles[2][1].m_direction = irinori.Direction.Top;

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 1 || f_playerA.m_robot.m_posY !== 1 || f_playerB.m_robot.m_posX !== 1 || f_playerB.m_robot.m_posY !== 2) {
        console.log("case " + f_caseID + ": A & B swapped positions , A going down B going up and that's not allowed! - FAILED");
        f_ok = false;
    }
    f_caseID++;

    irinori.testing.initTestgame();

    f_game = irinori.testing.testgame;
    a_engine.SetCurrentGame(f_game);

    f_game.AddPlayer(f_playerA);

    a_engine.MoveRobot(f_playerA.m_robot, 8,8);
    f_playerA.m_robot.m_direction = irinori.Direction.Top;


    f_game.m_map.m_tiles[8][8].m_direction = irinori.Direction.Top;
    f_game.m_map.m_tiles[8][8].m_type = irinori.TileType.ConveyorBelt;
    f_game.m_map.m_tiles[8][7].m_direction = irinori.Direction.Right;
    f_game.m_map.m_tiles[8][7].m_type = irinori.TileType.ConveyorBelt;  
   
    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 8 || f_playerA.m_robot.m_posY !== 7 || f_playerA.m_robot.m_direction !== irinori.Direction.Right)
    {
        console.log("case " + f_caseID + ": Robot A should have rotated from top to right - FAILED");
        f_ok = false;
    }
    f_caseID++;   

    a_engine.MoveRobot(f_playerA.m_robot, 8,8);
    f_playerA.m_robot.m_direction = irinori.Direction.Right;

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 8 || f_playerA.m_robot.m_posY !== 7 || f_playerA.m_robot.m_direction !== irinori.Direction.Bottom)
    {
        console.log("case " + f_caseID + ": Robot A should have rotated from right to bottom - FAILED");
        f_ok = false;
    }
    f_caseID++;  
    
    a_engine.MoveRobot(f_playerA.m_robot, 8,7);
    f_playerA.m_robot.m_direction = irinori.Direction.Bottom;

    //Should now rotate to the left 
    f_game.m_map.m_tiles[8][8].m_direction = irinori.Direction.Right;   
    f_game.m_map.m_tiles[8][7].m_direction = irinori.Direction.Bottom;    
   
    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 8 || f_playerA.m_robot.m_posY !== 8 || f_playerA.m_robot.m_direction !== irinori.Direction.Right)
    {
        console.log("case " + f_caseID + ": Robot A should have rotated from Bottom to right - FAILED");
        f_ok = false;
    }
    f_caseID++;   

    a_engine.MoveRobot(f_playerA.m_robot, 8,7);
    f_playerA.m_robot.m_direction = irinori.Direction.Right;

    a_engine.MoveConveyorBelts(false);

    if (f_playerA.m_robot.m_posX !== 8 || f_playerA.m_robot.m_posY !== 8 || f_playerA.m_robot.m_direction !== irinori.Direction.Top)
    {
        console.log("case " + f_caseID + ": Robot A should have rotated from right to top - FAILED");
        f_ok = false;
    }
    f_caseID++;  


    if (f_ok) {
        console.log("TestMoveConveyorBelts - OK!");
    }
    else {
        console.log("TestMoveConveyorBelts - FAILED!");
    }

}



irinori.testing.EngineTest.TestFireRobotLasers = function (a_engine) {
    //what test is this?
    console.log("Test FireRobotLasers");

    //initialize
    //a game reference
    var f_game = irinori.testing.testgame;

    //players
    var f_player = new irinori.Player("Bob");
    f_player.initRobot(1, 1, irinori.Direction.Right);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Rob");
    f_player.initRobot(2, 1, irinori.Direction.Left);
    f_player.m_robot.m_health = 1; //weakened
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Todd");
    f_player.initRobot(4, 1, irinori.Direction.Left);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Thud");
    f_player.initRobot(12, 2, irinori.Direction.Bottom);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Lou");
    f_player.initRobot(12, 3, irinori.Direction.Top);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Cody");
    f_player.initRobot(6, 10, irinori.Direction.Bottom);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Shinpachi");
    f_player.initRobot(6, 12, irinori.Direction.Top);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Terminator");
    f_player.initRobot(1, 5, irinori.Direction.Top);
    f_player.m_robot.m_alive = false;
    f_game.AddPlayer(f_player);

    //map
    f_game.m_map.m_tiles[12][2].m_bottom = irinori.SideObject.Wall; //a wall between Thud and Lou


    //shoot robot the lasers!
    a_engine.FireRobotLasers();

    //case 1
    //  Did Bob take correct amount of damage? (1)
    //  Bob gets hit by the now dead player Rob and Todds laser doesn't go through Rob
    if (f_game.m_players[0].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 1) {
        console.log("case 1: OK");
    }
    else {
        console.log("case 1: FAILED");
        console.log("- Health: " + f_game.m_players[0].m_robot.m_health);
    }

    //case 2
    //  Did Rob die? (he's better of that way)
    //  Rob dies from Bob's laser
    if (f_game.m_players[1].m_robot.m_health <= 0 && f_game.m_players[1].m_robot.m_alive !== true) {
        console.log("case 2: OK");
    }
    else {
        console.log("case 2: FAILED");
        console.log("- Health: " + f_game.m_players[1].m_robot.m_health);
        console.log("- Alive: " + f_game.m_players[1].m_robot.m_alive);
    }

    //case 3
    //  Did Thud's laser get blocked? (it should)
    //  Thud's laser doesn't hit Lou because a "second wall" is blocking the laser
    if (f_game.m_players[4].m_robot.m_health === irinori.Robot.prototype.MaxHealth) {
        console.log("case 3: OK");
    }
    else {
        console.log("case 3: FAILED");
        console.log("- Health: " + f_game.m_players[4].m_robot.m_health);
    }

    //case 4
    //  Did Lou's laser get blocked? (it should)
    //  Lou's laser doesn't hit Thud because a "first wall" is blocking the laser
    if (f_game.m_players[3].m_robot.m_health === irinori.Robot.prototype.MaxHealth) {
        console.log("case 4: OK");
    }
    else {
        console.log("case 4: FAILED");
        console.log("- Health: " + f_game.m_players[3].m_robot.m_health);
    }

    //case 5
    //  Did Cody take correct amount of damage? (1)
    //  To check if lasers fire properly in the bottom direction
    if (f_game.m_players[5].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 1) {
        console.log("case 5: OK");
    }
    else {
        console.log("case 5: FAILED");
        console.log("- Health: " + f_game.m_players[5].m_robot.m_health);
    }

    //case 6
    //  Did Shinpachi take correct amount of damage? (1)
    //  To check if lasers fire properly in the top direction
    if (f_game.m_players[6].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 1) {
        console.log("case 6: OK");
    }
    else {
        console.log("case 6: FAILED");
        console.log("- Health: " + f_game.m_players[6].m_robot.m_health);
    }

    //case 7
    //  Did Terminator take any damage? (he shouldn't)
    //  To check if robot's shoots themselves
    if (f_game.m_players[7].m_robot.m_health === irinori.Robot.prototype.MaxHealth) {
        console.log("case 7: OK");
    }
    else {
        console.log("case 7: FAILED");
        console.log("- Health: " + f_game.m_players[7].m_robot.m_health);
    }
}


irinori.testing.EngineTest.TestFireBoardLasers = function (a_engine) {
    //what test is this?
    console.log("Test FireBoardLasers");

    //initialize
    //a game reference
    var f_game = irinori.testing.testgame;

    //players
    var f_player = new irinori.Player("Bob");
    f_player.initRobot(4, 4, irinori.Direction.Right);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Rob");
    f_player.initRobot(2, 2, irinori.Direction.Right);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Todd");
    f_player.initRobot(8, 2, irinori.Direction.Right);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Lou");
    f_player.initRobot(8, 5, irinori.Direction.Right);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Mah");
    f_player.initRobot(12, 3, irinori.Direction.Right);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Ken");
    f_player.initRobot(12, 4, irinori.Direction.Right);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Kenny");
    f_player.initRobot(1, 12, irinori.Direction.Right);
    f_game.AddPlayer(f_player);
    

    //map
    //Bob's lasers.. yes, all of them
    f_game.m_map.m_tiles[4][4].m_top = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[4][4].m_bottom = irinori.SideObject.Laserx2;
    f_game.m_map.m_tiles[4][4].m_left = irinori.SideObject.Laserx3;
    f_game.m_map.m_tiles[4][4].m_right = irinori.SideObject.Laserx1;

    //Rob's lasers
    f_game.m_map.m_tiles[2][1].m_top = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[2][3].m_bottom = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[1][2].m_left = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[3][2].m_right = irinori.SideObject.Laserx1;
    
    //Todd's lasers
    f_game.m_map.m_tiles[8][1].m_top = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[8][3].m_bottom = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[7][2].m_left = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[9][2].m_right = irinori.SideObject.Laserx1;
    //Todd's walls
    f_game.m_map.m_tiles[8][2].m_top = irinori.SideObject.Wall;
    f_game.m_map.m_tiles[8][2].m_bottom = irinori.SideObject.Wall;
    f_game.m_map.m_tiles[8][2].m_left = irinori.SideObject.Wall;
    f_game.m_map.m_tiles[8][2].m_right = irinori.SideObject.Wall;

    //Lou's lasers
    f_game.m_map.m_tiles[8][4].m_top = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[8][6].m_bottom = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[7][5].m_left = irinori.SideObject.Laserx1;
    f_game.m_map.m_tiles[9][5].m_right = irinori.SideObject.Laserx1;
    //Lou's walls
    f_game.m_map.m_tiles[8][4].m_bottom = irinori.SideObject.Wall;
    f_game.m_map.m_tiles[8][6].m_top = irinori.SideObject.Wall;
    f_game.m_map.m_tiles[7][5].m_right = irinori.SideObject.Wall;
    f_game.m_map.m_tiles[9][5].m_left = irinori.SideObject.Wall;

    //Mah's and Ken's laser
    f_game.m_map.m_tiles[12][1].m_top = irinori.SideObject.Laserx1;

    //Kenny's lasers
    f_game.m_map.m_tiles[1][12].m_top = irinori.SideObject.Laserx3;
    f_game.m_map.m_tiles[1][12].m_bottom = irinori.SideObject.Laserx3;
    f_game.m_map.m_tiles[1][12].m_left = irinori.SideObject.Laserx3;
    f_game.m_map.m_tiles[1][12].m_right = irinori.SideObject.Laserx3;

    //shoot the board lasers!
    a_engine.FireBoardLasers();

    //case 1
    //  Did Bob take the correct amount of damage? (7)
    if (f_game.m_players[0].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 7) {
        console.log("case 1: OK");
    }
    else {
        console.log("case 1: FAILED");
        console.log("- Health: " + f_game.m_players[0].m_robot.m_health);
    }

    //case 2
    //  Did Rob take the correct amount of damage? (4)
    if (f_game.m_players[1].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 4) {
        console.log("case 2: OK");
    }
    else {
        console.log("case 2: FAILED");
        console.log("- Health: " + f_game.m_players[1].m_robot.m_health);
    }

    //case 3
    //  Did Todd take the correct amount of damage? (0)
    if (f_game.m_players[2].m_robot.m_health === irinori.Robot.prototype.MaxHealth) {
        console.log("case 3: OK");
    }
    else {
        console.log("case 3: FAILED");
        console.log("- Health: " + f_game.m_players[2].m_robot.m_health);
    }

    //case 4
    //  Did Lou take the correct amount of damage? (0)
    if (f_game.m_players[3].m_robot.m_health === irinori.Robot.prototype.MaxHealth) {
        console.log("case 4: OK");
    }
    else {
        console.log("case 4: FAILED");
        console.log("- Health: " + f_game.m_players[3].m_robot.m_health);
    }

    //case 5
    //  Did Mah and Ken take the correct amount of damage? (Mah: 1, Ken: 0)
    if (f_game.m_players[4].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 1 && f_game.m_players[5].m_robot.m_health === irinori.Robot.prototype.MaxHealth) {
        console.log("case 5: OK");
    }
    else {
        console.log("case 5: FAILED");
        console.log("- " + f_game.m_players[4].m_name + " Health: " + f_game.m_players[4].m_robot.m_health);
        console.log("- " + f_game.m_players[5].m_name + " Health: " + f_game.m_players[5].m_robot.m_health);
    }

    //case 6
    //  Did Kenny die? (he should, you bastard!)
    if (f_game.m_players[6].m_robot.m_health <= 0 && f_game.m_players[6].m_robot.m_alive !== true) {
        console.log("case 6: OK");
    }
    else {
        console.log("case 6: FAILED");
        console.log("- " + f_game.m_players[6].m_name + " Health: " + f_game.m_players[6].m_robot.m_health);
        console.log("- " + f_game.m_players[6].m_name + " Alive: " + f_game.m_players[6].m_robot.m_alive);
    }
}


irinori.testing.EngineTest.TestRotateGears = function (a_engine) {
    //what test is this?
    console.log("Test RotateGears");

    //initialize
    //a game reference
    var f_game = irinori.testing.testgame;

    //players
    var f_player = new irinori.Player("Bob");
    f_player.initRobot(1, 1, irinori.Direction.Top);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Rob");
    f_player.initRobot(2, 1, irinori.Direction.Right);
    f_game.AddPlayer(f_player);
    
    f_player = new irinori.Player("Todd");
    f_player.initRobot(3, 1, irinori.Direction.Left);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("God");
    f_player.initRobot(4, 1, irinori.Direction.Bottom);
    f_game.AddPlayer(f_player);

    f_player = new irinori.Player("Chuck Norris");
    f_player.initRobot(2, 2, irinori.Direction.Right);
    f_game.AddPlayer(f_player);

    //map
    f_game.m_map.m_tiles[1][1].m_type = irinori.TileType.GearLeft;
    f_game.m_map.m_tiles[2][1].m_type = irinori.TileType.GearRight;
    f_game.m_map.m_tiles[3][1].m_type = irinori.TileType.GearLeft;
    f_game.m_map.m_tiles[4][1].m_type = irinori.TileType.GearRight;

    //Chuck Norris's gears
    f_game.m_map.m_tiles[1][2].m_type = irinori.TileType.GearLeft;
    f_game.m_map.m_tiles[1][3].m_type = irinori.TileType.GearLeft;
    f_game.m_map.m_tiles[2][3].m_type = irinori.TileType.GearLeft;
    f_game.m_map.m_tiles[3][3].m_type = irinori.TileType.GearLeft;
    f_game.m_map.m_tiles[3][2].m_type = irinori.TileType.GearLeft;

    //give them a spin! guruguru
    a_engine.RotateGears();


    //case 1
    //  Did Bob rotate correctly?
    if (f_game.m_players[0].m_robot.m_direction === irinori.Direction.Left) {
        console.log("case 1: OK");
    }
    else {
        console.log("case 1: FAILED");
        console.log("- " + f_game.m_players[0].m_name + " Direction: " + f_game.m_players[0].m_robot.m_direction);
    }

    //case 2
    //  Did Rob rotate correctly?
    if (f_game.m_players[1].m_robot.m_direction === irinori.Direction.Bottom) {
        console.log("case 2: OK");
    }
    else {
        console.log("case 2: FAILED");
        console.log("- " + f_game.m_players[1].m_name + " Direction: " + f_game.m_players[1].m_robot.m_direction);
    }

    //case 3
    //  Did Todd rotate correctly?
    if (f_game.m_players[2].m_robot.m_direction === irinori.Direction.Bottom) {
        console.log("case 3: OK");
    }
    else {
        console.log("case 3: FAILED");
        console.log("- " + f_game.m_players[2].m_name + " Direction: " + f_game.m_players[2].m_robot.m_direction);
    }

    //case 4
    //  Did God rotate correctly?
    if (f_game.m_players[3].m_robot.m_direction === irinori.Direction.Left) {
        console.log("case 4: OK");
    }
    else {
        console.log("case 4: FAILED");
        console.log("- " + f_game.m_players[3].m_name + " Direction: " + f_game.m_players[3].m_robot.m_direction);
    }

    //case 5
    //  Did Chuck Norris rotate? (he shouldn't, because the world rotate around him... Sorry, I couldn't help myself :))
    if (f_game.m_players[4].m_robot.m_direction === irinori.Direction.Right) {
        console.log("case 5: OK");
    }
    else {
        console.log("case 5: FAILED");
        console.log("- " + f_game.m_players[4].m_name + " Direction: " + f_game.m_players[4].m_robot.m_direction);
    }
}


irinori.testing.EngineTest.TestCheckFlags = function (a_engine) {
    //what test is this?
    console.log("Test CheckFlags");

    //initialize
    //a game reference
    var f_game = irinori.testing.testgame;

    //players
    var f_player = new irinori.Player("Bob");
    f_player.initRobot(1, 1, irinori.Direction.Top);
    f_player.m_robot.m_alive = false;
    f_player.m_robot.m_spawnX = 0;
    f_player.m_robot.m_spawnY = 0;
    f_player.m_robot.m_health = irinori.Robot.prototype.MaxHealth - 1;
    f_game.AddPlayer(f_player);

    var f_player = new irinori.Player("Rob");
    f_player.initRobot(1, 3, irinori.Direction.Left);
    f_player.m_robot.m_spawnX = 0;
    f_player.m_robot.m_spawnY = 0;
    f_player.m_robot.m_health = irinori.Robot.prototype.MaxHealth - 5;
    f_game.AddPlayer(f_player);

    var f_player = new irinori.Player("Todd");
    f_player.initRobot(3, 3, irinori.Direction.Top);
    f_player.m_robot.m_spawnX = 0;
    f_player.m_robot.m_spawnY = 0;
    f_player.m_robot.m_health = irinori.Robot.prototype.MaxHealth - 5;
    f_game.AddPlayer(f_player);
    
    var f_player = new irinori.Player("David");
    f_player.initRobot(5, 4, irinori.Direction.Left);
    f_player.m_robot.m_spawnX = 0;
    f_player.m_robot.m_spawnY = 0;
    f_game.AddPlayer(f_player);

    //map
    f_game.m_map.m_tiles[1][1].m_type = irinori.TileType.RepairAndEquip;
    f_game.m_map.m_tiles[1][1].m_checkpoint = 1;
    f_game.m_map.m_tiles[1][3].m_type = irinori.TileType.RepairAndEquip;
    f_game.m_map.m_tiles[1][3].m_checkpoint = 1;
    f_game.m_map.m_tiles[3][3].m_type = irinori.TileType.Repair;
    f_game.m_map.m_tiles[3][3].m_checkpoint = 2;
    f_game.m_map.m_tiles[0][0].m_type = irinori.TileType.Repair;


    //check for flags!
    a_engine.CheckFlags();

    //case 1
    //  Did Bob's spawn pos change? (he's dead so he shouldn't get a new spawn pos)
    if (f_game.m_players[0].m_robot.m_spawnX !== f_game.m_players[0].m_robot.m_posX && f_game.m_players[0].m_robot.m_spawnY !== f_game.m_players[0].m_robot.m_posY) {
        console.log("case 1: OK");
    }
    else {
        console.log("case 1: FAILED");
        console.log("- " + f_game.m_players[0].m_name + " SpawnX: " + f_game.m_players[0].m_robot.m_spawnX);
        console.log("- " + f_game.m_players[0].m_name + " PosX: " + f_game.m_players[0].m_robot.m_posX);
        console.log("- " + f_game.m_players[0].m_name + " SpawnY: " + f_game.m_players[0].m_robot.m_spawnY);
        console.log("- " + f_game.m_players[0].m_name + " PosY: " + f_game.m_players[0].m_robot.m_posY);
    }

    //case 2
    //  Did Bob gain a card? (he's dead so he shouldn't get bonus cards)
    if (f_game.m_players[0].m_robot.m_bonusCards.length === 0) {
        console.log("case 2: OK");
    }
    else {
        console.log("case 2: FAILED");
        console.log("- " + f_game.m_players[0].m_name + " BonusCards: " + f_game.m_players[0].m_robot.m_bonusCards);
    }

    //case 3
    //  Did Bob repair? (he's dead so he shouldn't get repaired)
    if (f_game.m_players[0].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 1) {
        console.log("case 3: OK");
    }
    else {
        console.log("case 3: FAILED");
        console.log("- " + f_game.m_players[0].m_name + " Health: " + f_game.m_players[0].m_robot.m_health);
    }

    //case 4
    //  Did Bob get the checkpoint? (he shouldnt get it because he's dead)
    if (f_game.m_players[0].m_robot.m_nextCheckpoint === 1) {
        console.log("case 4: OK");
    }
    else {
        console.log("case 4: FAILED");
        console.log("- " + f_game.m_players[0].m_name + " NextCheckpoint: " + f_game.m_players[0].m_robot.m_nextCheckpoint);
    }

    //case 5
    //  Did Rob's spawn pos change? (he should get a new spawn pos)
    if (f_game.m_players[1].m_robot.m_spawnX === f_game.m_players[1].m_robot.m_posX && f_game.m_players[1].m_robot.m_spawnY === f_game.m_players[1].m_robot.m_posY) {
        console.log("case 5: OK");
    }
    else {
        console.log("case 5: FAILED");
        console.log("- " + f_game.m_players[1].m_name + " SpawnX: " + f_game.m_players[1].m_robot.m_spawnX);
        console.log("- " + f_game.m_players[1].m_name + " PosX: " + f_game.m_players[1].m_robot.m_posX);
        console.log("- " + f_game.m_players[1].m_name + " SpawnY: " + f_game.m_players[1].m_robot.m_spawnY);
        console.log("- " + f_game.m_players[1].m_name + " PosY: " + f_game.m_players[1].m_robot.m_posY);
    }

    //case 6
    //  Did Rob gain a card? (he should get a bonus card)
    if (f_game.m_players[1].m_robot.m_bonusCards.length === 1) {
        console.log("case 6: OK");
    }
    else {
        console.log("case 6: FAILED");
        console.log("- " + f_game.m_players[1].m_name + " BonusCards: " + f_game.m_players[1].m_robot.m_bonusCards);
    }

    //case 7
    //  Did Bob repair? (he should get repaired)
    //  He had 5 damage on him and we now check if he has 4 damage on him
    if (f_game.m_players[1].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 4) {
        console.log("case 7: OK");
    }
    else {
        console.log("case 7: FAILED");
        console.log("- " + f_game.m_players[1].m_name + " Health: " + f_game.m_players[1].m_robot.m_health);
    }

    //case 8
    //  Did Rob's get the checkpoint? (he should)
    if (f_game.m_players[1].m_robot.m_nextCheckpoint === 2) {
        console.log("case 8: OK");
    }
    else {
        console.log("case 8: FAILED");
        console.log("- " + f_game.m_players[1].m_name + " NextCheckpoint: " + f_game.m_players[1].m_robot.m_nextCheckpoint);
    }

    //case 9
    //  Did Todd's spawn pos change? (he should get a new spawn pos)
    if (f_game.m_players[2].m_robot.m_spawnX === f_game.m_players[2].m_robot.m_posX && f_game.m_players[2].m_robot.m_spawnY === f_game.m_players[2].m_robot.m_posY) {
        console.log("case 9: OK");
    }
    else {
        console.log("case 9: FAILED");
        console.log("- " + f_game.m_players[2].m_name + " SpawnX: " + f_game.m_players[2].m_robot.m_spawnX);
        console.log("- " + f_game.m_players[2].m_name + " PosX: " + f_game.m_players[2].m_robot.m_posX);
        console.log("- " + f_game.m_players[2].m_name + " SpawnY: " + f_game.m_players[2].m_robot.m_spawnY);
        console.log("- " + f_game.m_players[2].m_name + " PosY: " + f_game.m_players[2].m_robot.m_posY);
    }

    //case 10
    //  Did Todd's get the checkpoint? (he shouldn't)
    //  Todd is standing on checkpoint 2, he needs checkpoint 1 before he can get checkpoint 2
    if (f_game.m_players[2].m_robot.m_nextCheckpoint === 1) {
        console.log("case 10: OK");
    }
    else {
        console.log("case 10: FAILED");
        console.log("- " + f_game.m_players[2].m_name + " NextCheckpoint: " + f_game.m_players[2].m_robot.m_nextCheckpoint);
    }

    //case 11
    //  Did Todd repair? (he should get repaired)
    //  Check if the Repair tile type does repair (from 5 damage to 4 damage)
    if (f_game.m_players[2].m_robot.m_health === irinori.Robot.prototype.MaxHealth - 4) {
        console.log("case 11: OK");
    }
    else {
        console.log("case 11: FAILED");
        console.log("- " + f_game.m_players[2].m_name + " Health: " + f_game.m_players[2].m_robot.m_health);
    }

    //case 12
    //  The respawn paranoia case 
    //  Checks if the respawn is set when it shouldn't
    if (f_game.m_players[3].m_robot.m_spawnX === 0 && f_game.m_players[3].m_robot.m_spawnY === 0) {
        console.log("case 12: OK");
    }
    else {
        console.log("case 12: FAILED");
        console.log("- " + f_game.m_players[3].m_name + " SpawnX: " + f_game.m_players[3].m_robot.m_spawnX + " SpawnY: " + f_game.m_players[3].m_robot.m_spawnY);
    }
}


irinori.testing.EngineTest.TestPushPushers = function (a_engine) {
    //what test is this?
    console.log("Test PushPushers");

    //initialize
    //a game reference
    var f_game = irinori.testing.testgame;

    //players
    //0
    var f_playerBob = new irinori.Player("Bob");
    f_playerBob.initRobot(1, 1, irinori.Direction.Top);
    f_game.AddPlayer(f_playerBob);
    //1
    var f_playerRob = new irinori.Player("Rob");
    f_playerRob.initRobot(2, 1, irinori.Direction.Top);
    f_game.AddPlayer(f_playerRob);
    //2
    var f_playerTodd = new irinori.Player("Todd");
    f_playerTodd.initRobot(1, 3, irinori.Direction.Top);
    f_game.AddPlayer(f_playerTodd);
    //3
    var f_playerThud = new irinori.Player("Thud");
    f_playerThud.initRobot(2, 3, irinori.Direction.Top);
    f_game.AddPlayer(f_playerThud);
    //4
    var f_playerFred = new irinori.Player("Fred");
    f_playerFred.initRobot(4, 1, irinori.Direction.Top);
    f_game.AddPlayer(f_playerFred);
    //5
    var f_playerTed = new irinori.Player("Ted");
    f_playerTed.initRobot(5, 1, irinori.Direction.Top);
    f_game.AddPlayer(f_playerTed);
    //6
    var f_playerJoe = new irinori.Player("Joe");
    f_playerJoe.initRobot(4, 2, irinori.Direction.Top);
    f_game.AddPlayer(f_playerJoe);
    //7 blocking path for joe
    var f_playerLou = new irinori.Player("Lou");
    f_playerLou.initRobot(5, 2, irinori.Direction.Top);
    f_playerLou.m_robot.m_alive = false;
    f_game.AddPlayer(f_playerLou);
    f_game.m_map.m_tiles[f_playerLou.m_robot.m_posX][f_playerLou.m_robot.m_posY].r_robot = null;
    //8
    var f_playerManfred = new irinori.Player("Manfred");
    f_playerManfred.initRobot(7, 1, irinori.Direction.Top);
    f_game.AddPlayer(f_playerManfred);
    //9
    var f_playerAmandfred = new irinori.Player("Amandfred");
    f_playerAmandfred.initRobot(8, 1, irinori.Direction.Top);
    f_game.AddPlayer(f_playerAmandfred);
    //10
    var f_playerCasey = new irinori.Player("Casey");
    f_playerCasey.initRobot(7, 3, irinori.Direction.Right);
    f_game.AddPlayer(f_playerCasey);
    //11
    var f_playerCarl = new irinori.Player("Carl");
    f_playerCarl.initRobot(8, 3, irinori.Direction.Left);
    f_game.AddPlayer(f_playerCarl);
    //12
    var f_playerA = new irinori.Player("A");
    f_playerA.initRobot(7, 5, irinori.Direction.Bottom);
    f_game.AddPlayer(f_playerA);
    //13
    var f_playerB = new irinori.Player("B");
    f_playerB.initRobot(7, 6, irinori.Direction.Right);
    f_game.AddPlayer(f_playerB);
    //14
    var f_playerC = new irinori.Player("C");
    f_playerC.initRobot(8, 6, irinori.Direction.Top);
    f_game.AddPlayer(f_playerC);
    //15
    var f_playerD = new irinori.Player("D");
    f_playerD.initRobot(8, 5, irinori.Direction.Left);
    f_game.AddPlayer(f_playerD);
    //16
    var f_playerMah = new irinori.Player("Mah");
    f_playerMah.initRobot(7, 8, irinori.Direction.Right);
    f_game.AddPlayer(f_playerMah);
    //17
    var f_playerKen = new irinori.Player("Ken");
    f_playerKen.initRobot(9, 8, irinori.Direction.Left);
    f_game.AddPlayer(f_playerKen);
    //18
    var f_playerHonda = new irinori.Player("Honda");
    f_playerHonda.initRobot(6, 8, irinori.Direction.Left);
    f_game.AddPlayer(f_playerHonda);
    //19
    var f_playerSimba = new irinori.Player("Simba");
    f_playerSimba.initRobot(0, 5, irinori.Direction.Right);
    f_playerSimba.m_robot.m_lives = 1;
    f_game.AddPlayer(f_playerSimba);
    //20
    var f_playerNala = new irinori.Player("Nala");
    f_playerNala.initRobot(2, 5, irinori.Direction.Left);
    f_playerNala.m_robot.m_lives = 1;
    f_game.AddPlayer(f_playerNala);
    //21
    var f_playerRamon = new irinori.Player("Ramon");
    f_playerRamon.initRobot(0, 6, irinori.Direction.Right);
    f_playerRamon.m_robot.m_lives = 1;
    f_game.AddPlayer(f_playerRamon);

    //map
    f_game.m_map.m_tiles[1][1].m_top = irinori.SideObject.PusherEven; //Bob's pusher
    f_game.m_map.m_tiles[2][1].m_bottom = irinori.SideObject.PusherEven; //Rob's pusher
    f_game.m_map.m_tiles[1][3].m_right = irinori.SideObject.PusherEven; //Todd's pusher
    f_game.m_map.m_tiles[2][3].m_left = irinori.SideObject.PusherEven; //Thud's pusher
    f_game.m_map.m_tiles[4][1].m_left = irinori.SideObject.PusherEven; //Fred & Ted's pusher
    f_game.m_map.m_tiles[4][2].m_left = irinori.SideObject.PusherEven; //Joe & Lou's pusher
    f_game.m_map.m_tiles[7][1].m_bottom = irinori.SideObject.PusherEven; //Manfred's pusher
    f_game.m_map.m_tiles[7][1].m_top = irinori.SideObject.Wall; //Manfred's wall
    f_game.m_map.m_tiles[8][1].m_bottom = irinori.SideObject.PusherEven; //Amandfred's pusher
    f_game.m_map.m_tiles[8][0].m_bottom = irinori.SideObject.Wall; //Amandfred's wall
    f_game.m_map.m_tiles[7][3].m_left = irinori.SideObject.PusherEven; //Casey's pusher
    f_game.m_map.m_tiles[8][3].m_right = irinori.SideObject.PusherEven; //Carl's pusher
    f_game.m_map.m_tiles[7][5].m_top = irinori.SideObject.PusherEven; //A's pusher
    f_game.m_map.m_tiles[7][6].m_left = irinori.SideObject.PusherEven; //B's pusher
    f_game.m_map.m_tiles[8][6].m_bottom = irinori.SideObject.PusherEven; //C's pusher
    f_game.m_map.m_tiles[8][5].m_right = irinori.SideObject.PusherEven; //D's pusher
    f_game.m_map.m_tiles[7][8].m_left = irinori.SideObject.PusherEven; //Mah's pusher
    f_game.m_map.m_tiles[9][8].m_right = irinori.SideObject.PusherEven; //Ken's pusher
    f_game.m_map.m_tiles[6][8].m_right = irinori.SideObject.PusherOdd; //Honda's pusher
    f_game.m_map.m_tiles[0][5].m_left = irinori.SideObject.PusherOdd; //Simba's pusher
    f_game.m_map.m_tiles[1][5].m_type = irinori.TileType.Hole; //Simba's and Nala's hole
    f_game.m_map.m_tiles[2][5].m_right = irinori.SideObject.PusherOdd; //Nala's pusher
    f_game.m_map.m_tiles[0][6].m_right = irinori.SideObject.PusherOdd; //Ramon's pusher

    /*----------------------------------------------------------------------------------
    test the even pushers
    ------------------------------------------------------------------------------------*/
    //push the even pushers
    a_engine.PushPushers(1);

    //case 1
    //  Did Bob get pushed? (he should)
    //  To test top pushers
    if (f_game.m_players[0].m_robot.m_posX === 1 && f_game.m_players[0].m_robot.m_posY === 2) {
        console.log("case 1: OK");
    }
    else {
        console.log("case 1: FAILED");
        console.log("- " + f_game.m_players[0].m_name + " PosX: " + f_game.m_players[0].m_robot.m_posX);
        console.log("- " + f_game.m_players[0].m_name + " PosY: " + f_game.m_players[0].m_robot.m_posY);
    }

    //case 2
    //  Did Rob get pushed? (he should)
    //  To test bottom pushers
    if (f_game.m_players[1].m_robot.m_posX === 2 && f_game.m_players[1].m_robot.m_posY === 0) {
        console.log("case 2: OK");
    }
    else {
        console.log("case 2: FAILED");
        console.log("- " + f_game.m_players[1].m_name + " PosX: " + f_game.m_players[1].m_robot.m_posX);
        console.log("- " + f_game.m_players[1].m_name + " PosY: " + f_game.m_players[1].m_robot.m_posY);
    }

    //case 3
    //  Did Todd get pushed? (he should)
    //  To test right pushers
    if (f_game.m_players[2].m_robot.m_posX === 0 && f_game.m_players[2].m_robot.m_posY === 3) {
        console.log("case 3: OK");
    }
    else {
        console.log("case 3: FAILED");
        console.log("- " + f_game.m_players[2].m_name + " PosX: " + f_game.m_players[2].m_robot.m_posX);
        console.log("- " + f_game.m_players[2].m_name + " PosY: " + f_game.m_players[2].m_robot.m_posY);
    }

    //case 4
    //  Did Thud get pushed? (he should)
    //  To test left pushers
    if (f_game.m_players[3].m_robot.m_posX === 3 && f_game.m_players[3].m_robot.m_posY === 3) {
        console.log("case 4: OK");
    }
    else {
        console.log("case 4: FAILED");
        console.log("- " + f_game.m_players[3].m_name + " PosX: " + f_game.m_players[3].m_robot.m_posX);
        console.log("- " + f_game.m_players[3].m_name + " PosY: " + f_game.m_players[3].m_robot.m_posY);
    }

    //case 5
    //  Did Ted get pushed by Fred (that got pushed by a pusher)? (he shouldn't)
    //  To test that pushers doesn't push robots if a robot is in the way
    if (f_game.m_players[4].m_robot.m_posX === 4 && f_game.m_players[4].m_robot.m_posY === 1 && f_game.m_players[5].m_robot.m_posX === 5 && f_game.m_players[5].m_robot.m_posY === 1) {
        console.log("case 5: OK");
    }
    else {
        console.log("case 5: FAILED");
        console.log("- " + f_game.m_players[4].m_name + " PosX: " + f_game.m_players[4].m_robot.m_posX + ", PosY: " + f_game.m_players[4].m_robot.m_posY);
        console.log("- " + f_game.m_players[5].m_name + " PosX: " + f_game.m_players[5].m_robot.m_posX + ", PosY: " + f_game.m_players[5].m_robot.m_posY);
    }

    //case 6
    //  Did Joe get pushed by the pusher? (he should)
    //  To test that pushers ignores dead robots (Lou is a dead robot at the position where Joe should end up)
    if (f_game.m_players[6].m_robot.m_posX === 5 && f_game.m_players[6].m_robot.m_posY === 2) {
        console.log("case 6: OK");
    }
    else {
        console.log("case 6: FAILED");
        console.log("- " + f_game.m_players[6].m_name + " PosX: " + f_game.m_players[6].m_robot.m_posX + ", PosY: " + f_game.m_players[6].m_robot.m_posY);
        console.log("- " + f_game.m_players[7].m_name + " PosX: " + f_game.m_players[7].m_robot.m_posX + ", PosY: " + f_game.m_players[7].m_robot.m_posY);
    }

    //case 7
    //  Did Manfred get pushed? (he shouldn't)
    //  To test that pushers won't push if there is a wall (facing towards you) in the way
    if (f_game.m_players[8].m_robot.m_posX === 7 && f_game.m_players[8].m_robot.m_posY === 1) {
        console.log("case 7: OK");
    }
    else {
        console.log("case 7: FAILED");
        console.log("- " + f_game.m_players[8].m_name + " PosX: " + f_game.m_players[8].m_robot.m_posX + ", PosY: " + f_game.m_players[8].m_robot.m_posY);
    }

    //case 8
    //  Did Amandfred get pushed? (she shouldn't)
    //  To test that pushers won't push if there is a wall (facing away from you) in the way
    if (f_game.m_players[9].m_robot.m_posX === 8 && f_game.m_players[9].m_robot.m_posY === 1) {
        console.log("case 8: OK");
    }
    else {
        console.log("case 8: FAILED");
        console.log("- " + f_game.m_players[9].m_name + " PosX: " + f_game.m_players[9].m_robot.m_posX + ", PosY: " + f_game.m_players[9].m_robot.m_posY);
    }

    //case 9
    //  Did Casey and Carl get pushed? (they shouldn't)
    //  To test that pushers won't push if A & B is next to each other and both have a pusher that would push them to the other robot's position
    if (f_game.m_players[10].m_robot.m_posX === 7 && f_game.m_players[10].m_robot.m_posY === 3 && f_game.m_players[11].m_robot.m_posX === 8 && f_game.m_players[11].m_robot.m_posY === 3) {
        console.log("case 9: OK");
    }
    else {
        console.log("case 9: FAILED");
        console.log("- " + f_game.m_players[10].m_name + " PosX: " + f_game.m_players[10].m_robot.m_posX + ", PosY: " + f_game.m_players[10].m_robot.m_posY);
        console.log("- " + f_game.m_players[11].m_name + " PosX: " + f_game.m_players[11].m_robot.m_posX + ", PosY: " + f_game.m_players[11].m_robot.m_posY);
    }

    //case 10
    //  A will be pushed to B's pos and B to C's and D to A's
    //  To test that pushers do push when in a circle formation?
    if (f_game.m_players[12].m_robot.m_posX === 7 && f_game.m_players[12].m_robot.m_posY === 6 && f_game.m_players[13].m_robot.m_posX === 8 && f_game.m_players[13].m_robot.m_posY === 6 && f_game.m_players[14].m_robot.m_posX === 8 && f_game.m_players[14].m_robot.m_posY === 5 && f_game.m_players[15].m_robot.m_posX === 7 && f_game.m_players[15].m_robot.m_posY === 5) {
        console.log("case 10: OK");
    }
    else {
        console.log("case 10: FAILED");
        console.log("- " + f_game.m_players[12].m_name + " PosX: " + f_game.m_players[12].m_robot.m_posX + ", PosY: " + f_game.m_players[12].m_robot.m_posY);
        console.log("- " + f_game.m_players[13].m_name + " PosX: " + f_game.m_players[13].m_robot.m_posX + ", PosY: " + f_game.m_players[13].m_robot.m_posY);
        console.log("- " + f_game.m_players[14].m_name + " PosX: " + f_game.m_players[14].m_robot.m_posX + ", PosY: " + f_game.m_players[14].m_robot.m_posY);
        console.log("- " + f_game.m_players[15].m_name + " PosX: " + f_game.m_players[15].m_robot.m_posX + ", PosY: " + f_game.m_players[15].m_robot.m_posY);
    }

    //case 11
    //  Did Mah or Ken get pushed? (they shouldn't)
    //  To test that pushers won't push when 2 or more robots would be pushed to the same tile
    if (f_game.m_players[16].m_robot.m_posX === 7 && f_game.m_players[16].m_robot.m_posY === 8 && f_game.m_players[17].m_robot.m_posX === 9 && f_game.m_players[17].m_robot.m_posY === 8) {
        console.log("case 11: OK");
    }
    else {
        console.log("case 11: FAILED");
        console.log("- " + f_game.m_players[16].m_name + " PosX: " + f_game.m_players[16].m_robot.m_posX + ", PosY: " + f_game.m_players[16].m_robot.m_posY);
        console.log("- " + f_game.m_players[17].m_name + " PosX: " + f_game.m_players[17].m_robot.m_posX + ", PosY: " + f_game.m_players[17].m_robot.m_posY);
    }



    /*----------------------------------------------------------------------------------
    test the odd pushers
    ------------------------------------------------------------------------------------*/
    //push the odd pushers
    a_engine.PushPushers(2);

    //case 12
    //testing odd pushers
    if (f_game.m_players[18].m_robot.m_posX === 5 && f_game.m_players[18].m_robot.m_posY === 8) {
        console.log("case 12: OK");
    }
    else {
        console.log("case 12: FAILED");
        console.log("- " + f_game.m_players[18].m_name + " PosX: " + f_game.m_players[18].m_robot.m_posX + ", PosY: " + f_game.m_players[18].m_robot.m_posY);
    }

    //case 13
    //  Did Simba and Nala get pushed into the hole? (they should)
    //  To test that pushers can push multiple robots into the same hole
    if (f_game.m_players[19].m_robot.m_alive === false && f_game.m_players[20].m_robot.m_alive === false) {
        console.log("case 13: OK");
    }
    else {
        console.log("case 13: FAILED");
        console.log("- " + f_game.m_players[19].m_name + " PosX: " + f_game.m_players[19].m_robot.m_posX + ", PosY: " + f_game.m_players[19].m_robot.m_posY + ", Alive: " + f_game.m_players[19].m_robot.m_alive);
        console.log("- " + f_game.m_players[20].m_name + " PosX: " + f_game.m_players[20].m_robot.m_posX + ", PosY: " + f_game.m_players[20].m_robot.m_posY + ", Alive: " + f_game.m_players[20].m_robot.m_alive);
    }

    //case 14
    //  Did Ramon get pushed outside the map? (he should)
    //  To test that pushers can push robots outside the map
    if (f_game.m_players[21].m_robot.m_alive === false) {
        console.log("case 14: OK");
    }
    else {
        console.log("case 14: FAILED");
        console.log("- " + f_game.m_players[21].m_name + " PosX: " + f_game.m_players[21].m_robot.m_posX + ", PosY: " + f_game.m_players[21].m_robot.m_posY + ", Alive: " + f_game.m_players[21].m_robot.m_alive);
    }
}

window.onload = irinori.testing.MasterTest;