using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Pathfinding
{
    class Node
    {
        public int x;
        public int y;

        public Node parent;

        public Nodetype m_type = Nodetype.Normal;
        public enum Nodetype
        {
            Normal,
            Blocked
        }

        public Node(int a_x, int a_y, Nodetype a_type)
        {
            x = a_x;
            y = a_y;
            m_type = a_type;
        }

        public Node(Tile a_tile)
        {
            x = a_tile.x;
            y = a_tile.y;

            //if the tile is blocked
            if (a_tile.m_type == Tile.Tiletype.Blocked)
                m_type = Nodetype.Blocked;//block the node
        }
    }
}
