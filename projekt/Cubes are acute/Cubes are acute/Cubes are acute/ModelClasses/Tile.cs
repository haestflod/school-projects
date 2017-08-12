using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses
{
    [Serializable]
    class Tile
    {

        public float m_height = 0;
        public Tiletype m_type = Tiletype.Normal;        

        public BoundingBox m_boundBox;
 
        /// <summary>
        /// Creates a new tile and sets the bounding box based on the x,y and height values
        /// </summary>
        /// <param name="a_x">The x value for bounding box</param>
        /// <param name="a_y">The y value for bounding box</param>
        /// <param name="a_height"></param>        
        public Tile(int a_x,int a_y,int a_height,Tiletype a_type)
        {
            m_height = a_height;
            m_type = a_type;

            m_boundBox = new BoundingBox(new Vector3(a_x, a_y, a_height), new Vector3(a_x + Map.m_tileSize, a_y + Map.m_tileSize, a_height)); 
        }        
    }

    public enum Tiletype
    {
        Normal,
        Blocked
    }
}
