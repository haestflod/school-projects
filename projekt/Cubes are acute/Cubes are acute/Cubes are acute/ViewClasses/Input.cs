using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ViewClasses.UI;

namespace Cubes_are_acute.ViewClasses
{
    class Input
    {
        public Keys m_moveCameraRight = Keys.Right;
        public Keys m_moveCameraLeft = Keys.Left;
        public Keys m_moveCameraForward = Keys.Up;
        public Keys m_moveCameraBackward = Keys.Down;

        public Keys m_home = Keys.Home;

        public Keys m_esc = Keys.Escape;

        public Keys m_f1 = Keys.F1;

        public KeyboardState m_keyboardState;
        public KeyboardState m_oldkeyboardState;

        public MouseHandler m_mouse = new MouseHandler();      

        private float m_mouseBBoffset = 0.05f;

        float? m_intersection;

        /// <summary>
        /// Has to be called before any other input commandos are done, or they will not read correctly
        /// </summary>
        public void GetKeyboardMouseState()
        {
            m_oldkeyboardState = m_keyboardState;
            m_keyboardState = Keyboard.GetState();                   
            m_mouse.GetState();            
        }

        public bool KeyPressed(Keys a_key)
        {
            return m_keyboardState.IsKeyDown(a_key);
        }

        public bool KeyClicked(Keys a_key)
        {
            if (m_keyboardState.IsKeyUp(a_key) && m_oldkeyboardState.IsKeyDown(a_key))
            {
                return true;
            }
            return false;
        }

        public bool movCameraRight()
        {
            return m_keyboardState.IsKeyDown(m_moveCameraRight);
        }

        public bool movCameraLeft()
        {
            return m_keyboardState.IsKeyDown(m_moveCameraLeft);
        }

        public bool movCameraForward()
        {
            return m_keyboardState.IsKeyDown(m_moveCameraForward);
        }

        public bool movCameraBackward()
        {
            return m_keyboardState.IsKeyDown(m_moveCameraBackward);
        }

        public bool ResetCamera()
        {
            return m_keyboardState.IsKeyDown(m_home);
        }

        public bool mouseLeftButtonDown()
        {
            if (m_mouse.IsLeftButtonDown())
            {
                return true;                
            }
            return false;
        }        

        public bool mouseLeftClick()
        {
            if (m_mouse.IsLeftClick())
            {
                return true;
            }
            return false;
        }              

        public bool mouseRightClick()
        {
            if (m_mouse.IsRightClick())
            {
                return true;
            }
            return false;
        } 

        public bool moveCameraDown()
        {
            if (m_mouse.ScrolledBackward())
            {
                return true;
            }
            return false;
        }

        public bool moveCameraUp()
        {
            if (m_mouse.ScrolledForward())
            {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Returns the ray that intersects with objects. Created through ViewPort.Unproject function
        /// </summary>
        /// <param name="a_mx">The mouse X position</param>
        /// <param name="a_my">The mouse Y position</param>        
        public Ray GetWorldRay(GraphicsDevice a_graphics, Camera a_camera, int a_mx, int a_my)
        {
            Vector3 maxPoint = a_graphics.Viewport.Unproject(new Vector3(a_mx, a_my, 1), a_camera.m_projection, a_camera.m_view, Matrix.Identity);
            Vector3 minPoint = a_graphics.Viewport.Unproject(new Vector3(a_mx, a_my, 0), a_camera.m_projection, a_camera.m_view, Matrix.Identity);

            //Creates the direction vector from the 2 points
            Vector3 f_dir = maxPoint - minPoint;
            f_dir.Normalize();

            return new Ray(minPoint, f_dir);
        }

        /// <summary>
        /// Returns world position by raytracing from nearplane to farplane and intersecting at a plane somewhere along the path
        /// </summary>
        /// <param name="a_device">Needed for unproject functions</param>
        /// <param name="a_plane">The plane that the ray intersects</param>
        /// <param name="a_camera">Needed to get all the matrixes</param>        
        public Vector3? GetWorldPosition(GraphicsDevice a_device,Plane a_plane,ModelClasses.Map a_map, Camera a_camera,int a_mx,int a_my)
        {
            //If the mouse pos is inside the HUD it will return null
            if (a_my < HUD.m_area.Top)
            {
                Ray f_ray = GetWorldRay(a_device, a_camera, a_mx, a_my);

                foreach (ModelClasses.Tile tile in a_map.m_tiles)
                {
                    m_intersection = f_ray.Intersects(tile.m_boundBox);

                    if (m_intersection.HasValue)
                    {
                        //Uses formula  Point =  Raypos + (Raydir * distanceToPoint) to calculate the position
                        Vector3 f_wpos = f_ray.Position + f_ray.Direction * m_intersection.Value;                        

                        return f_wpos;
                    }                            
                }
                //This will only happen if it fails to intersect with the map tiles, like you click outside map
                Plane plane = a_plane;

                plane.D -= 2;

                m_intersection = f_ray.Intersects(plane);

                if (m_intersection.HasValue)
                {
                    Vector3 f_wpos = f_ray.Position + f_ray.Direction * m_intersection.Value;

                    int x = (int)f_wpos.X;
                    int y = (int)f_wpos.Y;
                    //If the position is outside of map left side, it will get 0
                    if (f_wpos.X < 0)
                    {
                        f_wpos.X = 0;
                        x = 0;
                    }//If position is outside map right side it will be max width of map
                    else if (f_wpos.X >= a_map.m_mapWidth)
                    {
                        f_wpos.X = a_map.m_mapWidth - 0.01f;
                        x = a_map.m_Xlength - 1;
                    }

                    //If the position is outside map (bottom) it will be set to minimum
                    if (f_wpos.Y < 0)
                    {
                        f_wpos.Y = 0;
                        y = 0;
                    }//If outside on the top it will be set as maximum top
                    else if (f_wpos.Y >= a_map.m_mapDepth)
                    {
                        f_wpos.Y = a_map.m_mapDepth - 0.01f;
                        y = a_map.m_Ylength - 1;
                    }

                    f_wpos.Z = a_map.m_tiles[x, y].m_boundBox.Max.Z;

                    return f_wpos;
                }
            }
            return null;
        }

        public BoundingBox? CreateBBSelection(GraphicsDevice a_gd, Plane a_plane,ModelClasses.Map a_map, Camera a_camera)
        {
            //The old position, where you first started dragging mouse
            Vector3? f_oldPos = GetWorldPosition(a_gd, a_plane, a_map, a_camera, m_mouse.m_oldXpos, m_mouse.m_oldYpos);

            if (f_oldPos.HasValue)
            {
                Vector3? f_newPos;

                //If mouse is inside the HUD it sets the new pos just outside the hud
                if (m_mouse.m_mouseState.Y > HUD.m_area.Top)
                {
                    f_newPos = GetWorldPosition(a_gd, a_plane, a_map, a_camera, m_mouse.m_mouseState.X, HUD.m_area.Top);
                }//Otherwise it sets the current mouse pos as the other point, to create the BB between oldPos & newPos
                else
                {
                    f_newPos = GetWorldPosition(a_gd, a_plane, a_map, a_camera, m_mouse.m_mouseState.X, m_mouse.m_mouseState.Y);
                }

                if (f_newPos.HasValue)
                {
                    //If the mouse cursor is to the left of where you started
                    if (f_newPos.Value.X < f_oldPos.Value.X)
                    {
                        //If the mouse cursor is below the position where you started
                        if (f_newPos.Value.Y < f_oldPos.Value.Y)
                        {
                            return new BoundingBox(new Vector3(f_newPos.Value.X, f_newPos.Value.Y,f_newPos.Value.Z - m_mouseBBoffset),
                                                    new Vector3(f_oldPos.Value.X, f_oldPos.Value.Y,f_oldPos.Value.Z + m_mouseBBoffset));
                        }//IF the mouse cursor is above where you started
                        else
                        {
                            return new BoundingBox(new Vector3(f_newPos.Value.X, f_oldPos.Value.Y, f_newPos.Value.Z - m_mouseBBoffset),
                                                    new Vector3(f_oldPos.Value.X, f_newPos.Value.Y, f_oldPos.Value.Z + m_mouseBBoffset));
                        }
                    }//IF mouse cursor is to the right of where you started
                    else
                    {
                        //If mouse cursor is below where you started
                        if (f_newPos.Value.Y < f_oldPos.Value.Y)
                        {
                            return new BoundingBox(new Vector3(f_oldPos.Value.X, f_newPos.Value.Y, f_oldPos.Value.Z - m_mouseBBoffset),
                                                    new Vector3(f_newPos.Value.X, f_oldPos.Value.Y, f_newPos.Value.Z + m_mouseBBoffset));
                        }//If mouse cursor is above of where you started
                        else
                        {
                            return new BoundingBox(new Vector3(f_oldPos.Value.X, f_oldPos.Value.Y, f_oldPos.Value.Z - m_mouseBBoffset),
                                                    new Vector3(f_newPos.Value.X, f_newPos.Value.Y, f_newPos.Value.Z + m_mouseBBoffset));
                        }
                    }
                }
            }

            return null;
        }        
        
    }
}
