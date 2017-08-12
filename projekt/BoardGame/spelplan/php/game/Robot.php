<?php
namespace game;

	//Enum power down status
	//NOTE: Initiate means that the next turn this robot should become powered down (unless something unexpected happens)
	class PowerDownStatus
	{
		const False = 0;
		const Initiate = 1;
		const True = 2;
	}

/* 
 * Robot
 */
class Robot
{
	//CONSTANTS
	/**
	 * MaxHealth
	 * The maximum amount of health possible
	 */
	const MaxHealth = 10;

	// Default HP after respawn
	const RespawnHealth = 8;


	//VARIABLES
	public $m_posX;
	public $m_posY;
	public $m_spawnX;
	public $m_spawnY;
	public $m_direction;
	public $m_robotTypeID;
	public $m_health;
	public $m_lives;
	public $m_alive;
	public $m_lockedRegisterCards;
	public $m_bonusCards;

	public $m_laserPower;
	public $m_nextCheckpoint;
	public $m_powerDownStatus;
	public $m_registers;

	public $m_hasBeenDead;

	/**
	 * Robot
	 * @param Int a_posX The X position the robot starts on (and respawns on).
	 * @param Int a_posY The Y position the robot starts on (and respawns on).
	 * @param Int a_direction The direction the robot should face
	 */
	public function __construct($a_player = null, $a_deck = null) {

	 	if ($a_player && $a_deck)
	 	{
		 	$this->m_posX = +$a_player->robot()->posX();
		 	$this->m_posY = +$a_player->robot()->posY();
		 	$this->m_spawnX = +$a_player->robot()->spawnPosX();
		 	$this->m_spawnY = +$a_player->robot()->spawnPosY();
		 	$this->m_direction = +$a_player->robot()->direction();
		 	$this->m_robotTypeID = +$a_player->robot()->type();
		 	$this->m_health = +$a_player->robot()->health();
		 	$this->m_lives = +$a_player->robot()->lives();
		 	$this->m_alive = !!$a_player->robot()->alive();
		 	$this->m_lockedRegisterCards = $a_player->robot()->lockedRegisters();
		 	// $this->m_bonusCards = explode( ",", $a_player->robot()->bonusCards() );

		 	// for ( $i = 0; $i < count( $this->m_bonusCards ); $i++ )
		 	// {
		 	// 	$this->m_bonusCards[$i] = +$this->m_bonusCards[$i];
		 	// }

			$this->m_laserPower = 1; // Hard coded until furhter implementation.
			$this->m_nextCheckpoint = $a_player->robot()->nextCheckpoint(); // Hard coded until furhter implementation.
			$this->m_powerDownStatus = +$a_player->robot()->powerDownStatus();

			$this->m_registers[0] = new Register( new RegisterCard( $a_deck->m_cards[+$a_player->robot()->register1()]->m_type, $a_deck->m_cards[+$a_player->robot()->register1()]->m_priority ) );
			$this->m_registers[1] = new Register( new RegisterCard( $a_deck->m_cards[+$a_player->robot()->register2()]->m_type, $a_deck->m_cards[+$a_player->robot()->register2()]->m_priority ) );
			$this->m_registers[2] = new Register( new RegisterCard( $a_deck->m_cards[+$a_player->robot()->register3()]->m_type, $a_deck->m_cards[+$a_player->robot()->register3()]->m_priority ) );
			$this->m_registers[3] = new Register( new RegisterCard( $a_deck->m_cards[+$a_player->robot()->register4()]->m_type, $a_deck->m_cards[+$a_player->robot()->register4()]->m_priority ) );
			$this->m_registers[4] = new Register( new RegisterCard( $a_deck->m_cards[+$a_player->robot()->register5()]->m_type, $a_deck->m_cards[+$a_player->robot()->register5()]->m_priority ) );
		}

		$this->m_hasBeenDead = false;
    }

	/**
	 * ChangePowerDownStatus
	 * Changes the robots power down status.
	 * @param Int status The status to change too.
	 */
	public function ChangePowerDownStatus ($a_status) {
		$this->m_powerDownStatus = $a_status;
	}

	/**
	 * ChangeHealth
	 * Changes the health of the robot and unlocks/locks registers based on the health
	 * @param Int a_change The change value (a negative value decreases health and a positive repairs)
	 */
	public function ChangeHealth ($a_change) {
	    //set the health
	    $this->m_health += $a_change;

	    //make sure that the health doesn't go below 0
	    if ($this->m_health < 0) {
	        $this->m_health = 0;
	    }
	    //make sure that the health doesn't go above the MaxHealth
	    else if ($this->m_health > $this::MaxHealth) {
	        $this->m_health = $this::MaxHealth;
	    }

	    //update register locks
	    $this->UpdateRegisterLocks();

	    //did the robot die?
	    if ($this->m_health <= 0) {
	        $this->m_alive = false; //the robot is dead
	    }
	}

	/**
	 * SetRegister
	 * Set a specific card on a register placeholder.
	 * @param Int position The index-position of the register.
	 * @param Card card The card to place on the register.
	 */
	public function SetRegister ($a_position, $a_card) {
	    $this->m_registers[$a_position]->AssignCard($a_card);
	}


	/**
	 * UpdateRegisterLocks
	 * Locks/Unlocks the registers depending on the robot's current health.
	 */
	public function UpdateRegisterLocks () {
	    //loop through all registers
	    for ($i = 0; $i < count($this->m_registers); $i++) {
	        //if the register should be locked
	        if ($this->m_health <= $i + 1) {
	            $this->m_registers[$i]->Lock();
	        }
	        //if the register should be unlocked
	        else {
	            $this->m_registers[$i]->Unlock();
	        }
	    }
	}

	/**
	 * Respawn
	 * Respawns the robot if killed/dead/dropped down a big black hole.
	 * Respawn at spawnX & spawnY.
	 */
	public function Respawn () {
	    //place the robot at the respawn position
	    $this->m_posX = $this->m_spawnX;
	    $this->m_posY = $this->m_spawnY;
	    
	    //restore health
	    $this->m_health = $this::RespawnHealth;
	    //update register locks
	    $this->UpdateRegisterLocks();

	    $this->m_alive = true; //IT'S ALIVE!
	}
}

?>