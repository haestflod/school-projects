 ///<reference path="references.js" />

if ( window.irinori === undefined ) {
	//var irinori = {};
    window.irinori = {};
}

//Game is a collection of data that game engine does logic on.
irinori.Game = function ( a_gameId ) 
{
    this.m_id = a_gameId;
    this.m_map = null;
    this.m_bonusDeck = [];
    this.m_registerDeck;
    this.m_turn = 0;
    this.m_players = [];

    //Is set by the controller that creates the game
    this.m_clientPlayer = null;

    this.m_amountOfRegisters = 5;

    //In milliseconds
    this.m_turntimer;
    //in minutes... or at least database is!
    this.turnResponsetimer;

    this.m_winner = null;
}

irinori.Game.prototype.AddPlayer = function (a_player) {
    this.m_players.push(a_player);

    if (this.m_map !== null) {
        this.m_map.m_tiles[a_player.m_robot.m_posX][a_player.m_robot.m_posY].r_robot = a_player.m_robot;
    }
    else {
        throw "Need a map before adding players cause of references on the map";        
    }
}

irinori.Game.prototype.InitMap = function(a_map)
{
    this.m_map = a_map;
}

irinori.Game.prototype.InitRegisterDeck = function () {
    this.m_registerDeck = new irinori.RegisterDeck(this.m_players.length);
}