<?php

namespace game;

class Game
{
	public $m_id = null;
	public $m_map = null;
	public $m_bonusDeck = array();
	public $m_registerDeck = null;
	public $m_turn = 0;
	public $m_players = array();
	
	public $m_amountOfRegisters = 5;
	
	public $m_turntimer;
	public $m_turnResponsetimer;
	
	public $m_gameData;

	public $m_winner = null;

	public function __construct($a_gameData = null)
	{
		if ($a_gameData)
		{
			// SET GAME ID
			$this->m_id = $a_gameData->id();

			// INIT MAP
			$this->InitMap( Map::DecodeMapString( $a_gameData->map()->width(), $a_gameData->map()->height(), $a_gameData->map()->tiles() ) );
	
			// INIT REGISTER DECK
			$this->InitRegisterDeck( count( $a_gameData->players() ) );
	
			// ADD PLAYERS
			foreach ( $a_gameData->players() as $player )
			{
				$this->AddPlayer( new Player( $player, $this->m_registerDeck ) );
			}
		}
	}

	public function AddPlayer($a_player)
	{
		array_push($this->m_players, $a_player);
		
		if ($this->m_map != null)
		{
			$this->m_map->m_tiles[$a_player->m_robot->m_posX][$a_player->m_robot->m_posY]->r_robot = $a_player->m_robot;
		}
		else
		{
			throw new \Exception("Need a map before adding robots");				
		}
	}
	
	public function InitMap($a_map)
	{
		$this->m_map = $a_map;
	}
	
	public function InitRegisterDeck( $a_nPlayers )
	{
		$this->m_registerDeck = new \game\RegisterDeck( $a_nPlayers );
	}
}
