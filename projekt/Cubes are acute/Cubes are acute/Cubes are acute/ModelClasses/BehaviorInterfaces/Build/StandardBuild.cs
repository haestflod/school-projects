using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.Units;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    [Serializable]
    class StandardBuild : iBuildBehavior
    {
        //The player that owns the builder!
        Player m_player;

        Map m_map;

        PathFinder m_pathfinder;

        //The thing that is building stuff
        Thing m_builder;

        List<Thing> m_aspiringSacrifices = new List<Thing>();

        /// <summary>
        /// The list of workers that will die when building a new unit!
        /// </summary>
        List<Thing> m_sacrifices = new List<Thing>();

        /// <summary>
        /// Used to temporarily store objects in barracks if player wants to cancel something being built, to reimburse those units
        /// </summary>
        List<Thing> m_deletedSacrifices = new List<Thing>();

        //The queue and takes a thingtype to use m_player thingasset to get the right unit.
        Queue<ThingType> m_buildingQueue = new Queue<ThingType>();
        
        /// <summary>
        /// The thing that is being currently built
        /// </summary>
        public Thing m_currentBuildingThing = null;

        public StandardBuild(Player a_player, Thing a_builder, Map a_map, PathFinder a_pathfinder)
        {
            //sets the references so it knows who the player is and who the builder is.
            m_player = a_player;
            
            m_map = a_map;

            m_pathfinder = a_pathfinder;

            m_builder = a_builder;

            m_player.AddThingBuilder(m_builder);
        }

        /// <summary>
        /// Does ze build behavior! 
        /// </summary>      
        public void DoBuildBehavior(float a_elapsedTime)
        {
            HandleNewAspirants();

            //If there is nothing to build, return false
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

        /// <summary>
        /// Adds a thingy to the build queue. Checks later if the queue is full
        /// </summary>        
        public void AddToBuildQueue(ThingType a_thingy)
        {
            m_buildingQueue.Enqueue(a_thingy);
            //Starts building after adding to queue.  
            StartBuild();
        }

        /// <summary>
        /// Do not use! 
        /// </summary>        
        public void AddToBuildQueue(ThingType a_thingy, Vector3 a_position)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// In charge of validating resources and setting m_currentlyBuilding to something
        /// </summary>
        public void StartBuild()
        {
            //If not already building anything and the queue count is above 0 , start to build!!
            if (m_currentBuildingThing == null && m_buildingQueue.Count > 0)
            {
                //Creates an empty thing first
                Thing f_temp = null;
                //Switch checks what type it is to be built
                switch (m_buildingQueue.Dequeue())
                {
                    //If it's Cube
                    case ThingType.C_Barbarian:
                        //f_temp is now a cube!                        
                        f_temp = m_player.m_thingsAssets.CreateBarbarian(m_builder.m_currentposition);                        
                        break;
                }

                if (f_temp != null && m_sacrifices.Count >= f_temp.m_price)
                {
                    //Removes the supply of how many cubes it took to build the object cause that's needed for CanAddUnit() below if you're at maximum supply
                    m_player.RemoveSupply(f_temp.m_price);
                
                    //If player has supply to add the cube
                    if (m_player.CanAddUnit(f_temp))
                    {
                        //Shall now build it!
                        m_currentBuildingThing = f_temp;

                        int count = m_currentBuildingThing.m_price;

                        while (count > 0)
                        {
                            //Removes the unit power when it removes the unit from the barrack
                            //Note: No need to do the same with supply as it was already removed above CanAddUnit()
                            m_player.RemoveUnitPower(m_sacrifices[0].m_type);
                            m_deletedSacrifices.Add(m_sacrifices[0]);
                            m_sacrifices.RemoveAt(0);

                            count--;
                        }

                        //Adds the barbarians unitpower so computers unit power doesn't go to 0 .. cause they might surrender then ^_^
                        m_player.AddUnitPower(m_currentBuildingThing.m_type);
                        //Calls the player function to add a currentlyBuildingThing to it's lists and supply and what not!
                        //Note: Doesn't use AddReady/Visible as the unit is invisible a.t.m. but has to add the supply now and not when it's finished building
                        m_player.AddSupply(GetSupplyValue());

                    }//If can't add unit
                    else
                    {
                        //Readd the supply that was drawn
                        m_player.AddSupply(f_temp.m_price);
                    }
                }
            }
        }

        //If the buildTimer >= m_timerequired
        public void FinishBuild()
        {
            //Set the attackbehaviors e.t.c. for the item
            m_currentBuildingThing.SpawnMe(m_player, m_map, m_pathfinder);

            m_currentBuildingThing.m_currentposition = GetSpawnPosition();

            //Removes supply because m_player.AddReadyThing will add the supply back on :p
            m_player.RemoveSupply(GetSupplyValue());
            m_player.RemoveUnitPower(m_currentBuildingThing.m_type);

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

            m_deletedSacrifices.Clear();               

            //sets the item being built to null as the current one is finished.
            m_currentBuildingThing = null;

            //Attempts to start building next item in ze queue
            StartBuild();            
        }

        public bool UpdateBuildTimer(float a_elapsedTime)
        {
            return m_currentBuildingThing.BuildMe(a_elapsedTime);                       
        }


        //Not implemented in HUD or anything like that so can't use this yet but
        public void CancelBuild()
        {
            //Removing the supply and unitPower from the currentlyBuilt unit
            m_player.RemoveSupply(GetSupplyValue());
            m_player.RemoveUnitPower(m_currentBuildingThing.m_type);

            for (int i = 0; i < m_deletedSacrifices.Count; )
            {
                m_sacrifices.Add(m_deletedSacrifices[i]);

                m_player.AddSupply(m_deletedSacrifices[i].m_supplyValue);
                m_player.AddUnitPower(m_deletedSacrifices[i].m_type);

                m_deletedSacrifices.RemoveAt(i);
            }

            //Makes the currentbuildingitem to null so StartBuild() can proceed to next item
            m_currentBuildingThing = null;
            StartBuild();
        }

        public void Destroyed()
        {
            if (m_currentBuildingThing != null)
            {
                //Removes supplyValue from object being built as it was artificially added !  Same with UnitPower
                m_player.RemoveSupply(GetSupplyValue());
                m_player.RemoveUnitPower(m_currentBuildingThing.m_type);
                //Sets currentlybuilding to null
                m_currentBuildingThing = null;
            }
            //remove the building from builders list
            m_player.RemoveThingBuilder(m_builder);
            if (m_sacrifices.Count > 0)
            {
                //Since This buildbehavior removed the workers without removing supply & unitPower yet removed em from the list, 
                //Just Adding them back would cause double supplies & unitpower Growth which is bad! 
                m_player.RemoveSupply(m_sacrifices.Count * m_sacrifices[0].m_supplyValue);
                m_player.RemoveUnitPower(m_sacrifices[0].m_type, m_sacrifices.Count); 

                //Doesn't remove the blocked tiles on map, cause that's the m_builders.RemoveMe() functions job
                MathGameHelper.RestoreXPercentUnits(m_sacrifices, m_player, 0.25f);

            }

            //If the building dies before the new possible sacrifices becomes fullfledged ones!
            foreach (Thing asp in m_aspiringSacrifices)
            {
                //Make it stop moving!
                asp.ChangeDestination(asp.m_currentposition);
            }
        }

        private void HandleNewAspirants()
        {           
            for (int i = 0; i < m_aspiringSacrifices.Count; )
            {
                //Checks if the cube is at builder pos, if so EAT IT!!! 
                if (m_aspiringSacrifices[i].m_currentposition == m_builder.m_currentposition)
                {                    
                    m_aspiringSacrifices[i].m_exists = false;
                    //Removes the builder from unit list so it can't be seen or targeted, also doesn't remove the supply it was worth
                    m_player.RemoveWorkerTemporarily(m_aspiringSacrifices[i]);
                    //Sets position when adding, so it's not neccesarily to do it later possibly
                    m_aspiringSacrifices[i].m_currentposition = GetSpawnPosition();
                    //changed destination so it doesn't move if it becomes visible again
                    m_aspiringSacrifices[i].ChangeDestination(m_aspiringSacrifices[i].m_currentposition);

                    //Adds the sacrifice to the sacrifice list!
                    m_sacrifices.Add(m_aspiringSacrifices[i]);

                    //Remove it from aspiring sacrifice list as it's now a true sacrifice!
                    m_aspiringSacrifices.RemoveAt(i);
                }//if the unit died, or wanted to move elsewhere!  Potentially you can be a sacrifice and a builder in building object but once you 'start' building at the building object
                //existance is false, so should be removed frm there then!
                else if (!m_aspiringSacrifices[i].m_exists || !m_aspiringSacrifices[i].m_alive || m_aspiringSacrifices[i].m_thingState != ThingState.Building)
                {
                    m_aspiringSacrifices.RemoveAt(i);
                }
                else
                {
                    i++;
                }
            }                       
        }

        public int GetAspiringSacrificeCount()
        {
            return m_aspiringSacrifices.Count;
        }

        public void AddSacrifice(Thing a_sacrifice) 
        {
            if (!m_aspiringSacrifices.Contains(a_sacrifice) && a_sacrifice.m_type == ThingType.C_Cube)
            {
                //Pushes in the waypoint into the builder without blocked tiles problems 
                a_sacrifice.AddDestination(m_builder.m_currentposition);

                //Sets the state to building so it can check the state, if for example a unit wants to move elsewhere it's automatically removed from the aspiring list!
                a_sacrifice.m_thingState = ThingState.Building;

                m_aspiringSacrifices.Add(a_sacrifice);
            }
        }

        public void RemoveSacrifice() 
        {          
            if (m_sacrifices.Count > 0)
            {
                //Has to remove the supply because AddReadyThing() readds it and the unitpower
                m_player.RemoveSupply(m_sacrifices[0].m_supplyValue);
                m_player.RemoveUnitPower(m_sacrifices[0].m_type);

                m_sacrifices[0].m_exists = true;
                
                m_player.AddReadyThing(m_sacrifices[0], null);

                m_sacrifices.RemoveAt(0);
            }            
        }

        public void RemoveAllSacrifices() 
        {
            m_player.RemoveSupply(m_sacrifices.Count);
            if (m_sacrifices.Count > 0)
            {
                m_player.RemoveUnitPower(m_sacrifices[0].m_type, m_sacrifices.Count);

                foreach (Thing sacrifice in m_sacrifices)
                {
                    sacrifice.m_exists = true;
                    m_player.AddReadyThing(sacrifice, null);
                }
            }
            //was a fun bug earlier that double added units making them move faaast e.t.c. ! 
            m_sacrifices.Clear();
        }

        public int GetSacrificeCount()
        {
            return m_sacrifices.Count;
        }

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
            return Vector3.Zero;
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
                spawnPos.Y = m_builder.m_currentposition.Y - m_builder.m_size.Y * 0.5f - m_currentBuildingThing.m_size.Y * 0.5f;
                spawnPos.Z = m_map.m_tiles[(int)spawnPos.X,(int)spawnPos.Y].m_height;
            }
            else
            {   
                spawnPos.X = m_builder.m_currentposition.X - m_builder.m_size.X * 0.5f + 0.5f;
                spawnPos.Y = m_builder.m_currentposition.Y - m_builder.m_size.Y * 0.5f - 0.5f;
                spawnPos.Z = m_map.m_tiles[(int)spawnPos.X, (int)spawnPos.Y].m_height;
            }           

            return spawnPos;
        }
    }
}
