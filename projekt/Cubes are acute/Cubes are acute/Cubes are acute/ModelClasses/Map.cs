using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Cubes_are_acute.ModelClasses.WorldObjects;

namespace Cubes_are_acute.ModelClasses
{
    [Serializable]
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
        /// The depth of map (m_depth * TileSize)
        /// </summary>
        public int m_mapDepth;

        public List<WorldObject> m_worldObjects = new List<WorldObject>();        

        /// <summary>
        /// The size of how many tiles inside each grid element
        /// </summary>
        //public const int m_gridSize = 8;
        /// <summary>
        /// The maxheight of the map
        /// </summary>
        public const int m_maxHeight = 8;
        //The world pos size of each tile, where 1 would mean 1 world pos wide/long  and eg 4 would mean length 4 for each tile
        public const int m_tileSize = 1;

        public const float m_tileSizeDivided = m_tileSize * 0.5f;

        public Tile[,] m_tiles;

        /// <summary>
        /// The height difference that will decide if the tile will be normal or blocked.
        /// if a adjacent tile height's difference is greater (or less) than this value, the middle tile will be set as blocked.
        /// </summary>
        private float m_walkableHeightDifference = 1;

        public Map(int a_Xlength,int a_Ylength)
        {            
            m_Xlength = a_Xlength;
            m_Ylength = a_Ylength;

            m_mapWidth = m_Xlength * m_tileSize;
            m_mapDepth = m_Ylength * m_tileSize;

            m_tiles = new Tile[m_Xlength, m_Ylength];

            //OK here's the plan! We don't have enough time to make a proper map loading
            //So.. We hardcode.. But 128x128 tiles are too many.. 
            //So.. We make rectangles that will be used to set different heights
            //and the tiles that is not set this way will get height 0
            List<Rectangle> rectangles = new List<Rectangle>();//the pos is bottom-left, growing towards top-right
            List<int> heights = new List<int>();//make sure to add a height after each rectangle
            
            float offSet = 0.125f * 0.5f;

            int rectangleLength = (int)(m_Xlength * (0.5f - 0.125f * 0.5f) + 0.5f);

            /***********
             * ISLANDS
             *********** */

            //Bottom Left Rectangle
            rectangles.Add(new Rectangle(0, 0, rectangleLength, rectangleLength));
            heights.Add(2);

            //Bottom Right Rectangle
            rectangles.Add(new Rectangle((int)((0.5f + offSet) * m_Xlength), 0, rectangleLength, rectangleLength));
            heights.Add(2);

            //TopLeft
            rectangles.Add(new Rectangle(0 ,
                                        (int)((0.5f + offSet) * m_Ylength), 
                                        rectangleLength, rectangleLength));
            heights.Add(2);

            //TopRight
            rectangles.Add(new Rectangle((int)((0.5f + offSet) * m_Xlength),
                                        (int)((0.5f + offSet) * m_Ylength)
                                        , rectangleLength, rectangleLength));
            heights.Add(2);

            /***********
             * BRIDGES
             *********** */

            //Bottom Bridge
            rectangles.Add(new Rectangle(rectangleLength,
               (int)(m_Ylength * (0.25f - offSet) + 1),
               m_Xlength - rectangleLength*2,
               (int)(0.125f * m_Ylength + 0.5f) - 2));
            heights.Add(2);

            //Bottom RAMP
            rectangles.Add(new Rectangle(rectangleLength,
               (int)(m_Ylength * (0.25f - offSet)),
               (int)(0.125f * m_Xlength + 0.5f),
               (int)(0.125f * m_Ylength + 0.5f)));
            heights.Add(1);

            //Top Bridge
            rectangles.Add(new Rectangle(rectangleLength,
               (int)(m_Ylength * (0.75f - offSet) + 1),
               m_Xlength - rectangleLength * 2,
               (int)(0.125f * m_Ylength + 0.5f) - 2));
            heights.Add(2);

            //Top RAMP
            rectangles.Add(new Rectangle(rectangleLength,
               (int)(m_Ylength * (0.75f - offSet)),
               (int)(0.125f * m_Xlength + 0.5f),
               (int)(0.125f * m_Ylength + 0.5f)));
            heights.Add(1);


            //Left Bridge
            rectangles.Add(new Rectangle((int)(m_Xlength * (0.25f - offSet) + 1),
                                        rectangleLength,
                                        (int)(m_Xlength * 0.125f - 2),
                                        m_Xlength - rectangleLength * 2));
            heights.Add(2);

            //Left Ramp
            rectangles.Add(new Rectangle((int)(m_Xlength * (0.25f - offSet)),
                                        rectangleLength,
                                        (int)(m_Xlength * 0.125f),
                                        m_Xlength - rectangleLength * 2));
            heights.Add(1);
 
            //Right Bridge
            rectangles.Add(new Rectangle((int)(m_Xlength * (0.75f - offSet) + 1),
                                        rectangleLength,
                                        (int)(m_Xlength * 0.125f - 2),
                                        m_Xlength - rectangleLength * 2));
            heights.Add(2);

            //Left Ramp
            rectangles.Add(new Rectangle((int)(m_Xlength * (0.75f - offSet)),
                                        rectangleLength,
                                        (int)(m_Xlength * 0.125f),
                                        m_Xlength - rectangleLength * 2));
            heights.Add(1);

            
            for (int x = 0; x < m_Xlength; x++)
            {
                for (int y = 0; y < m_Ylength; y++)
                {
                    //loop through all rectangles
                    for(int i = 0; i < rectangles.Count; i++)
                    {
                        //if inside the rectangle (yes, the map has origo in bottom left)
                        if ((x >= rectangles[i].X && x < rectangles[i].X + rectangles[i].Width) && (y >= rectangles[i].Y && y < rectangles[i].Y + rectangles[i].Height))
                        {
                            m_tiles[x, y] = new Tile(x, y, heights[i], Tiletype.Normal);
                            break;
                        }
                    }

                    //if not set
                    if(m_tiles[x, y] == null)
                        m_tiles[x, y] = new Tile(x, y, 0, Tiletype.Normal);
                }
            }
            /*
            //this is temp to create a small maze (to test the pathfinder)
            m_tiles[9, 9] = new Tile(9, 9, 0, Tiletype.Normal);
            m_tiles[9, 8] = new Tile(9, 8, 0, Tiletype.Normal);
            
            m_tiles[10, 9] = new Tile(10, 9, 0, Tiletype.Normal);
            m_tiles[10, 8] = new Tile(10, 8, 0, Tiletype.Normal);
            
            m_tiles[11, 9] = new Tile(11, 9, 0, Tiletype.Normal);
            m_tiles[11, 8] = new Tile(11, 8, 0, Tiletype.Normal);
            

            m_tiles[12, 7] = new Tile(12, 7, 0, Tiletype.Normal);
            m_tiles[12, 8] = new Tile(12, 8, 0, Tiletype.Normal);
            m_tiles[12, 9] = new Tile(12, 9, 0, Tiletype.Normal);

            m_tiles[11, 7] = new Tile(11, 7, 0, Tiletype.Normal);

            m_tiles[12, 6] = new Tile(12, 6, 0, Tiletype.Normal);
            m_tiles[12, 5] = new Tile(12, 5, 0, Tiletype.Normal);
            m_tiles[12, 4] = new Tile(12, 4, 0, Tiletype.Normal);
            m_tiles[11, 5] = new Tile(11, 5, 0, Tiletype.Normal);
            m_tiles[11, 4] = new Tile(11, 4, 0, Tiletype.Normal);


            m_tiles[4, 7] = new Tile(4, 7, 2, Tiletype.Normal);

            //create a ramp
            m_tiles[9, 12] = new Tile(9, 12, 1, Tiletype.Normal);
            m_tiles[9, 13] = new Tile(9, 13, 1, Tiletype.Normal);
            m_tiles[9, 14] = new Tile(9, 14, 1, Tiletype.Normal);
            */
            //set blocked tiles
            SetBlockedTiles();
        }


        /// <summary>
        /// This will set all unwalkable tiles to blocked.
        /// </summary>
        private void SetBlockedTiles()
        {
            //go through all tiles
            for (int x = 0; x < m_tiles.GetLength(0); x++)
            {
                for (int y = 0; y < m_tiles.GetLength(1); y++)
                {
                    //this part sets the border tiles to blocked (only left side and bottom, because they are outside the map)
                    //NOTE: this will make it impossible to walk outside the map's borders. Awesome? Yeah.

                    //if it's a tile at the left or bottom of the border
                    if (x == 0 || y == 0)
                    {
                        //set it to blocked
                        m_tiles[x, y].m_type = Tiletype.Blocked;

                        //check next tile
                        continue;
                    }

                    //this part will set the wall tiles to blocked
                    //if a tile has any adjacent tile that is unreachable, it's a wall

                    //go through all adjacent tiles
                    for (int b = y - 1; b <= y + 1; b++)
                    {
                        for (int a = x - 1; a <= x + 1; a++)
                        {
                            //if NOT outside the map
                            if (a != -1 && b != -1 && a != m_Xlength && b != m_Ylength)
                            {
                                //if the height difference is greater than the m_walkableHeightDifference
                                if (m_tiles[x, y].m_height - m_tiles[a, b].m_height > m_walkableHeightDifference)
                                {
                                    //the middle tile's type is set to blocked
                                    m_tiles[x, y].m_type = Tiletype.Blocked;

                                    //there is no need to go through any more adjacent tiles
                                    break;//get me out of here!
                                }
                            }
                        }

                        //if the middle tile has become blocked there is no need to go through any more adjacent tiles
                        if (m_tiles[x, y].m_type == Tiletype.Blocked)
                        {
                            break;//get me out of here aswell!
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Used to set the correct positions of the world object depending on size
        /// </summary>        
        public void AddWorldObject(WorldObject a_worldObject)
        {
            if (a_worldObject.m_size.X % 2 == 0)
            {
                a_worldObject.m_position.X = (int)a_worldObject.m_position.X;
            }
            else
            {
                a_worldObject.m_position.X = (int)a_worldObject.m_position.X + Map.m_tileSizeDivided;
            }

            if (a_worldObject.m_size.Y % 2 == 0)
            {
                a_worldObject.m_position.Y = (int)a_worldObject.m_position.Y;
            }
            else
            {
                a_worldObject.m_position.Y = (int)a_worldObject.m_position.Y + Map.m_tileSizeDivided;
            }

            a_worldObject.m_position.Z = m_tiles[(int)a_worldObject.m_position.X, (int)a_worldObject.m_position.Y].m_height;

            m_worldObjects.Add(a_worldObject);
        }

        ///<summary>
        ///Returns a world object of a specific type on a specific area! 
        ///</summary>      
        public WorldObject GetWorldObject(ref Rectangle a_buildArea,WorldObjectType a_type)
        {            
            foreach (WorldObject worldObject in m_worldObjects)
            {
                Rectangle f_woArea = MathGameHelper.GetAreaRectangle(ref worldObject.m_position, ref worldObject.m_size);


                if (MathGameHelper.RectanglesIntersects(ref a_buildArea, ref f_woArea)  && a_type == worldObject.m_type )
                {
                    if (worldObject.m_type == WorldObjectType.SoL)
                    {
                        if ((worldObject as SoL).m_taken)
                        {
                            return null;
                        }
                    }
                    
                    return worldObject;
                }
            }

            return null;
        }
        // test
        ///<summary>
        ///Returns any world object that is inside buildarea, 
        ///used for instance by standard build if it's not looking for a WO to check that you're not building on a WO! 
        ///</summary>        
        internal WorldObject GetWorldObject(ref Rectangle a_buildArea)
        {            
            foreach (WorldObject worldObject in m_worldObjects)
            {
                Rectangle f_woArea = MathGameHelper.GetAreaRectangle(ref worldObject.m_position, ref worldObject.m_size);
                //Intersect properly...
                if (MathGameHelper.RectanglesIntersects(ref a_buildArea, ref f_woArea) )
                {                    
                    return worldObject;
                }
            }

            return null;
        }

        //Gets the closest untaken World Object to a certain point of a certain type
        public WorldObject GetClosestUntakenWorldObject(Vector3 a_position, WorldObjectType a_type, List<WorldObject> a_discardedWOs)
        {
            WorldObject f_closestWO = null;

            float f_distance = 0;            
                          
            for (int i = 0; i < m_worldObjects.Count; i++)
            {
                if (m_worldObjects[i].m_type == a_type && !m_worldObjects[i].m_taken && !a_discardedWOs.Contains(m_worldObjects[i]) )
                {
                    if (f_closestWO != null)
                    {
                        float f_tempDistance = (a_position - m_worldObjects[i].m_position).LengthSquared();

                        if (f_tempDistance < f_distance)
                        {
                            f_distance = f_tempDistance;
                            f_closestWO = m_worldObjects[i];
                        }
                    }//if the WO is null it has to be initialized :p
                    else
                    {
                        f_closestWO = m_worldObjects[i];
                        f_distance = (a_position - m_worldObjects[i].m_position).LengthSquared();
                    }

                }                    
            }
            
            return f_closestWO;
        }

        public bool AreaBuildable(ref Rectangle a_area, float a_height)
        {
            if (IsTile(a_area.Left, a_area.Top) && IsTile(a_area.Right, a_area.Bottom))
            {
                bool f_sameHeight = true;

                int bottom = a_area.Top;
                int top = a_area.Bottom;

                if (a_area.Bottom < a_area.Top)
                {
                    bottom = a_area.Bottom;
                    bottom = a_area.Top;
                }
                

                for (int y = bottom;y <= top; y++)
                {
                    if (f_sameHeight)
                    {
                        for (int x = a_area.Left; x <= a_area.Right; x++)
                        {
                            if (a_height != m_tiles[x, y].m_height || m_tiles[x,y].m_type == Tiletype.Blocked)
                            {
                                f_sameHeight = false;
                                break;
                            }
                        }
                    }
                }

                return f_sameHeight;
            }

            return false;
        }

        public void AddBuildingOnMap(ref Rectangle a_area)
        {
            int bottom = a_area.Top;
            int top = a_area.Bottom;

            if (a_area.Bottom < a_area.Top)
            {
                bottom = a_area.Bottom;
                bottom = a_area.Top;
            }
            for (int y = bottom; y <= top; y++)
            {
                for (int x = a_area.Left; x <= a_area.Right; x++)
                {

                    m_tiles[x, y].m_type = Tiletype.Blocked;    
                    
                }
            }
        }

        public void RemoveBuildingOnMap(ref Rectangle a_area)
        {
            int bottom = a_area.Top;
            int top = a_area.Bottom;

            if (a_area.Bottom <= a_area.Top)
            {
                bottom = a_area.Bottom;
                bottom = a_area.Top;
            }

            for (int y = bottom; y <= top; y++)
            {
                for (int x = a_area.Left; x <= a_area.Right; x++)
                {
                    m_tiles[x, y].m_type = Tiletype.Normal;
                }
            }
        }

        public bool IsTile(int a_x, int a_y)
        {
            //returns if the tile cordinates is inside the map, 
            return a_x >= 0 && a_x < m_Xlength && a_y >= 0 && a_y < m_Ylength;
        }

        public bool IsYPosInside(int a_y)
        {
            return a_y >= 0 && a_y < m_Ylength;
        }

        public bool IsXPosInside(int a_x)
        {
            return a_x >= 0 && a_x < m_Xlength;
        }

        
    }    
}
