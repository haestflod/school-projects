using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses
{
    [Serializable]
    class PathFinder
    {
        //this map will get a reference to the real map, so if the real map changes so will this
        Map m_map;

	    int onClosedList = 0;

        //basically, this is what the FindPath will return 
        //but it will also store a path (if one is found) in m_pathList
	    const int found = 1, nonexistent = 2; 

	    //Create needed arrays
	    int[] openList;     //1 dimensional array holding ID# of open list items
        int[,] whichList;   //2 dimensional array used to record whether a cell is on the open list or on the closed list.
        int[] openX;        //1d array stores the x location of an item on the open list
        int[] openY;        //1d array stores the y location of an item on the open list
	    int[,] parentX;     //2d array to store parent of each cell (x)
	    int[,] parentY;     //2d array to store parent of each cell (y)
	    int[] Fcost;	    //1d array to store F cost of a cell on the open list
	    int[,] Gcost; 	    //2d array to store G cost for each cell.
	    int[] Hcost;	    //1d array to store H cost of a cell on the open list

        //this is where the paths will be stored (until a new path is created)
        public List<Vector3> m_pathList = new List<Vector3>();

        /// <summary>
        /// The total length of the path. WARNING: Use this ONLY to compare other pathlength's, since it's using Gcost which is not to scale with the Map
        /// </summary>
        public int m_pathLength;

        
        public PathFinder(ref Map a_map)
        {
            //Create needed arrays
            openList = new int[a_map.m_Xlength * a_map.m_Ylength + 2]; //1 dimensional array holding ID# of open list items
            whichList = new int[a_map.m_Xlength + 1, a_map.m_Ylength + 1];  //2 dimensional array used to record whether a cell is on the open list or on the closed list.
            openX = new int[a_map.m_Xlength * a_map.m_Ylength + 2]; //1d array stores the x location of an item on the open list
            openY = new int[a_map.m_Xlength * a_map.m_Ylength + 2]; //1d array stores the y location of an item on the open list
            parentX = new int[a_map.m_Xlength + 1, a_map.m_Ylength + 1]; //2d array to store parent of each cell (x)
            parentY = new int[a_map.m_Xlength + 1, a_map.m_Ylength + 1]; //2d array to store parent of each cell (y)
            Fcost = new int[a_map.m_Xlength * a_map.m_Ylength + 2];	//1d array to store F cost of a cell on the open list
            Gcost = new int[a_map.m_Xlength + 1, a_map.m_Ylength + 1]; 	//2d array to store G cost for each cell.
            Hcost = new int[a_map.m_Xlength * a_map.m_Ylength + 2];	//1d array to store H cost of a cell on the open list

            m_map = a_map;//set map reference
        }


        /// <summary>
        /// Finds the fastest a path from point A to point B, which will be stored in m_pathList (if a path was found).
        /// Returns: 1 = found, 2 = nonexistent
        /// </summary>
        public int FindPath(Vector3 a_start, Vector3 a_target)
        {
            int onOpenList = 0, parentXval = 0, parentYval = 0,
            a = 0, b = 0, m = 0, u = 0, v = 0, temp = 0, numberOfOpenListItems = 0,
            addedGCost = 0, tempGcost = 0, path = 0,
            tempx, pathX, pathY,
            newOpenListItemID = 0;

            bool cornerIsWalkable;
            

            //reset past path list
            m_pathList = new List<Vector3>();
            m_pathLength = 0;//reset the path's length aswell


            //0.Convert start and target input to the start and target square
            int startX = (int)a_start.X, startY = (int)a_start.Y;
            int targetX = (int)a_target.X, targetY = (int)a_target.Y;

            //1.Quick Path Checks: Under the some circumstances no path needs to be generated

            //if for some reason the target is NaN
            //NOTE: this fixes a certain problem in our project when targeting outside the map.
            //      This is NOT a general check in pathfinders, and should be solved at it's core (NOT here).
            //      But our time is limited, so for now this will do.
            if (double.IsNaN(a_target.X) || double.IsNaN(a_target.Y) || double.IsNaN(a_target.Z))
                return nonexistent;

            #region Smart Targeting™
            //If target square is unwalkable, we will try to find an alternative square 
            //  (as close as possible to the target) to go to instead.
            //However if no alternative is found, the pathfinding will end here

            //I shall call this: Smart Targeting™
            
            if (m_map.m_tiles[targetX, targetY].m_type == Tiletype.Blocked)
            {
                //a offset vector (used to set new true target, when the closest (none blocked) tile is found)
                Vector2 offsetVector = new Vector2();
                //the length to the closest (none blocked) tile
                float closestLength = float.MaxValue;
                //they are set to -1 at start to know if no alternative tile was found
                int tempTargetX = -1, tempTargetY = -1;

                //go through all adjacent tiles
                for (int y = targetY - 1; y <= targetY + 1; y++)
                {
                    for (int x = targetX - 1; x <= targetX + 1; x++)
                    {
                        //if this is inside the map
                        if (m_map.IsTile(x, y))
                        {
                            //if the tile is NOT blocked
                            if (m_map.m_tiles[x, y].m_type != Tiletype.Blocked)
                            {
                                //calc the length
                                //NOTE: the length to the true target, NOT the converted one!
                                float length = new Vector2(a_target.X - (x + (float)Map.m_tileSize / 2), a_target.Y - (y + (float)Map.m_tileSize / 2)).Length();

                                //if this length is closer than the currently closest
                                if (length < closestLength)
                                {
                                    //set new clostest
                                    closestLength = length;

                                    //set this tile as a good target
                                    tempTargetX = x; tempTargetY = y;

                                    //set the offset vector
                                    offsetVector = new Vector2((x + (float)Map.m_tileSize / 2) - a_target.X, (y + (float)Map.m_tileSize / 2) - a_target.Y);
                                }
                            }
                        }
                    }
                }

                //if a alternative tile was found
                if (tempTargetX >= 0 && tempTargetY >= 0)
                {
                    //the true target has to be changed
                    //NOTE: this will only be changed in here, since it's not a ref variable
                    a_target = a_target + new Vector3(offsetVector, 0);//this is the middle of the alternative tile

                    //the height has to be changed aswell
                    a_target.Z = m_map.m_tiles[tempTargetX, tempTargetY].m_height;


                    //this part is to go as close as possible to the blocked tile (that you actually wanted to go to)

                    //if no change in Y
                    if (tempTargetY == targetY)
                    {
                        //change X
                        if (tempTargetX < targetX)
                            a_target.X += 0.49f;
                        else
                            a_target.X -= 0.49f;
                    }
                    //if no change in X
                    else if (tempTargetX == targetX)
                    {
                        //change Y
                        if (tempTargetY < targetY)
                            a_target.Y += 0.49f;
                        else
                            a_target.Y -= 0.49f;
                    }
                    //if change in both Y and X (a diagonal position)
                    else
                    {
                        //change X
                        if (tempTargetX < targetX)
                            a_target.X += 0.49f;
                        else
                            a_target.X -= 0.49f;

                        //change Y
                        if (tempTargetY < targetY)
                            a_target.Y += 0.49f;
                        else
                            a_target.Y -= 0.49f;
                    }
                    


                    //set target to the closest (none blocked) tile
                    targetX = tempTargetX; targetY = tempTargetY;
                }
                //no alternative tile was found
                else
                {
                    return nonexistent;
                }
            }
            #endregion

            //If starting location and target are in the same location...
            //NOTE: this has to happen AFTER Smart Targeting™, because no path can be found if you start on the targeted tile
            if (startX == targetX && startY == targetY)
            {
                //add the targeted location to the pathlist
                m_pathList.Add(a_target);

                return found;
            }
            


            //2.Reset some variables that need to be cleared 
            //NOTE: m_pathList is reseted earlier, to make sure that no path will be added when the code exit in 1.Quick Path Checks
            if (onClosedList > 1000000) //reset whichList occasionally
            {
                for (int x = 0; x < m_map.m_Xlength; x++)
                {
                    for (int y = 0; y < m_map.m_Ylength; y++)
                        whichList[x, y] = 0;
                }
                onClosedList = 10;
            }
            onClosedList = onClosedList + 2; //changing the values of onOpenList and onClosed list is faster than redimming whichList() array
            onOpenList = onClosedList - 1;
            Gcost[startX, startY] = 0; //reset starting square's G value to 0

            
            //3.Add the starting location to the open list of squares to be checked.
	        numberOfOpenListItems = 1;
	        openList[1] = 1; //assign it as the top (and currently only) item in the open list, which is maintained as a binary heap (explained below)
	        openX[1] = startX ; openY[1] = startY;


            #region Pathfinding
            //4.Do the following until a path is found or deemed nonexistent.
            do
            {

                //5.If the open list is not empty, take the first cell off of the list.
                //	This is the lowest F cost cell on the open list.
                if (numberOfOpenListItems != 0)
                {

                    //6. Pop the first item off the open list.
                    parentXval = openX[openList[1]];
                    parentYval = openY[openList[1]]; //record cell coordinates of the item
                    whichList[parentXval, parentYval] = onClosedList; //add the item to the closed list

                    //	Open List = Binary Heap: Delete this item from the open list, which
                    //  is maintained as a binary heap. For more information on binary heaps, see:
                    //	http://www.policyalmanac.org/games/binaryHeaps.htm
                    numberOfOpenListItems = numberOfOpenListItems - 1;//reduce number of open list items by 1	

                    //	Delete the top item in binary heap and reorder the heap, with the lowest F cost item rising to the top.
                    openList[1] = openList[numberOfOpenListItems + 1];//move the last item in the heap up to slot #1
                    v = 1;

                    //	Repeat the following until the new item in slot #1 sinks to its proper spot in the heap.
                    do
                    {
                        u = v;
                        if (2 * u + 1 <= numberOfOpenListItems) //if both children exist
                        {
                            //Check if the F cost of the parent is greater than each child.
                            //Select the lowest of the two children.
                            if (Fcost[openList[u]] >= Fcost[openList[2 * u]])
                                v = 2 * u;

                            if (Fcost[openList[v]] >= Fcost[openList[2 * u + 1]])
                                v = 2 * u + 1;
                        }
                        else
                        {
                            if (2 * u <= numberOfOpenListItems) //if only child #1 exists
                            {
                                //Check if the F cost of the parent is greater than child #1	
                                if (Fcost[openList[u]] >= Fcost[openList[2 * u]])
                                    v = 2 * u;
                            }
                        }

                        if (u != v) //if parent's F is > one of its children, swap them
                        {
                            temp = openList[u];
                            openList[u] = openList[v];
                            openList[v] = temp;
                        }
                        else
                            break; //otherwise, exit loop

                    } while (true); //END of:    Repeat the following until the new item in slot #1 sinks to its proper spot in the heap.


                    //7.Check the adjacent squares. (Its "children" -- these path children
                    //	are similar, conceptually, to the binary heap children mentioned
                    //	above, but don't confuse them. They are different. Path children
                    //	are portrayed in Demo 1 with grey pointers pointing toward
                    //	their parents.) Add these adjacent child squares to the open list
                    //	for later consideration if appropriate (see various if statements
                    //	below).
                    for (b = parentYval - 1; b <= parentYval + 1; b++)
                    {
                        for (a = parentXval - 1; a <= parentXval + 1; a++)
                        {

                            //	If not off the map (do this first to avoid array out-of-bounds errors)
                            if (a != -1 && b != -1 && a != m_map.m_Xlength && b != m_map.m_Ylength)
                            {

                                //	If not already on the closed list (items on the closed list have
                                //	already been considered and can now be ignored).			
                                if (whichList[a, b] != onClosedList)
                                {

                                    //	If not a wall/obstacle square.
                                    if (m_map.m_tiles[a, b].m_type != Tiletype.Blocked)
                                    {

                                        //	Don't cut across corners
                                        cornerIsWalkable = true;
                                        if (a == parentXval - 1)
                                        {
                                            if (b == parentYval - 1)
                                            {
                                                if (m_map.m_tiles[parentXval - 1, parentYval].m_type == Tiletype.Blocked
                                                    || m_map.m_tiles[parentXval, parentYval - 1].m_type == Tiletype.Blocked)
                                                    cornerIsWalkable = false;
                                            }
                                            else if (b == parentYval + 1)
                                            {
                                                if (m_map.m_tiles[parentXval, parentYval + 1].m_type == Tiletype.Blocked
                                                    || m_map.m_tiles[parentXval - 1, parentYval].m_type == Tiletype.Blocked)
                                                    cornerIsWalkable = false;
                                            }
                                        }
                                        else if (a == parentXval + 1)
                                        {
                                            if (b == parentYval - 1)
                                            {
                                                if (m_map.m_tiles[parentXval, parentYval - 1].m_type == Tiletype.Blocked
                                                    || m_map.m_tiles[parentXval + 1, parentYval].m_type == Tiletype.Blocked)
                                                    cornerIsWalkable = false;
                                            }
                                            else if (b == parentYval + 1)
                                            {
                                                if (m_map.m_tiles[parentXval + 1, parentYval].m_type == Tiletype.Blocked
                                                    || m_map.m_tiles[parentXval, parentYval + 1].m_type == Tiletype.Blocked)
                                                    cornerIsWalkable = false;
                                            }
                                        }

                                        if (cornerIsWalkable == true)
                                        {
                                            //	If not already on the open list, add it to the open list.			
                                            if (whichList[a, b] != onOpenList)
                                            {
                                                //Create a new open list item in the binary heap.
                                                newOpenListItemID = newOpenListItemID + 1; //each new item has a unique ID #
                                                m = numberOfOpenListItems + 1;
                                                openList[m] = newOpenListItemID;//place the new open list item (actually, its ID#) at the bottom of the heap
                                                openX[newOpenListItemID] = a;
                                                openY[newOpenListItemID] = b;//record the x and y coordinates of the new item

                                                //Figure out its G cost
                                                if (Math.Abs(a - parentXval) == 1 && Math.Abs(b - parentYval) == 1)
                                                    addedGCost = 14;//cost of going to diagonal squares	
                                                else
                                                    addedGCost = 10;//cost of going to non-diagonal squares				
                                                Gcost[a, b] = Gcost[parentXval, parentYval] + addedGCost;

                                                //Figure out its H and F costs and parent
                                                Hcost[openList[m]] = 10 * (Math.Abs(a - targetX) + Math.Abs(b - targetY));
                                                Fcost[openList[m]] = Gcost[a, b] + Hcost[openList[m]];
                                                parentX[a, b] = parentXval; parentY[a, b] = parentYval;

                                                //Move the new open list item to the proper place in the binary heap.
                                                //Starting at the bottom, successively compare to parent items,
                                                //swapping as needed until the item finds its place in the heap
                                                //or bubbles all the way to the top (if it has the lowest F cost).
                                                while (m != 1) //While item hasn't bubbled to the top (m=1)	
                                                {
                                                    //Check if child's F cost is < parent's F cost. If so, swap them.	
                                                    if (Fcost[openList[m]] <= Fcost[openList[m / 2]])
                                                    {
                                                        temp = openList[m / 2];
                                                        openList[m / 2] = openList[m];
                                                        openList[m] = temp;
                                                        m = m / 2;
                                                    }
                                                    else
                                                        break;
                                                }
                                                numberOfOpenListItems = numberOfOpenListItems + 1;//add one to the number of items in the heap

                                                //Change whichList to show that the new item is on the open list.
                                                whichList[a, b] = onOpenList;
                                            }

                                            //8.If adjacent cell is already on the open list, check to see if this 
                                            //	path to that cell from the starting location is a better one. 
                                            //	If so, change the parent of the cell and its G and F costs.	
                                            else //If whichList(a,b) = onOpenList
                                            {

                                                //Figure out the G cost of this possible new path
                                                if (Math.Abs(a - parentXval) == 1 && Math.Abs(b - parentYval) == 1)
                                                    addedGCost = 14;//cost of going to diagonal tiles	
                                                else
                                                    addedGCost = 10;//cost of going to non-diagonal tiles				
                                                tempGcost = Gcost[parentXval, parentYval] + addedGCost;

                                                //If this path is shorter (G cost is lower) then change
                                                //the parent cell, G cost and F cost. 		
                                                if (tempGcost < Gcost[a, b]) //if G cost is less,
                                                {
                                                    parentX[a, b] = parentXval; //change the square's parent
                                                    parentY[a, b] = parentYval;
                                                    Gcost[a, b] = tempGcost;//change the G cost			

                                                    //Because changing the G cost also changes the F cost, if
                                                    //the item is on the open list we need to change the item's
                                                    //recorded F cost and its position on the open list to make
                                                    //sure that we maintain a properly ordered open list.
                                                    for (int x = 1; x <= numberOfOpenListItems; x++) //look for the item in the heap
                                                    {
                                                        if (openX[openList[x]] == a && openY[openList[x]] == b) //item found
                                                        {
                                                            Fcost[openList[x]] = Gcost[a, b] + Hcost[openList[x]];//change the F cost

                                                            //See if changing the F score bubbles the item up from it's current location in the heap
                                                            m = x;
                                                            while (m != 1) //While item hasn't bubbled to the top (m=1)	
                                                            {
                                                                //Check if child is < parent. If so, swap them.	
                                                                if (Fcost[openList[m]] < Fcost[openList[m / 2]])
                                                                {
                                                                    temp = openList[m / 2];
                                                                    openList[m / 2] = openList[m];
                                                                    openList[m] = temp;
                                                                    m = m / 2;
                                                                }
                                                                else
                                                                    break;
                                                            }
                                                            break; //exit for x = loop
                                                        } //If openX(openList(x)) = a
                                                    } //For x = 1 To numberOfOpenListItems
                                                }//If tempGcost < Gcost(a,b)

                                            }//else If whichList(a,b) = onOpenList	
                                        }//If not cutting a corner
                                    }//If not a wall/obstacle square.
                                }//If not already on the closed list 
                            }//If not off the map
                        }//for (a = parentXval-1; a <= parentXval+1; a++){
                    }//for (b = parentYval-1; b <= parentYval+1; b++){

                }//if (numberOfOpenListItems != 0)

                //9.If open list is empty then there is no path.	
                else
                {
                    path = nonexistent; break;
                }

                //If target is added to open list then path has been found.
                if (whichList[targetX, targetY] == onOpenList)
                {
                    path = found; break;
                }

            } while (true); //END of:     4.Do the following until a path is found or deemed nonexistent.
            #endregion


            //10.Save the path if it exists.
            if (path == found)
	        {
                //since you can only get the path backwards, i'm going to make this simple for myself
                //by adding the path nodes to a list and then reverse the whole list
                //this might be changed in the future to add it in the correct order (backwards)

                pathX = targetX; pathY = targetY;//start from the target location
                //repeat the following until you are in the start location
                do
                {
                    //add this path
                    //NOTE: tileSize is used to make the paths in the middle of the tiles
                    //(since a Tile's position is in the bottom-left, while a Thing's position is in the center)
                    m_pathList.Add(new Vector3(pathX + (float)Map.m_tileSize / 2, pathY + (float)Map.m_tileSize / 2, m_map.m_tiles[pathX, pathY].m_height));

                    //increase path length
                    m_pathLength += Gcost[pathX, pathY];

                    //Look up the parent of the current cell.	
                    tempx = parentX[pathX, pathY];
                    pathY = parentY[pathX, pathY];
                    pathX = tempx;

                    //If we have reached the starting square, exit the loop.	
                }
                while (pathX != startX || pathY != startY);

                //remove the last (which is the first now)
                //NOTE: this is because the final one is the same square that was targeted, 
                //  thus it's stupid to go to this square and then go to somewhere on this square again (atleast as long as we don't cut corners)
                m_pathList.RemoveAt(0);

                //reverse the path list
                m_pathList.Reverse();

                //add the final destination
                m_pathList.Add(a_target);
            }
            return path;
        }
    }
}
