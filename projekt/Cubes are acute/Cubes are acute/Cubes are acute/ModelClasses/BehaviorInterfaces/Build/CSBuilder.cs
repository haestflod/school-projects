using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.Units.Cubes;
using Microsoft.Xna.Framework;
using Cubes_are_acute.ModelClasses.WorldObjects;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    [Serializable]
    class CSBuilder : iBuildBehavior
    {

        //The player that owns the builder!
        Player m_player;

        Map m_map;

        PathFinder m_pathfinder;

        //The thing that is building stuff
        Thing m_builder;

        //The queue and takes a thingtype to use m_player thingasset to get the right unit.
        Queue<ThingType> m_buildingQueue = new Queue<ThingType>();

        /// <summary>
        /// The thing that is being currently built
        /// </summary>
        public Thing m_currentBuildingThing = null;

        SoL m_SoL;

        bool m_addedWithSupply = false;

        public CSBuilder(Player a_player, Thing a_builder, SoL a_SoL, Map a_map, PathFinder a_pathfinder)
        {
            m_player = a_player;

            m_map = a_map;

            m_pathfinder = a_pathfinder;

            m_builder = a_builder;

            m_player.AddThingBuilder(m_builder);

            m_SoL = a_SoL;
        }

        public void AddToBuildQueue(ThingType a_thingy)
        {
            m_buildingQueue.Enqueue(a_thingy);
            //Starts building after adding to queue.  
            StartBuild();
        }

        public void AddToBuildQueue(ThingType a_thingy, Vector3 a_position)
        {
            throw new NotImplementedException();
        }

        public void DoBuildBehavior(float a_elapsedTime)
        {
            if (m_currentBuildingThing != null)
            {
                //If UpdateBuildTimer returns true the item is finished being built.
                if (UpdateBuildTimer(a_elapsedTime))
                {
                    //Thus, finish it!
                    FinishBuild();
                }            
            }          
   
        }

        public void StartBuild()
        {
            //If not already building anything and the queue count is above 0 , start to build!!
            if (m_currentBuildingThing == null && m_buildingQueue.Count > 0 && m_SoL != null)
            {
                //Creates an empty thing first
                Thing f_temp = null;
                //Switch checks what type it is to be built
                switch (m_buildingQueue.Dequeue())
                {
                    //If it's Cube
                    case ThingType.C_Cube:
                        //f_temp is now a cube!
                        f_temp = m_player.m_thingsAssets.CreateCube(m_builder.m_currentposition);
                        break;
                }

                //returns true if harvesting was possible
                if (m_SoL.Harvest())
                {
                    //If player has supply to add the cube
                    if (f_temp != null)
                    {
                        //Shall now build it!
                        m_currentBuildingThing = f_temp;
                        //Calls the player function to add a currentlyBuildingThing to it's lists and supply and what not!
                        if (m_player.CanAddUnit(m_currentBuildingThing))
                        {
                            m_addedWithSupply = true;
                            m_player.AddSupply(GetSupplyValue());
                        }
                        else
                        {
                            m_addedWithSupply = false;                            
                        }                        
                    }
                }
                else
                {
                    switch (m_builder.m_type)
                    {
                        case ThingType.C_Extractor:
                            //(m_builder as Extractor).m_SoL = null;
                            //gotta destroy all references or it still exists in ze program                            
                            m_SoL = null;
                            break;
                    }

                    //Removes itself from the list of thingBuilders as it can no longer build anything! 
                    //m_player.RemoveThingBuilder(m_builder);
                }                
            }//End if (currentbuildthing == null && m_buildQueue > 0 && m_sol != null
        }

        public void FinishBuild()
        {
            //If there was enough supply for the cube when the cube started being built
            if (m_addedWithSupply)
            {
                //Removes supply out here instead of SpawnBuilder, because SpawnBuilder() in !addedWithSupply  just adds supply,
                //Doesn't remove, if it did it'd be able to spawn 10 cubes if it was possible to add cubes!
                m_player.RemoveSupply(GetSupplyValue());
                SpawnBuilder();
            }
            //If it started building the unit without supply it will check 1 last time when it's finished being built if anything changed supply wise, might be possible 
            //To add the unit now! before throwing it away
            else
            {
                //Checks if possible.. then redundant code
                if (m_player.CanAddUnit(m_currentBuildingThing))
                {                    
                    SpawnBuilder();
                }                
            }

            //sets the item being built to null as the current one is finished.
            m_currentBuildingThing = null;

            if (m_player.m_race == Races.Cubes)
            {
                AddToBuildQueue(ThingType.C_Cube);
            }
            else
            {
                //To come.. Thingtype.S_Sphere
            }           
        }

        /// <summary>
        /// Does the spawn logic for the builder
        /// </summary>
        private void SpawnBuilder()
        {
            m_currentBuildingThing.m_currentposition = GetSpawnPosition();

            //Set the attackbehaviors e.t.c. for the item
            m_currentBuildingThing.SpawnMe(m_player, m_map, m_pathfinder);          

            //If m_builder has a destination.. temporary shit until our setdestination function works with a list again ^^
            if (m_builder.m_destination.Count > 0)
            {
                //Add the unit to the unit list, or building list... ok, gotta fix it so it goes to the appropriate list!
                m_player.AddReadyThing(m_currentBuildingThing, m_builder.m_destination);
            }
            else
            {
                m_player.AddReadyThing(m_currentBuildingThing, null);
            }            
        }

        public bool UpdateBuildTimer(float a_elapsedTime)
        {
            //adds the buildtimer to elapsed time!
            return m_currentBuildingThing.BuildMe(a_elapsedTime);            
        }

        public void CancelBuild()
        {
            //Removes the building from the list and doesn't add the unit to any list, thus removing it 
            m_player.RemoveSupply(GetSupplyValue());
            //Makes the currentbuildingitem to null so StartBuild() can proceed to next item
            m_currentBuildingThing = null;
            StartBuild();
        }

        public void Destroyed()
        {
            //If it had added with supply it will remove it! Otherwise not or you get 1 extra supply ^_^
            if (m_addedWithSupply)
            {
                m_player.RemoveSupply(GetSupplyValue());
            }
            m_player.RemoveThingBuilder(m_builder);
            m_currentBuildingThing = null;
        }

        public int GetAspiringSacrificeCount() { return 0; }
        public void AddSacrifice(Thing a_sacrifice) { }        
        public void RemoveSacrifice() { }
        public void RemoveAllSacrifices() { }
        public int GetSacrificeCount()  { return 0; }

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
            return m_builder.m_size;
        }

        public float GetBuildRangeSquared()
        {
            return 0;
        }

        public bool IsBuilding()
        {
            if (m_currentBuildingThing != null)
            {
                return true;
            }

            return false;
        }

        public float GetBuildTimer()
        {
            if (m_currentBuildingThing != null)
            {
                return m_currentBuildingThing.m_builtTimer;
            }
            return 0;
        }

        public ThingType GetBuildingType()
        {
            if (m_currentBuildingThing != null)
            {
                return m_currentBuildingThing.m_type;
            }

            return ThingType.C_Cube;
        }

        public Vector3 GetSpawnPosition()
        {
            Vector3 spawnPos = new Vector3();

            if (m_currentBuildingThing != null)
            {
                //set spawnpos to below the buider, to the left
                spawnPos.X = m_builder.m_currentposition.X - m_builder.m_size.X * 0.5f + m_currentBuildingThing.m_size.X * 0.5f;
                spawnPos.Y = m_builder.m_currentposition.Y - m_builder.m_size.Y / 2 - m_currentBuildingThing.m_size.Y / 2;
                spawnPos.Z = m_builder.m_currentposition.Z;
            }
            else
            {
                spawnPos.X = m_builder.m_currentposition.X - m_builder.m_size.X / 2 + 0.5f;
                spawnPos.Y = m_builder.m_currentposition.Y - m_builder.m_size.Y / 2 - 0.5f;
                spawnPos.Z = m_builder.m_currentposition.Z;
            }

            return spawnPos;
        }
    }
}
