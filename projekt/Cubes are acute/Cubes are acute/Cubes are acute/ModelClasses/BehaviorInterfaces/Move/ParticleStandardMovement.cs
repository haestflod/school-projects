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
    class ParticleStandardMovement : iMoveBehavior
    {
        Vector3 m_distance;
        Vector3 m_newDistance;

        /// <summary>
        /// DO not use. Does not do anything
        /// </summary>        
        public void Move(ref Vector3 a_currentposition, ref Queue<Vector3> a_destination, float a_speed, ref ModelClasses.Units.ThingState a_unitState,float a_elapsedTime)
        {            
        }

        /// <summary>
        /// DO not use. Does not do anything
        /// </summary>        
        public void Move(Thing a_thing, float a_elapsedTime)
        {
        }


        public void Move(ref Vector3 a_currentposition, ref Vector3 a_destination, float a_speed, float a_elapsedTime)
        {            
            //sets distance values, creates the angle the distance vector is pointing at
            m_distance = a_destination - a_currentposition;

            if (m_distance.LengthSquared() != 0)
            {
                //Normalizes so the total Length of vector is 1,  
                m_distance.Normalize();

                //Adds the position and since distance vector is normalized it will always go as fast as the speed
                a_currentposition += m_distance * a_speed * a_elapsedTime;

                //Sets value for the other distance vector, it's to compare the 2 angles.  If the new distance is past the destination
                //It will point opposite direction and the Vector3.Dot will return less than 0 then.
                m_newDistance = a_destination - a_currentposition;

                //if destination is reached
                if (Vector3.Dot(m_distance, m_newDistance) < 0)
                {
                    //Copies the values, not the reference cause the destination is not to be trifled with! as destination is the thingy it's flying towards 
                    //REAL referenced value, incase it moves, projectile follows :p  but if it has reached destination it doesn't copy reference!
                    a_currentposition.X = a_destination.X;
                    a_currentposition.Y = a_destination.Y;
                    a_currentposition.Z = a_destination.Z;
                }
            }
        }
    }
}
