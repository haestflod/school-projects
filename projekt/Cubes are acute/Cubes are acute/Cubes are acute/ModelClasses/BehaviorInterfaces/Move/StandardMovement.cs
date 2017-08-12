using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Cubes_are_acute.ControllerClasses;
using Cubes_are_acute.ModelClasses.Units;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    [Serializable]
    class StandardMovement : iMoveBehavior
    {
        /// <summary>
        /// Distance between destination and currentposition
        /// </summary>
        Vector3 m_distance;
        Vector3 m_newDistance;
        //The collision behavior that this movement behavior is using
        iCollisionBehavior m_collisionBehavior = CollisionFactory.m_standardCollision;


        public void Move(Thing a_thing, float a_elapsedTime)
        {

            //Should probably replace this function with A* or some other pathfinding formula later on!
            //distance vector is created, will be 0 if           
            if (a_thing.m_destination.Count > 0)
            {
                //Checks if unit is supposed to move
                if (a_thing.m_thingState == ThingState.Moving || a_thing.m_thingState == ThingState.Chasing || a_thing.m_thingState == ThingState.Hunting || a_thing.m_thingState == ThingState.Building)
                {
                    //sets distance values, creates the angle the distance vector is pointing at
                    m_distance = a_thing.m_destination[0] - a_thing.m_currentposition;

                    if (m_distance.LengthSquared() != 0)
                    {

                        //Normalizes so the total Length of vector is 1,  
                        m_distance.Normalize();

                        //Adds the position and since distance vector is normalized it will always go as fast as the speed
                        a_thing.m_currentposition += m_distance * a_thing.m_speed * a_elapsedTime;

                        //Sets value for the other distance vector, it's to compare the 2 angles.  If the new distance is past the destination
                        //It will point opposite direction and the Vector3.Dot will return less than 0 then.
                        m_newDistance = a_thing.m_destination[0] - a_thing.m_currentposition;

                        //if destination is reached
                        if (Vector3.Dot(m_distance, m_newDistance) < 0)
                        {
                            //dequeue destination
                            a_thing.m_currentposition = a_thing.DequeueDestination();

                            //if final destination is reached
                            if (a_thing.m_destination.Count == 0)
                            {
                                //change unit state to idle
                                if (a_thing.m_thingState != ThingState.Building)
                                {
                                    a_thing.m_thingState = ThingState.Idle;
                                }
                            }
                        }
                    }
                    else
                    {
                        a_thing.m_currentposition = a_thing.DequeueDestination();

                        if (a_thing.m_destination.Count == 0)
                        {
                            //change unit state to idle
                            if (a_thing.m_thingState != ThingState.Building)
                            {
                                a_thing.m_thingState = ThingState.Idle;
                            }

                            
                        }
                    }
                }
            }
        }


        public void Move(ref Vector3 a_currentposition, ref Vector3 a_destination, float a_speed, float a_elapsedTime)
        {
        }
    }
}
