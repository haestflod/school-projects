using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Pathfinding
{
    class AStarPathfinding
    {
        //this map will get a reference to the real map, so if the real map changes so will this
        Map r_map;

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
        public List<Vector2> m_pathList = new List<Vector2>();


        public AStarPathfinding(ref Map a_map)
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

            r_map = a_map;//set map reference
        }


        /// <summary>
        /// Finds the fastest a path from point A to point B, which will be stored in m_pathList (if a path was found).
        /// Returns: 1 = found, 2 = nonexistent
        /// </summary>
        public int FindPath(Vector2 a_start, Vector2 a_target)
        {
            int onOpenList = 0, parentXval = 0, parentYval = 0,
            a = 0, b = 0, m = 0, u = 0, v = 0, temp = 0, numberOfOpenListItems = 0,
            addedGCost = 0, tempGcost = 0, path = 0,
            tempx, pathX, pathY,
            newOpenListItemID = 0;

            bool cornerIsWalkable;
            

            //reset past path list
            m_pathList = new List<Vector2>();


            //0.Convert start and target input to the start and target square
            int startX = (int)a_start.X, startY = (int)a_start.Y;
            int targetX = (int)a_target.X, targetY = (int)a_target.Y;

            //1.Quick Path Checks: Under the some circumstances no path needs to be generated

            //if the target location is blocked
            if (r_map.m_tiles[targetX, targetY].m_type == Tile.Tiletype.Blocked)
            {
                return nonexistent;
            }

            //If starting location and target are in the same location...
            if (startX == targetX && startY == targetY)
            {
                //add the targeted location to the pathlist
                m_pathList.Add(a_target);

                return found;
            }
            


            //2.Reset some variables that need to be cleared 
            if (onClosedList > 1000000) //reset whichList occasionally
            {
                for (int x = 0; x < r_map.m_Xlength; x++)
                {
                    for (int y = 0; y < r_map.m_Ylength; y++)
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
                    //  is maintained as a binary heap.
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
                            if (a != -1 && b != -1 && a != r_map.m_Xlength && b != r_map.m_Ylength)
                            {

                                //	If not already on the closed list (items on the closed list have
                                //	already been considered and can now be ignored).			
                                if (whichList[a, b] != onClosedList)
                                {

                                    //	If not a wall/obstacle square.
                                    if (r_map.m_tiles[a, b].m_type != Tile.Tiletype.Blocked)
                                    {

                                        //	Don't cut across corners
                                        cornerIsWalkable = true;
                                        if (a == parentXval - 1)
                                        {
                                            if (b == parentYval - 1)
                                            {
                                                if (r_map.m_tiles[parentXval - 1, parentYval].m_type == Tile.Tiletype.Blocked
                                                    || r_map.m_tiles[parentXval, parentYval - 1].m_type == Tile.Tiletype.Blocked)
                                                    cornerIsWalkable = false;
                                            }
                                            else if (b == parentYval + 1)
                                            {
                                                if (r_map.m_tiles[parentXval, parentYval + 1].m_type == Tile.Tiletype.Blocked
                                                    || r_map.m_tiles[parentXval - 1, parentYval].m_type == Tile.Tiletype.Blocked)
                                                    cornerIsWalkable = false;
                                            }
                                        }
                                        else if (a == parentXval + 1)
                                        {
                                            if (b == parentYval - 1)
                                            {
                                                if (r_map.m_tiles[parentXval, parentYval - 1].m_type == Tile.Tiletype.Blocked
                                                    || r_map.m_tiles[parentXval + 1, parentYval].m_type == Tile.Tiletype.Blocked)
                                                    cornerIsWalkable = false;
                                            }
                                            else if (b == parentYval + 1)
                                            {
                                                if (r_map.m_tiles[parentXval + 1, parentYval].m_type == Tile.Tiletype.Blocked
                                                    || r_map.m_tiles[parentXval, parentYval + 1].m_type == Tile.Tiletype.Blocked)
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
                                            else //If whichList(a,b) == onOpenList
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
                    m_pathList.Add(new Vector2(pathX + Map.m_tileSizeDivided, pathY + Map.m_tileSizeDivided));

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