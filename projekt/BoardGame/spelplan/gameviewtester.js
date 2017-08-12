 ///<reference path="js/references.js" />

if ( window.irinori === undefined ) {	
    window.irinori = {};
}

if ( window.irinori.testing === undefined ) {
	window.irinori.testing = {};
}

irinori.testing.GameviewTest = function()
{
    var f_gameview = new irinori.Gameview();

    irinori.testing.initTestgame();

    irinori.testing.GameviewTest.SetupMap();

    var f_playerA = new irinori.Player("A");
    var f_playerB = new irinori.Player("B");
    var f_playerC = new irinori.Player("C");
    var f_playerD = new irinori.Player("D");
    f_playerA.initRobot(5,9,irinori.Direction.Left, irinori.Robottype.A);
    f_playerB.initRobot(6,9,irinori.Direction.Top, irinori.Robottype.B);
    f_playerC.initRobot(5,10,irinori.Direction.Right, irinori.Robottype.A);
    f_playerD.initRobot(6,irinori.testing.testgame.m_map.m_height-1,irinori.Direction.Bottom, irinori.Robottype.A);

    irinori.testing.testgame.AddPlayer(f_playerA);
    irinori.testing.testgame.AddPlayer(f_playerB);
    irinori.testing.testgame.AddPlayer(f_playerC);
    irinori.testing.testgame.AddPlayer(f_playerD);

    f_gameview.Draw(irinori.testing.testgame);

    //Got to do that to fool draw it's not drawing same game!
    irinori.testing.initTestgame();

    irinori.testing.testgame.InitMap(irinori.Map.DecodeMapString(16,12,irinori.testing.testmapString) );

    f_gameview.Draw(irinori.testing.testgame);

}

irinori.testing.GameviewTest.SetupMap = function()
{
    var f_map = irinori.testing.testgame.m_map;
    var f_x, f_y;
    var x;
    var y;

    var f_type;

    var f_ystart = 5;
    var f_yend = 7;

    var f_xstart = 5;
    var f_xend = 7;

    for (x = f_xstart; x <= f_xend; x++) 
    {
        if (x % 2 === 0)
        {
            f_map.m_tiles[x][f_ystart].m_type = irinori.TileType.ConveyorBelt;
            f_map.m_tiles[x][f_yend].m_type = irinori.TileType.ExpressConveyorBelt;
        }
        else
        {
            f_map.m_tiles[x][f_ystart].m_type = irinori.TileType.ExpressConveyorBelt;
            f_map.m_tiles[x][f_yend].m_type = irinori.TileType.ConveyorBelt;
        }

        if (x === f_xend)
        {
            f_map.m_tiles[x][f_ystart].m_direction = irinori.Direction.Bottom;
            f_map.m_tiles[x][f_yend].m_direction = irinori.Direction.Left;
        }
        else if (x === f_xstart)
        {
            f_map.m_tiles[x][f_yend].m_direction = irinori.Direction.Top;
            f_map.m_tiles[x][f_ystart].m_direction = irinori.Direction.Right;
        }
        else
        {
            f_map.m_tiles[x][f_yend].m_direction = irinori.Direction.Left;
            f_map.m_tiles[x][f_ystart].m_direction = irinori.Direction.Right;
        }        
    }

    for (y = f_ystart + 1; y <= f_yend - 1; y++) 
    {
        if (y % 2 === 0)
        {
            f_map.m_tiles[f_xend][y].m_type = irinori.TileType.ConveyorBelt;
            f_map.m_tiles[f_xstart][y].m_type = irinori.TileType.ExpressConveyorBelt;
        }
        else
        {
            f_map.m_tiles[f_xend][y].m_type = irinori.TileType.ExpressConveyorBelt;
            f_map.m_tiles[f_xstart][y].m_type = irinori.TileType.ConveyorBelt;
        }

        f_map.m_tiles[f_xend][y].m_direction = irinori.Direction.Bottom;
        f_map.m_tiles[f_xstart][y].m_direction = irinori.Direction.Top;

    }

    

    /*
    for (f_x  = 4; f_x < 8; f_x++) 
    {
        if (f_x % 2 === 0)
        {
            f_type = irinori.TileType.ConveyorBelt; 
        }
        else
        {
            f_type = irinori.TileType.ExpressConveyorBelt;
        }

        f_map.m_tiles[f_x][f_y].m_type = f_type;
    }
    */


    /* CONVEYORBELT DRAWING UP/DOWN test */

    f_x = 0;
    f_y = 0;
    f_type = irinori.TileType.ConveyorBelt; 

    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;

    f_x = 0;
    f_y = 1;
    f_type = irinori.TileType.ExpressConveyorBelt; 

    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;

    f_x = 0;
    f_y = 2;
    f_type = irinori.TileType.ConveyorBelt; 

    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;

    f_x = 0;
    f_y = 3;
    f_type = irinori.TileType.ExpressConveyorBelt; 

    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x++][f_y].m_type = f_type;


    /* CONVEYOR BELT LEFT/RIGHT TEST */

    f_x = 0;
    f_y = 5;
    f_type = irinori.TileType.ConveyorBelt; 

    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;

    f_x = 1;
    f_y = 5;
    f_type = irinori.TileType.ExpressConveyorBelt; 

    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Left;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;


    f_x = 2;
    f_y = 5;
    f_type = irinori.TileType.ConveyorBelt; 

    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;

    f_x = 3;
    f_y = 5;
    f_type = irinori.TileType.ExpressConveyorBelt; 

    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Bottom;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Right;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;
    f_map.m_tiles[f_x][f_y].m_direction = irinori.Direction.Top;
    f_map.m_tiles[f_x][f_y++].m_type = f_type;

    f_x = 0;
    f_y = 4;

    
    f_map.m_tiles[f_x++][f_y].m_type = irinori.TileType.GearLeft;
    f_map.m_tiles[f_x++][f_y].m_type = irinori.TileType.GearRight;
    f_map.m_tiles[f_x++][f_y].m_type = irinori.TileType.Hole
    f_map.m_tiles[f_x++][f_y].m_type = irinori.TileType.Repair;
    f_map.m_tiles[f_x++][f_y].m_type = irinori.TileType.RepairAndEquip;
    f_map.m_tiles[f_x++][f_y].m_type = irinori.TileType.Normal;

    f_map.m_tiles[f_x][f_y].m_left = irinori.SideObject.Laserx1;
    f_map.m_tiles[f_x][f_y].m_top = irinori.SideObject.Laserx2;
    f_map.m_tiles[f_x][f_y].m_right = irinori.SideObject.Laserx3;
    f_map.m_tiles[f_x++][f_y].m_bottom = irinori.SideObject.Wall;

    f_map.m_tiles[f_x][f_y].m_left = irinori.SideObject.PusherOdd;
    f_map.m_tiles[f_x++][f_y].m_right = irinori.SideObject.PusherEven;

    f_map.m_tiles[f_x++][f_y].m_left = irinori.SideObject.Laserx1;
    
    f_map.m_tiles[f_map.m_width -1][f_y].m_right = irinori.SideObject.Wall;
    f_map.m_tiles[f_map.m_width -1][f_y].m_top = irinori.SideObject.Wall;
    f_map.m_tiles[f_map.m_width -1][f_y].m_bottom = irinori.SideObject.Wall;

    f_map.m_tiles[f_map.m_width -1][0].m_top = irinori.SideObject.Laserx3;
    f_map.m_tiles[f_map.m_width -1][f_map.m_height -1].m_bottom = irinori.SideObject.Laserx2;
    f_map.m_tiles[f_map.m_width -1][f_map.m_height -1].m_right = irinori.SideObject.Laserx1;

    f_map.m_tiles[f_map.m_width -3][f_map.m_height -1].m_right = irinori.SideObject.Laserx2;

}
   