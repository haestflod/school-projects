using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Pathfinding
{
    class Tile
    {
        public int x;
        public int y;

        public Tiletype m_type = Tiletype.Normal;
        public enum Tiletype
        {
            Normal,
            Blocked
        }

        public Tile(int a_x, int a_y, Tiletype a_type)
        {
            x = a_x;
            y = a_y;
            m_type = a_type;
        }

        public bool IsInside(float a_x, float a_y)
        {
            return a_x >= x && a_x <= x + 1
                && a_y >= y && a_y <= y + 1;
        }
    }
}
