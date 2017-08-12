using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.Units
{
    /// <summary>
    /// The supply building for Cubes
    /// </summary>
    [Serializable]    
    class CubeIgloo : Thing
    {
        const int SupplyValue = 0;
        const int Price = 2;
        public const int SupplyIncrement = 8;
        const float BuildTime = 15.0f;        

        public CubeIgloo(byte a_id,Microsoft.Xna.Framework.Graphics.Model a_model,int a_hp,int a_maxHP,Vector3 a_position,addUnderAttackPosition a_function)
            : base(a_id,a_model,false,a_hp,a_maxHP,a_position,BuildTime,SupplyValue,Price , a_function)
        {
            m_type = ThingType.C_Igloo;
            m_size = new Vector3(2);

            //Cancel Function
            m_actionbox[0, 2] = new ObjectAction("Cancel",
                                                 "Cancels the building from being built and returns ~75% of resources",
                                                 Microsoft.Xna.Framework.Input.Keys.Escape,
                                                 ObjectAction.Type.Instant,
                                                 CancelFunction);      
            
        }

        public override void SpawnMe(Player a_player, Map a_map, PathFinder a_pathfinder)
        {
            m_actionbox[0, 2] = new ObjectAction();            

            a_player.CurrentMaxSupply += SupplyIncrement;
        }

        public override void RemoveMe(Player a_player,Map a_map)
        {
            Rectangle f_rect = MathGameHelper.GetAreaRectangle(ref m_currentposition, ref m_size);

            a_map.RemoveBuildingOnMap(ref f_rect);

            a_player.CurrentMaxSupply -= SupplyIncrement;
        }


        public void Cancel(Player a_player, Map a_map)
        {
            foreach (BuildingObject bo in a_player.m_buildObjects)
            {
                if (bo.m_object == this)
                {
                    bo.CancelBuild(a_player, a_map);
                    break;
                }
            }           
        }


        public void CancelFunction(Game a_game, Vector3 a_point)
        {
            Player f_owner = a_game.GetPlayerByID(m_ownerID);
            
            Cancel(f_owner, a_game.m_map);
        }
    }
}
