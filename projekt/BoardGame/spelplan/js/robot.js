/**
 * robots/robot.js
 */

  ///<reference path="js/references.js" />

// Initialize namespace.
if ( !window.irinori ) {
    window.irinori = {};	
} 

//Enum power down status
//NOTE: Initiate means that the next turn this robot should become powered down (unless something unexpected happens)
irinori.PowerDownStatus = { "False": 0, "Initiate": 1, "True": 2 };

irinori.Robottype = { "A" : 0, "B" : 1, "C" : 2, "D" : 3 , "E" : 4, "F" : 5, "G": 6, "H" : 7};

/**
 --- Funktioner ---
 Move( director, steps, cards )
*/

/**
 * Robot
 * @param Int a_posX The X position the robot starts on (and respawns on).
 * @param Int a_posY The Y position the robot starts on (and respawns on).
 * @param Int a_direction The direction the robot should face
 */
irinori.Robot = function (a_posX, a_posY, a_direction, a_type, a_spawnX, a_spawnY) {
    this.m_registers = []; //Array holding registers
    this.m_bonusCards = []; // Array holding bonus cards

    this.m_health = this.MaxHealth; // Default amount of start HP.
    this.m_lives = 3; // Default amount of Lives.
    this.m_alive = true;
    this.m_hasBeenDead = false;

    this.m_type = a_type;

    this.m_posX = a_posX || 0;
    this.m_posY = a_posY || 0;
    this.m_spawnX = a_spawnX || a_posX;
    this.m_spawnY = a_spawnY || a_posY;

    this.m_direction = a_direction || 0; // default is 0, AKA "Left"
    this.m_powerDownStatus = irinori.PowerDownStatus.False; // powerdown status is by default false

    this.m_nextCheckpoint = 1;

    this.m_laserPower = 1;

    for (var i = 0; i < 5; i++) 
    {
        this.m_registers[i] = new irinori.Register();       
    }
}

/**
 * MaxHealth
 * The maximum amount of health possible
 */
irinori.Robot.prototype.MaxHealth = 10;

/**
* RespawnHealth
* The amount of health when respawned
*/
irinori.Robot.prototype.RespawnHealth = 8;

/**
 * ChangePowerDownStatus
 * Changes the robots power down status.
 * @param Int status The status to change too.
 */
irinori.Robot.prototype.ChangePowerDownStatus = function (a_status) {
	this.m_powerDownStatus = a_status;
}

/**
 * ChangeHealth
 * Changes the health of the robot and unlocks/locks registers based on the health
 * @param Int a_change The change value (a negative value decreases health and a positive repairs)
 */
irinori.Robot.prototype.ChangeHealth = function (a_change) {
    //set the health
    this.m_health += a_change;

    //make sure that the health doesn't go below 0
    if (this.m_health < 0) {
        this.m_health = 0;
    }
    //make sure that the health doesn't go above the MaxHealth
    else if (this.m_health > this.MaxHealth) {
        this.m_health = this.MaxHealth;
    }

    //update register locks
    this.UpdateRegisterLocks();

    //did the robot die?
    if (this.m_health <= 0) {
        this.m_alive = false; //the robot is dead
    }
}

/**
 * SetRegister
 * Set a specific card on a register placeholder.
 * @param Int position The index-position of the register.
 * @param Card card The card to place on the register.
 */
irinori.Robot.prototype.SetRegister = function (a_position, a_card) {
    this.m_registers[a_position].AssignCard(a_card);
}


/**
 * UpdateRegisterLocks
 * Locks/Unlocks the registers depending on the robot's current health.
 */
irinori.Robot.prototype.UpdateRegisterLocks = function () {
    var i;

    //loop through all registers
    for (i = 0; i < this.m_registers.length; i++) {
        //if the register should be locked
        if (this.m_health <= i + 1) {
            this.m_registers[i].Lock();
        }
        //if the register should be unlocked
        else {
            this.m_registers[i].Unlock();
        }
    }
}

/**
 * Respawn
 * Respawns the robot if killed/dead/dropped down a big black hole.
 * Respawn at spawnX & spawnY.
 */
irinori.Robot.prototype.Respawn = function () {
    //place the robot at the respawn position
    this.m_posX = this.m_spawnX;
    this.m_posY = this.m_spawnY;

    //restore health
    this.m_health = this.RespawnHealth;
    //update register locks
    this.UpdateRegisterLocks();

    this.m_alive = true; //IT'S ALIVE!
}