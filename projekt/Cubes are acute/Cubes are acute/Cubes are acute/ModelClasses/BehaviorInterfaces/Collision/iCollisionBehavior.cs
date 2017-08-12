using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    interface iCollisionBehavior
    {

        bool IsCollidingAt(ref Vector3 a_position,ref Rectangle a_size,Map a_map);
    }
}
