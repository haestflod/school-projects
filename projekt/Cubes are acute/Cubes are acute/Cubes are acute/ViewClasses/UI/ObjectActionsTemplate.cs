using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses;
using Cubes_are_acute.ModelClasses.Units;

namespace Cubes_are_acute.ViewClasses.UI
{
    class ObjectActionsTemplate
    {

        //Empty for not, but supposed to have a number of Actionboxes and will probably have a GetTemplate(Thingtype a_type, ThingState a_state)
        //And return the correct template to m_focusedTarget or something similar!  So it's ThingTypes * 3x3  instead of Units + Buildings * 3x3
        public ObjectAction[,] m_emptyAction = new ObjectAction[3, 3];

        public ObjectActionsTemplate ()
	    {
            for (int y = 0; y < m_emptyAction.GetLength(1); y++)
            {
                for (int x = 0; x < m_emptyAction.GetLength(0); x++)
                {
                    m_emptyAction[x, y] = new ObjectAction();
                }
            }
	    }


        public ObjectAction[,] GetActions(Thing a_thing)
        {
            if (a_thing != null)
            {
                switch (a_thing.m_type)
                {
                    case ThingType.C_Cube:                        
                        break;
                    case ThingType.C_Extractor:
                        break;
                    default:
                        return m_emptyAction;
                }
            }

            return m_emptyAction;
        }
    }
}
