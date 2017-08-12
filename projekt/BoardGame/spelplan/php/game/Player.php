<?php
namespace game;

/**
 * Player
 */
class Player
{
	var $m_name;
	var $m_robot;
	var $m_cards;
	var $m_id;

	public function __construct ($a_player = null, $a_deck = null) 
	{
		if ($a_player && $a_deck)
		{
			$this->m_id = $a_player->id();
			$this->m_name = $a_player->user()->name();
		    $this->m_cards = array();
		    $this->m_robot = new \game\Robot($a_player, $a_deck);
		}
	}
}
