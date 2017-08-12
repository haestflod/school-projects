 ///<reference path="references.js" />

if ( window.irinori === undefined ) {
	//var irinori = {};
    window.irinori = {};
}

irinori.Player = function (a_name, a_id) 
{
    if (!a_name)
    {
        throw "irinori.Player: a_name is undefined";
    }

    if (a_id === undefined)
    {
        console.log("irinori.Player: a_id is not set, this is bad!");
    }

    this.m_robot;

    this.m_name = a_name;

    this.m_id = a_id

    this.m_cards = [];
}

irinori.Player.prototype.initRobot = function(a_x, a_y, a_direction, a_type, a_spawnX, a_spawnY)
{
    

    if (a_direction > 3)
    {
        a_direction = 3;
    }
    else if (a_direction < 0)
    {
        a_direction = 0;
    }

    this.m_robot = new irinori.Robot(a_x, a_y, a_direction, a_type || 0, a_spawnX, a_spawnY);
}