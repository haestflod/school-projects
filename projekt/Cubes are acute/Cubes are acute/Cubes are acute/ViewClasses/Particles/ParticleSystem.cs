using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Cubes_are_acute.ViewClasses
{    
    [Serializable]
    class ParticleSystem
    {
        Particle[] m_particles = new Particle[1000];
        int m_index = 0;             

        [NonSerialized] List<Model> m_projektiles = new List<Model>(10);

        List<Particle> m_activeParticles = new List<Particle>(1000);

        public ParticleSystem(GameAssets a_assets)
        {
            m_projektiles.Add(a_assets.m_projektil);                  

            for (int i = 0; i < m_particles.Length; i++)
            {
                m_particles[i] = new Particle();
            }
        }       

        public List<Particle> GetParticles()
        {
            m_activeParticles.Clear();

            for (int i = 0; i < m_particles.Length; i++)
            {
                if (m_particles[i].IsActive())
                {
                    m_activeParticles.Add(m_particles[i]);
                }
            }

            return m_activeParticles;

        }

        public void CreateProjektile(ref Vector3 a_pos, ref Vector3 a_destination)
        {         
            //Not used for anything really, so it's useless? Probably yes.
            Vector3 f_size = new Vector3(4, 4, 4);

            m_particles[m_index] = new Particle(ref a_pos, ref a_destination, 15, ref f_size, m_projektiles[0], 10, Particle.ParticleType.Projektile);

            m_index++;
            if (m_index >= m_particles.Length)
            {
                m_index = 0;
            }
        }        
               
        public void Update(float a_elapsedTime)
        {
            //Probably useless aswell :p
            //m_totalGameTime += ControllerClasses.MasterController.m_elapsedTime;

            for (int i = 0; i < m_particles.Length; i++)
            {
                if (m_particles[i].IsActive())
                {
                    m_particles[i].UpdateParticle(a_elapsedTime);
                }
            }
        }        
    }
}
