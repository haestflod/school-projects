/// <reference path="references.js" />

if (window.irinori === undefined) {
    window.irinori = {};
}





irinori.RobotStatusView = function (a_player, a_statusDiv, a_gameView) {
    //check player parameter
    if (a_player == null || a_player == undefined) {
        throw "RobotStatusView constructor requires a player (a_player=" + a_player + ")";
    }

    //check div parameter
    if (a_statusDiv == null || a_statusDiv == undefined) {
        throw "RobotStatusView constructor requires a div";
    }

    //check gameView parameter
    if (a_gameView == null || a_gameView == undefined) {
        throw "RobotStatusView constructor requires a gameView";
    }

    this.r_player = a_player;

    this.r_gameView = a_gameView;

    //set the div
    this.m_statusDiv = a_statusDiv;

    this.m_robotDiv = document.createElement("div");
    this.m_robotDiv.setAttribute("class", "robotDiv");
    this.m_statusDiv.appendChild(this.m_robotDiv);

    this.m_nextCheckpointDiv = document.createElement("div");
    this.m_nextCheckpointDiv.setAttribute("class", "nextCheckpointDiv");
    this.m_statusDiv.appendChild(this.m_nextCheckpointDiv);

    this.m_healthDiv = document.createElement("div");
    this.m_healthDiv.setAttribute("class", "healthDiv");
    this.m_statusDiv.appendChild(this.m_healthDiv);

    this.m_livesDiv = document.createElement("div");
    this.m_livesDiv.setAttribute("class", "livesDiv");
    this.m_statusDiv.appendChild(this.m_livesDiv);

    this.m_powerDownDiv = document.createElement("div");
    this.m_powerDownDiv.setAttribute("class", "powerDownDiv");
    this.m_statusDiv.appendChild(this.m_powerDownDiv);

    this.m_powerDownButton = null;

    this.m_lockUI = false; //this is used to make the user unable to interact with the RobotStatusView
    //NOTE: when the game is "rolling" this should be set to true
}

irinori.RobotStatusView.prototype.Draw = function () {
    this.DrawRobot();
    this.DrawNextCheckpoint();
    this.DrawHealth();
    this.DrawLives();
    this.DrawPowerDown();

    this.DrawPowerDownButton();
}


irinori.RobotStatusView.prototype.DrawRobot = function () {
    var f_element;

    if (!this.m_robotDiv.hasChildNodes()) {
        f_element = document.createElement("img");
        f_element.setAttribute("class", "robotImg");
        f_element.setAttribute("src", irinori.Gameview.imgbasepath + this.r_gameView.GetRobotImgpath(this.r_player.m_robot));
        this.m_robotDiv.appendChild(f_element);
    }
}

irinori.RobotStatusView.prototype.DrawNextCheckpoint = function () {
    var f_element;

    if (!this.m_nextCheckpointDiv.hasChildNodes()) {
        //add the next checkpoint text
        f_element = document.createElement("p");
        f_element.setAttribute("class", "text");
        f_element.innerHTML = "Target:";
        this.m_nextCheckpointDiv.appendChild(f_element);

        f_element = document.createElement("img");
        f_element.setAttribute("class", "nextCheckpointImg");
        f_element.setAttribute("src", irinori.Gameview.imgbasepath + "checkpoint.png");
        this.m_nextCheckpointDiv.appendChild(f_element);

        f_element = document.createElement("p");
        f_element.setAttribute("class", "nextCheckpointText");
        f_element.innerHTML = this.r_player.m_robot.m_nextCheckpoint;
        this.m_nextCheckpointDiv.appendChild(f_element);
    }
    else {
        //update the next checkpoint
        this.m_nextCheckpointDiv.childNodes[2].innerHTML = this.r_player.m_robot.m_nextCheckpoint;
    }
}

irinori.RobotStatusView.prototype.DrawHealth = function () {
    var i;
    var f_element;

    if (!this.m_healthDiv.hasChildNodes()) {
        //add the health text
        f_element = document.createElement("p");
        f_element.setAttribute("class", "text");
        f_element.innerHTML = "Health:";
        this.m_healthDiv.appendChild(f_element);

        //add the health dots
        for (i = 0; i < this.r_player.m_robot.MaxHealth; i++) {
            f_element = document.createElement("img");
            f_element.setAttribute("class", "health");

            if (i < this.r_player.m_robot.m_health) {
                f_element.setAttribute("src", irinori.RobotStatusView.ImageBasePath + "health.png");
            }
            else {
                f_element.setAttribute("src", irinori.RobotStatusView.ImageBasePath + "health_empty.png");
            }
            
            //append
            this.m_healthDiv.appendChild(f_element);
        }
    }
    else {
        //update the health dots
        for (i = 0; i < this.r_player.m_robot.MaxHealth; i++) {
            if (i < this.r_player.m_robot.m_health) {
                //set health.png on correct node (+1 because there is a p-tag at 0)
                this.m_healthDiv.childNodes[i + 1].setAttribute("src", irinori.RobotStatusView.ImageBasePath + "health.png");
            }
            else {
                //set emptyhealth.png on correct node (+1 because there is a p-tag at 0)
                this.m_healthDiv.childNodes[i + 1].setAttribute("src", irinori.RobotStatusView.ImageBasePath + "health_empty.png");
            }
        }
    }

}

irinori.RobotStatusView.prototype.DrawLives = function () {
    var i;
    var f_element;

    if (!this.m_livesDiv.hasChildNodes()) {
        //add the lives text
        f_element = document.createElement("p");
        f_element.setAttribute("class", "text");
        f_element.innerHTML = "Lives:";
        this.m_livesDiv.appendChild(f_element);

        //add the life dots
        for (i = 0; i < 3; i++) {
            f_element = document.createElement("img");
            f_element.setAttribute("class", "life");

            if (i < this.r_player.m_robot.m_lives) {
                //set life.png on correct node (+1 because there is a p-tag at 0)
                f_element.setAttribute("src", irinori.RobotStatusView.ImageBasePath + "life.png");
            }
            else {
                //set emptylife.png on correct node (+1 because there is a p-tag at 0)
                f_element.setAttribute("src", irinori.RobotStatusView.ImageBasePath + "life_empty.png");
            }

            //append
            this.m_livesDiv.appendChild(f_element);
        }
    }
    else {
        //update the life dots
        for (i = 0; i < 3; i++) {
            if (i < this.r_player.m_robot.m_lives) {
                //set life.png on correct node (+1 because there is a p-tag at 0)
                this.m_livesDiv.childNodes[i + 1].setAttribute("src", irinori.RobotStatusView.ImageBasePath + "life.png");
            }
            else {
                //set emptylife.png on correct node (+1 because there is a p-tag at 0)
                this.m_livesDiv.childNodes[i + 1].setAttribute("src", irinori.RobotStatusView.ImageBasePath + "life_empty.png");
            }
        }
    }
}

irinori.RobotStatusView.prototype.DrawPowerDown = function () {
    var f_element;

    if (!this.m_powerDownDiv.hasChildNodes()) {
        //add the status text
        f_element = document.createElement("p");
        f_element.setAttribute("class", "text");
        f_element.innerHTML = "Powerdown Status:";
        this.m_powerDownDiv.appendChild(f_element);

        //add the current status
        f_element = document.createElement("p");

        switch (this.r_player.m_robot.m_powerDownStatus) {
            case irinori.PowerDownStatus.False:
                f_element.setAttribute("class", "powerDownFalse");
                f_element.innerHTML = "Normal";
                break;
            case irinori.PowerDownStatus.Initiate:
                f_element.setAttribute("class", "powerDownInitiate");
                f_element.innerHTML = "Initiating";
                break;
            case irinori.PowerDownStatus.True:
                f_element.setAttribute("class", "powerDownTrue");
                f_element.innerHTML = "Powered down";
                break;
        }
        this.m_powerDownDiv.appendChild(f_element);
    }
    else {
        //update the current status
        switch (this.r_player.m_robot.m_powerDownStatus) {
            case irinori.PowerDownStatus.False:
                this.m_powerDownDiv.childNodes[1].setAttribute("class", "powerDownFalse");
                this.m_powerDownDiv.childNodes[1].innerHTML = "Normal";
                break;
            case irinori.PowerDownStatus.Initiate:
                this.m_powerDownDiv.childNodes[1].setAttribute("class", "powerDownInitiate");
                this.m_powerDownDiv.childNodes[1].innerHTML = "Initiating";
                break;
            case irinori.PowerDownStatus.True:
                this.m_powerDownDiv.childNodes[1].setAttribute("class", "powerDownTrue");
                this.m_powerDownDiv.childNodes[1].innerHTML = "Powered down";
                break;
        }
    }
}


irinori.RobotStatusView.prototype.DrawPowerDownButton = function () {
    var f_that = this;
    /*
    //create the button
    f_element = document.createElement("button");
    f_element.setAttribute("class", "powerDownButton");
    f_element.innerHTML = "Powerdown";

    //set button properties
    switch (this.r_player.m_robot.m_powerDownStatus) {
    case irinori.PowerDownStatus.Initiate:
    f_element.disabled = true;
    break;
    default:
    f_element.disabled = true;
    break;
    }
    f_element.innerHTML = "Powerdown";
    */

    //check if the power down button doesn't exist yet
    if (this.m_powerDownButton === null) {
        //create the button
        f_element = document.createElement("button");
        f_element.setAttribute("class", "powerDownButton");
        f_element.innerHTML = "Powerdown";

        //set button properties
        switch (this.r_player.m_robot.m_powerDownStatus) {
            case irinori.PowerDownStatus.False:
                //set the onclick function
                f_element.onclick = function () {
                    irinori.RobotStatusView.prototype.TogglePowerDown.call(f_that);
                    return false;
                };
                break;
            default:
                //disable button
                f_element.disabled = true;
                break;
        }

        this.m_powerDownButton = f_element;

        //add the button
        this.m_powerDownDiv.appendChild(this.m_powerDownButton);
    }
    else {
        //set button properties
        switch (this.r_player.m_robot.m_powerDownStatus) {
            case irinori.PowerDownStatus.False:
                //set the onclick function
                this.m_powerDownButton.onclick = function () {
                    irinori.RobotStatusView.prototype.TogglePowerDown.call(f_that);
                    return false;
                };
                //enable the button (because it might be disabled!)
                this.m_powerDownButton.disabled = false;
                break;
            default:
                //disable the button
                this.m_powerDownButton.disabled = true;
                break;
        }
    }
}

irinori.RobotStatusView.prototype.TogglePowerDown = function () {
    //if power down status is false
    if (this.r_player.m_robot.m_powerDownStatus == irinori.PowerDownStatus.False) {
        //set to initiate
        this.r_player.m_robot.m_powerDownStatus = irinori.PowerDownStatus.Initiate;
    }
    else {
        //set to false
        this.r_player.m_robot.m_powerDownStatus = irinori.PowerDownStatus.False;
    }

    //draw the new power down status
    this.DrawPowerDown();
}


irinori.RobotStatusView.prototype.LockUI = function () {
    this.m_lockUI = true;
}

irinori.RobotStatusView.prototype.UnLockUI = function () {
    this.m_lockUI = true;
}


irinori.RobotStatusView.ImageBasePath = "img/status/";