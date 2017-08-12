<?php
namespace game;


class Startpos
{
	public $m_x;
	public $m_y;

	public function __construct ($a_x, $a_y)
	{
	    $this->m_x = $a_x;
	    $this->m_y = $a_y;
	}
}

/**
 * Object: Map (model side).
 */
 //The constructor
class Map
{
	//variables
	var $m_width;
	var $m_height;
	var $m_tiles;
	var $m_startpositions;
	var $m_amountOfCheckpoints;


	public function __construct ($width, $height) 
	{
	    $this->m_width = $width;
	    $this->m_height = $height;
	    $this->m_tiles = array();

	    $this->m_startpositions = array();

	    $this->m_amountOfCheckpoints = 0;

	    for ($i = 0; $i < $width; $i++) {
	        $this->m_tiles[$i] = array();
	    }
	}

	public function AddStartpos ($a_x, $a_y)
	{
	    array_push($this->m_startpositions, new \game\Startpos($a_x, $a_y) );
	}

	public function LoadEmptyMap () 
	{
	    for ($x = 0; $x < $this->m_width; $x++) {
	        for ($y = 0; $y < $this->m_height; $y++) {
	            //for the time being we will create a seemingly empty map
	            $this->m_tiles[$x][$y] = new \game\Tile();
	        }
	    }
	}

	public function IsTile ($x = null, $y = null) 
	{
	    if ($x === null || $y === null)
	    {
	        return false;
	    }

	    return $x >= 0 && $x < $this->m_width && $y >= 0 && $y < $this->m_height;
	}

	public function GetRobotTile ($a_robot)
	{     
	    return $this->m_tiles[$a_robot->m_posX][$a_robot->m_posY];
	}

	public function IsTileBlocking ($a_tile = null, $a_sides = null) 
	{    
	    if ($a_tile === null)
	    {
	        throw new \Exception("Wrong input parameters to Map->IsTileBlocking, need a_tile");
	    }
	    else if ($a_sides === null)
	    {
	        throw new \Exception("Wrong input Map->IsTileBlocking need a Direction value or an array with Direction values");
	    }    
	    
	    //Thanks to javascript! (Nope)
	    //NOTE: check if it's NOT an array
	    if (!is_array($a_sides))
	    {
	        return $this->IsTileCheck($a_sides, $a_tile);
	    }
	    else
	    {
	        //If the tile itself is some bad tiletype which currently none are :o
	        //if (a_tile.m_type == \game\TileType.someBadType)

	        for ($i = 0; $i < count($a_sides); $i++) 
	        {
	            if($this->IsTileCheck($a_sides[$i], $a_tile ) )
	            {
	                return true;
	            }
	        }
	    }
	        
	    return false;
	}


	//Used by IsTileBlocking
	public function IsTileCheck ($a_side, $a_tile)
	{
	    switch ($a_side) 
	    {
	        case \game\Direction::Left:
	            if ($a_tile->m_left !== \game\SideObject::None) {
	                return true;
	            }
	            break;
	        case \game\Direction::Top:
	            if ($a_tile->m_top !== \game\SideObject::None) {
	                return true;
	            }
	            break;
	        case \game\Direction::Right:
	            if ($a_tile->m_right !== \game\SideObject::None) {
	                return true;
	            }
	            break;
	        case \game\Direction::Bottom:
	            if ($a_tile->m_bottom !== \game\SideObject::None) {
	                return true;
	            }
	            break;
	        //if for some reason it's a strange value coming in 
	        default:
	            throw new \Exception("Error occured in Map->IsTileblocking");

	    }

	    return false;
	}


	public static function DecodeMapString ($a_width = null, $a_height = null, $a_string = null)
	{
		// require "php/game/engine.php";

	    if ($a_width === null || !is_numeric($a_width) )
	    {
	        throw new \Exception("\game\Map->DecodeMapString a_width is undefined, needs a width");
	    }
	    else if($a_height === null || !is_numeric($a_height))
	    {
	        throw new \Exception("\game\Map->DecodeMapString a_height is undefined, needs a height");
	    }
	    else if ($a_string === null)
	    {
	        throw new \Exception("\game\Map->DecodeMapString a_string undefined, can't decode an empty string");
	    }
	    else if (is_array($a_string))
	    {
	        throw new \Exception("\game\Map->DecodeMapString a_string is not a string");
	    }    

	    $f_tiles = explode(",", $a_string);

	    if (count($f_tiles) !== $a_width * $a_height)
	    {
	        throw new \Exception("\game\Map->DecodeMapString a_string is not a complete map $f_tiles.length tiles out of : ($a_width * $a_height) tiles");
	    }

	    $i = 0;
	    $l = 0;
	    $f_tileString;
	    $f_command = "";

	    $f_map = new \game\Map($a_width, $a_height);
	    $x; 
	    $y;

	    $f_letter;
	    //tiledirection or direction of a sideobject (a.k.a. the side it's attached on)
	    $f_direction;
	    //tiletype
	    $f_type;
	    //What kind of sideobject
	    $f_sideobject;
	    //needed to see if the direction is for sideobject or tiledirection
	    $f_settingSideobjects = false;
	    //needed to know if f_command is for tiletype or tiledirection
	    $f_typeFound = false;
	    //needed to know if f_command is for sideobject or for checkpoint
	    $f_checkpointFound = false;

	    $f_tile;

	    //Loops through each tile 1 line of x at a time
	    //Then loops through the tileString (cut at ,  x * y times)
	    //Then checks for special characters and based on two bools (f_found and f_settingSideobjects) it does few commands
	    
	    for ($y = 0; $y < $f_map->m_height; $y++) 
	    {   
	        for ($x = 0; $x < $f_map->m_width; $x++) 
	        {
	            //The tile string for example: C:L{L:L3;C:1;S;T:W;B:PE;}
	            $f_tileString = $f_tiles[$i++];  
	                      

	            //The first letter of a 'command', like N L CE RE S C 1 L3  e.t.c.!
	            $f_command = "";
	            
	            $f_settingSideobjects = false;

	            //f_checkpointFound = false;
	            $f_typeFound = false;
	            //This is the standard direction of a tile, so if it doesn't find a direction to the tile this is what the tile gets.
	            $f_direction = \game\Direction::Top;
	            

	            //Loops through the tilestring and checks for execute letters:  :;{}  otherwise adds the letter to f_command
	            for ($l = 0; $l < strlen($f_tileString); $l++)
	            {
	                $f_letter = $f_tileString[$l];			
	                
	                //Checks if at start of 'extra info' bracket or at the end and havn't found a bracket
	                if ($f_letter === "{" ) //" my intellisense went bonkers over that for some reason!
	                {
	                    $f_settingSideobjects = true;
	                    
	                    //If the type is already set it will check if f_command is empty or not to set the possible direction of a tile.
	                    if ($f_typeFound)
	                    {
	                        if (strlen($f_command) > 0)
	                        {
	                            $f_direction = \game\Map::GetDirection($f_command);
	                        }
	                    }
	                    else
	                    {                                               
	                        $f_type = \game\Map::GetType($f_command);                           
	                    }

	                    $f_tile = new \game\Tile($f_type, $f_direction);

	                    $f_command = "";
	                }
	                //If not encountered { yet and at the end of string
	                else if (!$f_settingSideobjects && $l === strlen($f_tileString) - 1) 
	                {
	                    $f_command .= $f_letter;	                    
	                    
	                    if ($f_typeFound)
	                    {
	                        //If a type is found and f_command is not empty, that means it's a direction inside f_command  like C:L  , N = type, L = current f_command
	                        if (strlen($f_command) > 0)
	                        {                            
	                            $f_direction = \game\Map::GetDirection($f_command);
	                            
	                        }
	                    }
	                    //If no type has been found that means the tilestring only had the tiletype in it, most common on N only
	                    else
	                    {                         
	                        $f_type = \game\Map::GetType($f_command);                                         
	                    }

	                    $f_tile = new \game\Tile($f_type, $f_direction);
	                }      
	                else if ($f_letter === ":" )
	                {
	                    //If : is found and hasn't entered { current f_command is the tiletype next time : will appen is inside a {
	                    if (!$f_settingSideobjects)
	                    {
	                        $f_type = \game\Map::GetType($f_command);
	                        $f_typeFound = true;
	                    }
	                    else
	                    {
	                        if ($f_command === "C")
	                        {
	                            $f_checkpointFound = true;
	                        }
	                        else
	                        {
	                            //Gets a direction OR -1 which is Startpos 
	                            $f_direction = \game\Map::GetDirection($f_command);            
	                        }
	                                    
	                    }

	                    $f_command = "";
	                }
	                else if ($f_letter === ";" )
	                {                        
	                    if ($f_command === "S")
	                    {
	                        $f_map->AddStartpos($x, $y);
	                    }
	                    else if ($f_checkpointFound === true)
	                    {
	                        $f_tile->m_checkpoint = intval($f_command);
	                        //Has to set it false or it will go in here again if checkpoint was first in the tilestrings extra info
	                        $f_checkpointFound = false;
	                        $f_map->m_amountOfCheckpoints++;
	                    }
	                    else
	                    {
	                        $f_sideobject = \game\Map::GetSideObject($f_command);

	                        if ($f_direction === \game\Direction::Left)
	                        {
	                            $f_tile->m_left = $f_sideobject;
	                        }
	                        if ($f_direction === \game\Direction::Right)
	                        {
	                            $f_tile->m_right = $f_sideobject;
	                        }
	                        if ($f_direction === \game\Direction::Top)
	                        {
	                            $f_tile->m_top = $f_sideobject;
	                        }
	                        if ($f_direction === \game\Direction::Bottom)
	                        {
	                            $f_tile->m_bottom = $f_sideobject;
	                        }
	                    }

	                    $f_command = "";
	                }
	                //If no 'command execute sign' - :;{ is found then add it to f_command 
	                else
	                {
	                	
	                    $f_command .= $f_letter;
						
	                }                	                
	            }

	            $f_map->m_tiles[$x][$y] = $f_tile;
	        }
	    }

	    
	    
	    return $f_map;
	}


	//Takes the letter and returns a tiletype based on letter!
    public static function GetType ($a_command)
    {
        switch ($a_command)
        {
            case "N":
                return \game\TileType::Normal;                      
            case "C":
                return \game\TileType::ConveyorBelt;
            case "EX":
                return \game\TileType::ExpressConveyorBelt;
            case "H":
                return \game\TileType::Hole;
            case "GL":
                return \game\TileType::GearLeft;
            case "GR":
                return \game\TileType::GearRight;
            case "R":
                return \game\TileType::Repair;
            case "RE":
                return \game\TileType::RepairAndEquip;
            default:
                throw new \Exception("game.Map->DecodeMapString->GetType could not decode letters to maptype :" . $a_command);
        }
    }
    //Takes a direction letter like LTRB and returns the direction
    public static function GetDirection ($a_command)
    {       
        switch ($a_command)
        {
            case "L":
                return \game\Direction::Left;
            case "T":
                return \game\Direction::Top;
            case "R":
                return \game\Direction::Right;
            case "B":
                return \game\Direction::Bottom;
            default:
                throw new \Exception("\game\Map->DecodeMapString->GetDirection could not decode letters to Direction : $a_command   tilestring: $f_tileString");          
        }
    }

    //Takes a map letter and returns the correct side object
    public static function GetSideObject ($a_command)
    {
        switch ($a_command)
        {
            case "W":
                return \game\SideObject::Wall;
            case "L1":
                return \game\SideObject::Laserx1;
            case "L2":
                return \game\SideObject::Laserx2;
            case "L3":
                return \game\SideObject::Laserx3;
            case "PO":
                return \game\SideObject::PusherOdd;
            case "PE":
                return \game\SideObject::PusherEven;
            default:
                throw new \Exception("\game\Map->DecodeMapString->GetSideObject could not decode letters to SideObject : $a_command   tilestring: $f_tileString");
        }        
    }
}

?>