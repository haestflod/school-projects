using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.Units.Cubes;
using Cubes_are_acute.ModelClasses.WorldObjects;
using Microsoft.Xna.Framework;
using System.Diagnostics;

namespace Cubes_are_acute.ModelClasses
{
    [Serializable]
    class ROB : Player
    {
        /// <summary>
        /// The list where all the new units end up (before they join a group)
        /// </summary> 
        public List<Thing> m_recruits = new List<Thing>();

        public List<Thing> m_macroGroup = new List<Thing>();
        public List<Thing> m_offensiveGroup = new List<Thing>();
        public List<Thing> m_defensiveGroup = new List<Thing>();

        /// <summary>
        /// List of barracks .. if the game would evolve into a bigger game at some point, change to offensiveStructure list or something instead!
        /// </summary>
        public List<Barrack> m_barracks = new List<Barrack>();

        public Vector3 m_startPosition;

        /// <summary>
        /// This stopwatch stores the total time that ROB has been thinking this update.
        /// </summary> 
        [NonSerialized] public Stopwatch m_timeOutWatch = new Stopwatch();
        /// <summary>
        /// The time limit (milliseconds) that cancels ROB's thinking.
        /// </summary> 
        const int m_timeLimitMilliSeconds = 2;
        /// <summary>
        /// The number of extractors that ROB tries to achieve
        /// </summary>
        const int m_maxActiveExtractorCount = 4;
        /// <summary>
        /// The length that defines inside a base
        /// </summary>
        const float m_insideBaseRange = 5;
        /// <summary>
        /// The multiplier to know if you can win against the opponents army. 
        /// </summary>
        const float m_powerToWinMultiplier = 1.25f;



        //interesting data:
        List<Player> m_enemyPlayers = new List<Player>();

        /// <summary>
        /// An array of all enermies army sizes (the number of attack-units)
        /// </summary>
        List<int> m_enermyArmySizes;
        /// <summary>
        /// A list of all enermies that currently are inside our base
        /// </summary>
        List<Thing> m_enermiesInsideBase;    

        /// <summary>
        /// The total amount of unitPower inside the base
        /// </summary>
        int m_enemyUnitPowerInsideMyBase = 0;
        
        /// <summary>
        /// The number of currently active extractors
        /// </summary>
        int m_activeExtractorCount;
        /// <summary>
        /// The number of possible expansions (untaken SoL's)
        /// </summary>
        int m_untakenExpansionCount;

        Vector3 m_currentAttackTarget;
        float m_lastAttackOrder = 0;
            

        public ROB(byte a_id, ViewClasses.GameAssets a_assets, Map a_map,PathFinder a_pathFinder, Vector3 a_startPosition)
            : base (a_id,a_assets,a_map,a_pathFinder)
        {           
            m_startPosition = a_startPosition;
        }

        public void InitilizeROB(Game a_game)
        {
            m_enemyPlayers = a_game.GetPlayerList();

            m_enemyPlayers.RemoveAt(m_playerID);

            m_enermyArmySizes = new List<int>(m_enemyPlayers.Count);//all players except you are considered as enermies atm

            for (int i = 0; i < m_enemyPlayers.Count; i++)
            {
                m_enermyArmySizes.Add(0);
            }
        }

        /// <summary>
        /// This updates ROB's actions.
        /// 
        /// The basic idea of ROB's thinking:
        /// 1. Look for any new unit(s).
        /// 2. Transfer new unit(s). 
        ///    If any unit(s) was found move them to correct group depending on their purpose 
        ///    (builders -> Macro, anything else -> Defensive).
        /// 3. Do each group's actions.
        ///    Each group has their own unique assignments and will ONLY control their own units.
        ///    If we want our units to do something else (than Macro and Defensive, that they start in)
        ///    we move them to a group that has that assignment.
        ///    
        /// Sort of like how the millitary works IRL.. Yeah, that's how I came up with this idea :)
        /// </summary>
        public void RobThinking(Game a_game)
        {
            //If computer isn't ded yet Computer Fighting! 
            if (!m_surrendered)
            {
                //reset and start the clock
                m_timeOutWatch.Reset();
                m_timeOutWatch.Start();

                if (m_lastAttackOrder > 0)
                {
                    m_lastAttackOrder -= a_game.m_elapsedTime;
                }

                //1. Look for any new unit(s).
                FindNewUnits();

                if (m_recruits.Count > 0)
                {
                    //2. Transfer new unit(s).
                    TransferRecruits();
                }

                RemoveDeadUnits();//we can't have dead units running around, can we? No we cannot Superkiller! 

                UpdateInterestingData(a_game);//to save us the trouble of calculating stuff (atleast) twice

                //3. Do each group's actions.
                PerformAction(a_game);


                //stop the clock
                m_timeOutWatch.Stop();
            }
        }

        private void PerformAction(Game a_game)
        {            
            DoMacro(a_game);

            DoOffensive(a_game);

            DoDefensive(a_game);

            DoSurrenderLogic(a_game);
            
        }



        #region Macro
        /*****************
          Macro
        ******************/


        /// <summary>
        /// handles the macro group
        /// </summary>
        private void DoMacro(Game a_game)
        {
            //macro also includes building actions, which should be done first
            DoBuildingActions(a_game);

            ClearSelectedTargets();

            //select all available units
            foreach (Thing unit in m_macroGroup)
            {
                if (unit.m_thingState == ThingState.Idle)
                {
                    m_selectedWorkers++;
                    m_selectedThings.Add(unit);
                }
            }

            //the group's actions

            //1. Should we build an Extractor?
            if (BuildExtractorConditions())
            {
                List<WorldObject> m_discardedWOs = new List<WorldObject>();
                //get best resource target (if there is any, and gives more units than it costed back!                

                TryingToFindWO:
                WorldObject myExpansion = a_game.m_map.GetClosestUntakenWorldObject(m_startPosition, WorldObjectType.SoL, m_discardedWOs);                

                //if there is an untaken resource on the map
                if (myExpansion != null)
                {
                    if ((myExpansion as SoL).m_resources < m_thingsAssets.m_extractor.m_price)
                    {
                        m_discardedWOs.Add(myExpansion);
                        m_untakenExpansionCount--;
                        goto TryingToFindWO;
                    }

                    //command build extractor
                    (m_selectedThings[0] as Cube).BuildExtractorFunction(a_game, myExpansion.m_position);

                    //action decided, go to End
                    goto End;
                }
            }


            //2. Should we build a Barrack?
            if (BuildBarrackConditions())
            {
                //try to find a good build location
                Vector3? buildLocation = TryFindGoodBuildSpot(m_thingsAssets.m_barrack, a_game);

                //check if a good location was found
                if (buildLocation != null)
                {
                    //command build barrack
                    (m_selectedThings[0] as Cube).BuildBarrackFunction(a_game, buildLocation.Value);

                    //action decided, go to End
                    goto End;
                }
            }


            //3. Should we build an Igloo?
            if (BuildIglooConditions())
            {
                //try to find a good build location
                Vector3? buildLocation = TryFindGoodBuildSpot(m_thingsAssets.m_igloo, a_game);

                //check if a good location was found
                if (buildLocation != null)
                {
                    //command build igloo
                    (m_selectedThings[0] as Cube).BuildIglooFunction(a_game, buildLocation.Value);

                    //action decided, go to End
                    goto End;
                }
            }


            //4. Should we train ourselves into something more useful?
            
            if (TrainUnitConditions())
            {
                //All this stuff to make it spread the cubeys more evenly!
                List<Thing> f_barracks = new List<Thing>();
                /*
                //Get buildings not building currently..
                foreach (Barrack barrack in m_barracks)
	            {
                    if (barrack.m_thingState != ThingState.BeingBuilt && !barrack.m_buildBehavior.IsBuilding() && barrack.m_buildBehavior.GetAspiringSacrificeCount() == 0)
                    {
                        f_barracks.Add(barrack);
                    }
	            }
                */
                int f_moves = m_selectedThings.Count / m_thingsAssets.m_barbarian.m_price;

                for (int i = 0; i <= f_moves; i++)
                {
                    Barrack f_temp = null;
                    int lowestAspiring = int.MaxValue;

                    foreach (Barrack barrack in m_barracks)
                    {
                        if (barrack.m_thingState != ThingState.BeingBuilt )
                        {
                            if (barrack.m_buildBehavior.GetAspiringSacrificeCount() + barrack.m_buildBehavior.GetSacrificeCount() < lowestAspiring )
                            {                                
                                f_temp = barrack;
                                lowestAspiring = barrack.m_buildBehavior.GetAspiringSacrificeCount() + +barrack.m_buildBehavior.GetSacrificeCount();                                    
                            }
                        }
                    }

                    if (f_temp != null)
                    {
                        BoundingBox f_box = (BoundingBox)f_temp.m_model.Tag;

                        f_box.Max += f_temp.m_currentposition;
                        f_box.Min += f_temp.m_currentposition;

                        if (m_selectedThings.Count >= m_thingsAssets.m_barbarian.m_price)
                        {
                            //Adds 2 cubes to the selected barrack
                            for (int j = 0; j < m_thingsAssets.m_barbarian.m_price; j++)
                            {
                                Vector3 f_dir = new Vector3(f_temp.m_currentposition.X - m_selectedThings[0].m_currentposition.X, f_temp.m_currentposition.Y - m_selectedThings[0].m_currentposition.Y, 0);

                                f_dir.Normalize();

                                //The ray from unit -> building
                                Ray f_tempRay = new Ray(new Vector3(m_selectedThings[0].m_currentposition.X, m_selectedThings[0].m_currentposition.Y, f_temp.m_currentposition.Z), f_dir);

                                float? f_intersection = f_tempRay.Intersects(f_box);

                                if (f_intersection.HasValue)
                                {
                                    Vector3 point = (f_tempRay.Position + f_tempRay.Direction * f_intersection.Value);

                                    //If it finds a path
                                    if (a_game.m_pathFinder.FindPath(m_selectedThings[0].m_currentposition, point) == 1)
                                    {
                                        m_selectedThings[0].ChangeDestination(a_game.m_pathFinder.m_pathList);

                                        f_temp.m_buildBehavior.AddSacrifice(m_selectedThings[0]);
                                        //It knows there will only be workers cause this is the macro group! 
                                        m_selectedThings.RemoveAt(0);
                                    }
                                }
                            }
                        }                        
                    }
                }                
            }

            //when we have decided to do an action we shouldn't try to do any more in the same update
            //since we would need to reselect units (all of them are no longer idle)
            //besides, I don't think it would even be possible to make 2 actions in the same update, nor would we gain anything in doing so
            End:
            return;//there HAS to be something after a goto point...
            //return; does actually exactly the same thing as End is supposed to do, but this way looks better.. I think :)
        }


        #region Macro Conditions and Functions
        /*****************
          Macro Conditions
        ******************/

        private bool BuildExtractorConditions()
        {
            //if we have enough builders to build an extractor
            if (m_selectedWorkers >= m_thingsAssets.m_extractor.m_price)
            {
                //if there is atleast 1 untaken expansion
                if (m_untakenExpansionCount >= 1)
                {
                    //if we have less than the max number of active extractors
                    if (m_activeExtractorCount < m_maxActiveExtractorCount)
                    {
                        return true;
                    }
                }
            }


            return false;
        }

        private bool BuildBarrackConditions()
        {
            //if we have enough builders to build a barrack
            if (m_selectedWorkers >= m_thingsAssets.m_barrack.m_price)
            {                
                //if we need more barracks (have more active extractors than we have barracks)
                if (m_barracks.Count <= m_activeExtractorCount * 2)
                {
                    //if there is none untaken expansion OR we have reached the max number of active extractors
                    //NOTE: this is to not build any barracks unless we have a good income
                    if (m_untakenExpansionCount == 0 || m_activeExtractorCount >= m_maxActiveExtractorCount)
                    {
                        return true;
                    }
                }
            }


            return false;
        }

        private bool BuildIglooConditions()
        {
            //if we have enough builders to build a igloo
            if (m_selectedWorkers >= m_thingsAssets.m_igloo.m_price)
            {
                //if the supply is not already maxed out
                if (CurrentMaxSupply != AbsoluteMaxSupply)
                {
                    int f_amountOfBuildingIgloos = 0;
                    foreach (BuildingObject bo in m_buildObjects)
                    {
                        if (bo.m_object.m_type == ThingType.C_Igloo)
                        {
                            f_amountOfBuildingIgloos++;
                        }
                    }
                    //if you produce more cube/sec than your supply can hold, in the time the igloo takes to build 
                    //in math: (cube/sec)*i >= freeSupplies + igloo price           i = the time to build an igloo
                    if ((m_activeExtractorCount / m_thingsAssets.m_cube.m_requiredBuildTime) * m_thingsAssets.m_igloo.m_requiredBuildTime 
                        >= ((CurrentMaxSupply + f_amountOfBuildingIgloos * CubeIgloo.SupplyIncrement) - CurrentSupply))
                    {
                        return true;
                    }
                }
            }


            return false;
        }

        private bool TrainUnitConditions()
        {
            if (m_barracks.Count < m_activeExtractorCount * 2)
            {
                return false;
            }

            //if we have any builders at all
            if (m_selectedWorkers > 0)
            {
                //if we have built a decent base (we have plenty of extractors and barracks to start producing attackers)
                if ( 
                       m_activeExtractorCount >= m_maxActiveExtractorCount                      
                       || m_untakenExpansionCount == 0                    
                    )
                    
                {
                    //get true if we have a unused barrack
                    bool hasBarrack = false;
                    foreach (Barrack barrack in m_barracks)
                    {
                        //if it's a barrack
                        if (barrack.m_thingState != ThingState.BeingBuilt)
                        {
                            //if the barrack isn't building                            
                            hasBarrack = true;
                            break;                            
                        }
                    }

                    //if we have a unused barrack AND enough builders to make one
                    if (hasBarrack && m_selectedWorkers >= m_thingsAssets.m_barbarian.m_price)
                    {
                        //if the number of possible resources is greater than the price of a supply building
                        //OR if we our supply is maxed out
                        //NOTE: this is to make sure that we will always be able to buy more supply when needed
                        //      OR to make sure that we won't save any resources for supply buildings when we are already at max
                        if (m_macroGroup.Count + (CurrentMaxSupply - CurrentSupply) > m_thingsAssets.m_igloo.m_price
                            || CurrentMaxSupply == Player.AbsoluteMaxSupply)
                        {
                            //loop through every players army size
                            foreach (int AttackPower in m_enermyArmySizes)
                            {
                                //if any other player has a potentially dangerous army to us
                                if (m_defensiveGroup.Count <= AttackPower * m_powerToWinMultiplier)
                                {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }

            return false;
        }


        /// <summary>
        /// Tries to find a good build location. 
        /// By randoming a one of our buildings and random a location around it.
        /// Until it finds a location that's buildable.
        /// NOTE: there is a weird offset somewhere in this project, which is corrected by "- (int)m_buildings[buildingIndex].m_size.Y"
        /// </summary>
        private Vector3? TryFindGoodBuildSpot(Thing a_building, Game a_game)
        {
            //initialize a few variables
            Vector3 buildPosition = new Vector3();
            bool goodPositionFound = false;
            Rectangle buildArea;
            int buildingIndex;
            int startDirection;
            int direction;
            int spaceBetweenBuildings = 2;

            do
            {
                //random a building (to build nearby)
                buildingIndex = Game.Randomizer.Next(m_buildings.Count);

                //random a start direction (orthogonal)
                startDirection = Game.Randomizer.Next(4);

                direction = startDirection;

                //this will start from the randomed start direction
                //then continue check clockwise for a good position
                //until a good position is found OR when we are back at the start
                do
                {
                    //NOTE: do NOT touch the Rectangle code in these cases, unless you know EXACTLY what you are doing!
                    //ADDITIONAL NOTE: the "- (int)m_buildings[buildingIndex].m_size.Y" at the end of each Y is there 
                    //                 because BuildFunction's has a bug (probably), or it works different than I thought.
                    switch (direction)
                    {
                        //above
                        case 0:
                            //set the build area
                            buildArea = new Rectangle(
                                (int)(m_buildings[buildingIndex].m_currentposition.X - (m_buildings[buildingIndex].m_size.X / 2)),
                                (int)(m_buildings[buildingIndex].m_currentposition.Y + (m_buildings[buildingIndex].m_size.Y / 2)
                                    + spaceBetweenBuildings + a_building.m_size.Y) - (int)m_buildings[buildingIndex].m_size.Y,
                                (int)a_building.m_size.X,
                                (int)a_building.m_size.Y);

                            //see if the area is buildable
                            if (a_game.m_map.AreaBuildable(ref buildArea, m_buildings[buildingIndex].m_currentposition.Z))
                            {
                                //we found a good position!
                                goodPositionFound = true;

                                //set the build position to the center of the build area
                                buildPosition.X = buildArea.Center.X;
                                buildPosition.Y = buildArea.Center.Y;
                                buildPosition.Z = m_buildings[buildingIndex].m_currentposition.Z;//use the same height as the nearby building
                            }
                            break;

                        //to the right
                        case 1:
                            //set the build area
                            buildArea = new Rectangle(
                                (int)(m_buildings[buildingIndex].m_currentposition.X + (m_buildings[buildingIndex].m_size.X / 2) 
                                    + spaceBetweenBuildings),
                                (int)(m_buildings[buildingIndex].m_currentposition.Y + (m_buildings[buildingIndex].m_size.Y / 2)) - (int)m_buildings[buildingIndex].m_size.Y,
                                (int)a_building.m_size.X,
                                (int)a_building.m_size.Y);

                            //see if the area is buildable
                            if (a_game.m_map.AreaBuildable(ref buildArea, m_buildings[buildingIndex].m_currentposition.Z))
                            {
                                //we found a good position!
                                goodPositionFound = true;

                                //set the build position to the center of the build area
                                buildPosition.X = buildArea.Center.X;
                                buildPosition.Y = buildArea.Center.Y;
                                buildPosition.Z = m_buildings[buildingIndex].m_currentposition.Z;//use the same height as the nearby building
                            }
                            break;

                        //below
                        case 2:

                            Vector2 f_position = new Vector2((int)(m_buildings[buildingIndex].m_currentposition.X - (m_buildings[buildingIndex].m_size.X / 2)),
                                (int)(m_buildings[buildingIndex].m_currentposition.Y - (m_buildings[buildingIndex].m_size.Y / 2)
                                    - spaceBetweenBuildings) - (int)m_buildings[buildingIndex].m_size.Y);

                            //It's so it doesn't build above a blocked tile, causing the spawn position to be inside a blocked tile, fucking up pathfinder royally
                            if (f_position.Y - a_building.m_size.Y <= 1)
                            {
                                f_position.Y++;
                            }

                            //set the build area
                            buildArea = new Rectangle((int)f_position.X,(int)f_position.Y
                                ,
                                (int)a_building.m_size.X,
                                (int)a_building.m_size.Y);

                            

                            //see if the area is buildable
                            if (a_game.m_map.AreaBuildable(ref buildArea, m_buildings[buildingIndex].m_currentposition.Z))
                            {
                                //we found a good position!
                                goodPositionFound = true;

                                //set the build position to the center of the build area
                                buildPosition.X = buildArea.Center.X;
                                buildPosition.Y = buildArea.Center.Y;
                                buildPosition.Z = m_buildings[buildingIndex].m_currentposition.Z;//use the same height as the nearby building
                            }
                            break;

                        //to the left
                        case 3:
                            //set the build area
                            buildArea = new Rectangle(
                                (int)(m_buildings[buildingIndex].m_currentposition.X - (m_buildings[buildingIndex].m_size.X / 2) 
                                    - spaceBetweenBuildings - a_building.m_size.X),
                                (int)(m_buildings[buildingIndex].m_currentposition.Y + (m_buildings[buildingIndex].m_size.Y / 2)) - (int)m_buildings[buildingIndex].m_size.Y,
                                (int)a_building.m_size.X,
                                (int)a_building.m_size.Y);

                            //see if the area is buildable
                            if (a_game.m_map.AreaBuildable(ref buildArea, m_buildings[buildingIndex].m_currentposition.Z))
                            {
                                //we found a good position!
                                goodPositionFound = true;

                                //set the build position to the center of the build area
                                buildPosition.X = buildArea.Center.X;
                                buildPosition.Y = buildArea.Center.Y;
                                buildPosition.Z = m_buildings[buildingIndex].m_currentposition.Z;//use the same height as the nearby building
                            }
                            break;
                    }

                    //go to next direction
                    direction++;
                    if (direction > 3)
                        direction = 0;//it needs to go back to 0 at sometime
                }
                //stops if we have gone back to the first direction
                while (direction != startDirection);
            }
            //stops if we found a good build location OR if ROB's thinking time is out
            while (goodPositionFound == false && m_timeOutWatch.ElapsedMilliseconds < m_timeLimitMilliSeconds);


            //if we found a good build location
            if (goodPositionFound)
            {
                return buildPosition;
            }

            //if no good build location was found
            return null;
        }

        /// <summary>
        /// Does the building's actions, like a barrack building barbarians!
        /// </summary>
        private void DoBuildingActions(Game a_game)
        {
            //loop through all buildings
            foreach (Thing building in m_buildings)
            {
                //if it's a barrack
                if (building.m_type == ThingType.C_Barrack)
                {
                    //if it's not building
                    if (!building.m_buildBehavior.IsBuilding())
                    {
                        //if it has enough sacrifices to build a barbarian
                        if (building.m_buildBehavior.GetSacrificeCount() >= m_thingsAssets.m_barbarian.m_price)
                        {
                            //build barbarian!
                            (building as Barrack).BuildBarbarianFunction(a_game, new Vector3());
                        }
                    }
                }
            }
        }
        #endregion


        #endregion

        #region Offensive
        /*****************
          Offensive
        ******************/


        /// <summary>
        /// handles the offensive group
        /// </summary>
        private void DoOffensive(Game a_game)
        {
            ClearSelectedTargets();

            //select all available units
            foreach (Thing unit in m_offensiveGroup)
            {
                //if idle
                if (unit.m_thingState == ThingState.Idle)
                {
                    m_selectedThings.Add(unit);
                }
            }

            
            //1. Is there anything to defend?
            if (HelpDefendConditions())
            {
                //if we have any units to help with
                if (m_offensiveGroup.Count > 0)
                {
                    //loop through all units in the offensive group
                    //NOTE: "i" will always be 0, but TransferUnit will remove units from the list so it's ok
                    for (int i = 0; i < m_offensiveGroup.Count; )
                    {
                        //move unit from offensive to defensive
                        TransferUnit(i, m_offensiveGroup, m_defensiveGroup);
                    }

                    //action decided, go to End
                    goto End;
                }
            }
            else
            {
                TryToHarass(a_game.m_pathFinder);     
            }                
                 
            //when we have decided to do an action we shouldn't try to do any more in the same update
            //because it's stupid
            End:
            return;//there HAS to be something after a goto point...
            //return; does actually exactly the same thing as End is supposed to do, but this way looks better.. I think :)
        }


        #region Offensive Conditions and Functions

        private bool HelpDefendConditions()
        {
            //if there are more enermies than the defensive group can handle
            if (m_defensiveGroup.Count < m_enermiesInsideBase.Count)
            {
                return true;
            }

            return false;
        }

        private void TryToHarass(PathFinder a_pathFinder)
        {           
            while (m_timeOutWatch.ElapsedMilliseconds < m_timeLimitMilliSeconds)
            {                
                Thing f_harassTarget = FindHarassment();

                if (f_harassTarget != null)
                {                    
                    HuntTowardsPoint(f_harassTarget, a_pathFinder);
                    break;
                }                
            }            
        }

        /// <summary>
        /// Randomizes a target and tries to see if it's weak and then tries to attack towards it!
        /// </summary>
        /// <returns></returns>
        private Thing FindHarassment()
        {
            //Just precaution against nasty errors!  not as important as one below tho
            if (m_enemyPlayers.Count == 0)
            {
                return null;
            }

            //Randomizes the player
            int randomPlayer = Game.Randomizer.Next(0, m_enemyPlayers.Count - 1);

            //This is count == 0 at beginning :p
            if (m_enemyPlayers[randomPlayer].m_buildings.Count == 0)
            {
                return null;
            }
            
            int randomBuilding = Game.Randomizer.Next(0, m_enemyPlayers[randomPlayer].m_buildings.Count - 1);

            Thing f_building = m_enemyPlayers[randomPlayer].m_buildings[randomBuilding];

            BoundingBox boundingBox = (BoundingBox)f_building.m_model.Tag;
            boundingBox.Max.Z = Map.m_maxHeight + 0.01f;
            boundingBox.Min.Z = 0;

            boundingBox.Min.X += f_building.m_currentposition.X - f_building.m_size.X - 3;
            boundingBox.Max.X += f_building.m_currentposition.X + f_building.m_size.X + 3;

            boundingBox.Min.Y += f_building.m_currentposition.Y - f_building.m_size.Y - 3;
            boundingBox.Max.Y += f_building.m_currentposition.Y + f_building.m_size.Y + 3;

            int f_unitPowerGuarding = 0;

            foreach (Thing unit in m_enemyPlayers[randomPlayer].m_units)
            {
                BoundingBox f_box = (BoundingBox)unit.m_model.Tag;

                if (f_box.Intersects(boundingBox))
                {
                    f_unitPowerGuarding += m_enemyPlayers[randomPlayer].m_thingsAssets.GetUnitPower(unit.m_type);
                }
            }

            if (m_offensiveGroup.Count <= f_unitPowerGuarding)
            {
                if (m_offensiveGroup.Count + m_defensiveGroup.Count > f_unitPowerGuarding)
                {
                    for (int i = 0; i < m_defensiveGroup.Count; )
                    {
                        TransferUnit(i, m_defensiveGroup, m_offensiveGroup);
                    }

                    return f_building;
                }
            }
            else
            {
                return f_building;
            }

            return null;

        }

        #endregion


        #endregion

        #region Defensive
        /*****************
          Defensive
        ******************/


        /// <summary>
        /// handles the defensive group
        /// </summary>
        private void DoDefensive(Game a_game)
        {
            ClearSelectedTargets();

            //select all available units
            foreach (Thing unit in m_defensiveGroup)
            {
                m_selectedThings.Add(unit);
            }
            
            //1a. Is there anything to defend?
            if (DefendConditions())
            {              
                HuntTowardsPoint(m_enermiesInsideBase[0], a_game.m_pathFinder);

                //action decided, go to End
                goto End;
            }
            //1b. If there isn't anything to defend should I pull workers?
            else if (DoIUseWorkersToDefend())
            {
                UseWorkersToDefend();               
                    
                goto End;                          
            }
            
            //2. Can we win with this army? Then move to offensive!
            if (WinConditions())
            {
                //loop through all units in the defensive group
                //NOTE: "i" will always be 0, but TransferUnit will remove units from the list so it's ok
                for(int i = 0; i < m_defensiveGroup.Count;)
                {
                    if (m_defensiveGroup[i].m_type != ThingType.C_Cube)
                    {
                        TransferUnit(i, m_defensiveGroup, m_offensiveGroup);
                    }
                    else
                    {
                        TransferUnit(i, m_defensiveGroup, m_macroGroup);
                    }
                    //move unit from defensive to offensive
                    
                }                

                //action decided, go to End
                goto End;
            }
            
            //3. Should we just idle?
            if (IdleConditions())
            {
                //loop through all available units in the defensive group
                for (int i = 0; i < m_defensiveGroup.Count; )
                {
                    if (m_defensiveGroup[i].m_type != ThingType.C_Cube)
                    {
                        //if the unit was NOT inside the base
                        if (!IsUnitInsideOurBase(m_defensiveGroup[i]) )
                        {
                            //move-unit-to-random-positions-inside-base code here!
                        }

                        i++;                        
                    }
                    else
                    {
                        TransferUnit(i,m_defensiveGroup,m_macroGroup);
                    }
                    
                    
                }

                //action decided, go to End
                goto End;
            }

            //when we have decided to do an action we shouldn't try to do any more in the same update
            //because it's stupid
            End:
            m_underAttackPositions.Clear();
            return;//there HAS to be something after a goto point...
            //return; does actually exactly the same thing as End is supposed to do, but this way looks better.. I think :)
        }


        #region Defensive Conditions and Functions

        private bool DefendConditions()
        {
            //if we have any units
            if (m_selectedThings.Count > 0)
            {
                //if we have any enermies inside our base
                if (m_enermiesInsideBase.Count > 0)
                {
                    return true;
                }
            }

            return false;
        }

        private bool DoIUseWorkersToDefend()
        {
            //Returns true if there are no defensive units and there are enemies in the base 
            return m_selectedThings.Count == 0 && m_macroGroup.Count >= m_enermiesInsideBase.Count && m_enermiesInsideBase.Count > 0;          
        }

        private void UseWorkersToDefend()
        {
            //Counts my power in workers only
            int f_myWorkerPower = m_macroGroup.Count * m_thingsAssets.GetUnitPower(ThingType.C_Cube);

            //If I have 25% larger force than enemy so I know I can win
            if (f_myWorkerPower >= m_enemyUnitPowerInsideMyBase*1.25f)
            {
                int f_neededWorkers =(int)(m_enemyUnitPowerInsideMyBase*1.25f + 0.5f);

                if (f_neededWorkers ==m_enemyUnitPowerInsideMyBase)
                {
                    f_neededWorkers++;
                }                    

                while (f_neededWorkers > 0)
                {
                    m_selectedThings.Add(m_macroGroup[0]);

                    TransferUnit(0, m_macroGroup, m_defensiveGroup);                        

                    f_neededWorkers--;
                }
            }
            //If I only have workers as units
            else if (f_myWorkerPower == m_unitPower)
            {               
                //If I have no barracks I must attack with all my workers trying to win this! 
                if (m_barracks.Count == 0)
                {
                    while (f_myWorkerPower > 0)
                    {
                        m_selectedThings.Add(m_macroGroup[0]);

                        TransferUnit(0, m_macroGroup, m_defensiveGroup);

                        f_myWorkerPower--;
                    }
                }
            }
        }

        private bool WinConditions()
        {
            //if we have any units
            if (m_selectedThings.Count > 0)
            {
                //loop through all enermies
                foreach (int armySize in m_enermyArmySizes)
                {
                    //if we have a certain percent more units than a enermy's army size
                    if (m_unitPower > armySize * m_powerToWinMultiplier)
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        private bool IdleConditions()
        {
            //if we have any units, no need to check if there's any enemy e.t.c. cause those checks will be prior to this 
            if (m_selectedThings.Count > 0)
            {
                return true;
            }

            return false;
        }
        #endregion

        #endregion

        #region Surrender

        private void DoSurrenderLogic(Game a_game)
        {
            bool surrender = false;

            //If enemy has twice my size in my base with workers & barbarians counted, and my barrack count is 0 and I have no active extractors ... I give up!
                            
            if (m_activeExtractorCount == 0)
            {
                if (m_barracks.Count == 0)
                {
                    surrender = true;
                    goto SurrenderNow;
                }                
                //Checks if you have no unit and can't produce anything ....  and enemy has some, like.. just leave the game already!!!
                else if (m_unitPower == 0)
                {
                    bool noChance = false;

                    foreach (int  enemyPower in m_enermyArmySizes)
                    {
                        if (enemyPower > 0)
                        {
                            noChance = true;
                            break;
                        }                    
                    }

                    if (noChance)
                    {
                        surrender = true;
                        goto SurrenderNow;
                    }
                }
                else if (m_enemyUnitPowerInsideMyBase > m_unitPower * 5)
                {
                    surrender = true;
                    goto SurrenderNow;
                }
            }            
            /*
            if (m_enemyUnitPowerInsideMyBase > (m_unitPower * 15) && m_unitPower < 10)
            {
                surrender = true;
                goto SurrenderNow;
            }*/
            

            SurrenderNow:
            if (surrender)
            {
                Surrender(a_game.m_map);
            }
        }

        #endregion

        #region Other Stuff
        /*****************
          OTHER STUFF
        ******************/

        private Thing GetNearestEnemyStructure(List<Player> a_playerList)
        {
            Thing nearestBuilding = null;
            float distance = float.MaxValue;

            //loop through all players
            foreach (Player player in m_enemyPlayers)
            {                
                //loop through all enermy buildings
                foreach (Thing building in player.m_buildings)
                {
                    //calc distance
                    float tempDistance = (building.m_currentposition - m_startPosition).LengthSquared();

                    //if it's closer than the previous distance
                    if (tempDistance < distance)
                    {
                        nearestBuilding = building;
                        distance = tempDistance;
                    }
                }
            }

            return nearestBuilding;
        }

        private Thing GetNearestEnemyStructure(Player a_player)
        {
            Thing nearestBuilding = null;
            float distance = float.MaxValue;

            foreach (Thing building in a_player.m_buildings)
            {
                //calc distance
                float tempDistance = (building.m_currentposition - m_startPosition).LengthSquared();

                //if it's closer than the previous distance
                if (tempDistance < distance)
                {
                    nearestBuilding = building;
                    distance = tempDistance;
                }
            }

            return nearestBuilding;
        }

        private void HuntTowardsPoint(Thing a_targetToKill , PathFinder a_pathfinder)
        {
            Vector3 attackPoint = new Vector3(a_targetToKill.m_currentposition.X - a_targetToKill.m_size.X * 0.5f,
                                                a_targetToKill.m_currentposition.Y - a_targetToKill.m_size.Y * 0.5f,
                                                a_targetToKill.m_currentposition.Z);

            //loop through all available units
            foreach (Thing unit in m_selectedThings)
            {                          
                if (unit.m_attackBehavior != null)
                {
                    //attack the enermies
                    unit.m_attackBehavior.StartHunting(attackPoint, a_pathfinder);
                }
            }
        }


        private void FindNewUnits()
        {
            //loop through all ROB's units
            foreach (Thing unit in m_units)
            {
                //if the unit exists in the macro group
                if(UnitExists(unit, m_macroGroup))
                {
                    continue;
                }
                //if the unit exists in the offensive group
                else if(UnitExists(unit, m_offensiveGroup))
                {
                    continue;
                }
                //if the unit exists in the defensive group
                else if (UnitExists(unit, m_defensiveGroup))
                {
                    continue;
                }

                //if the unit is not in any group
                m_recruits.Add(unit);
            }
        }

        /// <summary>
        /// Checks if a unit is in a list
        /// </summary> 
        private bool UnitExists(Thing a_unit, List<Thing> a_unitList)
        {
            return a_unitList.Contains(a_unit);               
        }


        private void TransferRecruits()
        {
            //all recruits will be transfered to a group (which group depends on the group assigner result)
            for(int i = 0; i < m_recruits.Count;)
            {
                //NOTE: "i" will always be 0! However the list's length will be reduced when you transfer units
                switch (GroupAssigner(m_recruits[i]))
                {
                    case 1:
                        TransferUnit(i, m_recruits, m_macroGroup);                        
                        break;
                    case 2:
                        TransferUnit(i, m_recruits, m_defensiveGroup);                        
                        break;
                }
            }
        }


        /// <summary>
        /// Transfers a unit from one list to another
        /// </summary>
        private void TransferUnit(int a_index, List<Thing> a_transferList, List<Thing> a_targetList)
        {
            if (a_transferList.Count != 0 && a_index < a_transferList.Count)
            {
                //add to the target list
                a_targetList.Add(a_transferList[a_index]);

                //remove all from the transferList
                a_transferList.RemoveAt(a_index);
            }
        }

        /// <summary>
        /// Removes all dead units in macro, offensive and defensive group
        /// </summary>
        private void RemoveDeadUnits()
        {
            //removes any dead units from the macro group
            for (int i = 0; i < m_macroGroup.Count; )
            {
                if (!UnitExists(m_macroGroup[i], m_units))
                {
                    m_macroGroup.RemoveAt(i);

                }
                else
                {
                    i++;
                }
            }

            //removes any dead units from the offensive group
            for (int i = 0; i < m_offensiveGroup.Count; )
            {
                if (!UnitExists(m_offensiveGroup[i], m_units))
                {
                    m_offensiveGroup.RemoveAt(i);

                }
                else
                {
                    i++;
                }
            }

            //removes any dead units from the defensive group
            for (int i = 0; i < m_defensiveGroup.Count; )
            {
                if (!UnitExists(m_defensiveGroup[i], m_units))
                {
                    m_defensiveGroup.RemoveAt(i);
                }
                else
                {
                    i++;
                }
            }
        }

        /// <summary>
        /// This assigns recruits to the different groups, just like the hat in hogwarts...
        /// Returns: 1=Macro, 2=Defensive
        /// </summary>
        private int GroupAssigner(Thing a_unit)
        {
            //if it's a builder
            if (a_unit.m_type == ThingType.C_Cube)
            {
                return 1;
            }
            
            return 2;
        }


        private void ClearSelectedTargets()
        {
            m_selectedWorkers = 0;
            m_selectedThings.Clear();
        }

        /// <summary>
        /// returns true if the unit is inside our base
        /// </summary>
        private bool IsUnitInsideOurBase(Thing a_unit)
        {
            //loop through all our buildings
            foreach (Thing building in m_buildings)
            {
                //if a unit is inside the base
                if ((building.m_currentposition - a_unit.m_currentposition).LengthSquared() < m_insideBaseRange * m_insideBaseRange)
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// This should update all data that are needed multiple times (in PerformAction)
        /// </summary>
        private void UpdateInterestingData(Game a_game)
        {
            //reset variables
            m_activeExtractorCount = 0;            
            m_untakenExpansionCount = 0;            
            m_enermiesInsideBase = new List<Thing>();
            m_barracks = new List<Barrack>();
            m_enemyUnitPowerInsideMyBase = 0;


            //get the number of active extractors and total number of barracks
            foreach (Thing building in m_buildings)
            {
                //if it's a extractor
                if (building.m_type == ThingType.C_Extractor)
                {
                    //if it's active (not depleted)
                    if (building.m_buildBehavior.IsBuilding())
                    {
                        m_activeExtractorCount++;
                    }
                }
                //if it's a barrack
                else if (building.m_type == ThingType.C_Barrack)
                {
                    m_barracks.Add(building as Barrack);
                }
            }
            //don't forget to add the one's that are currently building aswell!
            foreach (BuildingObject buildObject in m_buildObjects)
            {
                //if it's a extractor
                if (buildObject.m_object.m_type == ThingType.C_Extractor)
                {
                    m_activeExtractorCount++;
                }
                //if it's a barrack
                else if (buildObject.m_object.m_type == ThingType.C_Barrack)
                {
                    m_barracks.Add(buildObject.m_object as Barrack);
                }
            }

            //get the number of untaken expansions
            foreach (WorldObject worldObject in a_game.m_map.m_worldObjects)
            {
                //if it's a expansion
                if (worldObject.m_type == WorldObjectType.SoL)
                {
                    //if it's NOT taken
                    if (worldObject.m_taken == false && (worldObject as SoL).m_resources > m_thingsAssets.m_extractor.m_price)
                    {
                        m_untakenExpansionCount++;
                    }
                }
            }

            //get the army sizes of all enermies and checks if any are inside base
            //loop through all players in the game
            for (int p = 0; p < m_enemyPlayers.Count; p++)
			{
                if (m_enemyPlayers[p].m_surrendered)
                {
                    m_enemyPlayers.RemoveAt(p);
                    m_enermyArmySizes.RemoveAt(p);
                    p--;
                }
                else
                {
                    m_enermyArmySizes[p] = m_enemyPlayers[p].m_unitPower;

                    foreach (Thing unit in m_enemyPlayers[p].m_units)
                    {
                        //if the unit is inside our base
                        if (IsUnitInsideOurBase(unit))
                        {
                            //add this unit
                            m_enermiesInsideBase.Add(unit);

                            //The enemyUnitPower inside my base
                            m_enemyUnitPowerInsideMyBase += m_thingsAssets.GetUnitPower(unit.m_type);
                        }
                    }
                }
			}            
  
        }
        #endregion
    }
}
