using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    class CollisionFactory
    {
        public static StandardCollision m_standardCollision = new StandardCollision();
    }
}
