using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ViewClasses.UI;
using Cubes_are_acute.ViewClasses.Menu;

namespace Cubes_are_acute.ViewClasses
{
    class GameView
    {        
        public Camera m_camera;

        public MapTransformer m_mapTransformer;

        ParticleSystem m_pSystem;
        ParticleView m_pView;        

        public iParticles m_particleHandler;

        public HUD m_HUD = new HUD();          

        public Vector3 m_player1Color = new Vector3(1, 0, 0);
        public Vector3 m_player2Color = new Vector3(0, 0, 1);
        public Vector3 m_player3Color = new Vector3(0, 1, 0);
        public Vector3 m_player4Color = new Vector3(77/255f, 51/255f, 2/255f);

        private Color Badbad = new Color(186, 219, 173);
        private Color Darkred = new Color(210, 90, 90);

        private Vector3 m_worldStuffColor = new Vector3(1, 1, 0);

        public GameView(GraphicsDevice graphics, GameAssets a_gameAssets, ModelClasses.Game a_game)
        {            
            m_camera = new Camera(graphics, a_gameAssets,a_game.m_map);
            m_pSystem = new ParticleSystem(a_gameAssets);            

            m_particleHandler = new ParticlesHandler(m_pSystem);
                      
            m_pView = new ParticleView();

            m_mapTransformer = new MapTransformer(a_game.m_map);

            int colorID = 0;

            //SetModelEffect(a_gameAssets.m_normalGround);
            colorID++;           
            SetModelEffect(a_gameAssets.c_cube , colorID);
            SetModelEffect(a_gameAssets.c_barbarian, colorID);
            SetModelEffect(a_gameAssets.c_extractor, colorID);
            SetModelEffect(a_gameAssets.c_igloo, colorID);
            SetModelEffect(a_gameAssets.c_barrack, colorID);
            colorID++;
            SetModelEffect(a_gameAssets.m_sparkOfLife, colorID);
            SetModelEffect(a_gameAssets.m_projektil, colorID);
        }       

        /// <summary>
        /// Sets a models effect file parameters
        /// </summary>        
        private void SetModelEffect(Model a_model, int colorID)
        {
            Vector3 lampColor = new Vector3(0,0,0);
            switch (colorID)
            {
                case 0:
                    lampColor = m_player1Color;
                    break;
                default:
                    lampColor = m_worldStuffColor;
                    break;

            }
           
            foreach (ModelMesh mesh in a_model.Meshes)
            {
                foreach (Effect effect in mesh.Effects)
                {                                  
                    effect.Parameters["Projection"].SetValue(m_camera.m_projection);

                    effect.Parameters["PointLight"].SetValue(m_camera.m_cameraPos);
                    effect.Parameters["LampColor"].SetValue(lampColor);
                }
            }            
        }

        public void Draw(SpriteBatch a_spriteBatch, GameAssets a_gameAssets, ModelClasses.Game a_game, GraphicsDevice a_gd, DebugView a_debugView, ModelClasses.Save a_save, float a_elapsedTime)
        {
            //Sets the view matrix that is used by the shader
            m_camera.SetViewMatrix();
            m_camera.SetElapsedTime(a_elapsedTime);

            //DrawBackground(a_gameAssets.m_ground);

            //Draws a unit foreach unit added to a_game.m_units List of type Unit.
            m_mapTransformer.DrawMap(a_gd, m_camera);
            DrawGame(a_game, a_gameAssets, a_elapsedTime);
            DrawSelectionBorder(a_game.m_player, a_gd);         

            //Draws HUD
            m_HUD.Draw(a_spriteBatch, a_gameAssets, a_game);            
        }        

        public void DrawParticles(ModelClasses.Game a_game, GameAssets a_assets,float a_elapsedTime)
        {
            m_pSystem.Update(a_elapsedTime);
            m_pView.Render(m_camera, m_pSystem, a_assets);
        }
        
        private void DrawSelectionBorder(Player player, GraphicsDevice a_gd)
        {
            BoundingBoxBuffer.m_color = Color.White;
            
            //If there's some selected units
            if (player.m_selectedThings.Count > 0)
            {
                foreach (ModelClasses.Units.Thing thing in player.m_selectedThings)
                {                        
                    DrawBoundingBox((BoundingBox)thing.m_model.Tag, a_gd, m_camera.GetWorldMatrix(thing.m_currentposition), m_camera);
                }
            }
            //If there are no selected things, draw focusedTarget
            else if (player.m_focusedTarget != null)
            {
                DrawBoundingBox((BoundingBox)player.m_focusedTarget.m_model.Tag, a_gd, m_camera.GetWorldMatrix(player.m_focusedTarget.m_currentposition), m_camera);
            }
            //Draw SelectedWorldObject!
            else if (player.m_selectedWorldObject != null)
            {
                DrawBoundingBox((BoundingBox)player.m_selectedWorldObject.m_model.Tag, a_gd, m_camera.GetWorldMatrix(player.m_selectedWorldObject.m_position), m_camera);
            }
        }

        private void DrawGame(ModelClasses.Game a_game, GameAssets a_gameAsset, float a_elapsedTime)
        {
            //Draws the world objects
            DrawWorldObjects(a_game.m_map.m_worldObjects);

            foreach (Player player in a_game.m_allPlayers)
            {
                //If the player has surrendered, no need to go inside the function and change color on all models e.t.c.!
                if (!player.m_surrendered)
                {
                    DrawPlayer(player, a_gameAsset);
                }
            }            

            DrawParticles(a_game, a_gameAsset, a_elapsedTime);
        }        

        /// <summary>
        /// Draws the WorldObjects, such as SoL
        /// </summary>        
        private void DrawWorldObjects(List<ModelClasses.WorldObjects.WorldObject> a_worldObjects)
        {
            foreach (ModelClasses.WorldObjects.WorldObject worldObject in a_worldObjects)
            {
                if (worldObject.m_visible)
                {
                    foreach (ModelMesh mesh in worldObject.m_model.Meshes)
                    {
                        foreach (Effect effect in mesh.Effects)
                        {
                            effect.Parameters["World"].SetValue(m_camera.GetWorldMatrix(worldObject.m_position));
                            effect.Parameters["View"].SetValue(m_camera.m_view);

                            effect.Parameters["PointLight"].SetValue(m_camera.m_cameraPos);
                        }

                        mesh.Draw();
                    }
                }
            }
        }

        /// <summary>
        /// Draws a player (computers are players aswell, let's not be discriminating)
        /// </summary>  
        private void DrawPlayer(ModelClasses.Player a_player, GameAssets a_gameAsset)
        {
            //It's a switch because of scale levels,  if it was 6 players a switch is better than if :)
            switch (a_player.m_playerID)
            {
                case 0:
                    SetPlayerColor(ref m_player1Color, a_gameAsset);
                    break;
                case 1:
                    SetPlayerColor(ref m_player2Color, a_gameAsset);
                    break;
                case 2:
                    SetPlayerColor(ref m_player3Color, a_gameAsset);
                    break;
                case 3:
                    SetPlayerColor(ref m_player4Color, a_gameAsset);
                    break;
                default:
                    break;
            }            

            //draw units
            foreach (ModelClasses.Units.Thing unit in a_player.m_units)
            {                   
                DrawThing(unit);             
            }

            //draw buildings
            foreach (ModelClasses.Units.Thing building in a_player.m_buildings)
            {               
                DrawThing(building);
            }

            //Draws buildingObjects
            foreach (ModelClasses.Units.BuildingObject bo in a_player.m_buildObjects)
            {
                if (bo.m_isBuilding)
                {

                    DrawThing(bo.m_object);
                }
            }
        }

        #region SetPlayerColor

        /// <summary>
        /// Sets the color of units, The color sent is based on playerID
        /// </summary>        
        private void SetPlayerColor(ref Vector3 a_color, GameAssets a_gameAssets)
        {
            //possible break this part out in a function, or just let the foreach loops be here for each model :)
            foreach (ModelMesh mesh in a_gameAssets.c_cube.Meshes)
            {
                foreach (Effect effect in mesh.Effects)
                {
                    effect.Parameters["LampColor"].SetValue(a_color);
                }
            }

            foreach (ModelMesh mesh in a_gameAssets.c_barbarian.Meshes)
            {
                foreach (Effect effect in mesh.Effects)
                {
                    effect.Parameters["LampColor"].SetValue(a_color);
                }
            }

            foreach (ModelMesh mesh in a_gameAssets.c_extractor.Meshes)
            {
                foreach (Effect effect in mesh.Effects)
                {
                    effect.Parameters["LampColor"].SetValue(a_color);
                }
            }

            foreach (ModelMesh mesh in a_gameAssets.c_igloo.Meshes)
            {
                foreach (Effect effect in mesh.Effects)
                {
                    effect.Parameters["LampColor"].SetValue(a_color);
                }
            }

            foreach (ModelMesh mesh in a_gameAssets.c_barrack.Meshes)
            {
                foreach (Effect effect in mesh.Effects)
                {
                    effect.Parameters["LampColor"].SetValue(a_color);
                }
            }
        }

        #endregion


        /// <summary>
        /// Draws a thing
        /// </summary>        
        private void DrawThing(ModelClasses.Units.Thing a_thing)
        {            
            Matrix f_world = m_camera.GetWorldMatrix(a_thing.m_currentposition);

            foreach (ModelMesh mesh in a_thing.m_model.Meshes)
            {
                foreach (Effect effect in mesh.Effects)
                {
                    if (a_thing.m_thingState == ModelClasses.Units.ThingState.BeingBuilt)
                    {
                        effect.CurrentTechnique = effect.Techniques["tech_isBeingBuilt"];
                    }
                    else
                    {
                        effect.CurrentTechnique = effect.Techniques["technique0"];
                    }
                    
                    effect.Parameters["World"].SetValue(f_world);
                    effect.Parameters["View"].SetValue(m_camera.m_view);

                    effect.Parameters["PointLight"].SetValue(m_camera.m_cameraPos);
                }

                mesh.Draw();
            }         
        }

        /// <summary>
        /// Draws a bounding box around a unit, Set the boundingbox Color first before using tho or you might get different color than you wanted
        /// </summary>        
        public static void DrawBoundingBox(BoundingBox a_box, GraphicsDevice graphicsDevice, Matrix a_world, Camera a_camera)
        {
            BoundingBoxBuffer.CreateBoundingBoxBuffers(a_box);

            DrawBoundingBoxFunction(graphicsDevice, a_world, a_camera);
        }

        /// <summary>
        /// Draws a bounding box with longer lines than the DrawBoundingBox(), useful for eg building tiles
        /// </summary>        
        public static void DrawBoundingBoxBiggerLines(BoundingBox a_box, GraphicsDevice graphicsDevice, Matrix a_world, Camera a_camera)
        {
            BoundingBoxBuffer.CreateBoundingBoxBuffersBiggerLines(a_box);

            DrawBoundingBoxFunction(graphicsDevice, a_world, a_camera);
        }

        /// <summary>
        /// Draws the actual bounding box lines around the given bounding box
        /// </summary>        
        private static void DrawBoundingBoxFunction(GraphicsDevice graphicsDevice, Matrix a_world, Camera a_camera)
        {
            graphicsDevice.SetVertexBuffer(BoundingBoxBuffer.m_vertexBuffer);
            graphicsDevice.Indices = BoundingBoxBuffer.m_indexBuffer;            

            a_camera.m_BoundingBoxEffect.World = a_world;
            a_camera.m_BoundingBoxEffect.View = a_camera.m_view;

            foreach (EffectPass pass in a_camera.m_BoundingBoxEffect.CurrentTechnique.Passes)
            {
                pass.Apply();
                graphicsDevice.DrawIndexedPrimitives(PrimitiveType.LineList, 0, 0,
                    BoundingBoxBuffer.VertexCount, 0, BoundingBoxBuffer.PrimitiveCount);
            }

            graphicsDevice.SetVertexBuffer(null);
        }
        
        public void DrawTryingToBuild(GraphicsDevice a_graphics, Vector3 a_wpos, Map a_map, Vector3 a_size,bool a_needWO)
        {
            //This needs some kind of peak function or similar , but a.t.m. if the size is 0 it will think the size is 3 
            //and draw white boxes for everything,  reddish if blocked or dark gray if on other height 
            if (a_size.X > 0 && a_size.Y > 0)
            {
                #region SettingVariables

                bool f_ok = true;

                Rectangle f_buildArea = MathGameHelper.GetAreaRectangle(ref a_wpos,ref a_size);

                ModelClasses.WorldObjects.WorldObject f_worldObject = a_map.GetWorldObject(ref f_buildArea);

                Rectangle f_worldObjectArea = new Rectangle();

                if (f_worldObject != null)
                {
                    f_worldObjectArea = MathGameHelper.GetAreaRectangle(ref f_worldObject.m_position, ref f_worldObject.m_size);
                }

                if (a_needWO && f_worldObject == null)
                {
                    f_ok = false;
                }
                else if (a_needWO && f_worldObject != null)
                {
                    a_wpos = f_worldObject.m_position;
                }
                else if (!a_needWO && f_worldObject != null)
                {
                    f_ok = false;

                }                

                //Has to be used cause the ray trace gets stuck on bounding box at like 0.000000004 cause of float precision error?
                float f_height = a_map.m_tiles[(int)a_wpos.X, (int)a_wpos.Y].m_height;

                int f_wposLeft = (int)(a_wpos.X) - (int)(a_size.X * 0.5f);
                int f_wposRight = f_wposLeft + (int)(a_size.X);

                int f_wposBottom = (int)(a_wpos.Y) - (int)(a_size.Y * 0.5f);
                int f_wposTop = f_wposBottom + (int)a_size.Y;

                //Mouse is in middle, so - 1/2 building size then -1 for additional grid info
                int f_leftSide = f_wposLeft - 1;
                //Same but to right side            
                int f_rightSide = f_wposRight + 1;

                //Same but for the bottom
                int f_bottom = f_wposBottom - 1;
                //For the top!              
                int f_top = f_wposTop + 1;                

                
                //checks the corners if they have a tile or not, if they don't you can't build
                if (!a_map.IsTile(f_wposLeft, f_wposBottom) || !a_map.IsTile(f_wposLeft, f_wposTop - 1)
                    || !a_map.IsTile(f_wposRight - 1, f_wposBottom) || !a_map.IsTile(f_wposRight - 1, f_wposTop - 1))
                {
                    f_ok = false;
                }

                if (f_ok)
                {
                    BoundingBoxBuffer.m_color = Color.White;
                }
                else
                {
                    BoundingBoxBuffer.m_color = Color.LightPink;
                }

                #endregion

                #region OuterRegion

                //Draws bottom strip first
                if (a_map.IsYPosInside(f_bottom))
                {
                    for (int x = f_leftSide; x < f_rightSide; x++)
                    {
                        if (a_map.IsXPosInside(x))
                        {
                            DrawBoundingBoxBiggerLines(a_map.m_tiles[x, f_bottom].m_boundBox, a_graphics, Matrix.Identity, m_camera);
                        }

                    }
                }
                //Draws Top strip
                if (a_map.IsYPosInside(f_top - 1))
                {
                    for (int x = f_leftSide; x < f_rightSide; x++)
                    {
                        if (a_map.IsXPosInside(x))
                        {
                            DrawBoundingBoxBiggerLines(a_map.m_tiles[x, f_top - 1].m_boundBox, a_graphics, Matrix.Identity, m_camera);
                        }

                    }
                }

                if (a_map.IsXPosInside(f_leftSide))
                {
                    for (int y = f_bottom + 1; y < f_top - 1; y++)
                    {
                        if (a_map.IsYPosInside(y))
                        {
                            DrawBoundingBoxBiggerLines(a_map.m_tiles[f_leftSide, y].m_boundBox, a_graphics, Matrix.Identity, m_camera);
                        }
                    }
                }

                if (a_map.IsXPosInside(f_rightSide - 1))
                {
                    for (int y = f_bottom + 1; y < f_top - 1; y++)
                    {
                        if (a_map.IsYPosInside(y))
                        {
                            DrawBoundingBoxBiggerLines(a_map.m_tiles[f_rightSide - 1, y].m_boundBox, a_graphics, Matrix.Identity, m_camera);
                        }
                    }
                }

                #endregion

                #region InnerRegion



                //Lops from bottom to the top
                for (int y = f_wposBottom; y < f_wposTop; y++)
                {
                    if (a_map.IsYPosInside(y))
                    {
                        //x = a_wpos.X - 1  (a_wpos is rounded)  and loops until x >= a_wpos + a_buildingsize.X  + 1 
                        for (int x = f_wposLeft; x < f_wposRight; x++)
                        {
                            if (a_map.IsXPosInside(x))
                            {
                                BoundingBoxBuffer.m_color = Color.Red;
                                //If x is larger than left side and smaller than rightside - 1  and larger than bottom and smaller than top -1
                                //You are at the positions of the building where its positions are                           
                                //So if the height is not the same as where your mouse is Z wise (not same height) the grid will draw the color red
                                if (f_height == a_map.m_tiles[x, y].m_height && a_map.m_tiles[x, y].m_type != Tiletype.Blocked && f_ok)
                                {                                   
                                    BoundingBoxBuffer.m_color = Color.GreenYellow;   
                                }
                                else if (a_map.m_tiles[x, y].m_type == Tiletype.Blocked)
                                {
                                    BoundingBoxBuffer.m_color = Darkred;
                                }                               
                               
                                DrawBoundingBoxBiggerLines(a_map.m_tiles[x, y].m_boundBox, a_graphics, Matrix.Identity, m_camera);

                            }

                        }//End of x for loop                   
                    }

                }//end of y for loop

                #endregion
            }

            else
            {
                #region Can't_Get_Size_From_BuildBehavior
                a_size = new Vector3(3);

                //Has to be used cause the ray trace gets stuck on bounding box at like 0.000000004 cause of float precision error?
                float f_height = a_map.m_tiles[(int)a_wpos.X, (int)a_wpos.Y].m_height;

                int f_wposLeft = (int)(a_wpos.X) - (int)(a_size.X * 0.5f);
                int f_wposRight = f_wposLeft + (int)(a_size.X);

                int f_wposBottom = (int)(a_wpos.Y) - (int)(a_size.Y * 0.5f);
                int f_wposTop = f_wposBottom + (int)a_size.Y;

                //Mouse is in middle, so - 1/2 building size then -1 for additional grid info
                int f_leftSide = f_wposLeft - 1;
                //Same but to right side            
                int f_rightSide = f_wposRight + 1;

                //Same but for the bottom
                int f_bottom = f_wposBottom - 1;
                //For the top!              
                int f_top = f_wposTop + 1;

                for (int x = f_leftSide; x < f_rightSide ; x++)
                {
                    if (a_map.IsXPosInside(x))
                    {
                        for (int y = f_bottom; y < f_top; y++)
                        {
                            if (a_map.IsYPosInside(y))
                            {
                                BoundingBoxBuffer.m_color = Color.White;

                                if (a_map.m_tiles[x, y].m_type == Tiletype.Blocked )
                                {                                    
                                    BoundingBoxBuffer.m_color = Darkred;
                                }
                                else if (f_height != a_map.m_tiles[x, y].m_height)
                                {
                                    BoundingBoxBuffer.m_color = Color.DarkGray;
                                }                                

                                DrawBoundingBoxBiggerLines(a_map.m_tiles[x, y].m_boundBox, a_graphics, Matrix.Identity, m_camera);
                            }
                        }
                    }
                }
                #endregion
            }
        }
    }
}
