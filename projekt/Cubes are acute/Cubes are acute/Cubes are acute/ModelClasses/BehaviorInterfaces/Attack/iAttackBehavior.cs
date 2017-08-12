using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.Units;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    interface iAttackBehavior
    {
        void DoAttackBehavior(List<Player> a_players,PathFinder a_pathFinder ,ViewClasses.iParticles a_particleHandler, float a_elapsedTime);
        void Seek(Player a_player);
        void Attack(PathFinder a_pathFinder,ViewClasses.iParticles a_particleHandler);
        void Cooldown(float a_elapsedTime);

        void SetTarget(Thing a_target);
        void StartHunting(Vector3 a_huntingPosition, PathFinder a_pathFinder);

        void UnsetTarget();        

        int GetDamage();
        void SetDamage(int a_damage);

        float GetAttackRate();
        void SetAttackRate(float a_attackRate);

        float GetAttackRange();
        void SetAttackRange(float a_attackRange);

        float CalculateLengthToATarget(Thing a_target);
    }
}
