using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.WorldObjects;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.Units
{
    [Serializable]
    class BuildingObject
    {

        /// <summary>
        /// The object that is being built
        /// </summary>
        public Thing m_object;

        public WorldObject m_worldObject;

        public List<Thing> m_builders = null;

        public int[] m_builderPathLengths = null;

        public bool m_isBuilding = false;

        /// <summary>
        /// True if canceled, false otherwise
        /// </summary>
        public bool m_cancelled = false;

        public bool m_deleteMe = false;
        
        public BuildingObject(Thing a_object, WorldObject a_worldObject)
        {
            m_object = a_object;
            m_worldObject = a_worldObject;
        }

        public BuildingObject(Thing a_object, WorldObject a_worldObject, Thing a_builder,int a_pathLength)
            : this(a_object, a_worldObject)
        {
            if (a_builder != null)
            {
                m_builders = new List<Thing>(m_object.m_price);
                m_builderPathLengths = new int[m_object.m_price];

                AddBuilder(a_builder,a_pathLength);
            }
        }

        public bool AddBuilder(Thing a_builder,int a_pathLength)
        {
            if (a_builder != null)
            {                

                //If the builder list isn't full
                if (m_builders.Count < m_object.m_price)
                {
                    //Then first check if it's completly empty
                    if (m_builders.Count == 0)
                    {
                        //Add the path & builder
                        m_builderPathLengths[0] = a_pathLength;
                        m_builders.Add(a_builder);

                        //return true that the add was succesful!
                        return true;
                    }

                    if (m_builders.Contains(a_builder))
                    {
                        return false;
                    }

                    for (int i = 0; i < m_builders.Count; i++)
                    {                       

                        //checks if path length is shorter than pathLength at this index
                        if (a_pathLength < m_builderPathLengths[i])
                        {
                            //Swap & Pushes older positions further
                            SwapPositions(i, a_builder, a_pathLength);
                            return true;
                        }
                    }

                    //If the path wasn't shorter than anyone elses it will add the list & path value at the end of the array 
                    m_builderPathLengths[m_builders.Count] = a_pathLength;
                    m_builders.Add(a_builder);
                    

                    return true;
                }//If there's enough builders building!
                else
                {
                    //Checks if the builder already exists somehow! if it doesn't, then!! 
                    if (!m_builders.Contains(a_builder))
                    {
                        for (int i = 0; i < m_builders.Count; i++)
                        {
                            //Checks if the builder already exists, no duplicates here!


                            if (a_pathLength < m_builderPathLengths[i])
                            {
                                SwapPositions(i, a_builder, a_pathLength);
                                return true;
                            }
                        }
                    }                      
                }
                
            }//end of if builder != null

            return false;
        }

        private void SwapPositions(int a_index,Thing a_builder ,int a_pathLength)
        {
            //Temporarily stores the length & builder of the 'old' value as it pushes in the new value.
            int f_tempLength = m_builderPathLengths[a_index];
            m_builderPathLengths[a_index] = a_pathLength;

            Thing f_tempBuilder = m_builders[a_index];
            m_builders[a_index] = a_builder;

            //Then pluses index 1 
            a_index++;

            //If index isn't at the aboslute end of the array & list
            if (a_index < m_object.m_price)
            {

                for (int i = a_index; i < m_object.m_price; i++)
                {
                    //if the entry at beginning of function was at the edge of building list yet not at the absolute max, it will add the old values thus extending the list 
                    if (i >= m_builders.Count)
                    {
                        m_builderPathLengths[a_index] = f_tempLength;
                        m_builders.Add(f_tempBuilder);
                        break;
                    }

                    //If the index isn't at the soft end of list it will start to push other lengths & builders further back in the list

                    int f_tempLength2 = m_builderPathLengths[i];
                    Thing f_tempBuilder2 = m_builders[i];

                    m_builderPathLengths[i] = f_tempLength;
                    m_builders[i] = f_tempBuilder;

                    f_tempLength = f_tempLength2;
                    f_tempBuilder = f_tempBuilder2;

                    //If at the aboslute end it will Set the builder that was 'knocked out' to stop moving!
                    if (i == m_object.m_price - 1)
                    {
                        f_tempBuilder2.ChangeDestination(f_tempBuilder2.m_currentposition);
                    }
                }

            }//If you're at the absolute end of array
            else
            {
                //Gotta set the 'knocked out builders' destination to itself so it stops moving :p
                f_tempBuilder.ChangeDestination(f_tempBuilder.m_currentposition);
            }
            
        }

        /// <summary>
        /// If it returns true it tells Player to remove me, by making m_deleteMe = true
        /// </summary>               
        public bool DoBuildStuff(Player a_player, Map a_map, PathFinder a_pathfinder, float a_elapsedTime)
        {            
            //If not cancelled proceed to build stuff
            if (!m_cancelled)
            {
                //If object is not finished building
                if (m_object.m_thingState == ThingState.BeingBuilt && !m_deleteMe)
                {
                    //If this object isn't being built it needs to check if builders are close enough e.t.c.!
                    if (!m_isBuilding)
                    {
                        //If there are no builders there's no need to check they are all within range
                        if (m_builders != null)
                        {
                            //Checks builder states, like 1 died or stopped moving e.t.c. thus canceling the build
                            CheckBuilderStates();

                            //Has to have the same amount of builders as the price
                            if (m_builders.Count == m_object.m_price && !m_cancelled)
                            {
                                //Sets that everyone is in range to start with
                                bool m_everyoneInRange = true;

                                //Loops through all builders to check if they are out of range, if they are m_everyoneINrange is set to false
                                foreach (Thing builder in m_builders)
                                {                                   
                                    if ((builder.m_currentposition - m_object.m_currentposition).LengthSquared() > builder.m_buildBehavior.GetBuildRangeSquared())
                                    {
                                        m_everyoneInRange = false;
                                    }
                                }

                                //If everyone happened to be in range, the building shall be built! 
                                if (m_everyoneInRange)
                                {
                                    Rectangle f_buildArea = MathGameHelper.GetAreaRectangle(m_object.m_currentposition, m_object.m_size);

                                    //Checks if can build there, could be that someone else managed to build before ^_^
                                    if (CanBuildThere(a_map, ref f_buildArea))
                                    {
                                        if (!m_object.m_isUnit)
                                        {
                                            a_map.AddBuildingOnMap(ref f_buildArea);
                                        }
                                        //Sets existance to false so player will remove the builders from the game but the reference will live on in the BuildingObject 
                                        //until it's finished building incase of cancelled building or similar
                                        foreach (Thing builder in m_builders)
                                        {
                                            builder.m_exists = false;
                                        }
                                        m_isBuilding = true;
                                    }//if you can't build there , like another builder was faster it will cancel the building object
                                    else
                                    {
                                        m_cancelled = true;                                            
                                    }
                                }
                            }
                        }//If there is no builder the object will start building! as there's no need to check for logics there!
                        else
                        {
                            Rectangle f_buildArea = MathGameHelper.GetAreaRectangle(m_object.m_currentposition, m_object.m_size);

                            if (CanBuildThere(a_map, ref f_buildArea))
                            {
                                if (!m_object.m_isUnit)
                                {
                                    a_map.AddBuildingOnMap(ref f_buildArea);
                                }

                                m_isBuilding = true;
                            }
                            else
                            {
                                m_cancelled = true;                                                               
                            }
                        }

                        return false;
                    }//If m_isBuilding = true
                    else
                    {
                        if (m_object.m_exists && m_object.m_alive)
                        {
                            //Builds the object and when it's finished the m_object.State will change from beingbuilt to something else
                            if (m_object.BuildMe(a_elapsedTime)) 
                            {
                                //One might think you should tell m_builders to clear itself, but the reference to the builders will disappear once this buildingObject disappears
                                //So no need to do so!

                                //Set the interfaces and then return true so player will remove this buildingobject
                                m_object.SpawnMe(a_player, a_map, a_pathfinder);
                                //Removes the supply object was taking up because AddReadyThing will add the supply back
                                //NOTE: No need to worry about unitPower here cause it never added unitpower in a faked way here
                                a_player.RemoveSupply(m_object.m_supplyValue);

                                a_player.AddReadyThing(m_object, null);
                                if (m_builders != null)
                                {
                                    m_builders.Clear();
                                }

                                return true;
                            }                            

                        }//The building was killed 
                        else
                        {
                            DestroyBuild(a_map,a_player);
                            //returns true to tell buildingObject list to delete me! 
                            return true;
                        }
                    }

                    return false;
                }//If m_delete == true or the state isn't beingBuilt anymore somehow           
                else
                {                     
                    return true;
                }
            }//If m_cancelled = true
            else
            {
                if (m_builders != null)
                {
                    ///<Summary>
                    /// This part makes it so that builders that's inside a blocked area gets moved to a none-blocked area so they can be used again.
                    /// As example 2 different builder groups build at same area and the builders that can't build there gets trapped inside the blocked tiles.
                    /// So This part makes them if possible move through pathfinder to the position, if that's not possible forcefully move them ignoring tiles completly
                    /// Towards the 'spawn position' of the object (bottom left corner)
                    ///</Summary>

                    //The area of m_object
                    Rectangle f_area = MathGameHelper.GetAreaRectangle(ref m_object.m_currentposition,ref m_object.m_size);                    

                    //Loops through each builder
                    foreach (Thing builder in m_builders)
                    {                       

                        //Creates a new point 
                        Point f_point = new Point((int)builder.m_currentposition.X, (int)builder.m_currentposition.Y);

                        //Checks if the builder is inside the blocked tile area
                        if (f_area.Contains(f_point))
                        {
                            //If it is, get the destination point (lower left corner)
                            Vector3 f_destinationPoint = new Vector3(m_object.m_currentposition.X - m_object.m_size.X * 0.5f
                                , m_object.m_currentposition.Y - m_object.m_size.Y * 0.5f
                                , m_object.m_currentposition.Z);

                            //Try to find path there!
                            if (a_pathfinder.FindPath(builder.m_currentposition, f_destinationPoint) == 1)
                            {
                                builder.ChangeDestination(a_pathfinder.m_pathList);
                            }
                            else
                            {
                                builder.m_currentposition = f_destinationPoint;
                                builder.ChangeDestination(builder.m_currentposition);

                                /* Possible BAKA code!
                                 * Vector3 f_tempPos = builder.m_currentposition;
                                builder.m_currentposition = f_destinationPoint;

                                if (a_pathfinder.FindPath(builder.m_currentposition, f_destinationPoint) == 1)
                                {
                                    builder.ChangeDestination(a_pathfinder.m_pathList);
                                }
                                else
                                {
                                    builder.m_currentposition = f_tempPos;
                                    builder.ChangeDestination(builder.m_currentposition);
                                }*/
                            }
                        }//If the builder isn't inside the m_object area, just stop moving! 
                        else
                        {
                            builder.ChangeDestination(builder.m_currentposition);
                        }
                        
                        
                    }
                }

                //As the object is canceled, it should cease to exist
                m_object.m_exists = false;
                return true;
            }
        }

        /// <summary>
        /// Checks if their state has changed, like you moved 1 of the workers thus canceling the build
        /// </summary>
        private void CheckBuilderStates()
        {            
            foreach (Thing builder in m_builders)
            {
                if ((builder.m_thingState != ThingState.Building && builder.m_thingState != ThingState.Idle) || !builder.m_alive || !builder.m_exists)
                {
                    m_cancelled = true;
                }                
            }
        }

        /// <summary>
        /// Checks if it's possible to build there before starting the build
        /// </summary>       
        private bool CanBuildThere(Map a_map,ref Rectangle a_buildArea)
        {
                //If the object is a building
                if (!m_object.m_isUnit)
                {
                    //If world object isn't null
                    if (m_worldObject != null)
                    {
                        //Check that someone didn't take it before 'me'
                        if (m_worldObject.m_taken)
                        {
                            return false;
                        }

                    }

                    //Then check if the area is buildable, 
                    if (!a_map.AreaBuildable(ref a_buildArea,a_map.m_tiles[(int)m_object.m_currentposition.X,(int)m_object.m_currentposition.Y].m_height))
                    {
                        return false;
                    }
                }

                switch (m_object.m_type)
                {                    
                    case ThingType.C_Extractor:
                        //Later should check something else that defines their collision type or something .. like a unit will spawn as close to a building as possible e.t.c.                        
                        if (m_worldObject != null)
                        {
                            //Check that the world object is correct type and not taken!
                            if (m_worldObject.m_type == WorldObjectType.SoL)
                            {
                                (m_object as Units.Cubes.Extractor).SetSoL(m_worldObject as SoL);
                                return true;
                            }
                        }                        

                        return false;
                    default:
                        return true;
                    
                }
            //return false;
        }

        /// <summary>
        /// User canceled the build, meaning user will be refunded some of the resources used to build the structure / something else.
        /// </summary>        
        public void CancelBuild(Player a_player,Map a_map)
        {
            MathGameHelper.RestoreXPercentUnits(m_builders, a_player, 0.25f);

            Rectangle f_buildArea = MathGameHelper.GetAreaRectangle(ref m_object.m_currentposition, ref m_object.m_size);

            //Also removes the blocked tiles from the building
            a_map.RemoveBuildingOnMap(ref f_buildArea);            

            m_cancelled = true;
        }

        /// <summary>
        /// Is called if the building is destroyed while being built.
        /// </summary>       
        public void DestroyBuild(Map a_map,Player a_player)
        {
            m_cancelled = true;
            m_object.RemoveMe(a_player,a_map);            
        }

        /// <summary>
        /// Takes a unit that stopped moving by the stop command , if the unit is in the builder list the whole building object fails
        /// </summary>        
        public void PossibleCancel(Thing a_thing)
        {
            foreach (Thing builder in m_builders)
            {
                if (builder == a_thing)
                {
                    m_cancelled = true;
                    break;
                }
            }
        }
    }
}
