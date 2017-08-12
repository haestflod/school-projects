<?php

namespace game;

class ConveyorbeltHelpData
{
	public $m_tileX;
	public $m_tileY;
	
	public $m_robots = array();
	
	public $m_direction;
	
	public function __construct($a_x, $a_y, $a_robot, $a_direction)
	{
		$this->m_tileX = $a_x;
		$this->m_tileY = $a_y;
		
	    array_push($this->m_robots, $a_robot);
		
		$this->m_direction = $a_direction;	
	}
}

?>