using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.Units.Cubes;
using Cubes_are_acute.ModelClasses.WorldObjects;

namespace Cubes_are_acute.ModelClasses
{
    public enum Races
    {
        Cubes,
        Spheres
    }

    [Serializable]
    class Player
    {
        public byte m_playerID;

        public Races m_race;
        
        /// <summary>
        /// This is a list of things that's being built that's visible
        /// </summary>
        public List<BuildingObject> m_buildObjects = new List<BuildingObject>();

        /// <summary>
        /// This is a list of 'buildings' that can build things that's not visible until it's finished or similar stuff. Like a barrack!
        /// It's here to not loop through every single building & unit, as supply buildings e.t.c. can't build! 
        /// </summary>
        public List<Thing> m_thingBuilders = new List<Thing>();

        //This list contains the created units
        public List<Thing> m_units = new List<Thing>();

        public List<Thing> m_buildings = new List<Thing>();

        //This list will hold if a specifik unit has been selected
        public List<Thing> m_selectedThings = new List<Thing>();

        public List<Vector3> m_underAttackPositions = new List<Vector3>();

        public bool m_surrendered = false;//not actually implemented yet

        /// <summary>
        /// A possible selected world object
        /// </summary>
        public WorldObjects.WorldObject m_selectedWorldObject;
          
        //This unit is the one that the HUD will show
        public Thing m_focusedTarget;        

        public CubesAssets m_thingsAssets;

        private int m_currentSupply;
        private int m_currentMaxSupply;

        public int m_selectedWorkers = 0;

        public int m_unitPower = 0;

        public const int AbsoluteMaxSupply = 200;

        /// <summary>
        /// Only used by gameview, to know if it should draw BuildGrid or not
        /// </summary>
        public bool m_tryingToBuild = false;

        private bool m_canExecuteAction = true;

        //Attributes

        public int CurrentSupply
        {
            get { return m_currentSupply; }
            set
            {
                m_currentSupply = value;                
            }
        }

        public int CurrentMaxSupply
        {
            get { return m_currentMaxSupply; }
            set
            {
                m_currentMaxSupply = value;

                if (m_currentMaxSupply > AbsoluteMaxSupply)
                {
                    m_currentMaxSupply = AbsoluteMaxSupply;
                }
                else if (m_currentMaxSupply < 0)
                {
                    m_currentMaxSupply = 0;
                }
            }
        }
        
        //Later on, add struct where it takes the race
        public Player(byte a_id, ViewClasses.GameAssets a_assets, Map a_map, PathFinder a_pathfinder)
        {
            m_playerID = a_id;
            m_race = Races.Cubes;

            m_thingsAssets = new CubesAssets(this, a_assets, a_map, a_pathfinder);

            CurrentMaxSupply = 10;
            CurrentSupply = 0;            
        }

        public void AddUnderAttackPosition(Vector3 a_position)
        {
            //To come.. some kind of validation, is position area previously under some kind of attack .. discard the position
            //So this is just for now! Adios piña colada!
            m_underAttackPositions.Add(a_position);

            //It's just here to not cause crashes of 'out of memory... !' As the player doesn't handle it in any way! 
            if (m_playerID == 0)
            {
                m_underAttackPositions.Clear();
            }
        }
        

        /// <summary>
        /// Updates the visible things that's being build on the map, like a building .. like an extractor e.t.c.
        /// </summary>
        public void UpdateBuildObjectStatus(float a_elapsedTime, Map a_map, PathFinder a_pathfinder)
        {
            for (int i = 0; i < m_buildObjects.Count;i++)
            {
                if (m_buildObjects[i].DoBuildStuff(this, a_map, a_pathfinder, a_elapsedTime))
                {
                    m_buildObjects[i].m_deleteMe = true;
                }               
            }            
        }

        /// <summary>
        /// Updateds the 'building stuff, like a barrack building units
        /// </summary>
        public void UpdateThingBuilders(float a_elapsedTime)
        {
            foreach (Thing thingBuilder in m_thingBuilders)
	        {
                thingBuilder.m_buildBehavior.DoBuildBehavior(a_elapsedTime);
	        }                           
        }

        /// <summary>
        /// If player can add the building / unit 
        /// </summary>        
        public bool CanAddUnit(Thing a_thing)
        {
            if (a_thing != null)
            {
                //if the supply of thing + currentsupply isn't greater than the current max supply
                if (a_thing.m_supplyValue + CurrentSupply <= CurrentMaxSupply)
                {
                    return true;
                }
            }

            return false;
        }

        public void AddThingBuilder(Thing a_builder)
        {
            m_thingBuilders.Add(a_builder);
        }            

        /// <summary>
        /// Adds a visible thing that is being built. Like a building or a unit that you can select while it's being built.
        ///<param name="a_Isunit">True if it's a unit, false if it's a building</param>
        /// </summary>        
        public void AddVisibleThing(Thing a_thing, Thing a_builder, WorldObject a_worldObject,int a_pathLength)
        {
            //if player can add it to it's ranks!
            if (CanAddUnit(a_thing))
            {                         
                BuildingObject f_bo = new BuildingObject(a_thing, a_worldObject ,a_builder, a_pathLength);

                m_buildObjects.Add(f_bo);

                //Adds the supply so that's up to date!
                AddSupply(a_thing.m_supplyValue);
                AddUnitPower(a_thing.m_type);                
            }
            
        }
        
        /// <summary>
        /// Adds a unit that doesn't need to be built as it's already ready!!  
        /// </summary>
        ///<param name="a_Isunit">True if it's a unit, false if it's a building</param>
        /// <remarks>Another way around this is to add the unit to visible function and set the build timer to required timer
        /// and then it gets finished instantly</remarks>
        public void AddReadyThing(Thing a_thing, List<Vector3> a_newDestination)
        {
            //if possible to add!! 
            //if (CanAddUnit(a_thing))  REASON FOR REMOVAL: If you want to add something ready, then it hsould be added no matter supply, like sacrifices e.t.c.!
            //{            
            if (a_newDestination != null)
            {  
                foreach(Vector3 destination in a_newDestination)
                {
                    //set destination(s)
                    a_thing.AddDestination(destination);
                }
            }

            //checks type to know which list to add it to
            if (a_thing.m_isUnit)
            {
                    
                m_units.Add(a_thing);
            }
            else
            {
                m_buildings.Add(a_thing);
            }

            AddUnitPower(a_thing.m_type);
            AddSupply(a_thing.m_supplyValue);
            //}
        }

        /// <summary>
        /// Tries to create a new unit/building at a certain place. Like a building, 
        /// </summary>
        /// <remarks>It's bit outdated as it was made a long time ago but it's still pretty ok!</remarks>
        public bool TryToCreateNewUnit(Thing a_thing,Thing a_builder,Map a_map,WorldObject a_worldObject,int a_pathLength)
        {
            bool f_alreadyExistsOne = false;

            if (a_thing.m_isUnit)
            {
                AddVisibleThing(a_thing, null,null,0);
                return true;
            }
            else
            {
                foreach (BuildingObject bo in m_buildObjects)
                {
                    //assumes it's the same object that's being tried to build
                    if (bo.m_object.m_currentposition == a_thing.m_currentposition)
                    {
                        //tries to add the builder to this buildingObject
                        return bo.AddBuilder(a_builder, a_pathLength);
                    }
                }

                if (!f_alreadyExistsOne)
                {
                    AddVisibleThing(a_thing, a_builder, a_worldObject, a_pathLength);
                    return true;
                }
                
            }
            return false;    
        }

        /// <summary>
        /// Adds supply from some source, for instance a building that is building a unit that can't be seen or selected or handled in any way but has to count in supply
        /// </summary>        
        public void AddSupply(int a_supplyValue)
        {
            CurrentSupply += a_supplyValue;
        }   

        /// <summary>
        /// Removes supply from some source, for instance a building that is building a unit that can't be seen or selected or handled in any way but has to count in supply
        /// </summary>        
        public void RemoveSupply(int a_supplyValue)
        {            
            CurrentSupply -= a_supplyValue;            
        }

        public void AddUnitPower(ThingType a_type)
        {
            m_unitPower += m_thingsAssets.GetUnitPower(a_type);
        }

        public void RemoveUnitPower(ThingType a_type)
        {
            m_unitPower -= m_thingsAssets.GetUnitPower(a_type);
        }

        public void RemoveUnitPower(ThingType a_type, int a_multiplier)
        {
            m_unitPower -= m_thingsAssets.GetUnitPower(a_type) * a_multiplier;
        }

        public void RemoveThingBuilder(Thing a_thingBuilder)
        {
            m_thingBuilders.Remove(a_thingBuilder);
        }

        /// <summary>
        /// Removes a Cube or Sphere possibly temporarily from the unit list as it enters a building. 
        /// </summary>        
        public void RemoveWorkerTemporarily(Thing a_builder)
        {
            if (a_builder.m_type == ThingType.C_Cube)
            {                
                m_units.Remove(a_builder);                
            }
        }

        public void Surrender(Map a_map)
        {
            m_surrendered = true;

            //Loops through everything to make it not exist anymore

            foreach (Thing unit in m_units)
            {
                unit.m_exists = false;
            }

            foreach (Thing building in m_buildings)
            {
                building.m_exists = false;
            }

            foreach (BuildingObject bo in m_buildObjects)
            {
                bo.m_object.m_exists = false;
                if (bo.m_isBuilding)
                {
                    bo.DestroyBuild(a_map, this);
                }
            }
        }


        public void SetAttackTarget(Thing a_attackTarget)
        {
            foreach (Thing selectedThing in m_selectedThings)
            {
                if (selectedThing.m_attackBehavior != null)
                {
                    selectedThing.m_attackBehavior.SetTarget(a_attackTarget);
                }
            }

        }


        public void SetHoldPosition()
        {
            m_canExecuteAction = true;

            if (m_selectedThings.Count == 1)
            {
                if (m_playerID != m_selectedThings[0].m_ownerID)
                {
                    m_canExecuteAction = false;
                }
            }
            if (m_canExecuteAction)
            {
                foreach (Unit unit in m_selectedThings)
                {
                    unit.Hold();
                }
            }
        }

        public void SetStop()
        {
            m_canExecuteAction = true;

            if (m_selectedThings.Count == 1)
            {
                if (m_playerID != m_selectedThings[0].m_ownerID)
                {
                    m_canExecuteAction = false;
                }
            }
            if (m_canExecuteAction)
            {
                foreach (Unit unit in m_selectedThings)
                {
                    unit.Stop();
                    foreach (BuildingObject bo in m_buildObjects)
                    {
                        if (!bo.m_cancelled)
                        {
                            bo.PossibleCancel(unit as Thing);
                        }
                    }
                }
            }
        }
    }
}
