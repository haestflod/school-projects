 ///<reference path="js/references.js" />

if ( window.irinori === undefined ) {
	//var irinori = {};
    window.irinori = {};
}

if ( window.irinori.testing === undefined ) {
	//var irinori = {};
    window.irinori.testing = {};
}

irinori.testing.testgame = null;

irinori.testing.initTestgame = function () {
    //if (irinori.testing.testgame === null) {
        irinori.testing.testgame = new irinori.Game();
                
        irinori.testing.SetupTestMap();
    //}
}

irinori.testing.testmapString = "N,C:B,N,N{S;},R,N,N{T:W;},N,N{T:W;},N,N,N{T:W;},N,N{T:W;},N,N,N,C:B,N{T:W;S;},N{C:1;},N,EX:R,EX:R,EX:R,EX:R,EX:R,EX:R,EX:R,EX:R,EX:R,EX:B,N,C:B,C:L,N{T:W;},N{R:W;},N{L:W;},EX:T,N,C:B{T:W;},N,C:B{T:W;},N{T:W;C:2;},C:B,N{T:W;},C:B,EX:B,N{R:W;},C:B,N{S;},N,N,N,EX:T{R:W;},C:B,N,C:B,N,C:B,N,H,N{R:W;},EX:B,N,C:B,N,N,N{T:W;R:W;},N{L:W;},EX:T,N,C:B,N,C:B,N,C:B,N,C:B,EX:B,N{R:W;},N{S;},N,N,N,N,EX:T{R:W;},C:B,N,H,N,RE,N,C:B,N{R:W;},EX:B,N,N{T:W;S;},N{T:W;},N,N,N,EX:T{R:W;},N,C:T,N,RE,N,H,N,C:T{R:W;},EX:B,N,C:T,N,N,N{R:W;B:W;},N{L:W;},EX:T,C:T,N,C:T,N,C:T,N,C:T,N,EX:B,N{R:W;},C:T,N{S;},N,N,N,EX:T{R:W;},N,C:T,N,H,N,C:T,N,C:T{R:W;},EX:B,N,C:T,C:L,N{B:W;},N{R:W;},N{L:W;},EX:T,C:T,N,C:T,N,C:T,N,C:T,N,EX:B,N{R:W;},N,C:T,N{B:W;S;},N,N,EX:T,EX:L,EX:L{T:W;},EX:L,EX:L{T:W;},EX:L{T:W;},EX:L,EX:L{T:W;},EX:L,EX:L,N,N,C:T,N,N{S;},N,N,N{B:W;},N,N{B:L3;},N,N,N{B:W;},N,N{B:L1;},N,R";
irinori.testing.testmapString2 = "N,C:B,N,N{S;},R,N,N{T:W;},N,N{T:W;},N,N,N{T:W;},N,N{T:W;},N,N,N,C:B,N{T:W;S;},N{C:1;},N,EX:R,EX:R,EX:R,EX:R,EX:R,EX:R,EX:R,EX:R,EX:R,EX:B,N,C:B,C:L,N{T:W;},N{R:W;},N{L:W;},EX:T,N,C:B{T:W;},N,C:B{T:W;},N{T:W;C:2;},C:B,N{T:W;},C:B,EX:B,N{R:W;},C:B,N{S;},N,N,N,EX:T{R:W;},C:B,N,C:B,N,C:B,N,H,N{R:W;},EX:B,N,C:B,N,N,N{T:W;R:W;},N{L:W;},EX:T,N,C:B,N,C:B,N,C:B,N,C:B,EX:B,N{R:W;},N{S;},N,N,N,N,EX:T{R:W;},C:B,N,H,N,RE,N,C:B,N{R:W;},EX:B,N,N{T:W;S;},N{T:W;},N,N,N,EX:T{R:W;},N,C:T,N,RE,N,H,N,C:T{R:W;},EX:B,N,C:T,N,N,N{R:W;B:W;},N{L:W;},EX:T,C:T,N,C:T,N,C:T,N,C:T,N,EX:B,N{R:W;},C:T,N{S;},N,N,N,EX:T{R:W;},N,C:T,N,H,N,C:T,N,C:T{R:W;},EX:B,N,C:T,C:L,N{B:W;},N{R:W;},N{L:W;},EX:T,C:T,N,C:T,N,C:T,N,C:T,N,EX:B,N{R:W;},N,C:T,N{B:W;S;},N,N,EX:T,EX:L,EX:L{T:W;},EX:L,EX:L{T:W;},EX:L{T:W;},EX:L,EX:L{T:W;},EX:L,EX:L,N,N,C:T,N,N{S;},N,N,N{B:W;},N,N{B:L3;},N,N,N{B:W;},N,N{B:L1;},N,R";

irinori.testing.SetupTestMap = function()
{
    //size + 2 cause of the 'hole border'
    var f_map = new irinori.Map(14,14);
    f_map.LoadEmptyMap();

    irinori.testing.testgame.InitMap(f_map);
}



