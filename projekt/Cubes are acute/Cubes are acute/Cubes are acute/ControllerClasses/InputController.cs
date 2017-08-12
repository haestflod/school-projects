using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.GamerServices;
using Microsoft.Xna.Framework.Input;
using Cubes_are_acute.ViewClasses.UI;
using Cubes_are_acute.ViewClasses.Menu;
using Cubes_are_acute.ModelClasses;

namespace Cubes_are_acute.ControllerClasses
{  
    class InputController : Microsoft.Xna.Framework.Game
    {
        public ModelClasses.Save m_save = new Save();
        public ViewClasses.Input m_input = new ViewClasses.Input();

        public void DoInputControl(GraphicsDevice a_graphics, ref ModelClasses.Game a_game,ref ViewClasses.GameView a_gameView, 
            ViewClasses.DebugView a_debugView, ViewClasses.Menu.Menu a_menu, ViewClasses.GameAssets a_gameAssets)
        {
            m_input.GetKeyboardMouseState();                        

            if (a_game.m_state == ModelClasses.Game.GameState.Game)
            {
                CameraInputHandling(a_game, a_gameView.m_camera);

                MouseHandling(a_graphics, a_game, a_gameView);

                HUDHandling(a_graphics, a_game, a_gameView);
            }
         
            MenuHandling(a_graphics,ref a_game, a_menu, a_debugView, a_gameAssets,ref a_gameView);                                 
        }

        #region Mouse
        private void MouseHandling(GraphicsDevice a_graphics, ModelClasses.Game a_game, ViewClasses.GameView a_gameView)
        {
            if (m_input.mouseRightClick())
            {
                //Check if Ray from right clicking hit anything
                //If it did attack that target

                //If it didn't, Move to that target
                //If Attack is active Set units to hunting towards target
                //gets a world position based on a plane, and mouse position
                
                //rightclicks clears pending actions
                a_gameView.m_HUD.ClearPendingButtons();
                a_game.m_player.m_tryingToBuild = false;                
                
                Ray f_worldRay = m_input.GetWorldRay(a_graphics,a_gameView.m_camera,m_input.m_mouse.m_mouseState.X,m_input.m_mouse.m_mouseState.Y);

                ModelClasses.Units.Thing f_target = a_game.TryToAttackOrMove(f_worldRay);

                //If didn't find any target, then move to location!
                if (f_target == null)
                {                    
                    //Get world pos point
                    Vector3? point = m_input.GetWorldPosition(a_graphics, a_game.m_groundPlane, a_game.m_map, a_gameView.m_camera, m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y);
                    if (point.HasValue)
                    {
                        //Check if shift is down, do queue up paths
                        if (m_input.m_keyboardState.IsKeyDown(Microsoft.Xna.Framework.Input.Keys.LeftShift))
                        {
                            a_game.TryToAddDestination(a_game.m_player, point.Value, false);
                        }
                        else
                        {
                            a_game.TryToAddDestination(a_game.m_player, point.Value, true);
                        }
                    }
                }//If it found a target from the ray
                else
                {
                    //If the target isn't owned by player, attack!!!!
                    if (f_target.m_ownerID != a_game.m_player.m_playerID)
                    {
                        a_game.m_player.SetAttackTarget(f_target);
                    }//If player owns the target, move towards! 
                    else
                    {
                        //If the target is building and has standardbuild as build interface
                        if (!f_target.m_isUnit && f_target.m_buildBehavior is ModelClasses.BehaviorInterfaces.StandardBuild && f_target.m_thingState != ModelClasses.Units.ThingState.BeingBuilt)
                        {
                            //Creates the bounding box
                            BoundingBox f_box = (BoundingBox)f_target.m_model.Tag;

                            f_box.Max += f_target.m_currentposition;
                            f_box.Min += f_target.m_currentposition;

                            foreach (ModelClasses.Units.Thing selectedThing in a_game.m_player.m_selectedThings)
                            {
                                //The direction of the ray (from selectedItem -> target)
                                Vector3 f_dir = new Vector3(f_target.m_currentposition.X - selectedThing.m_currentposition.X, f_target.m_currentposition.Y - selectedThing.m_currentposition.Y , 0);

                                f_dir.Normalize();

                                //The ray from unit -> building
                                Ray f_tempRay = new Ray(new Vector3(selectedThing.m_currentposition.X,selectedThing.m_currentposition.Y,f_target.m_currentposition.Z),f_dir);

                                float? f_intersection = f_tempRay.Intersects(f_box);

                                if (f_intersection.HasValue)
                                {
                                    //Point =  Raypos + (Raydir * distanceToPoint)
                                    Vector3 point = (f_tempRay.Position + f_tempRay.Direction * f_intersection.Value);

                                    //If it finds a path
                                    //  Martin: The pathfinder IS working correctly. However there is no way to find a path to a tile which is surrounded by blocked tiles.
                                    //          A center position of a building of 3x3 size is obviously unreachable.
                                    //          Also, the pathfinder doesn't use the height when calculating a path, it only cares about if a tile is blocked or not
                                    if (a_game.m_pathFinder.FindPath(selectedThing.m_currentposition,point) == 1)
                                    {
                                        selectedThing.ChangeDestination(a_game.m_pathFinder.m_pathList);

                                        if (selectedThing.m_type == ModelClasses.Units.ThingType.C_Cube)
                                        {
                                            f_target.m_buildBehavior.AddSacrifice(selectedThing);
                                            
                                        }
                                    }
                                }
                            }
                        }//If not, move towards point! 
                        else
                        {
                            //Get world pos point
                            Vector3? point = m_input.GetWorldPosition(a_graphics, a_game.m_groundPlane, a_game.m_map, a_gameView.m_camera, m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y);
                            if (point.HasValue)
                            {
                                //Check if shift is down, do queue up paths
                                if (m_input.m_keyboardState.IsKeyDown(Microsoft.Xna.Framework.Input.Keys.LeftShift))
                                {
                                    a_game.TryToAddDestination(a_game.m_player, point.Value, false);
                                }
                                else
                                {
                                    a_game.TryToAddDestination(a_game.m_player, point.Value, true);
                                }
                            }
                        }
                    }
                }

                
                                
            }
            
            if (m_input.mouseLeftButtonDown() && !a_game.m_player.m_tryingToBuild)
            {
                BoundingBox? box = m_input.CreateBBSelection(a_graphics, a_game.m_groundPlane,a_game.m_map, a_gameView.m_camera);
                if (box.HasValue)
                {
                    ViewClasses.BoundingBoxBuffer.m_color = Color.White;
                    ViewClasses.GameView.DrawBoundingBox(box.Value, a_graphics, Matrix.Identity, a_gameView.m_camera);
                }
            }


            if (m_input.mouseLeftClick())
            {
                //if the focused unit does NOT have any pending buttons
                if (!a_gameView.m_HUD.HasAPendingButton())
                {
                    //If mouse hasn't moved, for eg. you clicked
                    if (m_input.m_mouse.m_mouseState.X == m_input.m_mouse.m_oldXpos && m_input.m_mouse.m_mouseState.Y == m_input.m_mouse.m_oldYpos)
                    {
                        if (m_input.m_mouse.m_mouseState.Y <= HUD.m_area.Top)
                        {
                            a_game.TryToSelect(m_input.GetWorldRay(a_graphics, a_gameView.m_camera, m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y));
                        }                               
                            
                    }//If mouse moved after you pressed it
                    else
                    {
                        BoundingBox? f_mouseBox = m_input.CreateBBSelection(a_graphics, a_game.m_groundPlane, a_game.m_map, a_gameView.m_camera);

                        if (f_mouseBox.HasValue)
                        {
                            a_game.TryToSelect(f_mouseBox.Value);
                        }

                    }
                }
                else
                {
                    //the mouse point
                    Vector3? point = m_input.GetWorldPosition(a_graphics, a_game.m_groundPlane, a_game.m_map, a_gameView.m_camera, m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y);

                    //Gotta check if it's null or not, or might get null exception
                    if (point.HasValue)
                    {
                        //check buttons
                        for (int y = 0; y < a_gameView.m_HUD.m_actionboxButtons.GetLength(1); y++)
                        {
                            for (int x = 0; x < a_gameView.m_HUD.m_actionboxButtons.GetLength(0); x++)
                            {
                                //if the button is pending
                                if (a_gameView.m_HUD.m_actionboxButtons[x, y].m_state == Button.BtnState.Pending)
                                {
                                    //use the function of the pending button
                                    a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_function(a_game, point.Value);

                                    //reset the now used button
                                    a_gameView.m_HUD.m_actionboxButtons[x, y].m_state = Button.BtnState.Normal;
                                    a_game.m_player.m_tryingToBuild = false;
                                }
                            }
                        }
                    }
                }                    
            }                    
            
        }
        #endregion

        #region Camera
        private void CameraInputHandling(ModelClasses.Game a_game, ViewClasses.Camera a_camera)
        {
            if (m_input.movCameraLeft()
                || m_input.m_mouse.m_mouseState.X <= 0 + a_camera.m_cameraBorder)
            {
                //if it may move left
                if (a_camera.m_focusPos.X > 0)
                    a_camera.MoveCameraLeft();
            }
            else if (m_input.movCameraRight()
                || m_input.m_mouse.m_mouseState.X >= MasterController.m_windowWidth - a_camera.m_cameraBorder)
            {
                //if it may move right
                if (a_camera.m_focusPos.X < a_game.m_map.m_mapWidth)
                    a_camera.MoveCameraRight();
            }

            if (m_input.movCameraForward()
                || m_input.m_mouse.m_mouseState.Y <= 0 + a_camera.m_cameraBorder)
            {
                //if it may move forward
                if (a_camera.m_focusPos.Y < a_game.m_map.m_mapDepth)
                    a_camera.MoveCameraForward();
            }
            else if (m_input.movCameraBackward()
                || m_input.m_mouse.m_mouseState.Y >= MasterController.m_windowHeight - a_camera.m_cameraBorder)
            {
                //if it may move backward
                if (a_camera.m_focusPos.Y > 0)
                    a_camera.MoveCameraBackward();
            }

            if (m_input.moveCameraDown())
            {
                a_camera.MoveCameraDown();
            }
            else if (m_input.moveCameraUp())
            {
                a_camera.MoveCameraUp();
            }

            if (m_input.KeyPressed(m_input.m_home))
            {
                a_camera.ResetCamera();
            }
        }
        #endregion

        #region HUD
        public void HUDHandling(GraphicsDevice a_graphics, ModelClasses.Game a_game, ViewClasses.GameView a_gameView)
        {
            //update HUD
            //MUST HAPPEN FIRST
            a_gameView.m_HUD.Update();

            #region Actionboxes

            //if there IS a focusedTarget (otherwise there is no need to go through any of this)
            if (a_game.m_player.m_focusedTarget != null && a_game.m_player.m_focusedTarget.m_ownerID == a_game.m_player.m_playerID)
            {
                #region Hotkeys
                //HOTKEYS
                //check hotkeys
                for (int y = 0; y < a_gameView.m_HUD.m_actionboxButtons.GetLength(1); y++)
                {
                    for (int x = 0; x < a_gameView.m_HUD.m_actionboxButtons.GetLength(0); x++)
                    {
                        if (m_input.KeyClicked(a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_hotkey))
                        {
                            //clear all pending buttons
                            a_gameView.m_HUD.ClearPendingButtons();

                            //add cooldown check here

                            if (a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_type == ModelClasses.ObjectAction.Type.Instant)
                            {
                                //current position point (it needs a point with a value, even if the actual function does not)
                                Vector3? point = a_game.m_player.m_focusedTarget.m_currentposition;

                                //do action
                                a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_function(a_game, point.Value);
                            }
                            else
                            {
                                //set pending
                                a_gameView.m_HUD.m_actionboxButtons[x, y].m_state = Button.BtnState.Pending;
                                if (a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_buildTag && a_game.m_player.m_selectedWorkers >= a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_price)
                                {
                                    a_game.m_player.m_tryingToBuild = true;
                                    a_gameView.m_HUD.m_visibleBuildingSize = a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_buildSize;
                                    a_gameView.m_HUD.m_buildingNeedsWO = a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_lookingForWO;
                                }
                                else if (a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_buildTag && a_game.m_player.m_selectedWorkers < a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_price)
                                {
                                    a_gameView.m_HUD.m_actionboxButtons[x, y].NormalState();
                                    //Play some event here...
                                }
                            }
                        }//If key is down but not pressed, do graphics for showing button is pressed!
                        else if (m_input.KeyPressed(a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_hotkey))
                        {
                            a_gameView.m_HUD.m_actionboxButtons[x, y].Press();
                        }
                    }
                }
                #endregion

                #region MouseOver
                //mouse part
                //if the mouse in in the HUD area
                if (m_input.m_mouse.m_mouseState.Y > HUD.m_area.Top)
                {
                    //the visual part
                    //check buttons
                    for (int y = 0; y < a_gameView.m_HUD.m_actionboxButtons.GetLength(1); y++)
                    {
                        for (int x = 0; x < a_gameView.m_HUD.m_actionboxButtons.GetLength(0); x++)
                        {
                            //if inside a button
                            if (a_gameView.m_HUD.m_actionboxButtons[x, y].IsMouseOver(m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y))
                            {
                                //if the button DOES have a function
                                if (a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_function != null)
                                {
                                    //set tooltip data
                                    a_gameView.m_HUD.m_tooltipData = a_game.m_player.m_focusedTarget.m_actionbox[x, y];

                                    //add cooldown check here

                                    if (m_input.mouseLeftButtonDown())
                                    {
                                        //press button
                                        a_gameView.m_HUD.m_actionboxButtons[x, y].Press();
                                    }
                                }
                            }
                        }
                    }
                #endregion

                #region MouseClick
                    //the action part
                    if (m_input.mouseLeftClick())
                    {
                        //MOUSE CLICKED
                        //check buttons
                        for (int y = 0; y < a_gameView.m_HUD.m_actionboxButtons.GetLength(1); y++)
                        {
                            for (int x = 0; x < a_gameView.m_HUD.m_actionboxButtons.GetLength(0); x++)
                            {
                                //if inside a button
                                if (a_gameView.m_HUD.m_actionboxButtons[x, y].m_rectangle.Contains(m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y))
                                {
                                    //if the button DOES have a function
                                    if (a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_function != null)
                                    {

                                        //add cooldown check here

                                        //if the action type is instant (no target needed)
                                        if (a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_type == ModelClasses.ObjectAction.Type.Instant)
                                        {
                                            //current position point (it needs a point with a value, even if the actual function does not)
                                            Vector3? point = a_game.m_player.m_focusedTarget.m_currentposition;

                                            //clear pending buttons
                                            a_gameView.m_HUD.ClearPendingButtons();

                                            //do action
                                            a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_function(a_game, point.Value);
                                        }
                                        //if the action needs a target
                                        else
                                        {
                                            //clear pending buttons
                                            a_gameView.m_HUD.ClearPendingButtons();

                                            //set pending
                                            a_gameView.m_HUD.m_actionboxButtons[x, y].m_state = Button.BtnState.Pending;
                                            if (a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_buildTag && a_game.m_player.m_selectedWorkers >= a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_price)
                                            {
                                                a_game.m_player.m_tryingToBuild = true;
                                                a_gameView.m_HUD.m_visibleBuildingSize = a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_buildSize;
                                                a_gameView.m_HUD.m_buildingNeedsWO = a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_lookingForWO;
                                            }
                                            else if (a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_buildTag && a_game.m_player.m_selectedWorkers < a_game.m_player.m_focusedTarget.m_actionbox[x, y].m_price)
                                            {
                                                a_gameView.m_HUD.m_actionboxButtons[x, y].NormalState();
                                                //Play some event here...
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                #endregion

                }
            }
            #endregion

        }
        #endregion

        #region Menu
        public void MenuHandling(GraphicsDevice a_graphics, ref ModelClasses.Game a_game, ViewClasses.Menu.Menu a_menu, 
            ViewClasses.DebugView a_debugView, ViewClasses.GameAssets a_gameAssets,ref ViewClasses.GameView a_gameView)
        {            
            //When menu is opened
            if (m_input.KeyClicked(m_input.m_f1))
            {                 
                if (a_menu.m_menuState == Menu.MenuState.None)
                {
                    a_game.m_state = ModelClasses.Game.GameState.Pause;
                    
                    a_menu.m_menuState = Menu.MenuState.InGameMenu;                    
                }
                else if (a_menu.m_menuState == Menu.MenuState.Main)
                {
                    //Nothing
                }
                //when it's closed
                else
                {                    
                    a_game.m_state = ModelClasses.Game.GameState.Game;
                }             
            }            
            else
            {               
                //Checks to se if mouse is in the menu area   
                if (m_input.m_mouse.m_mouseState.Y < Menu.m_menu.Bottom && m_input.m_mouse.m_mouseState.X > Menu.m_menu.Left)
                {
                    VisualMenuCheck(a_menu); 
                                                
                    if (m_input.mouseLeftClick())
                    {
                        if (a_menu.m_menuState == Menu.MenuState.Main)
                        {
                            if (ButtonPress(a_menu.m_mainButtons[0]))
                            {
                                a_menu.m_menuState = Menu.MenuState.PreGame;                                                                                        
                            }
                            else if (ButtonPress(a_menu.m_mainButtons[1]))
                            {
                                a_menu.m_menuState = Menu.MenuState.Load;
                            }
                            else if (ButtonPress(a_menu.m_mainButtons[2]))
                            {
                                a_menu.m_menuState = Menu.MenuState.Options;
                            }
                            else if (ButtonPress(a_menu.m_mainButtons[3]))
                            {
                                MasterController.m_exit = true;                                
                            }
                        }
                        else if (a_menu.m_menuState == Menu.MenuState.PreGame)
                        {
                            //Starts a session to play against computer
                            if (ButtonPress(a_menu.m_play))
                            {
                                ModelClasses.Game f_game = new ModelClasses.Game(a_gameAssets, MasterController.m_mapSize, MasterController.m_mapSize);
                                GameBuilder f_gameBuilder = new GameBuilder();

                                f_gameBuilder.BuildWorldForFour(f_game, a_gameAssets);

                                a_gameAssets.LoadHeightMap(a_graphics, f_game.m_map);

                                a_gameView = new ViewClasses.GameView(a_graphics, a_gameAssets, f_game);

                                f_game.SetParticleHandler(a_gameView.m_particleHandler);

                                a_gameView.m_mapTransformer.LoadGraphicsContent(a_graphics);

                                a_game = f_game;

                                a_menu.m_menuState = Menu.MenuState.None;
                            }
                            //Starts a Session to observe a Computer battle
                            else if (ButtonPress(a_menu.m_observer))
                            {
                                ModelClasses.Game f_game = new ModelClasses.Game(a_gameAssets, MasterController.m_mapSize, MasterController.m_mapSize);

                                f_game.SetParticleHandler(a_gameView.m_particleHandler);

                                a_gameAssets.LoadHeightMap(a_graphics, f_game.m_map);

                                a_gameView = new ViewClasses.GameView(a_graphics, a_gameAssets, f_game);

                                f_game.SetParticleHandler(a_gameView.m_particleHandler);

                                a_gameView.m_mapTransformer.LoadGraphicsContent(a_graphics);

                                a_game = f_game;

                                a_menu.m_menuState = Menu.MenuState.None;
                            }
                            //Return u to main menu
                            else if (ButtonPress(a_menu.m_ret))
                            {
                                a_menu.m_menuState = Menu.MenuState.Main;
                            }
                        }
                        else if (a_menu.m_menuState == Menu.MenuState.InGameMenu)
                        {
                            //Return to game button
                            if (ButtonPress(a_menu.m_return))
                            {
                                a_game.m_state = ModelClasses.Game.GameState.Game;
                            }

                            //Options button
                            else if (ButtonPress(a_menu.m_options))
                            {
                                a_menu.m_menuState = Menu.MenuState.Options;
                            }

                            //Save button
                            else if (ButtonPress(a_menu.m_save))
                            {
                                a_menu.m_menuState = Menu.MenuState.Save;
                            }

                            //Load Button
                            else if (ButtonPress(a_menu.m_load))
                            {
                                a_menu.m_menuState = Menu.MenuState.Load;
                            }

                            //Main Menu Button                           
                            else if (ButtonPress(a_menu.m_quit))
                            {
                                a_game.m_state = ModelClasses.Game.GameState.Main;
                                a_menu.m_menuState = Menu.MenuState.Main;
                            }

                             //Quit button
                            else if (ButtonPress(a_menu.m_ret))
                            {
                                MasterController.m_exit = true;
                            }
                        }

                        //Options Screen
                        else if (a_menu.m_menuState == Menu.MenuState.Options)
                        {
                            if (a_game.m_state == ModelClasses.Game.GameState.Main)
                            {
                                //Debug Button
                                if (ButtonPress(a_menu.m_debug))
                                {
                                    a_menu.m_menuState = Menu.MenuState.DebugMenu;
                                }
                                else if (ButtonPress(a_menu.m_ret))
                                {
                                    a_menu.m_menuState = Menu.MenuState.Main;
                                }
                            }
                            else
                            {
                                //Debug Button
                                if (ButtonPress(a_menu.m_debug))
                                {
                                    a_menu.m_menuState = Menu.MenuState.DebugMenu;
                                }
                                else if (ButtonPress(a_menu.m_ret))
                                {
                                    a_menu.m_menuState = Menu.MenuState.InGameMenu;
                                }
                            }
                        }

                        //Debug Screen
                        else if (a_menu.m_menuState == Menu.MenuState.DebugMenu)
                        {
                            if (ButtonPress(a_menu.m_ret))
                            {
                                a_menu.m_menuState = Menu.MenuState.Options;
                            }
                            else
                            {
                                for (int i = 0; i < a_menu.m_checkBoxes.Length; i++)
                                {
                                    if (a_menu.m_checkBoxes[i].m_state == CheckBox.ChkState.Checked)
                                    {
                                        a_debugView.m_debugOptions.m_options[i] = true;

                                        a_debugView.m_debugOptions.Update();
                                    }
                                    else if (a_menu.m_checkBoxes[i].m_state == CheckBox.ChkState.Unchecked)
                                    {
                                        a_debugView.m_debugOptions.m_options[i] = false;

                                        a_debugView.m_debugOptions.Update();
                                    }
                                }
                            }
                        }
                        //Save screen 
                        else if (a_menu.m_menuState == Menu.MenuState.Save)
                        {
                            if (ButtonPress(a_menu.m_ret))
                            {
                                a_menu.m_menuState = Menu.MenuState.InGameMenu;
                            }
                            //New save button
                            //It creates a new save slot and saves the game and adds it to the save/load screens 
                            else if (ButtonPress(a_menu.m_newSave))
                            {
                                m_save.TryToSave(a_game, "New Save");

                                //in order to update save/load screens to populate new saves                                                                
                                a_menu.UpdateSlots(a_gameAssets, m_save);

                                a_game.m_state = ModelClasses.Game.GameState.Game;
                            }
                            else if (ButtonPress(a_menu.m_Sup))
                            {
                                a_menu.ScrollUp();

                                a_menu.UpdateSlots(a_gameAssets, m_save);
                            }
                            else if (ButtonPress(a_menu.m_Sdown))
                            {
                                a_menu.ScrollDown();

                                a_menu.UpdateSlots(a_gameAssets, m_save);
                            }
                            else
                            {
                                //Loops through the saves to see if user have pressed a save and if true it saves the game and break                                                       
                                Button f_click = ButtonClicked(a_menu.m_saves);

                                if (f_click != null)
                                {
                                    m_save.TryToSave(a_game, f_click.m_buttonText);

                                    a_menu.UpdateSlots(a_gameAssets, m_save);

                                    a_game.m_state = ModelClasses.Game.GameState.Game;
                                }
                            }
                        }
                        //Load screen 
                        else if (a_menu.m_menuState == Menu.MenuState.Load)
                        {
                            if (ButtonPress(a_menu.m_Lup))
                            {
                                a_menu.ScrollUp();

                                a_menu.UpdateSlots(a_gameAssets, m_save);
                            }
                            else if (ButtonPress(a_menu.m_Ldown))
                            {
                                a_menu.ScrollDown();

                                a_menu.UpdateSlots(a_gameAssets, m_save);
                            }
                            else
                            {
                                Button f_click = ButtonClicked(a_menu.m_loaded);

                                if (f_click != null)
                                {
                                    ModelClasses.Game f_game = m_save.TryToLoad(f_click.m_buttonText);

                                    if (f_game != null)
                                    {
                                        f_game.InitializeModels(a_gameView.m_particleHandler, a_gameAssets);

                                        a_gameAssets.LoadHeightMap(a_graphics, f_game.m_map);

                                        a_gameView = new ViewClasses.GameView(a_graphics, a_gameAssets, f_game);

                                        f_game.SetParticleHandler(a_gameView.m_particleHandler);

                                        a_gameView.m_mapTransformer = new ViewClasses.MapTransformer(f_game.m_map);

                                        a_gameView.m_mapTransformer.LoadGraphicsContent(a_graphics);

                                        a_game = f_game;

                                        a_game.m_state = ModelClasses.Game.GameState.Game;
                                    }
                                }
                            }

                            if (a_game.m_state == ModelClasses.Game.GameState.Main)
                            {
                                if (ButtonPress(a_menu.m_ret))
                                {
                                    a_menu.m_menuState = Menu.MenuState.Main;
                                }
                            }
                            else
                            {
                                if (ButtonPress(a_menu.m_ret))
                                {
                                    a_menu.m_menuState = Menu.MenuState.InGameMenu;
                                }
                            }
                        }
                        else if (a_menu.m_menuState == Menu.MenuState.Win)
                        {
                            if (a_game.m_state == ModelClasses.Game.GameState.GameOver)
                            {
                                if (ButtonPress(a_menu.m_ret))
                                {
                                    a_game.m_state = ModelClasses.Game.GameState.Main;

                                    a_menu.m_menuState = Menu.MenuState.Main;
                                }
                            }
                        }
                        else if (a_menu.m_menuState == Menu.MenuState.Lose)
                        {
                            if (a_game.m_state == ModelClasses.Game.GameState.GameOver)
                            {
                                if (ButtonPress(a_menu.m_ret))
                                {
                                    a_game.m_state = ModelClasses.Game.GameState.Main;

                                    a_menu.m_menuState = Menu.MenuState.Main;
                                }
                            }
                        }
                    }
                }                                                            
            }     
        }
        #endregion

        #region Visual
        private void VisualMenuCheck(Menu a_menu)
        {
            if (a_menu.m_menuState != Menu.MenuState.Main)
            {
                VisualButtonCheck(a_menu.m_ret);
            }

            if (a_menu.m_menuState == Menu.MenuState.Main)
            {
                VisualButtonsCheck(a_menu.m_mainButtons);
            }
            else if (a_menu.m_menuState == Menu.MenuState.PreGame)
            {
                VisualButtonCheck(a_menu.m_play);
                VisualButtonCheck(a_menu.m_observer);               
            }
            else if (a_menu.m_menuState == Menu.MenuState.InGameMenu)
            {
                VisualButtonsCheck(a_menu.m_menuButtons);               
            }
            else if (a_menu.m_menuState == Menu.MenuState.Options)
            {
                VisualButtonsCheck(a_menu.m_optionsButtons);               
            }
            else if (a_menu.m_menuState == Menu.MenuState.DebugMenu)
            {
                VisualCheckBoxesCheck(a_menu.m_checkBoxes);                
            }
            else if (a_menu.m_menuState == Menu.MenuState.Save)
            {
                VisualButtonCheck(a_menu.m_newSave);
                VisualButtonCheck(a_menu.m_Sup);
                VisualButtonCheck(a_menu.m_Sdown);
                VisualButtonsCheck(a_menu.m_saves);               
            }
            else if (a_menu.m_menuState == Menu.MenuState.Load)
            {
                VisualButtonCheck(a_menu.m_Lup);
                VisualButtonCheck(a_menu.m_Ldown);
                VisualButtonsCheck(a_menu.m_loaded);                
            }                     
        }        

        private void VisualButtonCheck(Button a_button)
        {
            if (a_button.IsMouseOver(m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y))
            {
                if (m_input.mouseLeftButtonDown())
                {
                    //press button
                    a_button.Press();
                }
            }
        }

        private void VisualButtonsCheck(Button[] a_array)
        {
            foreach (Button button in a_array)
            {
                VisualButtonCheck(button);
            }
        }

        private void VisualCheckBoxCheck(CheckBox a_checkbox)
        {
            //if inside a button                        
            if (a_checkbox.IsMouseOver(m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y))
            {
                if (m_input.mouseLeftClick())
                {
                    if (a_checkbox.m_state == CheckBox.ChkState.Unchecked)
                    {
                        //check box
                        a_checkbox.Checked();
                    }
                    else if (a_checkbox.m_state == CheckBox.ChkState.Checked)
                    {
                        //uncheck box
                        a_checkbox.Unchecked();
                    }
                }
            }
        }

        private void VisualCheckBoxesCheck(CheckBox[] a_array)
        {
            foreach (CheckBox checkbox in a_array)
            {
                VisualCheckBoxCheck(checkbox);
            }
        }
        #endregion  
    
        #region Action

        private bool ButtonPress(Button a_button)
        {
            if (a_button.m_rectangle.Contains(m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y))
            {
                if (a_button.m_state == Button.BtnState.Pressed)
                {
                    a_button.NormalState();
                    return true;
                }             
            }

            return false;
        }

        private Button ButtonClicked(Button[] a_array)
        {
            for (int i = 0; i < a_array.Length; i++)
            {
                if (a_array[i].m_rectangle.Contains(m_input.m_mouse.m_mouseState.X, m_input.m_mouse.m_mouseState.Y))
                {
                    if (a_array[i].m_state == Button.BtnState.Pressed)
                    {
                        a_array[i].NormalState();
                        return a_array[i];
                    }
                }
            }            

            return null;
        }        

        #endregion
    }
}
