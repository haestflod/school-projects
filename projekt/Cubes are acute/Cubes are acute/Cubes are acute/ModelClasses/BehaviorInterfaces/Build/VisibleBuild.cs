using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.WorldObjects;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    [Serializable]
    class VisibleBuild : iBuildBehavior
    {
        //The player that owns the builder!
        Player m_player;

        Map m_map;

        PathFinder m_pathfinder;

        WorldObject m_currentWorldObject = null;

        //The queue and takes a thingtype to use m_player thingasset to get the right unit.
        Queue<ThingType> m_buildingQueue = new Queue<ThingType>();

        Thing m_builder;

        //Position where the building is supposed to be placed
        Vector3 m_position;

        public Thing m_currentBuildingThing = null;

        float m_buildRange;
        float m_buildRangeSquared;

        bool m_lookingForWO = false;
        WorldObjectType m_lookingForWOType;

        public VisibleBuild(Player a_player, Thing a_builder, float a_buildRange, Map a_map, PathFinder a_pathfinder)
        {
            m_player = a_player;

            m_map = a_map;
            m_pathfinder = a_pathfinder;

            m_builder = a_builder;
            m_buildRange = a_buildRange;
            m_buildRangeSquared = m_buildRange * m_buildRange;
        }

        public void AddToBuildQueue(Units.ThingType a_thingy)
        {
            throw new NotImplementedException();
        }

        public void AddToBuildQueue(ThingType a_thingy, Vector3 a_position)
        {
            m_buildingQueue.Enqueue(a_thingy);
            //Puts the build position in the center of a tile            

            //m_position = new Vector3((int)a_position.X + Map.m_tileSizeDivided, (int)a_position.Y + Map.m_tileSizeDivided, m_map.m_tiles[(int)a_position.X,(int)a_position.Y].m_height);            
            m_position = a_position;

            StartBuild();
        }
        
        /// <summary>
        /// Attempt to start building, goes through a lot of trying to build logic here
        /// </summary>
        public void StartBuild()
        {
           
            //If currently is not building anything and the queue is larger than 0
            if (m_currentBuildingThing == null &&  m_buildingQueue.Count > 0)
            {
                Thing f_temp = null;

                //Switch check the buildable types
                switch (m_buildingQueue.Dequeue())
                {                      
                    case ThingType.C_Extractor:
                        //Create extractor at position where you clicked
                        f_temp = m_player.m_thingsAssets.CreateExtractor(m_position);
                        //Extractor needs a SoL so it's looking for a WO and puts the type too
                        m_lookingForWO = true;
                        m_lookingForWOType = WorldObjectType.SoL;
                        break;
                    case ThingType.C_Igloo:
                        f_temp = m_player.m_thingsAssets.CreateIgloo(m_position);
                        m_lookingForWO = false;
                        break;
                    case ThingType.C_Barrack:
                        f_temp = m_player.m_thingsAssets.CreateBarrack(m_position);
                        m_lookingForWO = false;
                        break;
                }
                
                //If f_temp got valued
                if (f_temp != null )
                {

                    #region SetPositionCorrect
                    if (!f_temp.m_isUnit)
                    {
                        if (f_temp.m_size.X % 2 == 0)
                        {
                            m_position.X = (int)m_position.X;
                        }
                        else
                        {
                            m_position.X = (int)m_position.X + Map.m_tileSizeDivided;
                        }

                        if (f_temp.m_size.Y % 2 == 0)
                        {
                            m_position.Y = (int)m_position.Y;
                        }
                        else
                        {
                            m_position.Y = (int)m_position.Y + Map.m_tileSizeDivided;
                        }

                        m_position.Z = m_map.m_tiles[(int)m_position.X, (int)m_position.Y].m_height;
                    }
                    #endregion

                    
                    #region GetMapData 
                    //Checks for stuff on the map, Like a barrack if it gets a SoL? Cancel! 
 
                    Rectangle f_buildArea = MathGameHelper.GetAreaRectangle(m_position, f_temp.m_size);     

                    // IF looking for a WO
                    if (m_lookingForWO)
                    {
                        //Get a worldobject at the position trying to build at                        
                        m_currentWorldObject = m_map.GetWorldObject(ref f_buildArea, m_lookingForWOType);

                        if (m_currentWorldObject == null)
                        {
                            return;
                        }

                        //If it's SoL check if it's taken or not
                        if (m_currentWorldObject.m_type == WorldObjectType.SoL)
                        {
                            if ((m_currentWorldObject as SoL).m_taken)
                            {
                                m_currentWorldObject = null;
                                return;
                            }
                        }

                        //if found a WO
                        if (m_currentWorldObject == null)
                        {
                            return;
                        }
                    }//If not looking for WO
                    else
                    {
                        //Is outside, because if m_lookingForWO is false and m_currentWorldObject != null  it fails, can't build on a WO
                        m_currentWorldObject = m_map.GetWorldObject(ref f_buildArea);

                        if (m_currentWorldObject != null)
                        {
                            return;
                        }
                    }
                    #endregion

                    #region ValidationAndCreation
                    //Here it validates if it can Add the building / unit,   if it can build on the map (no blocked tiles... or units!)  and that player has enough workers

                    //If possible to add the thingy , and the area is buildable and player has enough selected workers
                    if (m_player.CanAddUnit(f_temp) && m_map.AreaBuildable(ref f_buildArea,m_position.Z) && m_player.m_selectedWorkers >= f_temp.m_price)
                    {
                        m_currentBuildingThing = f_temp;
                        if (m_currentBuildingThing.m_requiredBuildTime > 0)
                        {
                            float f_hp = 0.1f * (m_currentBuildingThing.m_maxHP-1);

                            m_currentBuildingThing.HP = 1;
                            m_currentBuildingThing.HPBuffer = f_hp;
                        }
                        //Sets the thingys position to position based by size & tileSize
                        m_currentBuildingThing.m_currentposition = m_position;

                        //find path to building spot
                        m_pathfinder.FindPath(m_builder.m_currentposition, m_position);

                        //Will try to create the new unit, which will either add the builder to an already existing BuildingObject or create a new one if the 
                        //m_currentBuildingThing aren't the same
                        if (m_player.TryToCreateNewUnit(m_currentBuildingThing, m_builder, m_map, m_currentWorldObject,m_pathfinder.m_pathLength))
                        {                           
                            //clear previous paths
                            m_builder.m_destination.Clear();

                            //set path to building spot
                            m_builder.m_destination = m_pathfinder.m_pathList;

                            m_builder.m_thingState = ThingState.Building;
                            
                        }

                        m_currentBuildingThing = null;
                        m_currentWorldObject = null;
                    }//end of if canAddUnit && map.AreaBuildable && m_player.m_selectedworkers >= price
                    #endregion

                }//End of If f_temp != null
            }
        }

        public void DoBuildBehavior(float a_elapsedTime) { }
        public void FinishBuild() { }
        public bool UpdateBuildTimer(float a_elapsedTime) { return false; }
        public void CancelBuild() { }
        public void Destroyed() { }
        public int GetAspiringSacrificeCount() { return 0; }
        public void AddSacrifice(Thing a_sacrifice) { }
        public void RemoveSacrifice() { }
        public void RemoveAllSacrifices() { }
        public int GetSacrificeCount() { return 0; }

        public int GetSupplyValue()
        {
            //if it has a building thingy it will remove that supply value, else 0
            if (m_currentBuildingThing != null)
            {
                return m_currentBuildingThing.m_supplyValue;
            }

            return 0;
        }

        public Vector3 GetSize()
        {
            if (m_currentBuildingThing != null)
            {
                return m_currentBuildingThing.m_size;
            }

            return Vector3.Zero;
        }

        public float GetBuildRangeSquared()
        {
            return m_buildRangeSquared;
        }

        public float GetBuildTimer()
        {
            if (m_currentBuildingThing != null)
            {
                return m_currentBuildingThing.m_builtTimer;
            }
            return 0;
        }

        public bool IsBuilding()
        {
            return false;
        }

        public ThingType GetBuildingType()
        {
            if (m_currentBuildingThing != null)
            {
                return m_currentBuildingThing.m_type;
            }

            //Pray to god this never happens!
            return ThingType.C_Cube;
        }

        public Vector3 GetSpawnPosition()
        {
            Vector3 spawnPos = new Vector3();

            return spawnPos;
        }
    }
}
