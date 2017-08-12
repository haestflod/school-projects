using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.Units.Cubes
{
    [Serializable]
    class Barbarian : Unit
    {
        const int SupplyValue = 2;
        const int Price = SupplyValue;
        const float BuildTime = 16.0f;

        public Barbarian(byte a_id, Microsoft.Xna.Framework.Graphics.Model a_model, int a_hp, int a_maxHP, Vector3 a_position, float a_speed , addUnderAttackPosition a_function)
            : base(a_id, a_model, true, a_hp, a_maxHP, a_position, a_speed,BuildTime, SupplyValue, Price , a_function)
        {

            m_type = ThingType.C_Barbarian;
            m_size = new Vector3(1);
        }        

        public override void SpawnMe(Player a_player, Map a_map, PathFinder a_pathfinder)
        {
            m_attackBehavior = BehaviorInterfaces.AttackFactory.CreateNewStandardAttack(this,
                                                                                        a_player.m_thingsAssets.m_barbarian.m_attackBehavior.GetAttackRate(),
                                                                                        a_player.m_thingsAssets.m_barbarian.m_attackBehavior.GetDamage(),
                                                                                        a_player.m_thingsAssets.m_barbarian.m_attackBehavior.GetAttackRange());
            m_moveBehavior = a_player.m_thingsAssets.m_barbarian.m_moveBehavior;            
        }                                       
    }
}
