using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Pathfinding
{
    class BruteForce
    {
        Map r_map;

        public List<Vector2> m_pathList;


        public BruteForce(ref Map a_map)
        {
            r_map = a_map;
        }


        public void DepthFirst(Vector2 a_start, Vector2 a_target)
        {
            m_pathList = new List<Vector2>();

            List<Node> OpenList = new List<Node>();
            List<Node> ClosedList = new List<Node>();

            //this array will tell us if we have added a node to the closed list or not
            bool[,] whichList = new bool[r_map.m_Xlength, r_map.m_Ylength];

            //0.Convert start and target input to the start and target square
            int startX = (int)a_start.X, startY = (int)a_start.Y;
            int targetX = (int)a_target.X, targetY = (int)a_target.Y;

            

            //add the start node
            OpenList.Add(new Node(r_map.m_tiles[startX, startY]));
            Node currentNode;

            while (OpenList.Count != 0)
            {
                //pop the first node from our Open List
                currentNode = OpenList[0];
                OpenList.RemoveAt(0);

                //check to see if the removed node is our destination
                //if it is our destination
                if (currentNode.x == targetX && currentNode.y == targetY)
                {
                    //loop until we are back to the start
                    while (currentNode != null)
                    {
                        //add the path backwards
                        m_pathList.Add(new Vector2(currentNode.x + Map.m_tileSizeDivided, currentNode.y + Map.m_tileSizeDivided));

                        //get parent of the node
                        currentNode = currentNode.parent;
                    }

                    //reverse the list so that we have the proper order
                    m_pathList.Reverse();

                    //get out of the loop
                    break;
                }
                //we are not at the destination
                else
                {
                    //extract the neighbors of our above removed node
                    for (int y = currentNode.y -1; y <= currentNode.y +1; y++)
                    {
                        for (int x = currentNode.x -1; x <=  currentNode.x +1; x++)
                        {
                            //if not outside the map
                            if (x != -1 && y != -1 && x != r_map.m_Xlength && y != r_map.m_Ylength)
                            {
                                //if not the current node
                                if (x != currentNode.x || y != currentNode.y)
                                {
                                    //if it's not been added to the closed list yet
                                    if (whichList[x, y] == false)
                                    {
                                        //if it's not blocked
                                        if (r_map.m_tiles[x, y].m_type != Tile.Tiletype.Blocked)
                                        {
                                            //create the neighbor
                                            Node n = new Node(r_map.m_tiles[x, y]);
                                            n.parent = currentNode;//make the current node it's parent

                                            //add the neighbor at the BEGINNING of the open list
                                            OpenList.Insert(0, n);

                                            //add the current node to the closed list
                                            ClosedList.Add(currentNode);

                                            whichList[x, y] = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        public void BreadthFirst(Vector2 a_start, Vector2 a_target)
        {
            m_pathList = new List<Vector2>();

            List<Node> OpenList = new List<Node>();
            List<Node> ClosedList = new List<Node>();

            //this array will tell us if we have added a node to the closed list or not
            bool[,] whichList = new bool[r_map.m_Xlength, r_map.m_Ylength];

            //0.Convert start and target input to the start and target square
            int startX = (int)a_start.X, startY = (int)a_start.Y;
            int targetX = (int)a_target.X, targetY = (int)a_target.Y;



            //add the start node
            OpenList.Add(new Node(r_map.m_tiles[startX, startY]));
            Node currentNode;

            while (OpenList.Count != 0)
            {
                //pop the first node from our Open List
                currentNode = OpenList[0];
                OpenList.RemoveAt(0);

                //check to see if the removed node is our destination
                //if it is our destination
                if (currentNode.x == targetX && currentNode.y == targetY)
                {
                    //loop until we are back to the start
                    while (currentNode != null)
                    {
                        //add the path backwards
                        m_pathList.Add(new Vector2(currentNode.x + Map.m_tileSizeDivided, currentNode.y + Map.m_tileSizeDivided));

                        //get parent of the node
                        currentNode = currentNode.parent;
                    }

                    //reverse the list so that we have the proper order
                    m_pathList.Reverse();

                    //get out of the loop
                    break;
                }
                //we are not at the destination
                else
                {
                    //extract the neighbors of our above removed node
                    for (int y = currentNode.y - 1; y <= currentNode.y + 1; y++)
                    {
                        for (int x = currentNode.x - 1; x <= currentNode.x + 1; x++)
                        {
                            //if not outside the map
                            if (x != -1 && y != -1 && x != r_map.m_Xlength && y != r_map.m_Ylength)
                            {
                                //if not the current node
                                if (x != currentNode.x || y != currentNode.y)
                                {
                                    //if it's not been added to the closed list yet
                                    if (whichList[x, y] == false)
                                    {
                                        //if it's not blocked
                                        if (r_map.m_tiles[x, y].m_type != Tile.Tiletype.Blocked)
                                        {
                                            //create the neighbor
                                            Node n = new Node(r_map.m_tiles[x, y]);
                                            n.parent = currentNode;//make the current node it's parent

                                            //add the neighbor at the END of the open list
                                            OpenList.Insert(OpenList.Count, n);

                                            //add the current node to the closed list
                                            ClosedList.Add(currentNode);

                                            whichList[x, y] = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }

        }
    }
}
