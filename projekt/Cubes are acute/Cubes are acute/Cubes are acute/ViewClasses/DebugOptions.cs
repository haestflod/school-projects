using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cubes_are_acute.ViewClasses
{
    class DebugOptions
    {
        public bool[] m_options = new bool[7];

        public bool m_freeLook = false;

        //Puts bounding boxes around every model
        public bool m_unitBoundingBoxDraw = false;

        public bool m_gridBoundingBoxDraw = false;

        //Shows the fps
        public bool m_showFPS = true;

        //Setting this to false turns virtual sync off
        public bool m_withVS = true;

        //Shows extended unit information, like wpos, attack cooldown timer
        public bool m_showUnitInfo = false;            

        //Shows the wpos of the mouse and grid location
        public bool m_showMouseWpos = false;

        public DebugOptions()
        {
            Add();                        
        }

        /// <summary>
        /// Sets all debug options to true
        /// </summary>
        public void ActivateDebug()
        {
            m_unitBoundingBoxDraw = true;
            m_gridBoundingBoxDraw = true;
            m_showFPS = true;
            m_withVS = true;
            m_showUnitInfo = true;
            m_showMouseWpos = true;
            m_freeLook = true;
        }

        /// <summary>
        /// Sets all debug options to false
        /// </summary>
        public void DeactivateDebug()
        {
            m_unitBoundingBoxDraw = false;
            m_gridBoundingBoxDraw = false;
            m_showFPS = false;
            m_withVS = false;
            m_showUnitInfo = false;
            m_showMouseWpos = false;
            m_freeLook = false;
        }      

        public void Add()
        {
            m_options[0] = m_showFPS;                     
            m_options[1] = m_showUnitInfo;
            m_options[2] = m_gridBoundingBoxDraw;
            m_options[3] = m_showMouseWpos;
            m_options[4] = m_unitBoundingBoxDraw;
            m_options[5] = m_freeLook;
            m_options[6] = m_withVS;
        }

        public void Update()
        {
            if (m_options[0] == false)
            {
                m_showFPS = false;
            }
            else if (m_options[0] == true)
            {
                m_showFPS = true;
            }

            if (m_options[1] == false)
            {
                m_showUnitInfo = false;
            }
            else if (m_options[1] == true)
            {
                m_showUnitInfo = true;
            }

            if (m_options[2] == false)
            {
                m_gridBoundingBoxDraw = false;
            }
            else if (m_options[2] == true)
            {
                m_gridBoundingBoxDraw = true;
            }

            if (m_options[3] == false)
            {
                m_showMouseWpos = false;
            }
            else if (m_options[3] == true)
            {
                m_showMouseWpos = true;
            }

            if (m_options[4] == false)
            {
                m_unitBoundingBoxDraw = false;
            }
            else if (m_options[4] == true)
            {
                m_unitBoundingBoxDraw = true;
            }

            if (m_options[5] == false)
            {
                m_freeLook = false;
            }
            else if (m_options[5] == true)
            {
                m_freeLook = true;
            }

            if (m_options[6] == false)
            {
                m_withVS = false;
            }
            else if (m_options[6] == true)
            {
                m_withVS = true;
            }
        }
    }
}
