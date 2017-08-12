using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.Units.Cubes
{
    [Serializable]
    class Barrack : Thing
    {
        const int SupplyValue = 0;
        const int Price = 5;
        const float BuildTime = 25.0f;

        public Barrack(byte a_id, Microsoft.Xna.Framework.Graphics.Model a_model, int a_hp, int a_maxHP, Vector3 a_position,addUnderAttackPosition a_function)
            : base (a_id, a_model, false, a_hp,a_maxHP, a_position, BuildTime, SupplyValue, Price,a_function)
        {
            m_type = ThingType.C_Barrack;

            m_size = new Vector3(3,3,2);            

            m_actionbox[0, 2] = new ObjectAction("Cancel",
                                                "Cancels the building from being built and returns ~75% of resources",
                                                Microsoft.Xna.Framework.Input.Keys.Escape,
                                                ObjectAction.Type.Instant, CancelMeFunction);      
        }

        public override void RemoveMe(Player a_player, Map a_map)
        {
            if (m_thingState != ThingState.BeingBuilt)
            {
                m_buildBehavior.Destroyed();
            }

            Rectangle f_rect = MathGameHelper.GetAreaRectangle(ref m_currentposition, ref m_size);

            a_map.RemoveBuildingOnMap(ref f_rect);            
        }

        public override void SpawnMe(Player a_player, Map a_map, PathFinder a_pathfinder)
        {
            m_actionbox[0, 0] = new ObjectAction("Release Worker", "Releases one worker! *poff*",
                                                Microsoft.Xna.Framework.Input.Keys.F,
                                                ObjectAction.Type.Instant, ReleaseWorkerFunction);

            m_actionbox[1, 0] = new ObjectAction("Release all Workers", "Releases all workers in this building",
                                                 Microsoft.Xna.Framework.Input.Keys.D,
                                                 ObjectAction.Type.Instant, ReleaseAllWorkersFunction);


            m_actionbox[0, 2] = new ObjectAction("Barbarian", "Cost:2\nBuild a scared Barbarian *rawr*"
                                                , Microsoft.Xna.Framework.Input.Keys.B
                                                , ObjectAction.Type.Instant, BuildBarbarianFunction);

            m_actionbox[2, 2] = new ObjectAction("Cancel", "Cancel what's currently being built",
                                                Microsoft.Xna.Framework.Input.Keys.Escape,
                                                ObjectAction.Type.Instant, CancelBuildFunction);

            m_buildBehavior = BehaviorInterfaces.BuildFactory.CreateNewStandardBuild(a_player, this, a_map, a_pathfinder);            
        }

        public void CancelMe(Player a_player, Map a_map)
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


        public void CancelMeFunction(Game a_game, Vector3 a_point)
        {
            Player f_owner = a_game.GetPlayerByID(m_ownerID);

            CancelMe(f_owner, a_game.m_map);
        }

        public void BuildBarbarian(Vector3 a_point)
        {
            m_buildBehavior.AddToBuildQueue(ThingType.C_Barbarian);
        }

        public void BuildBarbarianFunction(Game a_game, Vector3 a_point)
        {
            BuildBarbarian(a_point);
        }

        public void ReleaseWorker()
        {
            m_buildBehavior.RemoveSacrifice();
        }

        public void ReleaseWorkerFunction(Game a_game, Vector3 a_point)
        {            
            ReleaseWorker();
        }

        public void ReleaseAllWorkers()
        {
            m_buildBehavior.RemoveAllSacrifices();
        }

        public void ReleaseAllWorkersFunction(Game a_game, Vector3 a_point)
        {
            ReleaseAllWorkers();
        }

        public void CancelBuild()
        {
            m_buildBehavior.CancelBuild();
        }

        public void CancelBuildFunction(Game a_game, Vector3 a_point)
        {
            CancelBuild();
        }
    }
}
