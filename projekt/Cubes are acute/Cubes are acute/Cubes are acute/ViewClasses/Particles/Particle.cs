using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ModelClasses.BehaviorInterfaces;

namespace Cubes_are_acute.ViewClasses
{    
    [Serializable]
    class Particle
    {
        public Vector3 m_position;
        public Vector3 m_destination;     
                
        public Vector3 m_distanceTraveled = new Vector3(0);

        public ParticleType m_type;
        //public Color m_color;        
        [NonSerialized] public Model m_model;
        //every 1 unit is 1 second
        public float m_timeToLive;       

        public float m_speed;

        iMoveBehavior m_moveBehavior = MovementFactory.m_particleStandardMovement;

        /// <summary>
        /// Only used as initilization by ParticleSystem
        /// </summary>
        public Particle()
        {           
            m_timeToLive = -1;
        }
        
        public Particle(ref Vector3 a_position, ref Vector3 a_destination, float a_speed, ref Vector3 a_size, Model a_model, float a_timeToLive, ParticleType a_type)
        {
            m_position = a_position;
            m_destination = a_destination;
            m_speed = a_speed;

            m_type = a_type;
            m_model = a_model;
            m_timeToLive = a_timeToLive;
        }
       

        public virtual void UpdateParticle(float a_elapsedTime)
        {
            m_moveBehavior.Move(ref m_position, ref m_destination, m_speed,a_elapsedTime);
                   
            m_timeToLive -= a_elapsedTime;

            //update live time
            if (m_position == m_destination)
            {
                m_timeToLive = 0;
            }
        }

        public bool IsActive()
        {
            if (m_timeToLive <= 0)
            {
                return false;
            }
            return true;
        }

        public enum ParticleType
        {
            Projektile
        }
    }
}
