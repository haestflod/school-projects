using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ViewClasses
{
    class ParticleView
    {
        public void Render(Camera a_camera, ParticleSystem a_pSystem, GameAssets a_assets)
        {           
            foreach (Particle particle in a_pSystem.GetParticles())
            {
                Matrix f_world = a_camera.GetWorldMatrix(particle.m_position);
                
                foreach (ModelMesh mesh in particle.m_model.Meshes)
                {
                    foreach (Effect effect in mesh.Effects)
                    {                       
                        effect.Parameters["World"].SetValue(f_world);
                        effect.Parameters["View"].SetValue(a_camera.m_view);

                        effect.Parameters["PointLight"].SetValue(a_camera.m_cameraPos);
                    }

                    mesh.Draw();
                }                                  
            }                
        }
    }
}
