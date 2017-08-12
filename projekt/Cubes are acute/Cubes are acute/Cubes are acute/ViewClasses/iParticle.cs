using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ViewClasses
{
    interface iParticles
    {
        void CreateOddys(Vector3 a_startPosition, ref Vector3 a_endPosition);
    }
}
