using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ModelClasses;

namespace Cubes_are_acute.ViewClasses
{
    class DebugView
    {
        public DebugOptions m_debugOptions = new DebugOptions();
        //Has the positions for the fps spritebatch.DrawString() 
        Vector2 m_fpsPosition;
        //Has position for the unit info pos

        Vector2 m_unitInfoPosition;

        //Has the mouse info pos
        Vector2 m_mousePos;

        public TimeSpan m_fpstimer;
        public int m_fps = 0;
        public int m_frameCounter = 0;        

        public DebugView ()
	    {
            
	    }

        public void InitilizePositions()
        {
            m_fpsPosition = new Vector2(15, 10);
            m_mousePos = new Vector2(m_fpsPosition.X, m_fpsPosition.Y + 20);
            m_unitInfoPosition = new Vector2(15, UI.HUD.m_area.Top - 150);   
        }

        public void DrawDebug(GraphicsDevice a_graphics, Camera a_camera, ModelClasses.Game a_game, SpriteBatch spriteBatch, GameAssets a_gameAsset, Input a_input)
        {

            if (m_debugOptions.m_unitBoundingBoxDraw)
            {
                //draws Bounding boxes on units 
                DrawBBOnUnits(a_game.m_player, a_camera, a_graphics);
            }
            if (m_debugOptions.m_gridBoundingBoxDraw)
            {
                DrawBBOnGrid(a_game.m_map, a_camera, a_graphics);
            }

            spriteBatch.Begin();
            
            if (m_debugOptions.m_showFPS)
            {
                //Draws the fps meter
                DrawFPS(spriteBatch, a_gameAsset.m_normalFont);
            }
            if (m_debugOptions.m_showUnitInfo)
            {
                //If m_focusedTarget is set to something it will draw the extra info about that target
                if (a_game.m_player.m_focusedTarget != null)
                {
                    DrawUnitInfo(a_game.m_player.m_focusedTarget, spriteBatch, a_gameAsset.m_normalFont);
                }
            }
            if (m_debugOptions.m_showMouseWpos)
            {
                Vector3? f_point = a_input.GetWorldPosition(a_graphics, a_game.m_groundPlane, a_game.m_map, 
                    a_camera, a_input.m_mouse.m_mouseState.X, a_input.m_mouse.m_mouseState.Y);

                if (f_point.HasValue)
                {
                    DrawMouseWorldPos(f_point.Value, spriteBatch, a_gameAsset.m_normalFont);
                }
            }

            spriteBatch.End();
        }

        private void DrawFPS(SpriteBatch spriteBatch, SpriteFont a_font)
        {

            spriteBatch.DrawString(a_font, "FPS: " + m_fps, m_fpsPosition, Color.Red); 
        }

        private void DrawMouseWorldPos(Vector3 a_point, SpriteBatch spriteBatch, SpriteFont a_font)
        {
            //Gets the grid positions
            int gridX = (int)a_point.X / Map.m_tileSize;
            int gridY = (int)a_point.Y / Map.m_tileSize;            

            //0.00  means number . 2 decimals
            string f_info = string.Format("M pos X:{0:0.00} Y:{1:0.00} Z:{2:0.00} \nGridpos X:{3:0.00} Y:{4:0.00}", a_point.X, a_point.Y, a_point.Z, gridX, gridY);

            spriteBatch.DrawString(a_font, f_info, m_mousePos, Color.Red);
        }

        private void DrawUnitInfo(ModelClasses.Units.Thing a_thing, SpriteBatch spriteBatch, SpriteFont a_font)
        {
            //writes the info unit wpos, attack cooldown and the state of the unit
            string text = string.Format("Wpos X:{0:0.00} Y:{1:0.00} Z:{2:0.00} "
                                        + "\nState:{3} ID:{4}\n", 
                                        a_thing.m_currentposition.X, a_thing.m_currentposition.Y, 
                                        a_thing.m_currentposition.Z, a_thing.m_thingState, a_thing.m_ownerID);

            if (a_thing.m_attackBehavior != null)
            {
                if (a_thing.m_type == ModelClasses.Units.ThingType.C_Cube)
                {
                    ModelClasses.BehaviorInterfaces.StandardAttack f_attackBehavior =(ModelClasses.BehaviorInterfaces.StandardAttack) a_thing.m_attackBehavior;

                    text += string.Format("Atk CD: {0:0.00}", f_attackBehavior.m_cooldownTimer);
                }                
            }

            spriteBatch.DrawString(a_font, text, m_unitInfoPosition, Color.Red);
        }

        private void DrawBBOnUnits(ModelClasses.Player a_player, Camera a_camera, GraphicsDevice a_gd)
        {
            BoundingBoxBuffer.m_color = Color.White;

            foreach (ModelClasses.Units.Unit unit in a_player.m_units)
            {                
                GameView.DrawBoundingBox((BoundingBox)unit.m_model.Tag,a_gd,a_camera.GetWorldMatrix(unit.m_currentposition),a_camera);
            }            
        }

        private void DrawBBOnGrid(Map a_map, Camera a_camera, GraphicsDevice a_graphics)
        {
            
            foreach (Tile tile in a_map.m_tiles)
            {
                if (tile.m_type == Tiletype.Normal)
                {
                    BoundingBoxBuffer.m_color = Color.White;
                    GameView.DrawBoundingBox(tile.m_boundBox, a_graphics, Matrix.Identity, a_camera);
                }
                else
                {
                    BoundingBoxBuffer.m_color = Color.Red;
                    GameView.DrawBoundingBox(tile.m_boundBox, a_graphics, Matrix.Identity, a_camera);
                }
            }
        }
        
        /// <summary>
        /// Draws a bounding box anywhere you specify, Is used to test fixed cordinates
        /// </summary>       
        public void DrawTestBoundingBox(BoundingBox a_box, GraphicsDevice graphicsDevice,Camera a_camera)
        {
            BoundingBoxBuffer.CreateBoundingBoxBuffers(a_box);

            graphicsDevice.SetVertexBuffer(BoundingBoxBuffer.m_vertexBuffer);
            graphicsDevice.Indices = BoundingBoxBuffer.m_indexBuffer;     

            a_camera.m_BoundingBoxEffect.World = Matrix.Identity;
            a_camera.m_BoundingBoxEffect.View = a_camera.m_view;

            foreach (EffectPass pass in a_camera.m_BoundingBoxEffect.CurrentTechnique.Passes)
            {
                pass.Apply();
                graphicsDevice.DrawIndexedPrimitives(PrimitiveType.LineList, 0, 0,
                    BoundingBoxBuffer.VertexCount, 0, BoundingBoxBuffer.PrimitiveCount);
            }          

            graphicsDevice.SetVertexBuffer(null);
            
        }        
    }
}
