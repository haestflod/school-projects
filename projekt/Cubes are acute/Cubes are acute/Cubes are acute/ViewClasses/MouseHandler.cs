using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework.Input;

namespace Cubes_are_acute.ViewClasses
{
    class MouseHandler 
    {
        public MouseState m_oldMouseState;
        public MouseState m_mouseState;

        //Used when holding down mouse to do a bigger selection
        public int m_oldXpos;
        public int m_oldYpos;      

        public MouseHandler()
        {            
            m_mouseState = Mouse.GetState();
            m_oldMouseState = m_mouseState;
        }

        public void GetState()
        {
            m_oldMouseState = m_mouseState;
            m_mouseState = Mouse.GetState();            
        }

        public bool IsLeftButtonDown()
        {
            if (m_mouseState.LeftButton == ButtonState.Pressed)
            {
                //If you pressed mousebutton just now it will keep the position of mouse where you clicked, 
                if (m_oldMouseState.LeftButton == ButtonState.Released)
                {
                    m_oldXpos = m_mouseState.X;
                    m_oldYpos = m_mouseState.Y;
                }

                return true;
            }
            return false;
        }       

        public bool IsLeftClick()
        {
            //if old statement was pressed and new is released it's a Click!
            if (m_oldMouseState.LeftButton == ButtonState.Pressed && m_mouseState.LeftButton == ButtonState.Released)
            {
                return true;
            }
            return false;
        }        

        public bool IsRightClick()
        {
            //if old statement was pressed and new is released it's a Click!
            if (m_oldMouseState.RightButton == ButtonState.Pressed && m_mouseState.RightButton == ButtonState.Released)
            {
                return true;
            }
            return false;
        }

        public bool ScrolledForward()
        { 
            //If the scrollwheel value increased you have scrolled forward
            if (m_mouseState.ScrollWheelValue > m_oldMouseState.ScrollWheelValue)
            {                
                return true;
            }
            return false;
        }

        public bool ScrolledBackward()
        {
            //If the scrollwheel value decreased you have scrolled backward
            if (m_mouseState.ScrollWheelValue < m_oldMouseState.ScrollWheelValue)
            {               
                return true;
            }
            return false;
        }
    }

    
}
