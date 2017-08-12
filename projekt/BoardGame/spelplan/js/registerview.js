/// <reference path="references.js" />

if (window.irinori === undefined) {
    window.irinori = {};
}





irinori.RegisterView = function (a_player, a_registerDiv, a_handDiv, a_readyDiv) {
    this.r_player = a_player;

    this.m_registers = [];
    this.m_hand = []; //Holds the player's cards

    //set the divs
    this.m_registerDiv = a_registerDiv;
    this.m_handDiv = a_handDiv;
    this.m_readyDiv = a_readyDiv;   

    this.m_lockUI = false; //this is used to make the user unable to interact with the RegisterView
    //NOTE: when the game is "rolling" this should be set to true
}

irinori.RegisterView.prototype.Draw = function (a_game) {
    
    this.DrawRegisters(a_game);
    this.DrawHand();
//  this.DrawReadyButton(a_game);
    this.DrawForm(a_game);
}

//Draws the register
irinori.RegisterView.prototype.DrawRegisters = function (a_game) {
    var i;
    var f_divCardSlot;
    var f_titlebar;
    var f_aCard;
    var f_divCard;
    var f_element;
    var f_that = this;

    //clear the register (it clears the register array and removes these children from the div which holds it)
    while (this.m_registers.length >= 1) {
        //remove node
        this.m_registerDiv.removeChild(this.m_registers[0]);

        //remove from array
        this.m_registers.splice(0, 1);
    }

    //create the registers
    for (i = 0; i < a_game.m_amountOfRegisters; i++) {
        //create the slot
        f_divCardSlot = document.createElement("div");
        f_divCardSlot.setAttribute("class", "cardSlot");

        //create the titlebar
        f_titlebar = document.createElement("div");
        f_titlebar.setAttribute("class", "titleBar");

        //register number
        f_element = document.createElement("p");
        f_element.setAttribute("class", "registerNumber");
        f_element.innerHTML = i + 1;
        f_titlebar.appendChild(f_element); //append

        //append titlebar!
        f_divCardSlot.appendChild(f_titlebar);

        //if the player has a card in this register already
        if (this.r_player.m_robot.m_registers[i].m_card !== undefined) {
            //create the card
            f_divCard = this.GetCardView(this.r_player.m_robot.m_registers[i].m_card);

            //handle locked cards
            if (this.r_player.m_robot.m_registers[i].m_locked === true) {
                f_divCardSlot.appendChild(f_divCard); //append the card without the a

                //set locked status
                f_element = document.createElement("p");
                f_element.setAttribute("class", "locked");
                f_element.innerHTML = "LOCKED";
                f_titlebar.appendChild(f_element);
            }
            else {
                f_aCard = document.createElement("a");
                f_aCard.setAttribute("href", "#");
                f_aCard.appendChild(f_divCard);
                f_aCard.onclick = (function (a_registerID) {
                    return function () {
                        irinori.RegisterView.prototype.TakeCard.call(f_that, a_registerID);
                        return false;
                    }
                })(i);

                f_divCardSlot.appendChild(f_aCard); //append the card with the a (to make it look clickable)
            }
        }

        //add child to the register div
        this.m_registerDiv.appendChild(f_divCardSlot);

        //add to the array
        this.m_registers.push(f_divCardSlot);
    }
}

//Draws the hand
irinori.RegisterView.prototype.DrawHand = function () {
    var i;
    var f_divCardSlot;
    var f_aCard;
    var f_divCard;
    var f_that = this;

    //clear the hand (it clears the hand array and removes these children from the div which holds it)
    while (this.m_hand.length >= 1) {
        //remove node
        this.m_handDiv.removeChild(this.m_hand[0]);

        //remove from array
        this.m_hand.splice(0, 1);
    }

    //create the hand
    for (i = 0; i < this.r_player.m_cards.length; i++) {
        //create the card
        f_divCard = this.GetCardView(this.r_player.m_cards[i]);

        //create the a-tag
        f_aCard = document.createElement("a");
        f_aCard.setAttribute("href", "#");
        f_aCard.onclick = (function (a_handID) {
            return function () {
                irinori.RegisterView.prototype.PlaceCard.call(f_that, a_handID);

                return false;
            }
        })(i);


        //create the slot
        f_divCardSlot = document.createElement("div");
        f_divCardSlot.setAttribute("class", "cardSlot");

        f_aCard.appendChild(f_divCard); //append the card div to the a-tag

        f_divCardSlot.appendChild(f_aCard); //append the a-tag to the card slot

        //add child to the hand div
        this.m_handDiv.appendChild(f_divCardSlot);

        //add to the array
        this.m_hand.push(f_divCardSlot);
    }

    //set the hand's width
    this.m_handDiv.style.width = this.m_hand.length * (irinori.RegisterView.cardWidth + (2 * irinori.RegisterView.cardSideMargin)) + "px";
}


/*
GetCardView
Creates a card div (based on the inputed card) and returns it
*/
irinori.RegisterView.prototype.GetCardView = function (a_registerCard) {
    var f_divCard;
    var f_element;

    //create the card
    f_divCard = document.createElement("div");
    f_divCard.setAttribute("class", "card");
    

    //type
    f_element = document.createElement("img");
    f_element.setAttribute("class", "cardType");
    
    //first we need to find out the type
    switch (a_registerCard.m_type) {
        case 0:
            // Move 3
            f_element.setAttribute("src", irinori.RegisterView.ImageBasePath + "card_move3.png");
            break;
        case 1:
            // Move 2
            f_element.setAttribute("src", irinori.RegisterView.ImageBasePath + "card_move2.png");
            break;
        case 2:
            // Move 1
            f_element.setAttribute("src", irinori.RegisterView.ImageBasePath + "card_move1.png");
            break;
        case 3:
            // Back Up
            f_element.setAttribute("src", irinori.RegisterView.ImageBasePath + "card_backup.png");
            break;
        case 4:
            // Turn Right
            f_element.setAttribute("src", irinori.RegisterView.ImageBasePath + "card_turnright.png");
            break;
        case 5:
            // Turn Left
            f_element.setAttribute("src", irinori.RegisterView.ImageBasePath + "card_turnleft.png");
            break;
        case 6:
            // U-Turn
            f_element.setAttribute("src", irinori.RegisterView.ImageBasePath + "card_uturn.png");
            break;
    }
    f_divCard.appendChild(f_element); //append

    //priority
    f_element = document.createElement("p");
    f_element.setAttribute("class", "cardText");
    f_element.innerHTML = a_registerCard.m_priority;
    f_divCard.appendChild(f_element); //append

    //create card END

    return f_divCard;
}

irinori.RegisterView.prototype.UpdateForm = function () {
    for (var i = 0; i < this.r_player.m_robot.m_registers.length; i++ ) {
        if ( this.r_player.m_robot.m_registers[i].m_card ) {
            document.getElementById( "register" + i ).value = ( this.r_player.m_robot.m_registers[i].m_card.m_priority * 0.1 ) - 1;
        } else {
            document.getElementById( "register" + i ).value = "";
        }
    }

    document.getElementById("makemove").disabled = !this.CanSendMove();
}

/*
PlaceCard
This puts a card from the hand to a register

NOTE: It sets and searches the model side, we might want to change it to only search and set the view side.
But then we have to change the way the register is set
*/
irinori.RegisterView.prototype.PlaceCard = function (a_handID) {
    var i;
    var f_slot = -1;
    var f_divCard;
    var f_aCard;
    var f_that = this;

    //check if the view is locked
    if (this.m_lockUI) {
        return false;
    }

    //find a free slot in the register
    for (i = 0; i < this.r_player.m_robot.m_registers.length; i++) {
        //if the register doesn't have a card on it
        if (this.r_player.m_robot.m_registers[i].m_card == undefined) {
            f_slot = i; //set this register as the slot
            break;
        }
    }

    //if no free slot was found
    if (f_slot < 0) {
        return false;
    }


    //this part recreates the card and places it in the register (view)

    //get the card from the hand (not the a-tag!)
    f_divCard = this.m_hand[a_handID].childNodes[0].childNodes[0];

    //create the a-tag
    f_aCard = document.createElement("a");
    f_aCard.setAttribute("href", "#");
    f_aCard.onclick = (function (a_registerID) {
        return function () {
            irinori.RegisterView.prototype.TakeCard.call(f_that, a_registerID);
            return false;
        }
    })(f_slot);

    f_aCard.appendChild(f_divCard); //append the card to the a-tag

    //place the card in the register (view)
    this.m_registers[f_slot].appendChild(f_aCard);

    //clear the card slot
    //remove the card from the hand's card slot
    this.m_hand[a_handID].removeChild(this.m_hand[a_handID].childNodes[0])

    //finally, set the register!
    //NOTE: I'm doing this last in case anything above goes apeshit :P
    //place the card in the register (model);
    this.r_player.m_robot.SetRegister(f_slot, this.r_player.m_cards[a_handID]);

    //update the ready button looks
//   this.UpdateReadyButton();


    this.UpdateForm();
}


/*
TakeCard
This takes a card from the register and puts it in the player's hand
*/
irinori.RegisterView.prototype.TakeCard = function (a_registerID) {
    var i;
    var f_slot = -1;
    var f_divCard;
    var f_aCard;
    var f_that = this;

    //check if the view is locked
    if (this.m_lockUI) {
        return false;
    }


/*
    //find a free slot in the hand
    for (i = 0; i < this.m_hand.length; i++) {
        //if the slot doesn't have a card on it
        if (this.m_hand[i].childNodes[0] == undefined) {
            f_slot = i; //set this register as the slot
            break;
        }
    }
*/
    //get the card from the register (not the a-tag!)
    f_divCard = this.m_registers[a_registerID].childNodes[1].childNodes[0];

    for (var i = 0; i < this.r_player.m_cards.length; i++) {
        if ( this.r_player.m_cards[i].m_priority == f_divCard.childNodes[1].innerHTML )
        {
            f_slot = i;
        }
    }

    //if no free slot was found
    if (f_slot < 0) {
        return false;
    }

    //this part recreates the card and places it in the hand


    //create the a-tag
    f_aCard = document.createElement("a");
    f_aCard.setAttribute("href", "#");
    f_aCard.onclick = (function (f_slot) {
        return function () {
            irinori.RegisterView.prototype.PlaceCard.call(f_that, f_slot);
            return false;
        }
    })(f_slot);

    f_aCard.appendChild(f_divCard); //append the card to the a-tag

    //place the card in the hand (view)
    this.m_hand[f_slot].appendChild(f_aCard);

    //remove the card from the register (view)
    this.m_registers[a_registerID].removeChild(this.m_registers[a_registerID].childNodes[1]);

    //remove the card from the register (model)
    this.r_player.m_robot.m_registers[a_registerID].m_card = undefined;

    //update the ready button looks
//  this.UpdateReadyButton();
    this.UpdateForm();
}

//Draws the ready button
irinori.RegisterView.prototype.DrawReadyButton = function (a_game) {
    var f_aElement;
    var f_that = this;


    //if a ready button already exists
    if (this.m_readyDiv.hasChildNodes()) {
        return false; //exit
    }

    //create the a-tag (to make it look clickable)
    f_aElement = document.createElement("a");
    f_aElement.setAttribute("href", "#");
    f_aElement.onclick = (function (a_game) {
        return function () {
            irinori.RegisterView.prototype.TrySendMove.call(f_that, a_game);
        }
    })(a_game);
    f_aElement.innerHTML = "Make Move";

    //add the a-tag to the site
    this.m_readyDiv.appendChild(f_aElement);

    //set the buttons's background
    this.UpdateReadyButton();
}

//Draws the form
irinori.RegisterView.prototype.DrawForm = function (a_game) {
    var f_formRoot, f_button, f_hidden, f_fieldset;

    if (!this.m_readyDiv.hasChildNodes()) {
        f_formRoot = document.createElement("form");
        f_formRoot.setAttribute("action", "index.php?c=gameboard&game=" + a_game.m_id + "&a=makemove");
        f_formRoot.setAttribute("method", "post");

        f_fieldset = document.createElement("fieldset");
        f_formRoot.appendChild(f_fieldset);

        for (var i = 0; i <= 4; i++) {
            f_hidden = document.createElement("input");
            f_hidden.setAttribute("type", "hidden");
            f_hidden.setAttribute("name", "register" + i);
            f_hidden.setAttribute("id", "register" + i);
            f_fieldset.appendChild(f_hidden);
        }

        f_button = document.createElement("input");
        f_button.setAttribute("type", "submit");
        f_button.setAttribute("name", "makemove");
        f_button.setAttribute("id", "makemove");
        f_button.setAttribute("value", "Make Move");
        f_button.setAttribute("disabled", "true");
        f_fieldset.appendChild(f_button);

        this.m_readyDiv.appendChild(f_formRoot);
    }
    else {
        //set the form's button to be disabled
        this.m_readyDiv.childNodes[0].childNodes[0].childNodes[5].setAttribute("disabled", "true");
    }
}

irinori.RegisterView.prototype.TrySendMove = function (a_game) {
    var i;

    //check if the UI is locked
    if (this.m_lockUI) {
        return false;
    }


    //check if we may send the move
    if (this.CanSendMove()) {
        //send the move!
        this.SendMove(a_game);
    }
}


irinori.RegisterView.prototype.SendMove = function (a_game) {
    var turnData;
    var turnDataString;
    var i;

    //lets start preparing to send!

    //create the JSON object to send
    turnData = {};

    //add registers
    turnData.registers = [];
    for (i = 0; i < this.r_player.m_robot.m_registers.length; i++) {
        turnData.registers[i] = this.r_player.m_robot.m_registers[i].m_card.m_priority * 0.1;
    }

    //add powerdown
    turnData.powerdown = this.r_player.m_robot.m_powerDownStatus;

    //add bonus card ID's
    //NOTE: this might be changed when we actually implement the bonuscards
    turnData.bonusCardIDs = this.r_player.m_robot.m_bonusCards;

    //turn the JSON object into a JSON string
    turnDataString = JSON.stringify(turnData);


    //now it's finally time to send the turn data

    //TODO: send the string!
    console.log("MAKE IT SEND THIS: " + turnDataString);

    //lock the UI
    //to prevent multiple sends
    this.LockUI();

    //make the ready button look used
    //NOTE: should probably make it look like its loading and give some feedback on how it went
    this.m_readyDiv.childNodes[0].style.backgroundColor = irinori.RegisterView.usedColor;
}


//returns true if we may send the move (otherwise false)
irinori.RegisterView.prototype.CanSendMove = function () {
    //go through all registers
    for (i = 0; i < this.r_player.m_robot.m_registers.length; i++) {
        //check if we have filled the register
        if (this.r_player.m_robot.m_registers[i].m_card == undefined) {
            return false; //the register is not set, so we exit
        }
    }

    //it has gone through all checks
    return true;
}


irinori.RegisterView.prototype.UpdateReadyButton = function () {
    //check if we can send the move
    if (this.CanSendMove()) {
        //make it look ready
        this.m_readyDiv.childNodes[0].style.backgroundColor = irinori.RegisterView.readyColor;
    }
    else {
        //make it look not ready
        this.m_readyDiv.childNodes[0].style.backgroundColor = irinori.RegisterView.notReadyColor;
    }
}


irinori.RegisterView.prototype.LockUI = function () {
    this.m_lockUI = true;
}

irinori.RegisterView.prototype.UnLockUI = function () {
    this.m_lockUI = true;
}

/*
---------------------------------------------------------------------------
Visual Constants
---------------------------------------------------------------------------
*/
//used when setting the hand's width
irinori.RegisterView.cardWidth = 100;
irinori.RegisterView.cardSideMargin = 0;

//used for setting the ready button's looks
irinori.RegisterView.readyColor = "#BADBAD";
irinori.RegisterView.notReadyColor = "#DABDAB";
irinori.RegisterView.usedColor = "#BABADD";

irinori.RegisterView.ImageBasePath = "img/cards/";