using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Content;

namespace Cubes_are_acute.ViewClasses.UI
{
    class Button : VisualComponent
    {
        /// <summary>
        /// State of the button, Normal or Pressed
        /// </summary>
        public BtnState m_state = BtnState.Normal;
        /// <summary>
        /// The Image of the button
        /// </summary>
        public Texture2D m_texture;
        /// <summary>
        /// The font the button uses
        /// </summary>
        public SpriteFont m_font;
        /// <summary>
        /// The text that button has, CLICK ME!!
        /// </summary>
        public string m_buttonText = "";
        /// <summary>
        /// The Color the text has
        /// </summary>
        public Color m_textColor;

        //They are used to set X and Y back to original values, cause X and Y changes when you click on button to give look of clicking!
        private int staticX;
        private int staticY;

        //Constructs button without a text
        public Button(int a_x, int a_y, int a_width, int a_height, Texture2D a_texture, SpriteFont a_font)
            : base(a_x, a_y, a_width, a_height)
        {
            m_texture = a_texture;
            m_font = a_font;

            staticX = X;
            staticY = Y;
        }

        //Constructs button with a text
        public Button(int a_x, int a_y, int a_width, int a_height, Texture2D a_texture, SpriteFont a_font, string a_text, Color a_color)
            : this(a_x, a_y, a_width, a_height, a_texture, a_font)
        {
            m_buttonText = a_text;
            m_textColor = a_color;
        }

        public Button(int a_x, int a_y, int a_width, int a_height, string a_text)
            : this(a_x, a_y, a_width, a_height)
        {
            m_buttonText = a_text;            
        }

        //Constructs button without a text, texture and font
        public Button(int a_x, int a_y, int a_width, int a_height)
            : base(a_x, a_y, a_width, a_height)
        {
            staticX = X;
            staticY = Y;
        }


        //sets a texture
        public void SetTexture(Texture2D a_texture)
        {
            m_texture = a_texture;
        }

        public enum BtnState
        {
            Normal,
            Pressed,
            Pending
        }

        public void Press()
        {
            m_state = BtnState.Pressed;
            X = staticX + 2;
            Y = staticY + 2;
        }

        public void Pending()
        {
            m_state = BtnState.Pending;
            X = staticX + 2;
            Y = staticY + 2;
        }

        public void NormalState()
        {
            m_state = BtnState.Normal;
            X = staticX;
            Y = staticY;
        }        
    }
}