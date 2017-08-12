using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using System.Threading;

namespace Pathfinding
{
    class MasterController
    {
        bool m_done = false;

        Map m_map = new Map(16, 16);

        AStarPathfinding m_aStar;

        BruteForce m_bruteForce;

        List<Vector2> m_path;

        Stopwatch m_timer = new Stopwatch();

        int m_numberOfLoops = 10;




        public void Start()
        {
            while (m_done == false)
            {
                m_timer.Start();//start
                m_timer.Stop();//stop
                Console.WriteLine(m_timer.ElapsedMilliseconds);

                m_timer.Reset();

                m_timer.Restart();//start
                m_timer.Stop();//stop
                Console.WriteLine(m_timer.ElapsedMilliseconds);

                Console.WriteLine("Choose map, 1 or 2:");
                string input = Console.ReadLine();

                if (input == "1" || input == "2")
                {
                    //initialize the map and the pathfinders
                    m_map.LoadMap(Int32.Parse(input));
                    m_aStar = new AStarPathfinding(ref m_map);
                    m_bruteForce = new BruteForce(ref m_map);

                    Console.WriteLine("Choose pathfinder, A* (1) or BruteForce (2):");
                    input = Console.ReadLine();

                    if (input == "1")
                    {
                        //use A*

                        m_timer.Reset();
                        for (int i = 0; i < m_numberOfLoops; i++)
                        {
                            m_timer.Start();//start
                            //find path
                            m_aStar.FindPath(m_map.m_start, m_map.m_goal);
                            m_timer.Stop();//stop
                        }

                        //set path
                        m_path = m_aStar.m_pathList;
                    }
                    else if (input == "2")
                    {
                        //use BruteForce

                        Console.WriteLine("Depth First:");
                        m_timer.Reset();
                        for (int i = 0; i < m_numberOfLoops; i++)
                        {
                            m_timer.Start();//start
                            //depth first
                            m_bruteForce.DepthFirst(m_map.m_start, m_map.m_goal);
                            m_timer.Stop();//stop
                        }
                        //set path
                        m_path = m_bruteForce.m_pathList;

                        //print the map
                        PrintMap();

                        //print the timer
                        PrintTimer(m_timer);
                        

                        Console.WriteLine("Breadth First:");
                        m_timer.Reset();
                        for (int i = 0; i < m_numberOfLoops; i++)
                        {
                            m_timer.Start();//start
                            //breadth first
                            m_bruteForce.BreadthFirst(m_map.m_start, m_map.m_goal);
                            m_timer.Stop();//stop
                        }
                        //set path
                        m_path = m_bruteForce.m_pathList;
                    }

                    //print the map
                    PrintMap();

                    //print the timer
                    PrintTimer(m_timer);

                }

                Console.WriteLine();//adding an empty line at the end
            }
        }

        public void PrintMap()
        {
            //for each row
            for (int y = 0; y < m_map.m_Ylength; y++)
            {
                string line = "";

                //for each line
                for (int x = 0; x < m_map.m_Xlength; x++)
                {
                    switch (m_map.m_tiles[x, y].m_type)
                    {
                        case Tile.Tiletype.Normal:
                            
                            bool isInThePath = false;

                            //loop through all the path's nodes
                            for (int i = 0; i < m_path.Count; i++)
                            {

                                if (m_map.m_tiles[x, y].IsInside(m_path[i].X, m_path[i].Y))
                                {
                                    line += " *";

                                    isInThePath = true;
                                    break;
                                }
                            }

                            if (isInThePath == false)
                            {
                                line += "  ";
                            }
                            break;
                        case Tile.Tiletype.Blocked:
                            line += " O";
                            break;
                    }
                }

                Console.WriteLine(line);
            }
        }

        public void PrintTimer(Stopwatch a_timer)
        {
            Console.WriteLine(String.Format("Time: {0}ms", (float)a_timer.ElapsedMilliseconds / (float)m_numberOfLoops));
        }
    }
}
