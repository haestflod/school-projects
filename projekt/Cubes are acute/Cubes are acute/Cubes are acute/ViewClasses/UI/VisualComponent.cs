using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ViewClasses.UI
{
    class VisualComponent
    {
        //private float m_x, m_y;
        //private float m_width, m_height;
        public Rectangle m_rectangle;
        private bool m_visible = true;
        private bool m_readOnly = false;        

        /// <summary>
        /// The X-cordinate for the component 
        /// </summary>
        public int X
        {
            get { return m_rectangle.X; }
            set { m_rectangle.X = value; }
        }

        /// <summary>
        /// The Width of the component.
        /// </summary>
        public int Width
        {
            get { return m_rectangle.Width; }
            set { m_rectangle.Width = value; }
        }

        /// <summary>
        /// The height of the component.
        /// </summary>
        public int Height
        {
            get { return m_rectangle.Height; }
            set { m_rectangle.Height = value; }
        }

        /// <summary>
        /// The Y-cordinate of the component
        /// </summary>
        public int Y
        {
            get { return m_rectangle.Y; }
            set { m_rectangle.Y = value; }
        }

        /// <summary>
        /// If Visibility is false it will not be drawn.
        /// </summary>
        public bool Visibility
        {
            get { return m_visible; }
        }

        /// <summary>
        /// If readOnly is false you can't interact with the component.
        /// </summary>
        public bool ReadOnly
        {
            get { return m_readOnly; }
            set { m_readOnly = value; }
        }

        public VisualComponent(int a_x, int a_y, int a_width, int a_height)
        {
            X = a_x;
            Y = a_y;
            Width = a_width;
            Height = a_height;
        }


        /// <summary>
        /// This checks if mouse is over the component. Takes mouse-x and mouse-y position
        /// It also checks if the component is readonly or not. If it is it will not return true if you mouseovered
        /// </summary>               
        public bool IsMouseOver(int a_x, int a_y)
        {
            return (m_rectangle.Contains(a_x, a_y) && !m_readOnly);
        }        

        public void Show()
        {
            m_visible = true;            
        }

        public void Hide()
        {
            m_visible = false;
        }
    }
}
