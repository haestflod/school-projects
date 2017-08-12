 ///<reference path="references.js" />

if ( window.irinori === undefined ) {
	window.irinori = {};
}

irinori.Positiondata = function(a_posX, a_posY)
{
    if (a_posX === undefined || a_posY === undefined)
    {
        throw "Need a position as input paramter";
    }
    
    this.m_posX = a_posX;
    this.m_posY = a_posY;

    //Is modified by CanMoveRobot()
    this.m_moveCount = 0;

    //Is set manually by CanMoveRobot()
    this.m_pushedRobot = null;
    this.m_pushedRobotData = null;
}