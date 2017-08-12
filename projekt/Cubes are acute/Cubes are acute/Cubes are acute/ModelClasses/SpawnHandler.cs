using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses;
using Cubes_are_acute.ModelClasses.BehaviorInterfaces;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.WorldObjects;

namespace Cubes_are_acute.ModelClasses
{
    class SpawnHandler
    {
        /// <summary>
        /// Private reference to the map so only spawnhandler has access to it, as it needs it for different build behavior validations
        /// </summary>
        private static Map m_map;

        /// <summary>
        /// Private reference to all the world objects so only spawnhandler has access to it! 
        /// As build resource buildings e.t.c. needs it!
        /// </summary>
        private static List<WorldObject> m_worldObjects;

        public static void InitilizeSpawnHandler(Map a_map,List<WorldObject> a_worldObjects)
        {
            m_map = a_map;
            m_worldObjects = a_worldObjects;
        }

        public static void SpawnThing(Thing a_thing, Player a_player)
        {
            switch (a_thing.m_type)
            {
                case ThingType.C_Cube:
                    //Sets ze attackbehavior!!
                    a_thing.m_attackBehavior = new StandardAttack(a_player.m_thingsAssets.m_cube.m_attackBehavior.GetAttackRate()
                                                                , a_player.m_thingsAssets.m_cube.m_attackBehavior.GetDamage()
                                                                , a_player.m_thingsAssets.m_cube.m_attackBehavior.GetAttackRange());
                    //Sets the cubes moveBehavior!!
                    a_thing.m_moveBehavior = a_player.m_thingsAssets.m_cube.m_moveBehavior;

                    //a_thing.m_buildBehavior = BuildFactory.CreateNewStandardBuild(a_player,a_thing);
                    a_thing.m_buildBehavior = BuildFactory.CreateNewVisibleBuild(a_player,a_thing,a_player.m_thingsAssets.m_cube.m_buildBehavior.GetBuildRange(),m_map,m_worldObjects);

                    break;
                case ThingType.C_Extractor:
                    Units.Cubes.Extractor f_extractor = (Units.Cubes.Extractor)a_thing;

                    a_thing.m_buildBehavior = BuildFactory.CreateNewCSBuilder(a_player, a_thing, f_extractor.m_SoL);
                    if (a_player.m_race == Races.Cubes)
                    {
                        a_thing.m_buildBehavior.AddToBuildQueue(ThingType.C_Cube);
                    }                   

                    break;
            }
        }        
    }
}
