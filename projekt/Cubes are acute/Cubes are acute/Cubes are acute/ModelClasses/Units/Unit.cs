using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ViewClasses;
using Cubes_are_acute.ControllerClasses;

namespace Cubes_are_acute.ModelClasses.Units
{      
    [Serializable]
    class Unit : Thing
    {                       
        /// <summary>
        /// The constructor sets a unit m_model, initial m_hp, m_position, m_speed and units m_size.
        /// </summary>
        public Unit(byte a_id, Model a_model, bool a_isUnit, int a_hp, int a_maxHP, Vector3 a_position, float a_speed, float a_buildTime, int a_supplyValue, int a_price,addUnderAttackPosition a_function)
            : base(a_id, a_model, a_isUnit, a_hp, a_maxHP, a_position, a_buildTime, a_supplyValue,a_price,a_function)
        {                               
            m_speed = a_speed;

            //sets basic unit actions
            m_actionbox[0, 0] = new ObjectAction("Move", "Move the unit", Microsoft.Xna.Framework.Input.Keys.M, ObjectAction.Type.Target, MoveFunction);
            m_actionbox[1, 0] = new ObjectAction("Stop", "Stop the unit", Microsoft.Xna.Framework.Input.Keys.S, ObjectAction.Type.Instant, StopFunction);
            m_actionbox[2, 0] = new ObjectAction("Attack", "Attack a target", Microsoft.Xna.Framework.Input.Keys.A, ObjectAction.Type.Target,AttackFunction);

            m_actionbox[0, 1] = new ObjectAction("Hold", "Hold the position", Microsoft.Xna.Framework.Input.Keys.H, ObjectAction.Type.Instant, HoldFunction);            
            
        }             

        /// <summary>
        /// Sets a new destination for the unit(s) to move towards
        /// Used by HUD
        /// </summary> 
        public void MoveFunction(Game a_game, Vector3 a_point)
        {
            a_game.TryToAddDestination(a_game.m_player, a_point, true);
        }

        /// <summary>
        /// Sets unit(s) to stop doing what they are doing
        /// Used by HUD
        /// </summary> 
        public void StopFunction(Game a_game, Vector3 a_point)
        {
            a_game.m_player.SetStop();
        }

        /// <summary>
        /// Sets unit(s) to hold position
        /// Used by HUD
        /// </summary> 
        public void HoldFunction(Game a_game, Vector3 a_point)
        {
            a_game.m_player.SetHoldPosition();
        }        

        public void AttackFunction(Game a_game, Vector3 a_point)
        {
            Player f_owner = a_game.GetPlayerByID(m_ownerID);

            //Starts a ray ontop of the point and ray traces all the way down Z wise only
            Ray f_ray = new Ray(new Vector3(a_point.X,a_point.Y,Map.m_maxHeight + 1),-Vector3.UnitZ);

            //Gets a thing or null depending if it hits a target or not!
            Thing f_target = a_game.TryToAttackOrMove(f_ray);

            foreach (Thing selectedItem in f_owner.m_selectedThings)
            {
                if (selectedItem.m_attackBehavior != null)
                {
                    if (f_target == null)
                    {
                        selectedItem.m_attackBehavior.StartHunting(a_point, a_game.m_pathFinder);
                    }
                    else
                    {
                        selectedItem.m_attackBehavior.SetTarget(f_target);
                    }
                }
            }
        }        

        public void Hold()
        {
            m_thingState = ThingState.Hold;
        }

        public void Stop()
        {
            m_thingState = ThingState.Idle;
        }        
    }
}
