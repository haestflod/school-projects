using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;

namespace Cubes_are_acute.ViewClasses
{
    /// <summary>
    /// Has functions and variables that transfers GameModel coordinates into GameView coordinates and vice-versa
    /// </summary>
    class Camera
    {
        //World, View, Projection Matrix
        public Matrix m_world;
        public Matrix m_view;
        public Matrix m_projection;

        public Vector3 m_cameraPos;
        public Vector3 m_focusPos;

        //public Vector3 m_pointLight;

        private Vector3 m_originalFocusPos;
        private Vector3 m_originalCameraPos;

        public float m_cameraMoveSpeed = 30;
       
        public ShaderEffect m_shaderEffect;
        public BasicEffect m_BoundingBoxEffect;

        private float m_cameraMinDist;
        private float m_cameraMaxDist;

        private float m_elapsedTime;

        public int m_cameraBorder = 1;

        /// <summary>        
        /// </summary>
        /// <param name="graphics">Needed for setting AspectRatio</param>
        public Camera(GraphicsDevice graphics, GameAssets a_gameAssets,ModelClasses.Map a_map)
        {
            m_cameraMinDist = 10;
            m_cameraMaxDist = 40;

            m_originalFocusPos = Vector3.Zero;
            //original values are 0, -10, 40 if you change and forget ^_^
            m_originalCameraPos = new Vector3(0, -10, 40f);

            //m_pointLight = new Vector3(0, 0, 40);

            m_cameraPos = m_originalCameraPos;
            m_focusPos = m_originalFocusPos;           

            //Currently just as identity matrix
            m_world = Matrix.CreateTranslation(Vector3.Zero);

            //set camera position
            
            //Currently above the world looking down
            SetViewMatrix();            

            //45 degree view field
            m_projection = Matrix.CreatePerspectiveFieldOfView(MathHelper.ToRadians(45), graphics.Viewport.AspectRatio, 1, 300);

            m_shaderEffect = new ShaderEffect(a_gameAssets,ref m_projection,a_map);

            m_BoundingBoxEffect = new BasicEffect(graphics);

            m_BoundingBoxEffect.LightingEnabled = false;
            m_BoundingBoxEffect.TextureEnabled = false;
            m_BoundingBoxEffect.VertexColorEnabled = true;

            m_BoundingBoxEffect.Projection = m_projection;
        }

        public void ResetCamera()
        {
            m_focusPos = m_originalFocusPos;
            m_cameraPos = m_originalCameraPos;
        }

        public void MoveCameraRight()
        {
            m_cameraPos.X += m_elapsedTime * m_cameraMoveSpeed;
            m_focusPos.X += m_elapsedTime * m_cameraMoveSpeed;
        }        

        public void MoveCameraLeft()
        {
            m_cameraPos.X -= m_elapsedTime * m_cameraMoveSpeed;
            m_focusPos.X -= m_elapsedTime * m_cameraMoveSpeed;
        }

        public void MoveCameraForward()
        {
            m_cameraPos.Y += m_elapsedTime * m_cameraMoveSpeed;
            m_focusPos.Y += m_elapsedTime * m_cameraMoveSpeed;
        }

        public void MoveCameraBackward()
        {
            m_cameraPos.Y -= m_elapsedTime * m_cameraMoveSpeed;
            m_focusPos.Y -= m_elapsedTime * m_cameraMoveSpeed;
        }

        public void MoveCameraDown()
        {
            m_cameraPos.Z -= m_cameraMoveSpeed * 0.25f;
            if (m_cameraPos.Z < m_cameraMinDist)
            {
                m_cameraPos.Z = m_cameraMinDist;
            }
        }

        public void MoveCameraUp()
        {
            m_cameraPos.Z += m_cameraMoveSpeed *0.25f;
            if (m_cameraPos.Z > m_cameraMaxDist)
            {
                m_cameraPos.Z = m_cameraMaxDist;
            }
        }

        public void RotateCameraLeft()
        {
            m_cameraPos.X -= m_cameraMoveSpeed * m_elapsedTime;
        }

        public void RotateCameraRight()
        {
            m_cameraPos.X += m_cameraMoveSpeed * m_elapsedTime;
        }

        public void RotateCameraUp()
        {
            m_cameraPos.Y += m_cameraMoveSpeed * m_elapsedTime;
        }

        public void RotateCameraDown()
        {
            m_cameraPos.Y -= m_cameraMoveSpeed * m_elapsedTime;
        }

        public void RotateCameraForward()
        {
            m_cameraPos.Z -= m_cameraMoveSpeed*10 * m_elapsedTime;
        }

        public void RotateCameraBackward()
        {
            m_cameraPos.Z += m_cameraMoveSpeed * 10 * m_elapsedTime;
        }

        /// <summary>
        /// Returns a world matrix based on a position
        /// </summary>        
        public Matrix GetWorldMatrix(Vector3 a_position)
        {
            return Matrix.CreateTranslation(a_position);
        }

        public void SetElapsedTime(float a_elapsedTime)
        {
            m_elapsedTime = a_elapsedTime;
        }
        
        /// <summary>
        /// Sets m_view to a new view matrix, should be used at beginning of Draw()
        /// </summary>
        public void SetViewMatrix()
        {
            m_view = Matrix.CreateLookAt(m_cameraPos,m_focusPos, Vector3.Up);
        }        
    }
}
