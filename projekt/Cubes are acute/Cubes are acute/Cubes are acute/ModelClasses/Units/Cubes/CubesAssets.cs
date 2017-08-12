using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Cubes_are_acute.ModelClasses.Units.Cubes;
using Cubes_are_acute.ModelClasses.BehaviorInterfaces;

namespace Cubes_are_acute.ModelClasses.Units
{
    [Serializable]
    class CubesAssets
    {
        public byte m_ownerID;

        //the cube that all cubes gets their stats from
        public Cube m_cube;

        public Barbarian m_barbarian;

        public Extractor m_extractor;

        public CubeIgloo m_igloo;

        public Barrack m_barrack;

        public Races m_race;

        public CubesAssets(Player a_player, ViewClasses.GameAssets a_assets, Map a_map, PathFinder a_pathfinder)
        {
            m_ownerID = a_player.m_playerID;
            m_race = a_player.m_race;            
                
            m_cube = new Cube(m_ownerID, a_assets.c_cube, 10, 10, Vector3.Zero, 10,a_player.AddUnderAttackPosition);

            m_cube.m_moveBehavior = MovementFactory.m_standardMovement;
            m_cube.m_attackBehavior = new StandardAttack(m_cube,1, 1, 3);

            m_cube.m_buildBehavior = BuildFactory.CreateNewVisibleBuild(a_player, m_cube, 1, a_map, a_pathfinder);

            m_barbarian = new Barbarian(m_ownerID, a_assets.c_barbarian, 30, 30, Vector3.Zero,10 , a_player.AddUnderAttackPosition);

            m_barbarian.m_moveBehavior = MovementFactory.m_standardMovement;
            m_barbarian.m_attackBehavior = AttackFactory.CreateNewStandardAttack(m_barbarian,1, 5, 3);

            m_extractor = new Extractor(m_ownerID, a_assets.c_extractor, 500, 500, Vector3.Zero, a_player.AddUnderAttackPosition);

            m_igloo = new CubeIgloo(m_ownerID, a_assets.c_igloo, 100, 100, Vector3.Zero, a_player.AddUnderAttackPosition);

            m_barrack = new Barrack(m_ownerID, a_assets.c_barrack, 200, 200, Vector3.Zero, a_player.AddUnderAttackPosition);
        }        

        public Cube CreateCube(Vector3 a_position)
        {
            return new Cube(m_ownerID, m_cube.m_model, m_cube.HP, m_cube.m_maxHP, a_position, m_cube.m_speed, m_cube.m_underAttackFunction);           
        }

        public Barbarian CreateBarbarian(Vector3 a_position)
        {
            return new Barbarian(m_ownerID, m_barbarian.m_model, m_barbarian.HP, m_barbarian.m_maxHP, a_position, m_barbarian.m_speed, m_barbarian.m_underAttackFunction);
        }

        public Extractor CreateExtractor(Vector3 a_position)
        {
            return new Extractor(m_ownerID, m_extractor.m_model, m_extractor.HP, m_extractor.m_maxHP, a_position, m_extractor.m_underAttackFunction);
        }

        public CubeIgloo CreateIgloo(Vector3 a_position)
        {
            return new CubeIgloo(m_ownerID, m_igloo.m_model, m_igloo.HP, m_igloo.m_maxHP, a_position,  m_igloo.m_underAttackFunction);
        }

        public Barrack CreateBarrack(Vector3 a_position)
        {
            return new Barrack(m_ownerID, m_barrack.m_model, m_barrack.HP, m_barrack.m_maxHP, a_position , m_barrack.m_underAttackFunction);
        }

        public Thing GetThing(ThingType a_type)
        {
            if (m_race == Races.Cubes)
            {
                switch (a_type)
                {
                    case ThingType.C_Cube:
                        return m_cube;
                    case ThingType.C_Barbarian:
                        return m_barbarian;
                    case ThingType.C_Extractor:
                        return m_extractor;
                    case ThingType.C_Igloo:
                        return m_igloo;
                    case ThingType.C_Barrack:
                        return m_barrack;
                }
            }
            //This is just so you can't access anothers race units!
            return null;
        }

        public int GetUnitPower(ThingType a_type)
        {
            switch (a_type)
            {                
                case ThingType.C_Barbarian:
                    return 5;
                case ThingType.C_Cube:
                    return 1;
                default:
                    return 0;
            }
        }

        
    }    
}
