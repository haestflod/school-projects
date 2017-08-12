using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    class AttackFactory
    {
        public static StandardAttack CreateNewStandardAttack(ModelClasses.Units.Thing a_attacker,float a_attackRate, int a_damage, float a_attackRange)
        {
            return new StandardAttack(a_attacker,a_attackRate, a_damage, a_attackRange);
        }
    }
}
