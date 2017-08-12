using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Cubes_are_acute.ModelClasses.WorldObjects
{
    [Serializable]
    class SoL : WorldObject
    {
        public int m_resources = 150;        

        public SoL(Model a_model,Vector3 a_position)
            : base (a_model,ref a_position,new Vector3(3) ,WorldObjectType.SoL)
        {
           
        }

        public void TakeSoL()
        {
            m_taken = true;
            m_visible = false;
        }

        public void FreeSoL()
        {
            m_taken = false;
            m_visible = true;
        }

        public bool Harvest()
        {
            m_resources--;

            if (m_resources < 0)
            {
                m_exists = false;
                return false;
            }

            return true;
        }        
    }
}
