using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ViewClasses.UI
{
    class Progressbar : VisualComponent
    {
        public Rectangle m_progressArea;
        private float m_percentage;

        public float Percentage
        {
            get { return m_percentage; }
            set
            {
                m_percentage = value;

                if (m_percentage > 1)
                {
                    m_percentage = 1;
                }
                else if (m_percentage < 0)
                {
                    m_percentage = 0;
                }
            }
        }

        public Progressbar(int a_x, int a_y, int a_width, int a_height)
            : base (a_x, a_y, a_width, a_height)
        {
            m_progressArea = m_rectangle;
        }

        public void SetProgress(float a_percentage)
        {
            Percentage = a_percentage;

            m_progressArea.Width = (int)((m_rectangle.Right - m_rectangle.Left) * a_percentage);
        }
    }
}
