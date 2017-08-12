using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    class MovementFactory
    {
        public static StandardMovement m_standardMovement = new StandardMovement();

        public static ParticleStandardMovement m_particleStandardMovement = new ParticleStandardMovement();

    }
}
