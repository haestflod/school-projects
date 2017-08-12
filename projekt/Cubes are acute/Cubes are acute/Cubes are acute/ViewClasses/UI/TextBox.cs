using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework.Graphics;

namespace Cubes_are_acute.ViewClasses.UI
{
    class TextBox : VisualComponent
    {
        /// <summary>
        /// NOTE: I wasn't very clever back when I wrote this I think, a key CLICK is easy handled by 2 keystates! 
        /// </summary>


        private string m_text = "";
        private bool m_focus = false;
        public SpriteFont m_font;
        public Texture2D m_layout;
        
        private Dictionary<Keys, KeyHandler> m_usedKeys = new Dictionary<Keys, KeyHandler>();
        private List<Keys> m_keys = new List<Keys>();
        private float m_totalTime = 0;

        //the text is inside textbox and needs separate co-ordinates!
        private float m_textX;
        private float m_textY;
        public bool m_wordWrap = true;
        private int m_maxLength = 50;

        //attributes
        /// <summary>
        /// The Text that textbox presents
        /// </summary>
        public string Text
        {
            get { return m_text; }
            set 
            {
                if (m_text.Length < MaxLength || value.Length == Text.Length-1)
                {
                    m_text = value;
                }
            }
        }

        /// <summary>
        /// The X-coordinate for texts position. Should be set inside the textbox
        /// </summary>
        public float TextX
        {
            get { return m_textX; }
            set { m_textX = value; }
        }

        /// <summary>
        /// The Y-coordinate for texts position. Should be set inside the textbox
        /// </summary>
        public float TextY
        {
            get { return m_textY; }
            set { m_textY = value; }
        }

        /// <summary>
        /// If the textbox is focused. (You leftclick on it to focus)
        /// </summary>
        public bool Focus
        {
            get { return m_focus; }
            set { m_focus = value; }
        }

        public int MaxLength
        {
            get { return m_maxLength; }
            set { m_maxLength = value; }
        }

        /// <summary>
        /// If the box automatically makes a linebreak if the text has reached TextBox's width
        /// </summary>
        public bool WordWrap
        {
            get { return m_wordWrap; }
            set { m_focus = value; }
        }

        //constructors
        public TextBox(int a_x, int a_y, int a_width, int a_height,SpriteFont a_font,Texture2D a_layout)
            : base(a_x, a_y, a_width, a_height)
        {
            TextX = X + 5;
            TextY = Y + 5;
            m_font = a_font;
            m_layout = a_layout;
            InitilizeKeys();
            InitializeUsedKeys();

        }

        public TextBox(int a_x, int a_y, int a_width, int a_height, SpriteFont a_font, Texture2D a_layout, string a_text)
            : this(a_x, a_y, a_width, a_height,a_font,a_layout)
        {
            Text = a_text;
        }
        
        //functions
        /// <summary>
        /// Updates the text user writes. Has to be called every frame for accurate reading!
        /// </summary>
        public void UpdateText(float a_elapsedTime)
        {
            m_totalTime += a_elapsedTime;
            
            List<Keys> f_pressed = GetPressedKeys();

            UpdateKeyStatuses(f_pressed);

            foreach (Keys key in f_pressed)
            {
                if (!m_usedKeys[key].m_used)
                {
                    if (key == Keys.Escape)
                    {
                        Focus = false;
                        break;
                    }
                    else if (key == Keys.Back)
                    {
                        if (Text.Length > 0)
                        {
                            Text = Text.Substring(0, Text.Length - 1);
                        }
                    }
                    else
                    {
                        if (ValidateKeyInput(key).Length <= 1)
                        {
                            Text += ValidateKeyInput(key);
                        }
                    }
                }
            }
            
        }

        //initializes the dictionary with all the keys that are OK! 
        private void InitializeUsedKeys()
        {
            foreach (Keys key in GetAllKeys())
            {
                m_usedKeys[key] = new KeyHandler();
            }
        }

        //Puts all keys that can be written in the textbox in the m_keys list
        //If some key is missing, add here and at ValidateKeyInput since
        //validateKeyInput writes the keyname. Like Space instead of ' '.
        private void InitilizeKeys()
        {
            m_keys.Add(Keys.A);
            m_keys.Add(Keys.B);
            m_keys.Add(Keys.C);
            m_keys.Add(Keys.D);
            m_keys.Add(Keys.E);
            m_keys.Add(Keys.F);
            m_keys.Add(Keys.G);
            m_keys.Add(Keys.H);
            m_keys.Add(Keys.I);
            m_keys.Add(Keys.J);
            m_keys.Add(Keys.K);
            m_keys.Add(Keys.L);
            m_keys.Add(Keys.M);
            m_keys.Add(Keys.N);
            m_keys.Add(Keys.O);
            m_keys.Add(Keys.P);
            m_keys.Add(Keys.Q);
            m_keys.Add(Keys.R);
            m_keys.Add(Keys.S);
            m_keys.Add(Keys.T);
            m_keys.Add(Keys.V);
            m_keys.Add(Keys.U);
            m_keys.Add(Keys.W);
            m_keys.Add(Keys.X);
            m_keys.Add(Keys.Y);
            m_keys.Add(Keys.Z);
            m_keys.Add(Keys.Back);
            m_keys.Add(Keys.Space);
            m_keys.Add(Keys.NumPad0);
            m_keys.Add(Keys.NumPad1);
            m_keys.Add(Keys.NumPad2);
            m_keys.Add(Keys.NumPad3);
            m_keys.Add(Keys.NumPad4);
            m_keys.Add(Keys.NumPad5);
            m_keys.Add(Keys.NumPad6);
            m_keys.Add(Keys.NumPad7);
            m_keys.Add(Keys.NumPad8);
            m_keys.Add(Keys.NumPad9);
            m_keys.Add(Keys.D0);
            m_keys.Add(Keys.D1);
            m_keys.Add(Keys.D2);
            m_keys.Add(Keys.D3);
            m_keys.Add(Keys.D4);
            m_keys.Add(Keys.D5);
            m_keys.Add(Keys.D6);
            m_keys.Add(Keys.D7);
            m_keys.Add(Keys.D8);
            m_keys.Add(Keys.D9);
            m_keys.Add(Keys.Enter);
            m_keys.Add(Keys.OemPeriod);            
            m_keys.Add(Keys.OemMinus);
            m_keys.Add(Keys.Escape);
        }

        //Returns the list m_keys
        private List<Keys> GetAllKeys()
        {
            return m_keys;
        }

        //Updates the dictionary status. It first sets the whole dictionary
        //to original state. Then after that it takes the parameter keys and 
        //sets dictionary keys to those being pressed. So they will remain pressed in the next UpdateText() call        
        private void UpdateKeyStatuses(List<Keys> a_keys)
        {
            
            foreach (Keys key in GetAllKeys())
            {                
                m_usedKeys[key].m_used = false;                
            }
            foreach (Keys key in a_keys)
            {                
                if (m_totalTime - m_usedKeys[key].m_lastUsed > 0.175f )
                {
                    m_usedKeys[key].m_lastUsed = m_totalTime;
                    m_usedKeys[key].m_used = false;
                }
                else
                {                    
                    m_usedKeys[key].m_used = true;                    
                }                                 
            }
            
        }

        //Gets all the keys a user pressed and only adds the keys that are in the list m_keys.
        private List<Keys> GetPressedKeys()
        {
            KeyboardState f_state = Keyboard.GetState();

            List<Keys> f_keys = new List<Keys>();

            foreach (Keys key in f_state.GetPressedKeys())
            {
                foreach (Keys a_key in GetAllKeys())
                {
                    if (key == a_key)
                    {
                        f_keys.Add(key);
                        break;
                    }
                }
            }

            return f_keys;
        }

        //checks if Shift is pressed.. to capitalize letters 
        private bool ShiftPressed()
        {
            KeyboardState f_state = Keyboard.GetState();
            if (f_state.IsKeyDown(Keys.LeftShift) || f_state.IsKeyDown(Keys.RightShift))
            {
                return true;
            }
            return false;
        }

        //long function with Switch on the keys to rewrite the key.ToString() into something useable.
        private string ValidateKeyInput(Keys a_key)
        {
            switch (a_key)
            {
                case Keys.D0:
                case Keys.NumPad0:
                    return "0";
                case Keys.D1:
                case Keys.NumPad1:
                    return "1";
                case Keys.D2:
                case Keys.NumPad2:
                    return "2";
                case Keys.D3:
                case Keys.NumPad3:
                    return "3";
                case Keys.D4:
                case Keys.NumPad4:
                    return "4";
                case Keys.D5:
                case Keys.NumPad5:
                    return "5";
                case Keys.D6:
                case Keys.NumPad6:
                    return "6";
                case Keys.D7:
                case Keys.NumPad7:
                    return "7";
                case Keys.D8:
                case Keys.NumPad8:
                    return "8";
                case Keys.D9:
                case Keys.NumPad9:
                    return "9";
                case Keys.OemPeriod:
                    return ".";
                case Keys.OemMinus:
                    return "-";
                case Keys.Enter:
                    return "\n";
                case Keys.Space:
                    return " ";
                case Keys.RightShift:
                case Keys.LeftShift:
                    return "";
                default:
                    if (ShiftPressed())
                    {
                        return a_key.ToString().ToUpper();
                    }
                    return a_key.ToString().ToLower();
            }
        }
    }
}