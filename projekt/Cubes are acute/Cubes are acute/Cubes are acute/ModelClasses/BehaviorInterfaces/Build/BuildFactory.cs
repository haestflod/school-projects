using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.BehaviorInterfaces;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.WorldObjects;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    class BuildFactory
    {
        public static StandardBuild CreateNewStandardBuild(Player a_player, Thing a_builder, Map a_map, PathFinder a_pathfinder)
        {
            return new StandardBuild(a_player, a_builder, a_map, a_pathfinder);
        }

        public static VisibleBuild CreateNewVisibleBuild(Player a_player, Thing a_builder, float a_buildRange, Map a_map, PathFinder a_pathfinder)
        {
            return new VisibleBuild(a_player, a_builder, a_buildRange, a_map, a_pathfinder);
        }

        public static CSBuilder CreateNewCSBuilder(Player a_player, Thing a_builder, SoL a_sol, Map a_map, PathFinder a_pathfinder)
        {
            return new CSBuilder(a_player, a_builder, a_sol, a_map, a_pathfinder);
        }
    }
}
