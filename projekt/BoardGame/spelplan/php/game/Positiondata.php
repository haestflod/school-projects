<?php

namespace game;

class Positiondata
{
	public $m_posX;
	public $m_posY;
	
	//These get handled directly by engine!
	public $m_moveCount = 0;	
	
	public $m_pushedRobot = null;
	public $m_pushedRobotData = null;
	
	public function __construct($a_posX, $a_posY)
	{
		if (!isset($a_posX) || !isset($a_posY))
		{
			throw new \Exception("game.PositionData.Construct: Need a position as inputparameter");			
		}
		
		$this->m_posX = $a_posX;
		$this->m_posY = $a_posY;
	}
	
}

?>