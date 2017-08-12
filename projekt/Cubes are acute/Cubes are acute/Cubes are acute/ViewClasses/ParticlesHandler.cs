using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ViewClasses
{
    [Serializable]
    class ParticlesHandler : iParticles
    {
        private ParticleSystem m_pSystem;

        public ParticlesHandler(ParticleSystem a_pSystem)
        {
            m_pSystem = a_pSystem;
        }

        //Copies the startposition value but wants the end position as reference so it can move to a moving target,  magic oddys!
        public void CreateOddys(Vector3 a_startPosition, ref Vector3 a_endPosition)
        {
            m_pSystem.CreateProjektile(ref a_startPosition, ref a_endPosition);
        }        
    }
}
