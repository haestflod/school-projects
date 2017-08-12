using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Cubes_are_acute.ViewClasses
{
    class ShaderEffect
    {
        public Effect m_effect;

        public ShaderEffect(GameAssets a_gameAssets,ref Matrix a_proj,ModelClasses.Map a_map)
        {
            m_effect = a_gameAssets.m_effect;
            m_effect.CurrentTechnique = m_effect.Techniques["tech_heightMap"];
            m_effect.Parameters["LampColor"].SetValue(new Vector3(0.8f, 0.8f, 0.8f));
            m_effect.Parameters["World"].SetValue(Matrix.CreateTranslation(a_map.m_mapWidth/2,a_map.m_mapDepth/2,0)); //* Matrix.CreateRotationX(MathHelper.ToRadians(-90)));
            m_effect.Parameters["Projection"].SetValue(a_proj);
            m_effect.Parameters["heightMap"].SetValue(a_gameAssets.m_heightMap);
            m_effect.Parameters["sandMap"].SetValue(a_gameAssets.m_sandMap); 
            m_effect.Parameters["grassMap"].SetValue(a_gameAssets.m_grassMap);
            m_effect.Parameters["rockMap"].SetValue(a_gameAssets.m_rockMap);
            m_effect.Parameters["snowMap"].SetValue(a_gameAssets.m_snowMap);
            m_effect.Parameters["maxHeight"].SetValue(ModelClasses.Map.m_maxHeight);
            m_effect.Parameters["textureSize"].SetValue(a_map.m_mapWidth);
            m_effect.Parameters["texelSize"].SetValue((float)1 / a_map.m_mapWidth);
            m_effect.Parameters["tileSize"].SetValue(ModelClasses.Map.m_tileSizeDivided);
        }
    }
}
