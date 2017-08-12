using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ModelClasses.BehaviorInterfaces;

namespace Cubes_are_acute.ModelClasses.Units
{
    /// <summary>
    /// All thing types should be in this list
    /// </summary>
    public enum ThingType
    {        
        C_Cube,
        C_Barbarian,
        C_Extractor,
        C_Igloo,
        C_Barrack
    }

    public enum ThingState
    {
        //When the thing is just idling
        Idle,
        //When thing is moving towards a destination
        Moving,
        //When thing is standing still and attacking
        Attacking,
        //When target is Moving after an enemy but not attacking but will attack as soon as enemy is in range
        Chasing,
        //When target is on hold, will only attack enemies in attack range but not chase
        Hold,
        //When enemy is moving but also seeking for enemies as it's moving towards destination
        Hunting,
        //When thing is moving towards destination trying to build
        Building,
        //While the thing is being built 
        BeingBuilt
    }

    [Serializable]
    class Thing
    {
        /// <summary>
        /// The player ID that is the owner
        /// </summary>
        public byte m_ownerID;
        /// <summary>
        /// The thing's type
        /// </summary>
        public ThingType m_type;
        /// <summary>
        /// The thing's model
        /// </summary>      
        [NonSerialized] public Model m_model;        

        /// <summary>
        /// True if it's a unit, false if it's building
        /// </summary>
        public bool m_isUnit;

        /// <summary>
        /// Is this thing alive? If this is false, the thing will probably cease to exist very soon
        /// </summary>
        public bool m_alive;
        /// <summary>
        /// If the thing exists? To be or not to be, that's the thing. (When this is false the thing could be removed from the game)
        /// </summary>
        public bool m_exists;
        /// <summary>
        /// All things has HP.
        /// </summary>
        private int m_hp;
        /// <summary>
        /// The maximum amount of HP.
        /// </summary>
        public int m_maxHP;

        public delegate void addUnderAttackPosition(Vector3 a_pos);

        public addUnderAttackPosition m_underAttackFunction = null;

        public float m_HPhealFactor;
        private float m_hpBuffer = 0;

        public iAttackBehavior m_attackBehavior = null;

        /// <summary>
        /// The state of the thing.
        /// </summary>
        public ThingState m_thingState;
        /// <summary>
        /// The thing's destination(s). (Used to move)
        /// </summary>
        public List<Vector3> m_destination = new List<Vector3>();
        /// <summary>
        /// The thing's speed.
        /// </summary>
        public float m_speed;
        /// <summary>
        /// The movement behavior.
        /// </summary>
        public iMoveBehavior m_moveBehavior = null;        
        /// <summary>
        /// The thing's position.
        /// </summary>
        public Vector3 m_currentposition;
        /// <summary>
        /// The thing's size. 
        /// </summary>
        public Vector3 m_size;        
        /// <summary>
        /// How much the thing costs in supply
        /// </summary>
        public int m_supplyValue;

        public int m_price;

        /// <summary>
        /// How much time this unit has been built so far
        /// </summary>
        public float m_builtTimer = 0;

        /// <summary>
        /// The time this thing required to be built before it's finished
        /// </summary>
        public float m_requiredBuildTime;

        public iBuildBehavior m_buildBehavior = null;

        /// <summary>
        /// The thing's ObjectActions (used by HUD)
        /// </summary>
        public ObjectAction[,] m_actionbox = new ObjectAction[3, 3];

        /// <summary>
        /// If HP is 0 or below m_alive sets to false. (Should be used instead of m_hp)
        /// </summary>
        public int HP
        {
            get { return m_hp; }
            
            set
            {
                m_hp = value;
                if (m_hp <= 0)
                {
                    m_alive = false;
                    m_exists = false;
                }
                else if (m_hp > m_maxHP)
                {
                    m_hp = m_maxHP;
                }
            }
        }

        public float HPBuffer
        {
            get { return m_hpBuffer; } 
            set
            {
                m_hpBuffer = value;

                if (m_hpBuffer >= 1)
                {
                    int f_temp = (int)m_hpBuffer;

                    HP += f_temp;

                    //recursive shit, yo
                    HPBuffer -= f_temp;
                }
            }
        }

        public Thing(byte a_id,Model a_model,bool a_IsUnit ,int a_hp,int a_maxHP, Vector3 a_position, float a_buildTime,int a_supplyValue,int a_price,addUnderAttackPosition a_function)
        {            
            m_ownerID = a_id;

            m_isUnit = a_IsUnit;

            m_exists = true;
            m_alive = true;
            m_model = a_model;
            m_maxHP = a_maxHP;
            HP = a_hp;

            m_price = a_price;

            if (a_buildTime > 0)
            {
                m_HPhealFactor = 0.9f * (1 / a_buildTime);
            }
            else
            {
                m_hp = 1;
            }

            m_underAttackFunction = a_function;

            m_thingState = ThingState.BeingBuilt;

            m_currentposition = a_position;          

            m_requiredBuildTime = a_buildTime;

            m_supplyValue = a_supplyValue;
            if (m_supplyValue < 0)
            {
                m_supplyValue = 0;
            }
            
            //initiate actionboxes
            for (int y = 0; y < m_actionbox.GetLength(1); y++)
            {
                for (int x = 0; x < m_actionbox.GetLength(0); x++)
                {
                    m_actionbox[x, y] = new ObjectAction();
                }
            }
        }



        /// <summary>
        /// Damages the unit
        /// </summary>
        /// <param name="a_damage"></param>
        public void TakeDamage(int a_damage)
        {
            HP -= a_damage;

            m_underAttackFunction(m_currentposition);
        }


        /// <summary>
        /// Sets a new destination for the unit to move towards
        /// </summary>        
        public void ChangeDestination(Vector3 a_newDestination)
        {
            if (m_thingState != ThingState.BeingBuilt)
            {
                //change unit state to moving
                m_thingState = ThingState.Moving;

                //clear and enqueue
                m_destination.Clear();
                m_destination.Add(a_newDestination);
            }
            
        }

        public void ChangeDestination(List<Vector3> a_newDestinationList)
        {
            if (m_thingState != ThingState.BeingBuilt)
            {
                //change unit state to moving
                m_thingState = ThingState.Moving;

                //clear and enqueue                
                m_destination = a_newDestinationList;
            }
        }

        /// <summary>
        /// Enqueue a new destination for the unit to move towards
        /// </summary>  
        public void AddDestination(Vector3 a_newDestination)
        {
            if (m_thingState != ThingState.BeingBuilt)
            {
                //change unit state to moving
                m_thingState = ThingState.Moving;

                //enqueue
                m_destination.Add(a_newDestination);
            }
        }

        public Vector3 DequeueDestination()
        {
            Vector3 temp = new Vector3();

            //copy the first on the list
            temp.X = m_destination[0].X;
            temp.Y = m_destination[0].Y;
            temp.Z = m_destination[0].Z;

            //remove the first on the list
            m_destination.RemoveAt(0);

            //return the copy
            return temp;
        }
        
        /// <summary>
        /// Returns true when it's finished being built
        /// </summary>       
        public bool BuildMe(float a_elapsedTime)
        {
            if (m_builtTimer < m_requiredBuildTime)
            {
                //Then timer ticks upwards closer to ze destiny!
                m_builtTimer += a_elapsedTime;
                HPBuffer += m_HPhealFactor * m_maxHP * a_elapsedTime;
                //i++ to continue to next thingy

                return false;
            }
            else
            {
                m_thingState = ThingState.Idle;
                return true;
            }           
        }

        public virtual void SpawnMe(Player a_player, Map a_map, PathFinder a_pathfinder)
        {
            
        }

        public virtual void RemoveMe(Player a_player,Map a_map)
        {

        }      
   
    }
}
