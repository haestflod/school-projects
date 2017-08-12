 //Intellisense stuff
 ///<reference path="references.js" />

if (window.irinori === undefined) {
    window.irinori = {};
}

irinori.ConveyorbeltHelpData = function (a_x, a_y, a_robot, a_direction) {
    this.m_tileX = a_x;
    this.m_tileY = a_y;

    this.m_robots = [];

    this.m_robots.push(a_robot);

    this.m_direction = a_direction;
}