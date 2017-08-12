using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ModelClasses.WorldObjects;

namespace Cubes_are_acute.ModelClasses.Units.Cubes
{
    [Serializable]
    class Extractor : Thing
    {
        const int SupplyValue = 0;
        const int Price = 15;
        const float BuildTime = 40f;

        public SoL m_SoL;

        /// <summary>
        /// Used by Assets so it can initialize it. to copy data from.
        ///</summary>
        public Extractor(byte a_id,Model a_model, int a_hp, int a_maxHP,  Vector3 a_position, addUnderAttackPosition a_function)
            : base(a_id, a_model, false,a_hp, a_maxHP, a_position, BuildTime,SupplyValue,Price , a_function)
        {
            m_type = ThingType.C_Extractor;

            m_size = new Vector3(3);

            m_actionbox[0, 2] = new ObjectAction("Cancel",
                                                 "Cancels the building from being built and returns ~75% of resources",
                                                 Microsoft.Xna.Framework.Input.Keys.Escape,
                                                 ObjectAction.Type.Instant,
                                                 CancelFunction);           
        }

        public Extractor(byte a_id, Model a_model, int a_hp, int a_maxHP, Vector3 a_position, SoL a_SoL, addUnderAttackPosition a_Function)
            : this (a_id, a_model, a_hp,a_maxHP,a_position , a_Function)
        {
            SetSoL(a_SoL);
        }

        public void SetSoL(SoL a_sol)
        {
            m_SoL = a_sol;
            m_SoL.TakeSoL();            
        }


        public override void SpawnMe(Player a_player, Map a_map, PathFinder a_pathfinder)
        {

            m_buildBehavior = BehaviorInterfaces.BuildFactory.CreateNewCSBuilder(a_player, this, m_SoL, a_map, a_pathfinder);
            m_buildBehavior.AddToBuildQueue(ThingType.C_Cube);

            //removes the cancel action box
            m_actionbox[0, 2] = new ObjectAction();

            //Reason for not Setting THe building on map here is that this is when it's finished building, not started being built!

            //Mai cool exception is gone :( /Tiger
            
        }

        public override void RemoveMe(Player a_player,Map a_map)
        {            
            m_SoL.FreeSoL();
            

            Rectangle f_rect = MathGameHelper.GetAreaRectangle(ref m_currentposition, ref m_size);

            a_map.RemoveBuildingOnMap(ref f_rect);

            if (m_thingState != ThingState.BeingBuilt)
            {
                m_buildBehavior.Destroyed();
            }

        }

        public void Cancel(Player a_player,Map a_map)
        {                        
            foreach (BuildingObject bo in a_player.m_buildObjects)
            {
                if (bo.m_object == this)
                {
                    bo.CancelBuild(a_player,a_map);
                    break;
                }
            }            

            m_SoL.FreeSoL();
            m_SoL = null;
        }


        public void CancelFunction(Game a_game, Vector3 a_point)
        {
            Player f_owner = a_game.GetPlayerByID(m_ownerID);

            Cancel(f_owner, a_game.m_map);
        }
    }
}
