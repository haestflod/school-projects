<?php
namespace game;

/**
 * Register
 */
class Register
{
	var $m_locked;
	var $m_card;

	public function __construct ($a_card = null) {
		$this->m_locked = false;
		$this->m_card = $a_card;
	}

	/**
	 * AssignCard
	 * @param Card card The card to assign to the register.
	 */
	public function AssignCard ($a_card) {
	    $this->m_card = $a_card;
	}

	/**
	 * Lock
	 * Locks the register.
	 */
	public function Lock () {
	    $this->m_locked = true;
	}

	/**
	 * Unlock
	 * Unlocks the register.
	 */
	public function Unlock () {
	    $this->m_locked = false;
	}
}

?>