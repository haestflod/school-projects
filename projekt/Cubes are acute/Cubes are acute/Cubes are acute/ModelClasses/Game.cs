using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ViewClasses;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.Units.Cubes;
using Cubes_are_acute.ModelClasses.WorldObjects;

namespace Cubes_are_acute.ModelClasses
{    
    [Serializable]
    class Game
    {

        public GameState m_state = GameState.Main;

        public List<Player> m_allPlayers = new List<Player>();

        public Player m_player;

        public List<ROB> m_computers = new List<ROB>();

        public Plane m_groundPlane = new Plane(Vector3.UnitZ, 0);

        public Map m_map;

        public PathFinder m_pathFinder;       

        public float m_elapsedTime;

        private iParticles m_particleHandler;

        public static Random Randomizer = new Random();

        public float m_buildingSpeedModifier = 10;

        public enum GameState
        {
            Game,
            Pause,
            Main,
            GameOver
        }

        public Game()
        {  
        }

        public Game(ViewClasses.GameAssets a_assets, int a_gameWidth, int a_gameHeight)
        {
            m_state = GameState.Game;

            m_map = new Map(a_gameWidth, a_gameHeight);
            m_pathFinder = new PathFinder(ref m_map);

            GameBuilder f_gameBuilder = new GameBuilder();

            f_gameBuilder.BuildWorldForFourCO(this,a_assets);
            
        } 
        
        public void SetParticleHandler(iParticles a_particleHandler)
        {
            m_particleHandler = a_particleHandler;
        }

        #region InitializeAfterLoading

        public void InitializeModels(iParticles a_particleHandler, GameAssets a_assets)
        {                         
            SetWorldObjects(m_map.m_worldObjects, a_assets);

            foreach (Player player in m_allPlayers)
            {
                SetModels(player, a_assets);
            }            

            SetParticleHandler(a_particleHandler);

            foreach (ROB computer in m_computers)
            {
                computer.m_timeOutWatch = new System.Diagnostics.Stopwatch(); 
            }                       
        }

        private Model GetModels(ThingType a_type, GameAssets a_assets)
        {            
            switch (a_type)
            {
                case ThingType.C_Cube:
                    return a_assets.c_cube;                    
                case ThingType.C_Extractor:
                    return a_assets.c_extractor; 
                case ThingType.C_Barrack:
                    return a_assets.c_barrack;
                case ThingType.C_Barbarian:
                    return a_assets.c_barbarian;
                case ThingType.C_Igloo:
                    return a_assets.c_igloo;
            }

            return null;
        }       

        public void SetModels(Player a_player, GameAssets a_assets)
        {
            a_player.m_thingsAssets.m_cube.m_model = a_assets.c_cube;
            a_player.m_thingsAssets.m_barbarian.m_model = a_assets.c_barbarian;

            a_player.m_thingsAssets.m_extractor.m_model = a_assets.c_extractor;
            a_player.m_thingsAssets.m_igloo.m_model = a_assets.c_igloo;
            a_player.m_thingsAssets.m_barrack.m_model = a_assets.c_barrack;
            
            SetThingModels(a_player.m_units, a_assets);
            SetThingModels(a_player.m_buildings,a_assets);
            SetThingModels(a_player.m_thingBuilders, a_assets);                        
            SetBuildModels(a_player.m_buildObjects, a_assets);                 
        }        

        private void SetThingModels(List<Thing> a_list, GameAssets a_assets)
        {
            foreach (Thing thing in a_list)
            {               
                if (thing.m_buildBehavior is ModelClasses.BehaviorInterfaces.CSBuilder)
                {
                    Thing f_thing = (thing.m_buildBehavior as ModelClasses.BehaviorInterfaces.CSBuilder).m_currentBuildingThing;
                    if (f_thing != null)
                    {
                        f_thing.m_model = GetModels(f_thing.m_type, a_assets);
                    }
                }
                else if (thing.m_buildBehavior is ModelClasses.BehaviorInterfaces.StandardBuild)
                {
                    Thing f_thing = (thing.m_buildBehavior as ModelClasses.BehaviorInterfaces.StandardBuild).m_currentBuildingThing;
                    if (f_thing != null)
                    {
                        f_thing.m_model = GetModels(f_thing.m_type, a_assets);
                    }
                }
                    
                thing.m_model = GetModels(thing.m_type, a_assets);                
            }       
        }

        private void SetBuildModels(List<BuildingObject> a_list, GameAssets a_assets)
        {        
            foreach (BuildingObject bo in a_list)
            {                   
                bo.m_object.m_model = GetModels(bo.m_object.m_type, a_assets);                
            }
        }      

        private void SetWorldObjects(List<WorldObject> a_worldObjs, GameAssets a_assets)
        {
            foreach (WorldObject obj in a_worldObjs)
            {
                switch (obj.m_type)
                {
                    case WorldObjectType.SoL:
                        obj.m_model = a_assets.m_sparkOfLife;
                        break;                    
                }
            }
        }

        #endregion

        public Player GetPlayerByID(byte a_id)
        {
            return m_allPlayers[a_id];                   
        }

        public List<Player> GetPlayerList()
        {
            List<Player> f_temp = new List<Player>();

            foreach (Player player in m_allPlayers)
            {
                f_temp.Add(player);
            }

            return f_temp;
        }

        public void Update(float a_elapsedTime)
        {
            m_elapsedTime = a_elapsedTime;

            DoUnitAction();            
        }

        public void DoUnitAction()
        {
            BuildUnits();

            MoveAllUnits();            

            AttackWithUnits();            

            ClearStuff();
        }

        private void BuildUnits()
        {
            foreach (Player player in m_allPlayers)
            {
                player.UpdateBuildObjectStatus(m_buildingSpeedModifier *  m_elapsedTime, m_map, m_pathFinder);
                player.UpdateThingBuilders(m_buildingSpeedModifier * m_elapsedTime);
            }            
        }
       
        //Moves all units (it's a update loop)
        private void MoveAllUnits()
        {
            foreach (Player player in m_allPlayers)
            {
                MovePlayerUnits(player);
            }          
        }

        private void MovePlayerUnits(Player a_player)
        {
            foreach (Unit unit in a_player.m_units)
            {
                if (unit.m_moveBehavior != null && unit.m_alive)
                {
                    unit.m_moveBehavior.Move(unit, m_elapsedTime);
                }
            }
        }


        //Attcks with units if a target is in range (it's a update loop)
        private void AttackWithUnits()
        {
            foreach (Player player in m_allPlayers)
	        {
		        AttackWithPlayer(player.m_playerID);
	        }               
        }

        private void AttackWithPlayer(byte a_id)
        {
            List<Player> f_players = GetPlayerList();            

            Player f_owner = f_players[a_id];

            //So the computer doesn't seek against it's own units ^_^
            f_players.RemoveAt(a_id);            

            foreach (Thing thing in f_owner.m_units)
            {               
                if (thing.m_alive)
                {
                    if (thing.m_attackBehavior != null)
                    {
                        //Only checks for units a.t.m.,  can be built out  by another if.. not sure best path to check everything.
                        thing.m_attackBehavior.DoAttackBehavior(f_players, m_pathFinder ,m_particleHandler, m_elapsedTime);
                    }
                }
            }
        }

        public bool HasLost(Player a_player)
        {
            return a_player.m_surrendered;
        }


        public bool HasWon(Player a_player)
        {
            //loop through all other players
            foreach (Player player in m_allPlayers)
            {
                //skip ourselves
                if (player.m_playerID != a_player.m_playerID)
                {
                    //if another player has NOT lost yet
                    if (!HasLost(player))
                        return false;
                }              
            }

            return true;
        }

        //This should probably return the winner or something instead :p
        public bool IsGameOver()
        {
            //loop through all players
            foreach (Player player in m_allPlayers)
            {
                //if anyone has won
                if (HasWon(player))
                    return true;
            }

            return false;
        }


        #region ClearFunctions

        private void ClearStuff()
        {
            //Clears all players
            foreach (Player player in m_allPlayers)
            {
                ClearPlayerUnits(player);
            }

            //Clears the focusedTarget
            if (m_player.m_focusedTarget != null)
            {
                if (!m_player.m_focusedTarget.m_exists || !m_player.m_focusedTarget.m_alive)
                {
                    m_player.m_focusedTarget = null;
                    m_player.m_tryingToBuild = false;
                }
            }

            //If there worldObject doesn't exist, set target to null
            if (m_player.m_selectedWorldObject != null)
            {
                if (!m_player.m_selectedWorldObject.m_exists)
                {
                    m_player.m_selectedWorldObject = null;
                }
            }

            //Clears worldObjects
            for (int i = 0; i < m_map.m_worldObjects.Count; )
            {
                if (!m_map.m_worldObjects[i].m_exists)
                {                   
                    m_map.m_worldObjects.RemoveAt(i);
                }
                else
                {
                    i++;
                }
            }
                                     
        }

        public void ClearPlayerUnits(Player a_player)
        {
            #region ClearUnits
            //Clears units from player
            for (int i = 0; i < a_player.m_units.Count; )
            {
                //If unit doesn't exist anymore it will be removed
                if (!a_player.m_units[i].m_exists)
                {                                       
                    a_player.m_units[i].RemoveMe(a_player,m_map);

                    a_player.RemoveSupply(a_player.m_units[i].m_supplyValue);

                    a_player.RemoveUnitPower(a_player.m_units[i].m_type);

                    a_player.m_units.RemoveAt(i);

                }
                else
                {
                    i++;
                }
            }

            //Remove selected things if they don't exist anymore or are dead
            for (int j = 0; j < a_player.m_selectedThings.Count; )
            {
                if (!a_player.m_selectedThings[j].m_exists || !a_player.m_selectedThings[j].m_alive)
                {
                    if (a_player.m_selectedThings[j].m_type == ThingType.C_Cube)
                    {
                        a_player.m_selectedWorkers--;
                    }

                    //Checks if focusedTarget is the target being removed
                    if (m_player.m_focusedTarget == a_player.m_selectedThings[j])
                    {
                        //If it wasn't index = 0 
                        if (j > 0)
                        {
                            //Set the focusedTarget to index - 1
                            m_player.m_focusedTarget = a_player.m_selectedThings[j - 1];
                        }
                        //If j == 0
                        else
                        {
                            //If there's another selectedThing, set target to that!
                            if (a_player.m_selectedThings.Count > 1)
                            {
                                m_player.m_focusedTarget = a_player.m_selectedThings[0];
                            }
                        }                        
                    }

                    //Doesn't do anything fancy here, just removes reference
                    a_player.m_selectedThings.RemoveAt(j);
                    break;
                }
                else
                {
                    j++;
                }
            }

            #endregion

            #region ClearBuildings
            for (int i = 0; i < a_player.m_buildings.Count; )
            {
                if (!a_player.m_buildings[i].m_exists)
                {                    
                    a_player.m_buildings[i].RemoveMe(a_player,m_map);

                    a_player.RemoveSupply(a_player.m_buildings[i].m_supplyValue);

                    a_player.m_buildings.RemoveAt(i);
                }
                else
                {
                    i++;
                }
            }            

            for (int i = 0; i < a_player.m_buildObjects.Count; )
            {
                if (a_player.m_buildObjects[i].m_deleteMe)
                {
                    //a_player.m_buildObjects[i].DestroyBuild(m_map, a_player);
                    //Building objects currently does all that remove stuff inside it's DoBuildBehavior() thingy
                    a_player.m_buildObjects.RemoveAt(i);
                }
                else
                {
                    i++;
                }

                
            }

            #endregion            

            #region CheckLoseScenario
            //If you have no buildings
            if (a_player.m_buildings.Count == 0)
            {
                bool lost = true;

                foreach (BuildingObject bo in a_player.m_buildObjects)
                {
                    if (bo.m_isBuilding)
                    {
                        //If you have a building that's currently being built it's not over yet!!!
                        if (!bo.m_object.m_isUnit)
                        {
                            lost = false;
                        }
                    }
                }

                if (lost)
                {
                    a_player.Surrender(m_map);
                }                
            }

            #endregion
        }

        #endregion

        #region PlayerInput

        #region SelectUnits

        public void TryToSelect(BoundingBox a_selectionBox)
        {
            m_player.m_selectedThings.Clear();
            m_player.m_focusedTarget = null;
            m_player.m_selectedWorldObject = null;
            m_player.m_selectedWorkers = 0;

            foreach (Player player in m_allPlayers)
            {
                if (FindSelectionInPlayer(player, a_selectionBox))
                {
                    return;
                }                
            }           
            
            BoundingBox box;

            foreach (WorldObject worldObject in m_map.m_worldObjects)
            {
                if (worldObject.m_visible)
                {
                    box = (BoundingBox)worldObject.m_model.Tag;

                    box.Min += worldObject.m_position;
                    box.Max += worldObject.m_position;

                    if (a_selectionBox.Intersects(box))
                    {
                        m_player.m_selectedWorldObject = worldObject;

                        return;
                    }
                }
            }
                                               
        }

        public void TryToSelect(Ray a_selectionRay)
        {
            m_player.m_selectedThings.Clear();
            m_player.m_focusedTarget = null;
            m_player.m_selectedWorldObject = null;
            m_player.m_selectedWorkers = 0;

            foreach (Player player in m_allPlayers)
            {
                if (FindSelectionInPlayer(player, a_selectionRay))
                {
                    return;
                }                
            }    

            BoundingBox box;

            foreach (WorldObject worldObject in m_map.m_worldObjects)
            {
                if (worldObject.m_visible)
                {
                    box = (BoundingBox)worldObject.m_model.Tag;

                    box.Min += worldObject.m_position;
                    box.Max += worldObject.m_position;

                    if (a_selectionRay.Intersects(box).HasValue)
                    {
                        m_player.m_selectedWorldObject = worldObject;

                        return;
                    }
                }
            }           

        }

        #region BoundingBox_Selection

        public bool FindSelectionInPlayer(Player a_player, BoundingBox a_selectionBox)
        {
            BoundingBox box;

            foreach (Thing unit in a_player.m_units)
            {
                
                box = (BoundingBox)unit.m_model.Tag;

                box.Min += unit.m_currentposition;
                box.Max += unit.m_currentposition;

                if (a_selectionBox.Intersects(box))
                {
                    //temp code to add focusedTarget (should use some sort of priority system)
                    m_player.m_focusedTarget = unit;

                    if (unit.m_ownerID == m_player.m_playerID)
                    {
                        m_player.m_selectedThings.Add(unit);

                        if (unit.m_type == ThingType.C_Cube)
                        {
                            m_player.m_selectedWorkers++;
                        }
                    }
                    else
                    {
                        return true;
                    }
                }                             
            }

            //if no units were found
            if (m_player.m_selectedThings.Count != 0)
            {
                return true;
            }
            //loop through the players buildings
            foreach (Thing building in a_player.m_buildings)
            {
                box = (BoundingBox)building.m_model.Tag;

                box.Min += building.m_currentposition;
                box.Max += building.m_currentposition;

                if (a_selectionBox.Intersects(box))
                {
                    //temp code to add focusedTarget (should use some sort of priority system)
                    m_player.m_focusedTarget = building;

                    if (building.m_ownerID == m_player.m_playerID)
                    {
                        m_player.m_selectedThings.Add(building);
                    }
                    else
                    {
                        return true;
                    }
                }
            }

            foreach (BuildingObject bo in a_player.m_buildObjects)
            {
                if (bo.m_isBuilding)
                {
                    box = (BoundingBox)bo.m_object.m_model.Tag;

                    box.Min += bo.m_object.m_currentposition;
                    box.Max += bo.m_object.m_currentposition;

                    if (a_selectionBox.Intersects(box))
                    {
                        m_player.m_focusedTarget = bo.m_object;

                        if (bo.m_object.m_ownerID == m_player.m_playerID)
                        {
                            m_player.m_selectedThings.Add(bo.m_object);
                        }
                        else
                        {
                            return true;
                        }

                    }
                }
            }

            return false;
        }

        #endregion

        #region Ray_Selection

        /// <summary>
        /// Is the same as the bounding box try to select but is only called when you click and thus doesn't drag the mouse around. It has higher
        /// accuracy compared to bounding box
        /// </summary>               
        public bool FindSelectionInPlayer(Player a_player, Ray a_selectionRay)
        {
            BoundingBox box;

            foreach (Thing unit in a_player.m_units)
            {
               
                box = (BoundingBox)unit.m_model.Tag;

                box.Min += unit.m_currentposition;
                box.Max += unit.m_currentposition;

                if (a_selectionRay.Intersects(box).HasValue)
                {
                    //temp code to add focusedTarget (should use some sort of priority system)
                    m_player.m_focusedTarget = unit;

                    if (unit.m_ownerID == m_player.m_playerID)
                    {
                        m_player.m_selectedThings.Add(unit);

                        if (unit.m_type == ThingType.C_Cube)
                        {
                            m_player.m_selectedWorkers++;
                        }

                    }

                    //always returns true as it's a ray, only supposed to hit one target
                    return true;
                }                
            }

            //if no units were found
            if (m_player.m_selectedThings.Count != 0)
            {
                return true;
            }
            //loop through the players buildings
            foreach (Thing building in a_player.m_buildings)
            {
                box = (BoundingBox)building.m_model.Tag;

                box.Min += building.m_currentposition;
                box.Max += building.m_currentposition;

                if (a_selectionRay.Intersects(box).HasValue)
                {
                    //temp code to add focusedTarget (should use some sort of priority system)
                    m_player.m_focusedTarget = building;

                    if (building.m_ownerID == m_player.m_playerID)
                    {
                        m_player.m_selectedThings.Add(building);
                    }

                    //always returns true as it's a ray, only supposed to hit one target
                    return true;
                }

            }

            //if no units were found
            if (m_player.m_selectedThings.Count != 0)
            {
                return true;
            }

            foreach (BuildingObject bo in a_player.m_buildObjects)
            {
                box = (BoundingBox)bo.m_object.m_model.Tag;

                box.Min += bo.m_object.m_currentposition;
                box.Max += bo.m_object.m_currentposition;

                if (a_selectionRay.Intersects(box).HasValue)
                {
                    m_player.m_focusedTarget = bo.m_object;

                    if (bo.m_object.m_ownerID == m_player.m_playerID)
                    {
                        m_player.m_selectedThings.Add(bo.m_object);
                    }                    
                        
                    return true;                    
                }
            }
                
            return false;            
        }

        #endregion
                

        #endregion

        #region Attack/Move Targeting

        public Thing TryToAttackOrMove(Ray a_ray)
        {
            Thing f_possibleTarget = null;
            
            for (int i = 1; i < m_allPlayers.Count; i++)
			{
			    f_possibleTarget = FindTarget(a_ray,m_allPlayers[i]);

                if (f_possibleTarget != null)
                {
                    return f_possibleTarget;
                }
			}

            f_possibleTarget = FindTarget(a_ray, m_player);

            if (f_possibleTarget != null)
            {
                return f_possibleTarget;
            }

            return f_possibleTarget;
        }

        private Thing FindTarget(Ray a_ray, Player a_player)
        {
            BoundingBox box;

            foreach (Thing unit in a_player.m_units)
            {
                box = (BoundingBox)unit.m_model.Tag;

                box.Min += unit.m_currentposition;
                box.Max += unit.m_currentposition;

                if (a_ray.Intersects(box).HasValue)
                {
                    return unit;
                }
            }

            foreach (Thing building in a_player.m_buildings)
            {
                box = (BoundingBox)building.m_model.Tag;

                box.Min += building.m_currentposition;
                box.Max += building.m_currentposition;

                if (a_ray.Intersects(box).HasValue)
                {
                    return building;
                }
            }

            foreach (BuildingObject bo in a_player.m_buildObjects)
            {
                if (bo.m_isBuilding)
                {
                    box = (BoundingBox)bo.m_object.m_model.Tag;

                    box.Min += bo.m_object.m_currentposition;
                    box.Max += bo.m_object.m_currentposition;

                    if (a_ray.Intersects(box).HasValue)
                    {
                        return bo.m_object;
                    }
                }
            }

            return null;
        }

        #endregion

        #region Pathfinding
        /// <summary>
        /// martin add something here
        /// </summary>       
        internal void TryToAddDestination(Player a_player, Vector3 a_destination, bool resetPaths)
        {
            //if there are any selected things
            if (a_player.m_selectedThings.Count > 0)
            {
                bool m_canExecuteAction = true;

                //if it's not the players unit
                if (a_player.m_playerID != a_player.m_selectedThings[0].m_ownerID)
                {
                    //it may not execute the action
                    m_canExecuteAction = false;
                }

                //if the player may execute the action
                if (m_canExecuteAction)
                {
                    foreach (Thing thing in a_player.m_selectedThings)
                    {
                        /*
                        //no need to do anything if the thing can't move
                        if (thing.m_moveBehavior == null)
                        {
                            continue;
                        }*/
                        //however buildings can't (generally) move, but they can set a rally point.
                        //so this check is not needed, until there is a thing that shouldn't move nor set a rally point
//TODO NOTE: rally point should be a different moveBehaviour than standard, then there is no need to check if it's a unit here
                        
                        //If you try to move a unit, unsets the target!
                        if (thing.m_attackBehavior != null)
                        {
                            thing.m_attackBehavior.UnsetTarget();
                        }

                        //the reason for this "dublicated" code is simple: it's faster this way

                        //if it should start from the current position
                        if (resetPaths)
                        {
                            //if it's a unit, it should start from it's current position
                            if (thing.m_isUnit)
                            {
                                
                                DoPathfinding(thing.m_currentposition, a_destination, thing, resetPaths);
                            }
                            //if it's a building, it should start from it's spawning position
                            //NOTE: this is to set the rally point
                            else
                            {
                                //if there is a buildbehaviour
                                //NOTE: if there is no buildbehaviour we won't be able to get a spawn position
                                if (thing.m_buildBehavior != null)
                                {
                                    DoPathfinding(thing.m_buildBehavior.GetSpawnPosition(), a_destination, thing, resetPaths);
                                }
                            }
                        }
                        //if it should start from the last one on the list
                        else
                        {
                            //this will get the last one in the list
                            Vector3 startPos;

                            //if there is items in the list
                            if (thing.m_destination.Count > 0)
                            {
                                //set startPos to the last one in the list
                                startPos = thing.m_destination[thing.m_destination.Count - 1];
                            }
                            else
                            {
                                //set startPos to the current position
                                startPos = thing.m_currentposition;
                            }

                            DoPathfinding(startPos, a_destination, thing, false);
                        }
                    }

                }
            }
        }

        private void DoPathfinding(Vector3 a_start, Vector3 a_destination, Thing thing, bool resetPaths)
        {
            switch (m_pathFinder.FindPath(a_start, a_destination))
            {
                //a path was found
                case 1:
                    if (resetPaths)
                    {
                        //clear destinations
                        //NOTE: the check is here because if no path is found, the former path shouldn't be cleared
                        thing.m_destination.Clear();
                    }

                    //add all destinations from the pathfinder
                    for (int i = 0; i < m_pathFinder.m_pathList.Count; i++)
                    {
                        thing.AddDestination(m_pathFinder.m_pathList[i]);
                    }
                    break;

                //no path was found
                case 2:
                    break;
            }
        }

        public void TryToHoldPosition()
        {
            m_player.SetHoldPosition();
        }

        #endregion

        #endregion


    }
}
