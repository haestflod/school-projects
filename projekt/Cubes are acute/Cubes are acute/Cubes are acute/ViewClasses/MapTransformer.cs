using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ModelClasses;

namespace Cubes_are_acute.ViewClasses
{
    class MapTransformer
    {
        
        VertexBuffer vb;
        IndexBuffer ib;
        VertexPositionNormalTexture[] vertices = new VertexPositionNormalTexture[4];
        int[] indices = new int[6];

        int dimensionX;
        int dimensionY;
        //int cellSize;

        public MapTransformer(Map a_map)
        {           

            dimensionX = Map.m_tileSize *a_map.m_Xlength;
            dimensionY = Map.m_tileSize *a_map.m_Ylength;
        }

        private void GenerateStructures()
        {
            //Gotta go through this to figure out what is causing ze errors
            //Removing the 1s from this fucks the triangle thingys up major!
            vertices = new VertexPositionNormalTexture[(dimensionX + 1) * (dimensionY + 1)];
            indices = new int[dimensionX * dimensionY * 6];
            
            for (int x = 0; x < dimensionX + 1 ; x++)
            {
                for (int y = 0; y < dimensionY + 1 ; y++)
                {
                    VertexPositionNormalTexture vert = new VertexPositionNormalTexture();

                    vert.Position = new Vector3((x - dimensionX / 2.0f ), (y - dimensionY / 2.0f), 0);
                    vert.Normal = Vector3.UnitZ;
                    vert.TextureCoordinate = new Vector2((float)x / dimensionX , (float)y / dimensionY);                

                    vertices[x * (dimensionX + 1) + y] = vert;
                }
            }

            for (int x = 0; x < dimensionX; x++)
            {
                for (int y = 0; y < dimensionY; y++)
                {
                    indices[6 * (x * dimensionX + y)] = (x * (dimensionX + 1) + y);
                    indices[6 * (x * dimensionX + y) + 1] = (x * (dimensionX + 1) + y + 1);
                    indices[6 * (x * dimensionX + y) + 2] = ((x + 1) * (dimensionX + 1) + y + 1);

                    indices[6 * (x * dimensionX + y) + 3] = (x * (dimensionX + 1) + y);
                    indices[6 * (x * dimensionX + y) + 4] = ((x + 1) * (dimensionX + 1) + y + 1);
                    indices[6 * (x * dimensionX + y) + 5] = ((x + 1) * (dimensionX + 1) + y);
                }

            }
        }

        public void LoadGraphicsContent(GraphicsDevice a_graphics)
        {
            GenerateStructures();

            vb = new VertexBuffer(a_graphics, typeof(VertexPositionNormalTexture), (dimensionX + 1) * (dimensionY + 1), BufferUsage.None);
            ib = new IndexBuffer(a_graphics, IndexElementSize.ThirtyTwoBits, 6 * dimensionX * dimensionY, BufferUsage.None);
            vb.SetData<VertexPositionNormalTexture>(vertices);
            ib.SetData<int>(indices);
        }

        public void DrawMap(GraphicsDevice a_graphics,Camera a_camera)
        {          
            a_graphics.SetVertexBuffer(vb);
            a_graphics.Indices = ib;

            a_camera.m_shaderEffect.m_effect.Parameters["View"].SetValue(a_camera.m_view);

            a_camera.m_shaderEffect.m_effect.CurrentTechnique = a_camera.m_shaderEffect.m_effect.Techniques["tech_heightMap"];
            a_camera.m_shaderEffect.m_effect.Parameters["PointLight"].SetValue(a_camera.m_cameraPos);  
            foreach (EffectPass pass in a_camera.m_shaderEffect.m_effect.CurrentTechnique.Passes)
            {
                pass.Apply();
            }

            a_graphics.DrawIndexedPrimitives(PrimitiveType.TriangleList, 0, 0, (dimensionX + 1) * (dimensionY + 1), 0, 2 * dimensionX * dimensionY);

            a_graphics.SetVertexBuffer(null);

        }
    }
}
