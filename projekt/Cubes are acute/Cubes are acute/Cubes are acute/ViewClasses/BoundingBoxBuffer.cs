using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Cubes_are_acute.ViewClasses
{
    class BoundingBoxBuffer
    {     
        public const int VertexCount = 48;        
        public const int PrimitiveCount = 24;

        public static VertexBuffer m_vertexBuffer;
        public static IndexBuffer m_indexBuffer;

        private const float ratio = 1/5f;

        private const float buildGridRatio = 1 / 2.5f;

        private static List<VertexPositionColor> vertices = new List<VertexPositionColor>();

        public static Color m_color = Color.White;

        /// <summary>
        /// HAS to be called before using BoundingBoxBuffer or the program will throw null references
        /// </summary>        
        public static void InitiliazeBuffers(GraphicsDevice graphicsDevice)
        {
            m_vertexBuffer = new VertexBuffer(graphicsDevice,
                typeof(VertexPositionColor), VertexCount,
                BufferUsage.WriteOnly);

            m_indexBuffer = new IndexBuffer(graphicsDevice, IndexElementSize.SixteenBits, VertexCount, BufferUsage.WriteOnly);
            m_indexBuffer.SetData(Enumerable.Range(0, VertexCount).Select(i => (short)i).ToArray());
        }
       
        public static void CreateBoundingBoxBuffers(BoundingBox boundingBox)
        {          
            Vector3 xOffset = new Vector3((boundingBox.Max.X - boundingBox.Min.X) * ratio, 0, 0);
            Vector3 yOffset = new Vector3(0, (boundingBox.Max.Y - boundingBox.Min.Y) * ratio, 0);
            Vector3 zOffset = new Vector3(0, 0, (boundingBox.Max.Z - boundingBox.Min.Z) * ratio);
            Vector3[] corners = boundingBox.GetCorners();

            AddVertexes(corners, ref xOffset, ref yOffset, ref zOffset);       
        }

        public static void CreateBoundingBoxBuffersBiggerLines(BoundingBox a_boundingBox)
        {
            Vector3 xOffset = new Vector3((a_boundingBox.Max.X - a_boundingBox.Min.X) * buildGridRatio, 0, 0);
            Vector3 yOffset = new Vector3(0, (a_boundingBox.Max.Y - a_boundingBox.Min.Y) * buildGridRatio, 0);
            Vector3 zOffset = new Vector3(0, 0, (a_boundingBox.Max.Z - a_boundingBox.Min.Z) * buildGridRatio);
            Vector3[] corners = a_boundingBox.GetCorners();

            AddVertexes(corners, ref xOffset, ref yOffset, ref zOffset);       
        }

        private static void AddVertexes(Vector3[] corners, ref Vector3 xOffset, ref Vector3 yOffset, ref Vector3 zOffset)
        {
            vertices.Clear();

            // Corner 1.
            AddVertex(corners[0]);
            AddVertex(corners[0] + xOffset);
            AddVertex(corners[0]);
            AddVertex(corners[0] - yOffset);
            AddVertex(corners[0]);
            AddVertex(corners[0] - zOffset);

            // Corner 2.
            AddVertex(corners[1]);
            AddVertex(corners[1] - xOffset);
            AddVertex(corners[1]);
            AddVertex(corners[1] - yOffset);
            AddVertex(corners[1]);
            AddVertex(corners[1] - zOffset);

            // Corner 3.
            AddVertex(corners[2]);
            AddVertex(corners[2] - xOffset);
            AddVertex(corners[2]);
            AddVertex(corners[2] + yOffset);
            AddVertex(corners[2]);
            AddVertex(corners[2] - zOffset);

            // Corner 4.
            AddVertex(corners[3]);
            AddVertex(corners[3] + xOffset);
            AddVertex(corners[3]);
            AddVertex(corners[3] + yOffset);
            AddVertex(corners[3]);
            AddVertex(corners[3] - zOffset);

            // Corner 5.
            AddVertex(corners[4]);
            AddVertex(corners[4] + xOffset);
            AddVertex(corners[4]);
            AddVertex(corners[4] - yOffset);
            AddVertex(corners[4]);
            AddVertex(corners[4] + zOffset);

            // Corner 6.
            AddVertex(corners[5]);
            AddVertex(corners[5] - xOffset);
            AddVertex(corners[5]);
            AddVertex(corners[5] - yOffset);
            AddVertex(corners[5]);
            AddVertex(corners[5] + zOffset);

            // Corner 7.
            AddVertex(corners[6]);
            AddVertex(corners[6] - xOffset);
            AddVertex(corners[6]);
            AddVertex(corners[6] + yOffset);
            AddVertex(corners[6]);
            AddVertex(corners[6] + zOffset);

            // Corner 8.
            AddVertex(corners[7]);
            AddVertex(corners[7] + xOffset);
            AddVertex(corners[7]);
            AddVertex(corners[7] + yOffset);
            AddVertex(corners[7]);
            AddVertex(corners[7] + zOffset);            

            //Sets the vertexBuffer to new data. Old data is lost if not used before, like calling this function twice before drawing.
            m_vertexBuffer.SetData(vertices.ToArray());            
        }

        private static void AddVertex(Vector3 position)
        {
            vertices.Add(new VertexPositionColor(position, m_color));
        }

    }

    
}
