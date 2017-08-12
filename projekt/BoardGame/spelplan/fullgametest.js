 ///<reference path="js/references.js" />

 if ( window.irinori === undefined ) {	
    window.irinori = {};
}

if ( window.irinori.testing === undefined ) {
	window.irinori.testing = {};
}

irinori.testing.GameTest = function()
{
    irinori.testing.initTestgame();

    var f_game = irinori.testing.testgame
    var i,j;
    var f_card;
    var m_engine = new irinori.engine();
    m_engine.SetCurrentGame(f_game);


    f_game.m_map = irinori.Map.DecodeMapString(16,12, irinori.testing.testmapString2);
    //irinori.testing.GameviewTest.SetupMap();
    
    var f_playerA = new irinori.Player("A");   
    f_playerA.initRobot(4, 2 ,irinori.Direction.Bottom, irinori.Robottype.C);
    f_game.AddPlayer(f_playerA);
    f_game.m_clientPlayer = f_playerA;
    
    
    var f_playerB = new irinori.Player("B");   
    f_playerB.initRobot(4, 8, irinori.Direction.Right, irinori.Robottype.D);
    f_game.AddPlayer(f_playerB);
    
    f_game.InitRegisterDeck();

    //init the registerView
    var m_registerDiv = document.getElementById("registers");
    var m_handDiv = document.getElementById("hand");
    var m_readyDiv = document.getElementById("ready");
    var m_registerView = new irinori.RegisterView(f_game.m_clientPlayer, m_registerDiv, m_handDiv, m_readyDiv);

    //init the RobotStatusView
    var m_statusDiv = document.getElementById("robotStatus");
    var m_robotStatusView = new irinori.RobotStatusView(f_game.m_clientPlayer, m_statusDiv, m_engine.m_gameview);

    var f_body = document.getElementsByTagName("body");

    var f_button = document.createElement("a");
    f_button.href = "#";
    f_button.innerHTML = " CLICK ME "; 
    f_body[0].appendChild(f_button);

    f_button.onclick = function ()
    {
    /*
        f_playerA.m_robot.SetRegister(0 ,  f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);
        f_playerA.m_robot.SetRegister(1, f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);
        f_playerA.m_robot.SetRegister(2,  f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);
        f_playerA.m_robot.SetRegister(3,  f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);
        f_playerA.m_robot.SetRegister(4, f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);

        f_playerB.m_robot.SetRegister(0 , f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);
        f_playerB.m_robot.SetRegister(1, f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);
        f_playerB.m_robot.SetRegister(2, f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);
        f_playerB.m_robot.SetRegister( 3, f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);
        f_playerB.m_robot.SetRegister(4, f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_amountOfCards)]);

        m_engine.SetCurrentGame(f_game);
        m_engine.DoMajorCycle();
    }*/
        
        for (i = 0; i < f_game.m_players.length; i++) {
            //not first player
            if (i !== 0) {
                for (j = 0; j < f_game.m_amountOfRegisters; j++) 
                {
                    f_card = f_game.m_registerDeck.m_cards[ Math.floor(Math.random()* f_game.m_registerDeck.m_cards.length) ];

                    //To set a specific card do it here:
                    f_card = f_game.m_registerDeck.m_cards[5];

                    f_game.m_players[i].m_robot.SetRegister(j, f_card);
                }
            }
        }

        m_engine.DoMajorCycle();
        for (i = 0; i < f_game.m_players.length; i++) {
            //if it's the first player
            if (i === 0) {
                //clear the player's hand
                f_game.m_players[i].m_cards = [];

                //if the robot is alive
                if (f_game.m_players[i].m_robot.m_alive) {
                    for (j = 0; j < f_game.m_players[i].m_robot.m_health - 1; j++) {
                        //set random card
                        f_game.m_players[i].m_cards[j] = f_game.m_registerDeck.m_cards[ Math.floor(Math.random() * f_game.m_registerDeck.m_cards.length) ];
                    }
                }
            }
        }
        m_registerView.Draw(f_game);
        m_robotStatusView.Draw();
    }
    

    //give the player some random cards (number of cards depends on health)
    //if the robot is alive
    if (f_game.m_players[0].m_robot.m_alive) {
        for (j = 0; j < f_game.m_players[0].m_robot.m_health - 1; j++) {
            //get random card
            f_game.m_players[0].m_cards[j] = f_game.m_registerDeck.m_cards[Math.floor(Math.random() * f_game.m_registerDeck.m_cards.length)];
        }
    }

    //draw the game
    m_engine.m_gameview.Draw(f_game);
    m_registerView.Draw(f_game);
    m_robotStatusView.Draw();
}

window.onload = irinori.testing.GameTest;