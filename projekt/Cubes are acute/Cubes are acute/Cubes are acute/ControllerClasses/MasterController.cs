//Made by:
//The one and only:    pinksuper007agentawesometagtag666killereliteblä
//The mysterious:      Tiger    , scratch scratch!
//The blonde fighter:  Saikou

using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Audio;
using Microsoft.Xna.Framework.Content;
using Microsoft.Xna.Framework.GamerServices;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework.Media;
using Microsoft.Xna.Framework.Storage;

namespace Cubes_are_acute.ControllerClasses
{
    /// <summary>
    /// This is the main type for your game
    /// </summary>
    public class MasterController : Microsoft.Xna.Framework.Game
    {
        //Globals
        GraphicsDeviceManager graphics;
        SpriteBatch spriteBatch;        

        public float m_elapsedTime;
        public float m_totalTime;

        //Used by stuff to get the width and height of the window, so there's no need to send game or graphicsdevice to where it's needed
        public static int m_windowWidth;
        public static int m_windowHeight;

        public static bool m_exit = false;
        public static bool m_load = false;
        public static bool m_new = false;
        //public static bool m_start = false;        
        public static String m_file;

        //Model  
        ModelClasses.Game m_game;
        ModelClasses.Save m_save;

        public static int m_mapSize;

        //Controller
        InputController m_inputController = new InputController();

        //Views        
        ViewClasses.GameAssets m_gameAssets = new ViewClasses.GameAssets();
        ViewClasses.GameView m_gameView;
        ViewClasses.Menu.Menu m_menu;

        ViewClasses.DebugView m_debugView = new ViewClasses.DebugView();
        public bool m_debugMode = true;        

        public MasterController()
        {
            graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";            
        }

        /// <summary>
        /// Allows the game to perform any initialization it needs to before starting to run.
        /// This is where it can query for any required services and load any non-graphic
        /// related content.  Calling base.Initialize will enumerate through any components
        /// and initialize them as well.
        /// </summary>
        protected override void Initialize()
        {
            base.Initialize();

            m_mapSize = 48;

            graphics.PreferredBackBufferHeight = 800;
            graphics.PreferredBackBufferWidth = 1024;

            if (!m_debugView.m_debugOptions.m_withVS)
            {
                graphics.SynchronizeWithVerticalRetrace = false;
                IsFixedTimeStep = false;
            }            

            graphics.ApplyChanges();

            //graphics.ToggleFullScreen();

            m_windowHeight = graphics.GraphicsDevice.Viewport.Height;
            m_windowWidth = graphics.GraphicsDevice.Viewport.Width;

            m_save = new ModelClasses.Save();

            m_menu = new ViewClasses.Menu.Menu(m_gameAssets, m_save);

            m_game = new ModelClasses.Game(m_gameAssets, m_mapSize,m_mapSize);
            m_game.m_state = ModelClasses.Game.GameState.Main;

            m_gameAssets.LoadHeightMap(graphics.GraphicsDevice, m_game.m_map);

            m_gameView = new ViewClasses.GameView(graphics.GraphicsDevice, m_gameAssets, m_game);         

            m_game.SetParticleHandler(m_gameView.m_particleHandler);

            m_gameView.m_mapTransformer.LoadGraphicsContent(graphics.GraphicsDevice);

            m_debugView.InitilizePositions();

            //LOLOL  Mouse wasn't visible for a strategy game at first, LOLOL!!
            IsMouseVisible = true;
            Window.Title = "Cubes are cute";            

            ViewClasses.BoundingBoxBuffer.InitiliazeBuffers(graphics.GraphicsDevice);            
        }

        /// <summary>
        /// LoadContent will be called once per game and is the place to load
        /// all of your content.
        /// </summary>
        protected override void LoadContent()
        {
            spriteBatch = new SpriteBatch(graphics.GraphicsDevice);

            m_gameAssets.LoadResources(Content,graphics.GraphicsDevice);            
        }

        /// <summary>
        /// UnloadContent will be called once per game and is the place to unload
        /// all content.
        /// </summary>
        protected override void UnloadContent()
        {
            
        }        

        /// <summary>
        /// Allows the game to run logic such as updating the world,
        /// checking for collisions, gathering input, and playing audio.
        /// </summary>
        /// <param name="gameTime">Provides a snapshot of timing values.</param>
        protected override void Update(GameTime gameTime)
        {
            m_elapsedTime = (float)gameTime.ElapsedGameTime.TotalSeconds;            

            if (m_elapsedTime > 0.1f)
            {
                m_elapsedTime = 0.1f;
            }

            if (m_game.m_state == ModelClasses.Game.GameState.Game)
            {

                if (m_debugMode)
                {
                    m_debugView.m_fpstimer += gameTime.ElapsedGameTime;

                    if (m_debugView.m_fpstimer > TimeSpan.FromSeconds(1))
                    {
                        m_debugView.m_fpstimer -= TimeSpan.FromSeconds(1);

                        m_debugView.m_fps = m_debugView.m_frameCounter;
                        m_debugView.m_frameCounter = 0;
                    }
                   
                }

                //if the game is over
                if (m_game.IsGameOver())
                {                 
                    m_game.m_state = ModelClasses.Game.GameState.GameOver;                    
                }
                else
                {
                    m_game.Update(m_elapsedTime);

                    //The AI of the computer
                    foreach (ModelClasses.ROB computer in m_game.m_computers)
                    {
                        computer.RobThinking(m_game);
                    }     
                }
            }
                       
            base.Update(gameTime);
        }

        /// <summary>
        /// This is called when the game should draw itself.
        /// </summary>
        /// <param name="gameTime">Provides a snapshot of timing values.</param>
        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.CornflowerBlue);

            //So game won't be drawn at Initialization
            if (m_game.m_state != ModelClasses.Game.GameState.Main)
            {
                //to fix z-buffer issue, caused by spriteBatch.Begin()
                GraphicsDevice.DepthStencilState = DepthStencilState.Default;

                //camera view sätts här
                m_gameView.Draw(spriteBatch, m_gameAssets, m_game, graphics.GraphicsDevice, m_debugView, m_save, m_elapsedTime);                

                if (m_debugMode)
                {
                    DebugActions();
                }
            }

            //Draws Menu default is Main Menu
            m_menu.Draw(spriteBatch, m_gameAssets, m_game, m_debugView, m_save);

            //Can only happen during a game
            if (m_game.m_state == ModelClasses.Game.GameState.Game)
            {
                m_menu.m_menuState = ViewClasses.Menu.Menu.MenuState.None;

                //This is here to draw the grid, and show the grid no matter how the depth is. So it's before the z-buffer issue is fixed
                if (m_game.m_player.m_tryingToBuild && m_game.m_player.m_focusedTarget != null)
                {
                    Vector3? f_point = m_inputController.m_input.GetWorldPosition(graphics.GraphicsDevice, m_game.m_groundPlane, m_game.m_map, m_gameView.m_camera, m_inputController.m_input.m_mouse.m_mouseState.X, m_inputController.m_input.m_mouse.m_mouseState.Y);
                    if (f_point.HasValue)
                    {
                        if (m_game.m_player.m_focusedTarget.m_buildBehavior != null)
                        {
                            //DRAW TRYING TO BUILD ..  draws ze grid!
                            m_gameView.DrawTryingToBuild(graphics.GraphicsDevice, f_point.Value, m_game.m_map, m_gameView.m_HUD.m_visibleBuildingSize, m_gameView.m_HUD.m_buildingNeedsWO);
                        }
                    }
                }                              
            }                                   
            
            //my function checks bools and performs different things   
            GameCheck();

            //So u can click on the screen ^_^
            m_inputController.DoInputControl(graphics.GraphicsDevice, ref m_game, ref m_gameView, m_debugView, m_menu, m_gameAssets);

            //MIN FUNKTION - Ze Tiger
            TigerRawrAttack();                        
        }


        public void DebugActions()
        {

            m_debugView.DrawDebug(graphics.GraphicsDevice, m_gameView.m_camera, m_game, spriteBatch, m_gameAssets, m_inputController.m_input);
            

            m_debugView.m_frameCounter++;            

            #region FreeLook
            //Debug option for rotating camera,  should be more like spinning around axis than just moving the 
            if (m_debugView.m_debugOptions.m_freeLook)
            {
                if (m_inputController.m_input.m_keyboardState.IsKeyDown(Keys.NumPad4))
                {
                    m_gameView.m_camera.RotateCameraLeft();
                }
                else if (m_inputController.m_input.m_keyboardState.IsKeyDown(Keys.NumPad6))
                {
                    m_gameView.m_camera.RotateCameraRight();
                }

                if (m_inputController.m_input.m_keyboardState.IsKeyDown(Keys.NumPad8))
                {
                    m_gameView.m_camera.RotateCameraUp();
                }
                else if (m_inputController.m_input.m_keyboardState.IsKeyDown(Keys.NumPad2))
                {
                    m_gameView.m_camera.RotateCameraDown();
                }

                if (m_inputController.m_input.m_keyboardState.IsKeyDown(Keys.NumPad5))
                {
                    m_gameView.m_camera.RotateCameraForward();
                }
                else if (m_inputController.m_input.m_keyboardState.IsKeyDown(Keys.NumPad0))
                {
                    m_gameView.m_camera.RotateCameraBackward();
                }
            }            
            #endregion
        }        

        private void TigerRawrAttack()
        {          
 
        }

        private void GameCheck()
        {
            //Quits game
            if (m_exit)
            {
                this.Exit();
            }                     
        }
    }
}
