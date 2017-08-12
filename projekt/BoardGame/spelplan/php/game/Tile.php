<?php
namespace game;

//the tile type enumerator
class TileType
{ 
	const Normal = 0;
	const Hole = 1;
	const ConveyorBelt = 2; 
	const ExpressConveyorBelt = 3; 
	const RotatingConveyorBeltRight = 4; 
	const RotatingConveyorBeltLeft = 5; 
	const GearRight = 6; 
	const GearLeft = 7; 
	const Repair = 8; 
	const RepairAndEquip = 9; 
}

//the side object enumerator
class SideObject
{
	const None = 0; 
	const Wall = 1; 
	const Laserx1 = 2; 
	const Laserx2 = 3; 
	const Laserx3 = 4; 
	const PusherOdd = 5; 
	const PusherEven = 6;
}

/**
 * Object: Tile (model side)
 */
 //The constructor
class Tile
{

	var $m_type;
	var $m_direction;

	var $m_top;
	var $m_left;
	var $m_right;
	var $m_bottom;

	var $r_robot;
	var $m_checkpoint;


	public function __construct (
		$a_type = \game\TileType::Normal, 
		$a_direction = \game\Direction::Top, 
		$a_topObject = \game\SideObject::None, 
		$a_leftObject = \game\SideObject::None, 
		$a_rightObject = \game\SideObject::None, 
		$a_bottomObject = \game\SideObject::None) 
	{
	    $this->m_type = $a_type;

		$this->m_direction = $a_direction;

	    $this->m_top = $a_topObject;
	    $this->m_left = $a_leftObject;
	    $this->m_right = $a_rightObject;
	    $this->m_bottom = $a_bottomObject;

	    $this->r_robot = null;

	    $this->m_checkpoint = 0;
	}

	public function HasSideObject ($a_direction, $a_sideObject) 
	{
	    switch ($a_direction) {
	        case \game\Direction::Left:
	            if ($this->m_left === $a_sideObject) {
	                return true;
	            }
	            break;
	        case \game\Direction::Top:
	            if ($this->m_top === $a_sideObject) {
	                return true;
	            }
	            break;
	        case \game\Direction::Right:
	            if ($this->m_right === $a_sideObject) {
	                return true;
	            }
	            break;
	        case \game\Direction::Bottom:
	            if ($this->m_bottom === $a_sideObject) {
	                return true;
	            }
	            break;
	        //if a strange value came in
	        default:
	            throw new \Exception("Error occured in Tile.HasSideObject! From input: a_direction: $a_direction, a_sideObject: $a_sideObject");

	    }
	    
	    return false;
	}
}

?>