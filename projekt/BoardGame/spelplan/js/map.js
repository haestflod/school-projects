 //Intellisense stuff
 ///<reference path="references.js" />

// Initialize namespace.
if (window.irinori === undefined) {
	window.irinori = {};
}

irinori.Startpos = function(a_x, a_y)
{
    this.m_x = a_x;
    this.m_y = a_y;
}

/**
 * Object: Map (model side).
 */
 //The constructor
irinori.Map = function (width, height) {
    this.m_width = width;
    this.m_height = height;
    this.m_tiles = [];

    this.m_startpositions = [];

    this.m_amountOfCheckpoints = 0;

    var i;
    for (i = 0; i < width; i++) {
        this.m_tiles[i] = [];
    }
    //this.LoadMap();
};

irinori.Map.prototype.AddStartpos = function (a_x, a_y)
{
    this.m_startpositions.push(new irinori.Startpos(a_x, a_y) );
}

irinori.Map.prototype.LoadEmptyMap = function () {
    var x;
    var y;

    for (x = 0; x < this.m_width; x++) {
        for (y = 0; y < this.m_height; y++) {
            //for the time being we will create a seemingly empty map
            this.m_tiles[x][y] = new irinori.Tile();
        }
    }
}

irinori.Map.prototype.IsTile = function (x, y) {
    if (x === undefined || y=== undefined)
    {
        return false;
    }

    return x >= 0 && x < this.m_width && y >= 0 && y < this.m_height;
}

irinori.Map.prototype.GetRobotTile = function(a_robot)
{     
    return this.m_tiles[a_robot.m_posX][a_robot.m_posY];
}

irinori.Map.prototype.IsTileBlocking = function (a_tile, a_sides) 
{    
    if (a_tile === undefined)
    {
        throw "Wrong input parameters to Map.IsTileBlocking, need a_tile";
    }
    else if (a_sides === undefined)
    {
        throw "Wrong input Map.IsTileBlocking need a Direction value or an array with Direction values"
    }    
    
    //Thanks to javascript! 
    if (a_sides.length === undefined)
    {
        return this.IsTileCheck(a_sides, a_tile);
    }
    else
    {
        var i;
        //If the tile itself is some bad tiletype which currently none are :o
        //if (a_tile.m_type == irinori.TileType.someBadType)

        for (i = 0; i < a_sides.length; i++) 
        {
            if(this.IsTileCheck(a_sides[i], a_tile ) )
            {
                return true;
            }
        }
    }
        
    return false;
}


//Used by IsTileBlocking
irinori.Map.prototype.IsTileCheck = function(a_side, a_tile)
{
    switch (a_side) 
    {
        case irinori.Direction.Left:
            if (a_tile.m_left !== irinori.SideObject.None) {
                return true;
            }
            break;
        case irinori.Direction.Top:
            if (a_tile.m_top !== irinori.SideObject.None) {
                return true;
            }
            break;
        case irinori.Direction.Right:
            if (a_tile.m_right !== irinori.SideObject.None) {
                return true;
            }
            break;
        case irinori.Direction.Bottom:
            if (a_tile.m_bottom !== irinori.SideObject.None) {
                return true;
            }
            break;
        //if for some reason it's a strange value coming in 
        default:
            throw "Error occured in Map.IsTileblocking";

    }

    return false;
}


irinori.Map.DecodeMapString = function(a_width,a_height,a_string)
{
    if (a_width === undefined || isNaN(a_width) )
    {
        throw "irinori.Map.DecodeMapString a_width is undefined, needs a width";
    }
    else if(a_height === undefined || isNaN(a_height))
    {
        throw "irinori.Map.DecodeMapString a_height is undefined, needs a height";
    }
    else if (a_string === undefined)
    {
        throw "irinori.Map.DecodeMapString a_string undefined, can't decode an empty string";
    }
    else if (a_string.length === undefined)
    {
        throw "irinori.Map.DecodeMapString a_string is not a string";
    }    

    var f_tiles = a_string.split(",");

    if (f_tiles.length !== a_width * a_height)
    {
        throw "irinori.Map.DecodeMapString a_string is not a complete map " + f_tiles.length + " tiles out of : " + (a_width * a_height) + " tiles"  ;
    }

    var i = 0;
    var l = 0;
    var f_tileString;
    var f_command = "";

    var f_map = new irinori.Map(a_width, a_height);
    var x, y;

    var f_letter;
    //tiledirection or direction of a sideobject (a.k.a. the side it's attached on)
    var f_direction;
    //tiletype
    var f_type;
    //What kind of sideobject
    var f_sideobject;
    //needed to see if the direction is for sideobject or tiledirection
    var f_settingSideobjects = false;
    //needed to know if f_command is for tiletype or tiledirection
    var f_typeFound = false;
    //needed to know if f_command is for sideobject or for checkpoint
    var f_checkpointFound = false;

    var f_tile

    //Takes the letter and returns a tiletype based on letter!
    var GetType = function(a_command)
    {
        switch (a_command)
        {
            case "N":
                return irinori.TileType.Normal;                             
            case "C":
                return irinori.TileType.ConveyorBelt;
            case "EX":
                return irinori.TileType.ExpressConveyorBelt;
            case "H":
                return irinori.TileType.Hole;
            case "GL":
                return irinori.TileType.GearLeft;
            case "GR":
                return irinori.TileType.GearRight;
            case "R":
                return irinori.TileType.Repair;
            case "RE":
                return irinori.TileType.RepairAndEquip;
            default:
                throw "irinori.Map.DecodeMapString.GetType could not decode letters to maptype : '" + a_command + "' tilestring: " + f_tileString;               
        }
    }    

    //TAkes a direction letter like LTRB and returns the direction
    var GetDirection = function(a_command)
    {       
        switch (a_command)
        {
            case "L":
                return irinori.Direction.Left;
            case "T":
                return irinori.Direction.Top;
            case "R":
                return irinori.Direction.Right;
            case "B":
                return irinori.Direction.Bottom;
            default:
                throw "irinori.Map.DecodeMapString could not decode letters to Direction : '" + a_command + "' tilestring: " + f_tileString;          
        }
    }

    //Takes a map letter and returns the correct side object
    var GetSideObject = function(a_command)
    {
        switch (a_command)
        {
            case "W":
                return irinori.SideObject.Wall;
            case "L1":
                return irinori.SideObject.Laserx1;
            case "L2":
                return irinori.SideObject.Laserx2;
            case "L3":
                return irinori.SideObject.Laserx3;
            case "PO":
                return irinori.SideObject.PusherOdd;
            case "PE":
                return irinori.SideObject.PusherEven;
            default:
                throw "irinori.Map.DecodeMapString could not decode letters to SideObject : '" + a_command + "' tilestring: " + f_tileString;
        }        
    }

    //Loops through each tile 1 line of x at a time
    //Then loops through the tileString (cut at ,  x * y times)
    //Then checks for special characters and based on two bools (f_found and f_settingSideobjects) it does few commands
    
    for (y = 0; y < f_map.m_height; y++) 
    {    
        for (x = 0; x < f_map.m_width; x++) 
        {
            //The tile string for example: C:L{L:L3;C:1;S;T:W;B:PE;}
            f_tileString = f_tiles[i++];            

            //The first letter of a 'command', like N L CE RE S C 1 L3  e.t.c.!
            f_command = "";
            
            f_settingSideobjects = false;

            //f_checkpointFound = false;
            f_typeFound = false;
            //This is the standard direction of a tile, so if it doesn't find a direction to the tile this is what the tile gets.
            f_direction = irinori.Direction.Top;
            

            //Loops through the tilestring and checks for execute letters:  :;{}  otherwise adds the letter to f_command
            for (l = 0; l < f_tileString.length; l++)
            {
                f_letter = f_tileString[l]; 
                
                //Checks if at start of 'extra info' bracket or at the end and havn't found a bracket
                if (f_letter === "{" )
                {
                    f_settingSideobjects = true;
                    
                    //If the type is already set it will check if f_command is empty or not to set the possible direction of a tile.
                    if (f_typeFound)
                    {
                        if (f_command.length > 0)
                        {
                            f_direction = GetDirection(f_command);
                        }
                    }
                    else
                    {                                               
                        f_type = GetType(f_command);                           
                    }

                    f_tile = new irinori.Tile(f_type, f_direction);

                    f_command = "";
                }
                //If not encountered { yet and at the end of string
                else if (!f_settingSideobjects && l === f_tileString.length - 1) 
                {
                    f_command += f_letter;
                    if (f_typeFound)
                    {
                        //If a type is found and f_commnand is not empty, that means it's a direction inside f_command  like C:L  , N = type, L = current f_command
                        if (f_command.length > 0)
                        {                            
                            f_direction = GetDirection(f_command);
                        }
                    }
                    //If no type has been found that means the tilestring only had the tiletype in it, most common on N only
                    else
                    {                         
                        f_type = GetType(f_command);                                         
                    }

                    f_tile = new irinori.Tile(f_type, f_direction);
                }      
                else if (f_letter === ":" )
                {
                    //If : is found and hasn't entered { current f_command is the tiletype next time : will appen is inside a {
                    if (!f_settingSideobjects)
                    {
                        f_type = GetType(f_command);
                        f_typeFound = true;
                    }
                    else
                    {
                        if (f_command === "C")
                        {
                            f_checkpointFound = true;
                        }
                        else
                        {
                            //Gets a direction OR -1 which is Startpos 
                            f_direction = GetDirection(f_command);            
                        }
                                    
                    }

                    f_command = "";
                }
                else if (f_letter === ";" )
                {                        
                    if (f_command === "S")
                    {
                        f_map.AddStartpos(x,y);
                    }
                    else if (f_checkpointFound === true)
                    {
                        f_tile.m_checkpoint = parseInt(f_command, 10);
                        //Has to set it false or it will go in here again if checkpoint was first in the tilestrings extra info
                        f_checkpointFound = false;
                        f_map.m_amountOfCheckpoints++;
                    }
                    else
                    {
                        f_sideobject = GetSideObject(f_command);

                        if (f_direction === irinori.Direction.Left)
                        {
                            f_tile.m_left = f_sideobject;
                        }
                        if (f_direction === irinori.Direction.Right)
                        {
                            f_tile.m_right = f_sideobject;
                        }
                        if (f_direction === irinori.Direction.Top)
                        {
                            f_tile.m_top = f_sideobject;
                        }
                        if (f_direction === irinori.Direction.Bottom)
                        {
                            f_tile.m_bottom = f_sideobject;
                        }
                    }

                    f_command = "";
                }
                //If no 'command execute sign' - :;{ is found then add it to f_command 
                else
                {
                    f_command += f_letter;
                }
                
                
            }

            f_map.m_tiles[x][y] = f_tile;
            
        }
    }

    
    
    return f_map;
}
