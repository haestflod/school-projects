/// <reference path="references.js" />

if (window.irinori === undefined) {
    window.irinori = {};
}

/*
    RegisterCard
*/
irinori.RegisterCardtype = { "Move3" : 0, "Move2" : 1, "Move1" : 2, "BackUp" : 3, "TurnRight" : 4, "TurnLeft" : 5, "UTurn": 6 };

irinori.RegisterCard = function (a_registerCardType, a_priority) {
    this.m_type = a_registerCardType;
    this.m_priority = a_priority;
}


/*
    RegisterDeck
*/
irinori.RegisterDeck = function (a_numberOfPlayers) {
    this.m_amountOfCards;
    this.m_cardsDealt = 0;
    this.m_cards = [];

    //number of players with a offset (to generate more cards)
    var f_tempNumberOfPlayers = a_numberOfPlayers + 2;

    var move3 = 1 * f_tempNumberOfPlayers;
    var move2 = 2 * f_tempNumberOfPlayers;
    var move1 = 3 * f_tempNumberOfPlayers;
    var backUp = 1 * f_tempNumberOfPlayers;
    var turnLeftAndTurnRight = 3 * f_tempNumberOfPlayers;
    var uTurn = 1 * f_tempNumberOfPlayers;

    //set amount of cards
    this.m_amountOfCards = move3 + move2 + move1 + backUp + turnLeftAndTurnRight * 2 + uTurn;

    var i = 0;

    //add U-Turn cards
    while (uTurn > 0) {
        this.m_cards[i] = new irinori.RegisterCard(irinori.RegisterCardtype.UTurn, (i + 1) * 10);
        i++;

        uTurn--;
    }    

    //add Turn Left and Turn Right cards
    while (turnLeftAndTurnRight > 0) {
        this.m_cards[i] = new irinori.RegisterCard(irinori.RegisterCardtype.TurnLeft, (i + 1) * 10);
        i++;

        this.m_cards[i] = new irinori.RegisterCard(irinori.RegisterCardtype.TurnRight, (i + 1) * 10);
        i++;

        turnLeftAndTurnRight--;
    }

    //add Back Up cards (moving backwards)
    while (backUp > 0) {
        this.m_cards[i] = new irinori.RegisterCard(irinori.RegisterCardtype.BackUp, (i + 1) * 10);
        i++;

        backUp--;
    }

    //add Move 1 cards
    while (move1 > 0) {
        this.m_cards[i] = new irinori.RegisterCard(irinori.RegisterCardtype.Move1, (i + 1) * 10);
        i++;

        move1--;
    }

    //add Move 2 cards
    while (move2 > 0) {
        this.m_cards[i] = new irinori.RegisterCard(irinori.RegisterCardtype.Move2, (i + 1) * 10);
        i++;

        move2--;
    }

    //add Move 3 cards
    while (move3 > 0) {
        this.m_cards[i] = new irinori.RegisterCard(irinori.RegisterCardtype.Move3, (i + 1) * 10);
        i++;

        move3--;
    }
}

/*
    GetCard
    Returns the card in the corresponding index. Used to see what card someone has (should NOT be used to deal cards!)
*/
irinori.RegisterDeck.prototype.GetCard = function (a_index) {
    return this.m_cards[a_index];
}

/*
    CardStringToCards
*/
irinori.RegisterDeck.prototype.CardStringToCards = function(a_cardString) {
    var cardIdArray = a_cardString.split(",");
    var cardArray = [];

    for (var i = 0; i < cardIdArray.length; i++) {
        cardArray.push( this.GetCard( cardIdArray[i] ) );
    }

    return cardArray;
}