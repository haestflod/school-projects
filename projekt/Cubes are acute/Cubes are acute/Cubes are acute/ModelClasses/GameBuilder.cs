using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.WorldObjects;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.Units.Cubes;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses
{
    /// <summary>
    /// Purpose of this class is to help building up game objects, like 2 extractors 5 units at the start of a game for each player
    /// </summary>
    class GameBuilder
    {
        public void BuildWorldForFourCO(Game a_game,ViewClasses.GameAssets a_assets)
        {
            #region WorldObjects

            a_game.m_buildingSpeedModifier = 10;
            a_game.m_map.m_worldObjects = new List<WorldObject>();
            a_game.m_allPlayers = new List<Player>();
            a_game.m_computers = new List<ROB>();

            Point bottomLeft =  new Point(0,0);
            
            int x = bottomLeft.X +4 ; int y = bottomLeft.Y + 4;
            Vector3 p1SpawnPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            x += 4; 
            Vector3 p1ExtraSoLPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            Point bottomRight = new Point(a_game.m_map.m_Xlength, 0);

            x = bottomRight.X - 4 ; y = bottomRight.Y + 4;
            Vector3 p2SpawnPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);
            x -= 4;
            Vector3 p2ExtraSoLPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            Point topLeft = new Point(0, a_game.m_map.m_Ylength);

            x = topLeft.X + 4; y = topLeft.Y - 4;
            Vector3 p3SpawnPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);
            x += 4; 
            Vector3 p3ExtraSoLPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            Point topRight = new Point(a_game.m_map.m_Xlength, a_game.m_map.m_Ylength);

            x = topRight.X - 4; y = topRight.Y - 4;
            Vector3 p4SpawnPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);
            x -= 4;
            Vector3 p4ExtraSoLPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p1SpawnPos));
            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p1ExtraSoLPos));

            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p2SpawnPos));
            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p2ExtraSoLPos));

            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p3ExtraSoLPos));
            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p3SpawnPos));

            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p4ExtraSoLPos));
            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p4SpawnPos));
            #endregion

            
            

            //Ze Player which is needed to be initilized :(
            a_game.m_player = new Player(100, a_assets, a_game.m_map, a_game.m_pathFinder);                   
            a_game.m_player.Surrender(a_game.m_map);            

            byte a_id = 0;

            //Computer1         
            ROB f_computer = new ROB(a_id++, a_assets, a_game.m_map, a_game.m_pathFinder, p1SpawnPos);
            a_game.m_computers.Add(f_computer);
            a_game.m_allPlayers.Add(f_computer);

            CreateExtractor(f_computer, a_game.m_map, p1SpawnPos);

            for (float i = p1SpawnPos.X - 2; i < p1SpawnPos.X + 2; i++)
            {
                CreateCube(f_computer, new Vector3(i, p1SpawnPos.Y + 4, p1SpawnPos.Z));
            }

            //Computer2      
            f_computer = new ROB(a_id++, a_assets, a_game.m_map, a_game.m_pathFinder, p2SpawnPos);
            a_game.m_computers.Add(f_computer);
            a_game.m_allPlayers.Add(f_computer);

            CreateExtractor(f_computer, a_game.m_map, p2SpawnPos);

            for (float i = p2SpawnPos.X - 2; i < p2SpawnPos.X + 2; i++)
            {
                CreateCube(f_computer, new Vector3(i, p2SpawnPos.Y+4, p2SpawnPos.Z));
            }

            //Computer3
            f_computer = new ROB(a_id++, a_assets, a_game.m_map, a_game.m_pathFinder, p3SpawnPos);
            a_game.m_computers.Add(f_computer);
            a_game.m_allPlayers.Add(f_computer);

            CreateExtractor(f_computer, a_game.m_map, p3SpawnPos);

            for (float i = p3SpawnPos.X - 2; i < p3SpawnPos.X + 2; i++)
            {
                CreateCube(f_computer, new Vector3(i, p3SpawnPos.Y - 4, p3SpawnPos.Z));
            }

            //Computer4
            f_computer = new ROB(a_id++, a_assets, a_game.m_map, a_game.m_pathFinder, p4SpawnPos);
            a_game.m_computers.Add(f_computer);
            a_game.m_allPlayers.Add(f_computer);

            CreateExtractor(f_computer, a_game.m_map, p4SpawnPos);

            for (float i = p4SpawnPos.X - 2; i < p4SpawnPos.X + 2; i++)
            {
                CreateCube(f_computer, new Vector3(i, p4SpawnPos.Y - 4, p4SpawnPos.Z));
            }

            foreach (ROB computer in a_game.m_computers)
            {
                computer.InitilizeROB(a_game);
            }

        }

        public void BuildWorldForFour(Game a_game, ViewClasses.GameAssets a_assets)
        {
            #region WorldObjects

            a_game.m_buildingSpeedModifier = 1;

            a_game.m_map.m_worldObjects = new List<WorldObject>();
            a_game.m_allPlayers = new List<Player>();
            a_game.m_computers = new List<ROB>();

            Point bottomLeft = new Point(0, 0);

            int x = bottomLeft.X + 4; int y = bottomLeft.Y + 4;
            Vector3 p1SpawnPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            x += 4;
            Vector3 p1ExtraSoLPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            Point bottomRight = new Point(a_game.m_map.m_Xlength, 0);

            x = bottomRight.X - 4; y = bottomRight.Y + 4;
            Vector3 p2SpawnPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);
            x -= 4;
            Vector3 p2ExtraSoLPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            Point topLeft = new Point(0, a_game.m_map.m_Ylength);

            x = topLeft.X + 4; y = topLeft.Y - 4;
            Vector3 p3SpawnPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);
            x += 4;
            Vector3 p3ExtraSoLPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            Point topRight = new Point(a_game.m_map.m_Xlength, a_game.m_map.m_Ylength);

            x = topRight.X - 4; y = topRight.Y - 4;
            Vector3 p4SpawnPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);
            x -= 4;
            Vector3 p4ExtraSoLPos = new Vector3(x, y, a_game.m_map.m_tiles[x, y].m_height);

            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p1SpawnPos));
            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p1ExtraSoLPos));

            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p2SpawnPos));
            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p2ExtraSoLPos));

            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p3ExtraSoLPos));
            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p3SpawnPos));

            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p4ExtraSoLPos));
            a_game.m_map.AddWorldObject(new SoL(a_assets.m_sparkOfLife, p4SpawnPos));           
            
            #endregion
        
            byte a_id = 0;  

            //Ze Player which is needed to be initilized :(
            a_game.m_player = new Player(a_id++, a_assets, a_game.m_map, a_game.m_pathFinder);
            a_game.m_allPlayers.Add(a_game.m_player);

            CreateExtractor(a_game.m_player, a_game.m_map, p1SpawnPos);

            for (float i = p1SpawnPos.X - 2; i < p1SpawnPos.X + 2; i++)
            {
                CreateCube(a_game.m_player, new Vector3(i, p1SpawnPos.Y + 4, p1SpawnPos.Z));
            }

            //Computer2      
            ROB f_computer = new ROB(a_id++, a_assets, a_game.m_map, a_game.m_pathFinder, p2SpawnPos);
            a_game.m_computers.Add(f_computer);
            a_game.m_allPlayers.Add(f_computer);

            CreateExtractor(f_computer, a_game.m_map, p2SpawnPos);

            for (float i = p2SpawnPos.X - 2; i < p2SpawnPos.X + 2; i++)
            {
                CreateCube(f_computer, new Vector3(i, p2SpawnPos.Y + 4, p2SpawnPos.Z));
            }

            //Computer3
            f_computer = new ROB(a_id++, a_assets, a_game.m_map, a_game.m_pathFinder, p3SpawnPos);
            a_game.m_computers.Add(f_computer);
            a_game.m_allPlayers.Add(f_computer);

            CreateExtractor(f_computer, a_game.m_map, p3SpawnPos);

            for (float i = p3SpawnPos.X - 2; i < p3SpawnPos.X + 2; i++)
            {
                CreateCube(f_computer, new Vector3(i, p3SpawnPos.Y - 4, p3SpawnPos.Z));
            }

            //Computer4
            f_computer = new ROB(a_id++, a_assets, a_game.m_map, a_game.m_pathFinder, p4SpawnPos);
            a_game.m_computers.Add(f_computer);
            a_game.m_allPlayers.Add(f_computer);

            CreateExtractor(f_computer, a_game.m_map, p4SpawnPos);

            for (float i = p4SpawnPos.X - 2; i < p4SpawnPos.X + 2; i++)
            {
                CreateCube(f_computer, new Vector3(i, p4SpawnPos.Y - 4, p4SpawnPos.Z));
            }


            foreach (ROB computer in a_game.m_computers)
            {
                computer.InitilizeROB(a_game);
            }
        }

        #region CreateObjects Stuff

        private void CreateExtractor(Player a_player,Map a_map,Vector3 a_position)
        {
            Extractor f_extractor = a_player.m_thingsAssets.CreateExtractor(a_position);
            f_extractor.m_builtTimer = f_extractor.m_requiredBuildTime + 1;
            Rectangle f_area = MathGameHelper.GetAreaRectangle(ref f_extractor.m_currentposition, ref f_extractor.m_size);

            WorldObject wo = a_map.GetWorldObject(ref f_area, WorldObjectType.SoL);

            f_extractor.m_currentposition = wo.m_position;

           a_player.AddVisibleThing(f_extractor, null,wo , 0);
        }

        private void CreateCube(Player a_player, Vector3 a_position)
        {
            Cube f_temp = a_player.m_thingsAssets.CreateCube(a_position);
            f_temp.m_builtTimer = f_temp.m_requiredBuildTime + 1;

            a_player.AddVisibleThing(f_temp, null, null, 0);
        }

        #endregion

    }
}
