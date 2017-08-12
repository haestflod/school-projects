<?php

namespace game;

class RegisterCardtype
{
	const Move3 = 0;
	const Move2 = 1;
	const Move1 = 2;
	const BackUp = 3;
	const TurnRight = 4;
	const TurnLeft = 5;
	const UTurn = 6;	
}

class RegisterCard
{
	public $m_type;
	public $m_priority;
	
	public function __construct($a_registerCardType, $a_priority)
	{
		$this->m_type = $a_registerCardType;
		$this->m_priority = $a_priority;
	}
}

class RegisterDeck
{
	public $m_amountOfCards;
	public $m_cardsDealt = 0;
	public $m_cards = array();

	public function __construct($a_numberOfPlayers)
	{
		$f_tempNumberOfPlayers = $a_numberOfPlayers + 2;
		
		$move3 = $f_tempNumberOfPlayers;
		$move2 = 2 * $f_tempNumberOfPlayers;
		$move1 = 3* $f_tempNumberOfPlayers;
		$backUp = $f_tempNumberOfPlayers;
		$turnLeftAndTurnRight = 3 * $f_tempNumberOfPlayers;
		$uTurn = $f_tempNumberOfPlayers;
		
		$this->m_amountOfCards = $move3 + $move2 + $move1 + $backUp + $turnLeftAndTurnRight * 2 + $uTurn;
		
		$i = 0;
		
		//add U-Turn cards
	    while ($uTurn > 0) {
	        $this->m_cards[$i] = new \game\RegisterCard(\game\RegisterCardtype::UTurn , ($i + 1) * 10);
	        $i++;
	
	        $uTurn--;
	    }	    
	
	    //add Turn Left and Turn Right cards
	    while ($turnLeftAndTurnRight > 0) {
	        $this->m_cards[$i] = new \game\RegisterCard(\game\RegisterCardtype::TurnLeft, ($i + 1) * 10);
	        $i++;
	
	        $this->m_cards[$i] = new \game\RegisterCard(\game\RegisterCardtype::TurnRight, ($i + 1) * 10);
	        $i++;
	
	        $turnLeftAndTurnRight--;
	    }
	
	    //add Back Up cards (moving backwards)
	    while ($backUp > 0) {
	        $this->m_cards[$i] = new \game\RegisterCard(\game\RegisterCardtype::BackUp, ($i + 1) * 10);
	        $i++;
	
	        $backUp--;
	    }
	
	    //add Move 1 cards
	    while ($move1 > 0) {
	        $this->m_cards[$i] = new \game\RegisterCard(\game\RegisterCardtype::Move1, ($i + 1) * 10);
	        $i++;
	
	        $move1--;
	    }
	
	    //add Move 2 cards
	    while ($move2 > 0) {
	        $this->m_cards[$i] = new \game\RegisterCard(\game\RegisterCardtype::Move2, ($i + 1) * 10);
	        $i++;
	
	        $move2--;
	    }
	
	    //add Move 3 cards
	    while ($move3 > 0) {
	        $this->m_cards[$i] = new \game\RegisterCard(\game\RegisterCardtype::Move3, ($i + 1) * 10);
	        $i++;
	
	        $move3--;
	    }
	}	
	
}

?>