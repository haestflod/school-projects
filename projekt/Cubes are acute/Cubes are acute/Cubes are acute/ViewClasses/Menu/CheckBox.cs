using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Content;

namespace Cubes_are_acute.ViewClasses.Menu
{
    class CheckBox : ViewClasses.UI.VisualComponent
    {
        public ChkState m_state = ChkState.Unchecked;        

        //Texture for when box is checked
        public Texture2D m_checked;

        //Texture for when box is unchecked
        public Texture2D m_unchecked;

        //the checkbox text
        public String m_checkBoxText = "";

        public CheckBox(int a_x, int a_y, int a_width, int a_height, Texture2D a_checked, Texture2D a_unchecked, String a_text)
            : base(a_x, a_y, a_width, a_height)
        {
            m_checked = a_checked;
            m_unchecked = a_unchecked;
            m_checkBoxText = a_text;
        }        

        public CheckBox(int a_x, int a_y, int a_width, int a_height)
            : base(a_x, a_y, a_width, a_height)
        {           
        }        

        public enum ChkState
        {
            Checked,
            Unchecked
        }

        public void Checked()
        {
            m_state = ChkState.Checked;
        }

        public void Unchecked()
        {
            m_state = ChkState.Unchecked;
        }
    }
}
