using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Input;
using Cubes_are_acute.ViewClasses;


namespace Cubes_are_acute.ModelClasses
{
    [Serializable]
    class ObjectAction
    {
        public string m_name;
        public string m_tooltip;
        public Keys m_hotkey;
        public Type m_type;
        public float m_cooldown;
        /// <summary>
        /// This is just the function type (what m_function wants as input)
        /// A action requires alot of info to be dynamic, so it takes a game and a point (mouse)
        /// </summary>
        public delegate void function(Game a_game, Vector3 a_point);
        /// <summary>
        /// This is the stored function
        /// </summary>
        public function m_function;

        /// <summary>
        /// If true, gameview will know to draw the Building Grid
        /// </summary>
        public bool m_buildTag = false;
        public Vector3 m_buildSize;
        public bool m_lookingForWO = false;
        public int m_price;
        

        public enum Type
        {
            Instant,
            Target,
            Channeling,
            Passive
        }

        public ObjectAction()
        {

        }

        /// <summary>
        /// Creates an action WITHOUT any cooldown.
        /// </summary>
        public ObjectAction(string a_name, string a_tooltip, Keys a_hotkey, Type a_type, function a_function)
        {
            m_name = a_name;
            m_tooltip = a_tooltip;
            m_hotkey = a_hotkey;
            m_type = a_type;
            m_function = a_function;

            m_cooldown = 0.0f;
        }

        /// <summary>
        /// Creates an action WITH a cooldown.
        /// </summary>
        public ObjectAction(string a_name, string a_tooltip, Keys a_hotkey, Type a_type, function a_function, float a_cooldown)
            :this(a_name,a_tooltip, a_hotkey, a_type, a_function)
        {
           //I deleted code here.. just..  who cares if m_cooldown is set twice :p was so much redundant info elsewhere :p

            m_cooldown = a_cooldown;
        }

        public void SetBuildingTag(Vector3 a_size, bool needWO,int a_price)
        {
            m_buildTag = true;
            m_buildSize = a_size;
            m_lookingForWO = needWO;
            m_price = a_price;
        }
    }
}
