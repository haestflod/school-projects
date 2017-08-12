using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Cubes_are_acute.ModelClasses.Units;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    interface iMoveBehavior
    {
        /// <summary>
        /// Movement typically for a unit or building (a thing!)
        /// </summary>
        void Move(Thing a_thing, float a_elapsedTime);

        /// <summary>
        /// Movement typhically that just needs to move from point a-> b 
        /// </summary>        
        void Move(ref Vector3 a_currentPos, ref Vector3 a_destination, float a_speed, float a_elapsedTime);
    }
}
