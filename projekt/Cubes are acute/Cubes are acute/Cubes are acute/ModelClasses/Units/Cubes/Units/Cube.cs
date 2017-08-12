using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ModelClasses.BehaviorInterfaces;

namespace Cubes_are_acute.ModelClasses.Units.Cubes
{
    [Serializable]
    class Cube : Unit
    {
        public Cube(byte a_id, Model a_model, int a_hp, int a_maxHP, Vector3 a_position, float a_speed,addUnderAttackPosition a_function)
            : base(a_id, a_model, true, a_hp, a_maxHP, a_position, a_speed, 4.0f, 1,0,a_function)
        {
            m_type = ThingType.C_Cube;

            m_size = new Vector3(1);                    
        }

        public override void SpawnMe(Player a_player, Map a_map, PathFinder a_pathfinder)
        {
            //abilities          
 
            //build extractor
            m_actionbox[0, 2] = new ObjectAction("Extractor",
                                                 "Cost: 15\nRequires a Spark of Life.\nExtractor will produce new Cubes until it out of resources",
                                                 Microsoft.Xna.Framework.Input.Keys.E,
                                                 ObjectAction.Type.Target,
                                                 BuildExtractorFunction);          
           
            m_actionbox[0, 2].SetBuildingTag(a_player.m_thingsAssets.m_extractor.m_size, true,a_player.m_thingsAssets.m_extractor.m_price);

            //Build igloo
            m_actionbox[1, 2] = new ObjectAction("Igloo",
                                                 "Cost: 2\nBuilds an Igloo to increase your supply by 8",
                                                 Microsoft.Xna.Framework.Input.Keys.G,
                                                 ObjectAction.Type.Target,
                                                 BuildIglooFunction);

            m_actionbox[1, 2].SetBuildingTag(a_player.m_thingsAssets.m_igloo.m_size, false,a_player.m_thingsAssets.m_igloo.m_price);

            //Build barracks
            m_actionbox[2, 2] = new ObjectAction("Barrack",
                                                "Costs: 5\nBuilds a barrack to produce more potent units",
                                                 Microsoft.Xna.Framework.Input.Keys.B,
                                                 ObjectAction.Type.Target,
                                                 BuildBarrackFunction);

            m_actionbox[2, 2].SetBuildingTag(a_player.m_thingsAssets.m_barrack.m_size, false, a_player.m_thingsAssets.m_barrack.m_price);

            m_attackBehavior = new StandardAttack(this, a_player.m_thingsAssets.m_cube.m_attackBehavior.GetAttackRate()
                                                                , a_player.m_thingsAssets.m_cube.m_attackBehavior.GetDamage()
                                                                , a_player.m_thingsAssets.m_cube.m_attackBehavior.GetAttackRange());
            //Sets the cubes moveBehavior!!
            m_moveBehavior = a_player.m_thingsAssets.m_cube.m_moveBehavior;

            //a_thing.m_buildBehavior = BuildFactory.CreateNewStandardBuild(a_player, a_thing);
            m_buildBehavior = BuildFactory.CreateNewVisibleBuild(a_player, this, a_player.m_thingsAssets.m_cube.m_buildBehavior.GetBuildRangeSquared(), a_map, a_pathfinder);
        }

        public void BuildExtractor(Vector3 a_point)
        {
            m_buildBehavior.AddToBuildQueue(ThingType.C_Extractor, a_point);
        }

        public void BuildExtractorFunction(Game a_game, Vector3 a_point)
        {            
            Player f_myDeliciousOwner = a_game.GetPlayerByID(m_ownerID);            

            int f_price = f_myDeliciousOwner.m_thingsAssets.m_extractor.m_price;

            if (f_myDeliciousOwner.m_selectedWorkers >= f_price)
            {
                foreach (Thing thingy in f_myDeliciousOwner.m_selectedThings)
                {
                    if (thingy.m_type == ThingType.C_Cube)
                    {
                        //Adds an item to build through a queue
                        (thingy as Cube).BuildExtractor(a_point);                           
                    }
                }                     
            }           
        }

        public void BuildIgloo(Vector3 a_point)
        {            
            m_buildBehavior.AddToBuildQueue(ThingType.C_Igloo, a_point);           
        }

        public void BuildIglooFunction(Game a_game, Vector3 a_point)
        {           
            Player f_myDeliciousOwner = a_game.GetPlayerByID(m_ownerID);

            int f_price = f_myDeliciousOwner.m_thingsAssets.m_igloo.m_price;

            if (f_myDeliciousOwner.m_selectedWorkers >= f_price)
            {
                foreach (Thing thingy in f_myDeliciousOwner.m_selectedThings)
                {
                    if (thingy.m_type == ThingType.C_Cube)
                    {
                        //Adds an item to build through a queue
                        (thingy as Cube).BuildIgloo(a_point);
                    }
                }
            }
        }

        public void BuildBarrack(Vector3 a_point)
        {            
            m_buildBehavior.AddToBuildQueue(ThingType.C_Barrack, a_point);            
        }

        public void BuildBarrackFunction(Game a_game, Vector3 a_point)
        {           
            Player f_myDeliciousOwner = a_game.GetPlayerByID(m_ownerID);

            int f_price = f_myDeliciousOwner.m_thingsAssets.m_barrack.m_price;

            if (f_myDeliciousOwner.m_selectedWorkers >= f_price)
            {
                foreach (Thing thingy in f_myDeliciousOwner.m_selectedThings)
                {
                    if (thingy.m_type == ThingType.C_Cube)
                    {
                        //Adds an item to build through a queue
                        (thingy as Cube).BuildBarrack(a_point);
                    }
                }
            }
        }
    }
}
