using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Cubes_are_acute.ModelClasses.Units;

namespace Cubes_are_acute.ModelClasses
{
    class MathGameHelper
    {
        public static Rectangle GetAreaRectangle(Vector3 a_position, Vector3 a_size)
        {
            if (a_size.X >= 1 && a_size.Y >= 1)
            {
                return new Rectangle((int)(a_position.X - a_size.X * 0.5f), (int)(a_position.Y - a_size.Y * 0.5f)
                        , (int)(a_size.X - 1), (int)(a_size.Y - 1));
            }
            else
            {
                return new Rectangle((int)a_position.X, (int)a_position.Y
                                    , 0, 0);
            }
        }

        public static Rectangle GetAreaRectangle(ref Vector3 a_position,ref Vector3 a_size)
        {
            if (a_size.X >= 1 && a_size.Y >= 1)
            {
            return new Rectangle((int)(a_position.X - a_size.X * 0.5f), (int)(a_position.Y - a_size.Y * 0.5f)
                    , (int)(a_size.X - 1), (int)(a_size.Y - 1));
            }
            else
            {
                return new Rectangle((int)a_position.X, (int)a_position.Y
                                    , 0, 0);
            }
        }
        
        /// <summary>
        /// Since XNA's Rectangle top & bottom are reversed this function should handle rectangles intersecting properly.
        /// </summary>
        /// <param name="firstRectangle">The rectangle that is possibly intersecting with another </param>
        /// <param name="secondRectangle">The second rectangle that first checks if it intersects with</param>
        /// <returns>Returns true if interesting, false if not</returns>
        public static bool RectanglesIntersects(ref Rectangle firstRectangle, ref Rectangle secondRectangle)
        {
            return  (
                        (firstRectangle.Left >= secondRectangle.Left && firstRectangle.Left <= secondRectangle.Right)
                        ||
                        (firstRectangle.Right >= secondRectangle.Left && firstRectangle.Right <= secondRectangle.Right)
                    )
                    &&
                    (
                        (firstRectangle.Top >= secondRectangle.Top && firstRectangle.Top <= secondRectangle.Bottom)
                        ||
                        (firstRectangle.Bottom >= secondRectangle.Top && firstRectangle.Bottom <= secondRectangle.Bottom)
                    );
        }

        /// <summary>
        /// Takes a list from buildingObject or StandardBuild and adds units back into the player list after for instance destroy, cancellation e.t.c.
        /// List is for example m_sacrifices from SB or m_builders in BuildingObject. 
        /// Minimum of 1 is destroyed tho. If the list has more than 1 objects in it
        /// </summary>
        /// <param name="a_thingList">The particular list of units</param>
        /// <param name="a_player">The player that list is restored to</param>
        /// <param name="a_percentReturnRate">How big percentage of units that is returned, 0.25 means 75% is returned</param>
        public static void RestoreXPercentUnits(List<Thing> a_thingList, Player a_player, float a_percentReturnRate)
        {
            //Checks if list isn't empty first
            if (a_thingList.Count > 0)
            {
                //Then sets the existance to true for all of them
                foreach (Thing thingy in a_thingList)
                {
                    thingy.m_exists = true;
                }

                //Gets the the amount to remove
                int f_amount = (int)(a_thingList.Count * a_percentReturnRate);

                //Checks if amount was 0 and the list has at least 1 element in it
                if (f_amount == 0 && a_thingList.Count > 1)
                {
                    //Then 1 will be removed!
                    f_amount = 1;
                }

                //Loops until f_amount is 0
                while (f_amount > 0)
                {
                    //Gets random number from the static random variable in Game
                    int index = Game.Randomizer.Next(0, a_thingList.Count - 1);

                    //If the element hadn't already been 'removed' 
                    if (a_thingList[index].m_exists)
                    {
                        //Set the existance to not existing
                        a_thingList[index].m_exists = false;
                        //And decrease the f_amount by 1 so it's not stuck in here forever!
                        f_amount--;
                    }
                }

                //Then add the units back to the player
                foreach (Thing thingy in a_thingList)
                {
                    a_player.AddReadyThing(thingy, null);
                }
            }
        }


    }
}
