using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Cubes_are_acute.ModelClasses.WorldObjects
{
    [Serializable]
    class WorldObject
    {
        [NonSerialized] public Model m_model;
        public Vector3 m_position;
        public WorldObjectType m_type;
        public Vector3 m_size;

        public bool m_taken = false;

        public bool m_visible = true;

        public bool m_exists = true;

        public WorldObject(Model a_model,ref Vector3 a_position,Vector3 a_size ,WorldObjectType a_type)
        {
            m_model = a_model;
            m_position = a_position;
            m_type = a_type;
            m_size = a_size;
        }
    }    

    public enum WorldObjectType
    {
        SoL
    }
}
