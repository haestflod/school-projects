using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Cubes_are_acute.ModelClasses.Units;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    [Serializable]
    class StandardAttack : iAttackBehavior
    {
        private float m_chaseRangeSquared;

        public Thing m_target = null; 

        public float m_cooldownTimer = 0;        
        public float m_attackRate;

        public int m_damage;

        public float m_attackRange;
        private float m_attackRangeSquared;

        private Thing m_attacker;

        private ThingState m_baseState;

        private Vector3 m_huntingPosition;

        private bool m_absoluteTarget = false;

        public StandardAttack(Thing a_attacker,float a_attackRate, int a_damage, float a_attackRange)
        {
            m_attacker = a_attacker;

            m_attackRate = a_attackRate;
            m_damage = a_damage;
            m_attackRange = a_attackRange;            

            m_attackRangeSquared = m_attackRange * m_attackRange;

            m_chaseRangeSquared = m_attackRangeSquared + 4;
        }

        /// <summary>
        /// Does attack behavior, if no attackTarget, Seek for one. If there is one, attack! 
        /// </summary>        
        public void DoAttackBehavior(List<Player> a_players,PathFinder a_pathfinder ,ViewClasses.iParticles a_particleHandler, float a_elapsedTime)
        {
            Cooldown(a_elapsedTime);

            if (m_attacker.m_thingState == ThingState.Hold || m_attacker.m_thingState == ThingState.Hunting)
            {
                m_baseState = m_attacker.m_thingState;
            }            

            //All the stuff you can't be when attacking.
            if (m_attacker.m_thingState != ThingState.Moving && m_attacker.m_thingState != ThingState.Building)
            {
                foreach (Player player in a_players)
                {
                    Seek(player);
                }

                //if you have no target
                if (m_target == null)
                {
                    if (m_attacker.m_currentposition != m_huntingPosition && m_baseState == ThingState.Hunting)
                    {
                        StartHunting(m_huntingPosition, a_pathfinder);
                    }
                    else if (m_attacker.m_currentposition == m_huntingPosition && m_baseState == ThingState.Hunting)
                    {
                        m_baseState = ThingState.Idle;
                    }

                    m_absoluteTarget = false;                                     
                }//if you doo! 
                else
                {
                    Attack(a_pathfinder,a_particleHandler);                    
                }
            }
        }

        /// <summary>
        /// Seeks after a target 
        /// </summary>        
        /// <param name="a_player">Seeks through this players units to attack em</param>
        public void Seek(Player a_player)
        {
            if (m_target == null)
            {                
                //If at hold it only wants to seek for targets within range, no need to find targets otherwise!
                if (m_baseState == ThingState.Hold)
                {
                    SeekTargetsAttackRange(a_player);
                }//Else find target that's at chase range, thus start to chase it possibly!
                else
                {
                    SeekTargetsChaseRange(a_player);
                }                
            }//if already has a target but maybe it's not good enough!
            else
            {
                //If the target is a building or currently being built.
                if (!m_target.m_isUnit || m_target.m_thingState == ThingState.BeingBuilt && !m_absoluteTarget)
                {
                    SeekTargetUnitAttackRange(a_player);
                }
            }
            
        }

        #region DifferentSeekTechniques

        /// <summary>
        /// Finds target within Change range
        /// </summary>        
        private void SeekTargetsChaseRange(Player a_player)
        {
            //Looks for a unit target first
            foreach (Thing thing in a_player.m_units)
            {
                //If the target is within 'chase range'
                if (CalculateLengthToATarget(thing) <= m_chaseRangeSquared)
                {
                    m_target = thing;
                    return;
                }
            }

            //Looks for a building next
            foreach (Thing building in a_player.m_buildings)
            {
                if (CalculateLengthToATarget(building) <= m_chaseRangeSquared)
                {
                    m_target = building;
                    return;
                }
            }

            //Thirdly, looks for an object being currently built!
            foreach (BuildingObject bo in a_player.m_buildObjects)
            {
                if (bo.m_isBuilding)
                {
                    if (CalculateLengthToATarget(bo.m_object) <= m_chaseRangeSquared)
                    {
                        m_target = bo.m_object;
                        return;
                    }
                }
            }
        }

        /// <summary>
        /// Finds targets within attackrange!
        /// </summary>        
        private void SeekTargetsAttackRange(Player a_player)
        {
            foreach (Thing thing in a_player.m_units)
            {
                if (CalculateLengthToATarget(thing) <= m_attackRangeSquared)
                {
                    m_target = thing;
                    return;
                }
            }

            foreach (Thing building in a_player.m_buildings)
            {
                if (CalculateLengthToATarget(building) <= m_attackRangeSquared)
                {
                    m_target = building;
                    return;
                }
            }

            foreach (BuildingObject bo in a_player.m_buildObjects)
            {
                if (bo.m_isBuilding)
                {
                    if (CalculateLengthToATarget(bo.m_object) <= m_attackRangeSquared)
                    {
                        m_target = bo.m_object;
                        return;
                    }
                }
            }
        }

        /// <summary>
        /// Only seeks for units, no buildings or other stuff!
        /// </summary>        
        private void SeekTargetUnitAttackRange(Player a_player)
        {
            foreach (Thing thing in a_player.m_units)
            {
                if (CalculateLengthToATarget(thing) <= m_attackRangeSquared)
                {
                    m_target = thing;
                    return;
                }
            }
        }

        #endregion

        public void Attack(PathFinder a_pathFinder,ViewClasses.iParticles a_particleHandler)
        {
            /* Flow:
             * 1. Is target alive or dead?
             * 2. Is target inside my chase range?
             * 3. Is target inside my attack range?
             * 4. Is my state Attacking?
             * 5. Is my attack ready?
             * 6. Do Damage and set cooldown to the attackrate
             * 7. If target is dead after dealing damage, set my state to my baseState (Hold or Hunting)
             * 
             * 1a. If Target is dead set my attack target to null
             * 2a. If target is outside my chase range, I stop attacking the target and go back to my previous state (Hunting, or Hold tho Hold should never happen)
             * 3a. If target is outside my attack range and my baseState = Hold, I drop my target.
             * 3b. If target is outside my attack range I will start to chase target! 
             * 4a. If my state is not Attacking but Chasing I will set my state to Idle
             * 4b. If my state is not Attacking but Hold or Idle I will set my state to Attacking
             * 5b. If my attack is not ready, do nothing             
             */

            //If target is alive try to attack               
            if (m_target.m_alive && m_target.m_exists)
            {
                float f_length = CalculateLengthToATarget(m_target);

                //If target is within chase range
                if (f_length <= m_chaseRangeSquared)
                {
                    //If target is within attackrange
                    if (f_length <= m_attackRangeSquared)
                    {
                        if (m_attacker.m_thingState == ThingState.Attacking)
                        {
                            //if cooldown is ready, do the attack check
                            if (m_cooldownTimer <= 0)
                            {
                                m_target.TakeDamage(m_damage);

                                m_cooldownTimer = m_attackRate;

                                a_particleHandler.CreateOddys(m_attacker.m_currentposition, ref m_target.m_currentposition);

                                if (!m_target.m_alive)
                                {
                                    m_attacker.m_thingState = m_baseState;
                                }
                            }
                        }//Sets attacker state from Chasing -> Idle -> Attacking                               
                        else if (m_attacker.m_thingState == ThingState.Chasing || m_attacker.m_thingState == ThingState.Hunting)
                        {
                            m_attacker.m_thingState = ThingState.Idle;
                        }//If the state is idle or hold the unit can attack! 
                        else if (m_attacker.m_thingState == ThingState.Idle || m_attacker.m_thingState == ThingState.Hold)
                        {
                            m_attacker.m_thingState = ThingState.Attacking;
                        }
                    }//If outside the attackerRange and the state is hold do: 
                    else if (m_baseState == ThingState.Hold)
                    {
                        //Set the attackerTarget to null, since someone else might be inside the attack range
                        m_target = null;
                    }//If the unit is idling it will chase target
                    else
                    {
                        if (a_pathFinder.FindPath(m_attacker.m_currentposition, m_target.m_currentposition) == 1)
                        {
                            ChaseTarget(a_pathFinder.m_pathList);
                        }//if unit can't find path to target, drop it!
                        else
                        {
                            m_target = null;
                        }
                    }
                }//If the target was selected by player, chase it till the end of time!
                else if (m_absoluteTarget)
                {
                    if (a_pathFinder.FindPath(m_attacker.m_currentposition, m_target.m_currentposition) == 1)
                    {
                        ChaseTarget(a_pathFinder.m_pathList);
                    }//if unit can't find path to target, drop it!
                    else
                    {
                        m_target = null;
                    }
                }//If outside chase range
                else
                {
                    //If the base state was hold or hunting, go back to doing that!
                    if (m_baseState == ThingState.Hold || m_baseState == ThingState.Hunting)
                    {
                        m_attacker.m_thingState = m_baseState;
                    }
                    m_target = null;
                }                    
                
            }//If target is dead            
            else
            {
                //set attack target to null so Seek is called again
                m_target = null;
                m_attacker.m_thingState = m_baseState;
            }            
        }

        /// <summary>
        /// Sets m_attackTarget to something specific, like player clicks on enemy and wants that one focused fired on!
        /// </summary>
        /// <param name="a_target"></param>
        public void SetTarget(Thing a_target)
        {
            m_target = a_target;
            m_absoluteTarget = true;
        }

        public void UnsetTarget()
        {
            m_target = null;
            m_absoluteTarget = false;
            m_baseState = ThingState.Idle;
        }

        /// <summary>
        /// Sets a hunting position incase target attacks a target that runs, thus chasing after and then the old path is forgotten.
        /// So this function saves the original hunting path!
        /// </summary>        
        public void StartHunting(Vector3 a_huntingPosition,PathFinder a_pathFinder)
        {
            m_huntingPosition = a_huntingPosition;

            bool f_pathFound = false;

            while (!f_pathFound)
            {

                if (a_pathFinder.FindPath(m_attacker.m_currentposition, m_huntingPosition) == 1)
                {
                    HuntTowardsLocation(a_pathFinder.m_pathList);
                    f_pathFound = true;
                }
                else
                {
                    //Some weird temp code if it can't find path at the exact location user selected, tries to find one around it!
                    m_huntingPosition.X--;

                    if (a_huntingPosition.X - m_huntingPosition.X > 3)
                    {
                        f_pathFound = true;
                    }
                }
            }
        }

        private void ChaseTarget(List<Vector3> a_pathList)
        {
            m_attacker.m_destination = a_pathList;

            m_attacker.m_thingState = ThingState.Chasing;
        }

        private void HuntTowardsLocation(List<Vector3> a_pathList)
        {
            m_attacker.m_destination = a_pathList;
            //m_target = null;

            if (m_target == null)
            {
                m_attacker.m_thingState = ThingState.Hunting;
            }
            else
            {
                if (CalculateLengthToATarget(m_target) > m_attackRangeSquared)
                {
                    m_attacker.m_thingState = ThingState.Hunting;
                }
            }
        }

        public void Cooldown(float a_elapsedTime)
        {
            if (m_cooldownTimer > 0)
            {
                m_cooldownTimer -= a_elapsedTime;                
            }
        }

        public int GetDamage()
        {
            return m_damage;
        }
        public void SetDamage(int a_damage)
        {
            m_damage = a_damage;
        }

        public float GetAttackRate()
        {
            return m_attackRate;
        }
        public void SetAttackRate(float a_attackRate)
        {
            m_attackRate = a_attackRate;
        }

        public float GetAttackRange()
        {
            return m_attackRange;
        }
        public void SetAttackRange(float a_attackRange)
        {
            m_attackRange = a_attackRange;
            m_attackRangeSquared = m_attackRange * m_attackRange;

            //What the hell is this 4? Pun jokes... The 4 should atleast be a variable
            m_chaseRangeSquared = m_attackRangeSquared + 4;
        }

        public float CalculateLengthToATarget(Thing a_target)
        {
            //TODO: the subtracted size is temp code to not only attack the center position
            //      should be replaced with something smart. But this works well as long as a buildings width == height
            return (m_attacker.m_currentposition - a_target.m_currentposition).LengthSquared() - a_target.m_size.X * a_target.m_size.X;
        }
    }
}
