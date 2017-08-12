-- phpMyAdmin SQL Dump
-- version 3.3.2deb1
-- http://www.phpmyadmin.net
--
-- Värd: 193.17.218.183
-- Skapad: 12 januari 2012 kl 11:31
-- Serverversion: 5.1.41
-- PHP-version: 5.3.2-1ubuntu4.9

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Databas: `112474-irinori`
--

-- --------------------------------------------------------

--
-- Struktur för tabell `GameMode`
--

CREATE TABLE IF NOT EXISTS `GameMode` (
  `GameModeID` int(11) NOT NULL,
  `Name` varchar(45) COLLATE utf8_swedish_ci DEFAULT NULL,
  PRIMARY KEY (`GameModeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

--
-- Data i tabell `GameMode`
--

INSERT INTO `GameMode` (`GameModeID`, `Name`) VALUES
(0, 'Normal');

-- --------------------------------------------------------

--
-- Struktur för tabell `GameParticipants`
--

CREATE TABLE IF NOT EXISTS `GameParticipants` (
  `GameID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `RobotTypeID` int(11) NOT NULL,
  `SpawnPosID` int(11) NOT NULL,
  `StillPlaying` tinyint(1) NOT NULL,
  PRIMARY KEY (`GameID`,`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

--
-- Data i tabell `GameParticipants`
--

INSERT INTO `GameParticipants` (`GameID`, `UserID`, `RobotTypeID`, `SpawnPosID`, `StillPlaying`) VALUES
(1, 1, 1, 4, 1),
(1, 2, 2, 7, 1);

-- --------------------------------------------------------

--
-- Struktur för tabell `Games`
--

CREATE TABLE IF NOT EXISTS `Games` (
  `GamesID` int(11) NOT NULL AUTO_INCREMENT,
  `CreatorID` int(11) NOT NULL,
  `RandomSeed` int(11) NOT NULL,
  `MaxPlayers` tinyint(11) NOT NULL,
  `Version` float NOT NULL,
  `GameModeID` int(11) NOT NULL,
  `TurnResponseTimer` int(11) NOT NULL,
  `TurnTimer` int(11) NOT NULL,
  `Finished` tinyint(1) NOT NULL,
  `Password` varchar(45) COLLATE utf8_swedish_ci NOT NULL,
  PRIMARY KEY (`GamesID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci AUTO_INCREMENT=2 ;

--
-- Data i tabell `Games`
--

INSERT INTO `Games` (`GamesID`, `CreatorID`, `RandomSeed`, `MaxPlayers`, `Version`, `GameModeID`, `TurnResponseTimer`, `TurnTimer`, `Finished`, `Password`) VALUES
(1, 1, 2147483647, 2, 1.1, 1, 1440, 90000, 0, 'herpisderp');

-- --------------------------------------------------------

--
-- Struktur för tabell `Maps`
--

CREATE TABLE IF NOT EXISTS `Maps` (
  `MapID` int(11) NOT NULL AUTO_INCREMENT,
  `Width` int(11) NOT NULL,
  `Height` int(11) NOT NULL,
  `Tiles` varchar(45) COLLATE utf8_swedish_ci NOT NULL,
  PRIMARY KEY (`MapID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci AUTO_INCREMENT=2 ;

--
-- Data i tabell `Maps`
--

INSERT INTO `Maps` (`MapID`, `Width`, `Height`, `Tiles`) VALUES
(1, 10, 10, 'null');

-- --------------------------------------------------------

--
-- Struktur för tabell `Players`
--

CREATE TABLE IF NOT EXISTS `Players` (
  `UserID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(45) COLLATE utf8_swedish_ci NOT NULL,
  `Password` varchar(100) COLLATE utf8_swedish_ci NOT NULL,
  `Email` varchar(45) COLLATE utf8_swedish_ci NOT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci COMMENT='player table' AUTO_INCREMENT=4 ;

--
-- Data i tabell `Players`
--

INSERT INTO `Players` (`UserID`, `Username`, `Password`, `Email`) VALUES
(1, 'Viktor', 'EncrtypmePw', 'lol@lol.se'),
(2, 'Jarmo', 'samst', 'lol2@lol.se'),
(3, 'Erik', 'Enc', 'lol3@lol.se');

-- --------------------------------------------------------

--
-- Struktur för tabell `PlayerTurns`
--

CREATE TABLE IF NOT EXISTS `PlayerTurns` (
  `GameID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `Ready` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`GameID`,`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci;

--
-- Data i tabell `PlayerTurns`
--

INSERT INTO `PlayerTurns` (`GameID`, `UserID`, `Ready`) VALUES
(1, 1, 1),
(1, 2, 0);

-- --------------------------------------------------------

--
-- Struktur för tabell `RoboType`
--

CREATE TABLE IF NOT EXISTS `RoboType` (
  `RoboTypeID` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(200) COLLATE utf8_swedish_ci NOT NULL,
  PRIMARY KEY (`RoboTypeID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci AUTO_INCREMENT=3 ;

--
-- Data i tabell `RoboType`
--

INSERT INTO `RoboType` (`RoboTypeID`, `Name`) VALUES
(1, 'Spider of impending pew pew'),
(2, 'Deathball');

-- --------------------------------------------------------

--
-- Struktur för tabell `TurnCollection`
--

CREATE TABLE IF NOT EXISTS `TurnCollection` (
  `GameID` int(11) NOT NULL AUTO_INCREMENT,
  `TurnCollectionID` int(11) NOT NULL,
  `TurnID` int(11) NOT NULL,
  PRIMARY KEY (`GameID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci AUTO_INCREMENT=5 ;

--
-- Data i tabell `TurnCollection`
--

INSERT INTO `TurnCollection` (`GameID`, `TurnCollectionID`, `TurnID`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 3),
(4, 2, 4);

-- --------------------------------------------------------

--
-- Struktur för tabell `TurnData`
--

CREATE TABLE IF NOT EXISTS `TurnData` (
  `TurnDataID` int(11) NOT NULL AUTO_INCREMENT,
  `Register1` int(11) NOT NULL,
  `Register2` int(11) NOT NULL,
  `Register3` int(11) NOT NULL,
  `Register4` int(11) NOT NULL,
  `Register5` int(11) NOT NULL,
  `PowerDown` enum('false','initiate','true') COLLATE utf8_swedish_ci NOT NULL,
  `SpawnLogic` enum('none','register1','register2','register3','register4','register5','rotateW','rotateN','rotateE','rotateS') COLLATE utf8_swedish_ci NOT NULL,
  `UserID` int(11) NOT NULL,
  PRIMARY KEY (`TurnDataID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci AUTO_INCREMENT=5 ;

--
-- Data i tabell `TurnData`
--

INSERT INTO `TurnData` (`TurnDataID`, `Register1`, `Register2`, `Register3`, `Register4`, `Register5`, `PowerDown`, `SpawnLogic`, `UserID`) VALUES
(1, 15, 11, 12, 17, 38, 'false', '', 1),
(2, 3, 6, 2, 25, 21, 'initiate', '', 2),
(3, 1, 2, 22, 23, 31, 'false', 'register2', 1),
(4, 15, 18, 30, 24, 29, 'true', '', 2);

-- --------------------------------------------------------

--
-- Struktur för tabell `Turns`
--

CREATE TABLE IF NOT EXISTS `Turns` (
  `GameID` int(11) NOT NULL AUTO_INCREMENT,
  `TurnCollectionID` int(11) NOT NULL,
  `Date` datetime NOT NULL,
  `TurnFinished` tinyint(1) NOT NULL,
  PRIMARY KEY (`GameID`,`TurnCollectionID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COLLATE=utf8_swedish_ci COMMENT='Turn tabellarn' AUTO_INCREMENT=2 ;

--
-- Data i tabell `Turns`
--

INSERT INTO `Turns` (`GameID`, `TurnCollectionID`, `Date`, `TurnFinished`) VALUES
(1, 1, '2011-11-27 00:00:00', 1),
(1, 2, '2011-11-27 00:00:00', 1),
(1, 3, '2011-11-28 00:00:00', 0);
