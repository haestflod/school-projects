using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Pathfinding
{
    class Map
    {
        /// <summary>
        /// The amount of tiles in X
        /// </summary>
        public int m_Xlength;
        /// <summary>
        /// The amount of tiles in Y
        /// </summary>
        public int m_Ylength;

        /// <summary>
        /// The width of map (m_Xlength * TileSize)
        /// </summary>
        public int m_mapWidth;

        /// <summary>
        /// The height of map (m_Ylength * TileSize)
        /// </summary>
        public int m_mapHeight;

        /// <summary>
        /// The size of a tile
        /// </summary>
        public const int m_tileSize = 1;

        public const float m_tileSizeDivided = m_tileSize * 0.5f;

        public Tile[,] m_tiles;

        public Vector2 m_start;

        public Vector2 m_goal;


        public Map(int a_Xlength, int a_Ylength)
        {
            m_Xlength = a_Xlength;
            m_Ylength = a_Ylength;

            m_mapWidth = m_Xlength * m_tileSize;
            m_mapHeight = m_Ylength * m_tileSize;

            //initialize the tile array
            m_tiles = new Tile[m_Xlength, m_Ylength];
        }

        public void LoadMap(int a_mapNumber)
        {
            // Read the file as one string.
            string[] data = System.IO.File.ReadAllLines(String.Format("Maps/Map{0}.txt", a_mapNumber));

            //set all tiles
            for (int y = 0; y < m_Ylength; y++)
            {
                for (int x = 0; x < m_Xlength; x++)
                {
                    //set tile
                    m_tiles[x, y] = new Tile(x, y, Tile.Tiletype.Normal);

                    switch (data[y][x])
                    {
                        case 'X':
                            //change tile type to blocked
                            m_tiles[x, y].m_type = Tile.Tiletype.Blocked;
                            break;
                        case 'S':
                            m_start = new Vector2(x + m_tileSizeDivided, y + m_tileSizeDivided);//we want be point to the middle of the  tile (not a corner)
                            break;
                        case 'G':
                            m_goal = new Vector2(x + m_tileSizeDivided, y + m_tileSizeDivided);//we want to point to the middle of the tile (not a corner)
                            break;
                    }
                    
                    
                }
            }
        }
    }
}
