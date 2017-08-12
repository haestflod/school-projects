using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ControllerClasses;
using Cubes_are_acute.ModelClasses;
using Cubes_are_acute.ModelClasses.WorldObjects;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses.Units.Cubes;

namespace Cubes_are_acute.ViewClasses.UI
{
    class HUD
    {
        //the HUDs area
        public static Rectangle m_area;
        //the HUD area's padding
        const int m_areaPadding = 10;

        //the actionbox's buttons
        public Button[,] m_actionboxButtons = new Button[3, 3];
        
        //the size of the actionbox's buttons
        const int m_buttonSize = 40;

        //the tooltip starting point (bottom right) 
        //NOTE: a temp will use this base and change depending on the tooltip's length
        Rectangle m_tooltipBase;
        //the tooltip's padding
        const int m_tooltipPadding = 10;
        //the tooltip's text scale.  
        //NOTE: it should be 1.0, it just needs a different font (a less big one)
        const float m_tooltipTextScale = 1.0f;
        //the tooltip data (the only purpose for this is to store the data of whatever action the mouse is over, used to see tooltip)
        public ObjectAction m_tooltipData;

        //Used to put a 0,0 vector into some draw string function :p
        //this is LIKE an offset, works like a charm when you want to center text.. But here.. Better let it be :)
        Vector2 m_textOrigin = new Vector2();

        //the portraits area
        Rectangle m_portraitArea;

        //the info area
        Rectangle m_infoArea;
        Progressbar m_buildProgress;
        Vector2 m_buildInfo;

        //the info area's padding
        const int m_infoAreaPadding = 10;

        Vector2 m_infoAreaPadded;

        Rectangle m_supplyImageArea;
        Vector2 m_supplyTextPos;

        public Vector3 m_visibleBuildingSize;
        public bool m_buildingNeedsWO = false;

        //this is my masterplan!
        //when creating the HUD the parts of it will get the correct position from this
        public HUD()
        {
            //the height of the HUD
            int height = 160;

            //sets HUD area
            m_area = new Rectangle(0, MasterController.m_windowHeight - height, MasterController.m_windowWidth, height);

            int actionboxSpace = 10;
            int actionboxWidth = 160;
            

            //sets the actionbox's buttons
            for (int y = 0; y < m_actionboxButtons.GetLength(1); y++)
            {
                for (int x = 0; x < m_actionboxButtons.GetLength(0); x++)
                {
                    m_actionboxButtons[x, y] = new Button(m_area.Width - actionboxWidth + actionboxSpace + (actionboxSpace + m_buttonSize) * x,
                                                                m_area.Y + actionboxSpace + (actionboxSpace + m_buttonSize) * y,
                                                                m_buttonSize,
                                                                m_buttonSize);
                }
            }

            //set tooltip position
            m_tooltipBase = new Rectangle(m_area.Right, m_area.Top, 0, 0);

            //set portrait area
            m_portraitArea = new Rectangle(m_area.Left + m_areaPadding + 200, m_area.Top + m_areaPadding, 100, 100);

            m_infoArea = new Rectangle(m_portraitArea.Right + m_areaPadding,m_area.Top + m_areaPadding 
                                        ,m_area.Right - m_portraitArea.Right - actionboxWidth - m_areaPadding * 2
                                        ,m_area.Height - m_areaPadding * 2);

            
           

            m_infoAreaPadded = new Vector2(m_infoArea.Left + m_areaPadding , m_infoArea.Top + m_areaPadding*0.5f);

            m_buildProgress = new Progressbar((int)m_infoAreaPadded.X + 200, m_infoArea.Top + m_areaPadding, 150, 20);

            m_buildInfo = new Vector2(m_buildProgress.m_rectangle.Left, m_buildProgress.m_rectangle.Bottom + m_areaPadding * 0.5f);

            m_supplyImageArea = new Rectangle(MasterController.m_windowWidth -200,10,24,24);
            m_supplyTextPos = new Vector2(m_supplyImageArea.Right + 2, m_supplyImageArea.Top - 2);
        }

        

        //draws HUD
        public void Draw(SpriteBatch a_spritebatch, GameAssets a_gameAssets, ModelClasses.Game a_game)
        {
            //Put the spritebatch Begin here, so it doesn't has to be called 5 times :p  since it sets some stuff, that's on long term bad!
            a_spritebatch.Begin();

            DrawHUDBackground(a_spritebatch, a_gameAssets);
            DrawActionbox(a_spritebatch, a_gameAssets, a_game);
            DrawTooltip(a_spritebatch, a_gameAssets, a_game);
            DrawInfo(a_spritebatch, a_gameAssets, a_game.m_player);
            DrawPortrait(a_spritebatch, a_gameAssets, a_game);
            DrawResourcesInfo(a_game.m_player, a_spritebatch, a_gameAssets);

            a_spritebatch.End();
        }

        private void DrawActionbox(SpriteBatch a_spriteBatch, GameAssets a_gameAssets, ModelClasses.Game a_game)
        {
            //draws actionbox
            for (int y = 0; y < m_actionboxButtons.GetLength(0); y++)
            {
                for (int x = 0; x < m_actionboxButtons.GetLength(1); x++)
                {                                       
                    if (a_game.m_player.m_focusedTarget != null)
                    {
                        //TEMP the real solution should use focusedUnit and depending on what it is, it will draw something different
                        a_spriteBatch.Draw(a_gameAssets.m_emptybox,
                                           m_actionboxButtons[x, y].m_rectangle,
                                           Color.White);

                        if (a_game.m_player.m_focusedTarget.m_moveBehavior != null)
                        {
                            a_spriteBatch.Draw(a_gameAssets.m_move,
                                           m_actionboxButtons[0, 0].m_rectangle,
                                           Color.White);

                            a_spriteBatch.Draw(a_gameAssets.m_hold,
                                           m_actionboxButtons[0, 1].m_rectangle,
                                           Color.White);

                            a_spriteBatch.Draw(a_gameAssets.m_hold,
                                           m_actionboxButtons[1, 0].m_rectangle,
                                           Color.White);
                        }

                        if(a_game.m_player.m_focusedTarget.m_type == ThingType.C_Cube)
                        {
                            a_spriteBatch.Draw(a_gameAssets.m_factory,
                                           m_actionboxButtons[0, 2].m_rectangle,
                                           Color.White);

                            a_spriteBatch.Draw(a_gameAssets.m_igloo,
                                          m_actionboxButtons[1, 2].m_rectangle,
                                          Color.White);

                            a_spriteBatch.Draw(a_gameAssets.m_factory,
                                          m_actionboxButtons[2, 2].m_rectangle,
                                          Color.White);
                        }
                        else if (a_game.m_player.m_focusedTarget.m_type == ThingType.C_Barrack )
                        {
                            if (a_game.m_player.m_focusedTarget.m_thingState != ThingState.BeingBuilt)
                            {
                                a_spriteBatch.Draw(a_gameAssets.m_barbarian,
                                               m_actionboxButtons[0, 2].m_rectangle,
                                               Color.White);

                                a_spriteBatch.Draw(a_gameAssets.m_cancel,
                                               m_actionboxButtons[0, 0].m_rectangle,
                                               Color.White);

                                a_spriteBatch.Draw(a_gameAssets.m_cancelAll,
                                               m_actionboxButtons[1, 0].m_rectangle,
                                               Color.White);

                                a_spriteBatch.Draw(a_gameAssets.m_cancelBuild,
                                               m_actionboxButtons[2, 2].m_rectangle,
                                               Color.White);
                            }
                        }
                    }
                }
            }               
        }

        private void DrawTooltip(SpriteBatch a_spriteBatch, GameAssets a_gameAssets, ModelClasses.Game a_game)
        {
            if(m_tooltipData != null)
            {
                //format text
                string text = String.Format("{0} [{1}]\n\n{2}", m_tooltipData.m_name, m_tooltipData.m_hotkey, m_tooltipData.m_tooltip);

                //make tooltip area
                Rectangle tooltipArea = m_tooltipBase;

                //Multiplication 4 times, I think this is faster (A) ^_^
                int f_totalPadding = 2 * m_tooltipPadding;

                //change tooltip area (depending on the text)
                //NOTE: if you change the font then you will have to change here aswell (to get the correct length)
                tooltipArea.X -= (int)(a_gameAssets.m_smallFont.MeasureString(text).X * m_tooltipTextScale) + f_totalPadding;
                tooltipArea.Y -= (int)(a_gameAssets.m_smallFont.MeasureString(text).Y * m_tooltipTextScale) + f_totalPadding;
                tooltipArea.Width += (int)(a_gameAssets.m_smallFont.MeasureString(text).X * m_tooltipTextScale) + f_totalPadding;
                tooltipArea.Height += (int)(a_gameAssets.m_smallFont.MeasureString(text).Y * m_tooltipTextScale) + f_totalPadding;
                
                //draw tooltip area
                //TEMP to see the tooltip area
                a_spriteBatch.Draw(a_gameAssets.m_button, tooltipArea, Color.DarkOrange);

                //draw text
                a_spriteBatch.DrawString(a_gameAssets.m_smallFont,
                                         text,
                                         new Vector2(tooltipArea.X + m_tooltipPadding, tooltipArea.Y + m_tooltipPadding),
                                         Color.Black,
                                         0.0f,
                                         m_textOrigin,
                                         m_tooltipTextScale,
                                         SpriteEffects.None,
                                         0.5f);                
            }
        }


        //Draws the portrait
        private void DrawPortrait(SpriteBatch a_spriteBatch, GameAssets a_gameAssets, ModelClasses.Game a_game)
        {

            if (a_game.m_player.m_focusedTarget != null)
            {
                //Draws portrait (depending on what type the focused unit is)
                switch (a_game.m_player.m_focusedTarget.m_type)
                {
                    case ModelClasses.Units.ThingType.C_Cube:
                        a_spriteBatch.Draw(a_gameAssets.m_cubePortrait, m_portraitArea, Color.White);
                        break;
                    default:
                        break;
                }
 
            }            
        }


        //Draws a selected units stats 
        private void DrawInfo(SpriteBatch a_spriteBatch, GameAssets a_gameAssets, ModelClasses.Player a_player)
        {              
            //TEMP to see the info area  - I c wut u did thar /Tiger!
            a_spriteBatch.Draw(a_gameAssets.m_button, m_infoArea, Color.Violet);

            if (a_player.m_focusedTarget != null)
            {
                //Format text
                 string f_info = string.Format("HP: {0}/{1}\n", 
                    a_player.m_focusedTarget.HP, 
                    a_player.m_focusedTarget.m_maxHP);

                 if (a_player.m_focusedTarget.m_builtTimer < a_player.m_focusedTarget.m_requiredBuildTime)
                 {                  
                     m_buildProgress.SetProgress(a_player.m_focusedTarget.m_builtTimer / a_player.m_focusedTarget.m_requiredBuildTime);

                     string f_buildingInfo = string.Format("{0:0.0} / {1:0.0} {2:0.0}% \nBuilding: {3}", a_player.m_focusedTarget.m_builtTimer, 
                         a_player.m_focusedTarget.m_requiredBuildTime, m_buildProgress.Percentage * 100, GetUnitName(a_player.m_focusedTarget.m_type));

                     a_spriteBatch.Draw(a_gameAssets.m_button, m_buildProgress.m_rectangle, Color.DarkGray);
                     a_spriteBatch.Draw(a_gameAssets.m_button,m_buildProgress.m_progressArea,Color.Green);

                     a_spriteBatch.DrawString(a_gameAssets.m_normalFont,f_buildingInfo , m_buildInfo, Color.White);
                 }

                 //Special hud info for special types, like extractor needs to write how many sols it has left
                 switch (a_player.m_focusedTarget.m_type)
                 {                     
                     case ModelClasses.Units.ThingType.C_Extractor:
                         Extractor f_tempExtractor = (Extractor)a_player.m_focusedTarget;
                         if (f_tempExtractor.m_SoL != null && f_tempExtractor.m_SoL.m_resources >= 0)
                         {
                             f_info += "SoLs: " + f_tempExtractor.m_SoL.m_resources;
                         }
                         else
                         {
                             f_info += "SoLs: Depleted";
                         }
                         break;
                    
                 }

                 if (a_player.m_focusedTarget.m_buildBehavior != null)
                 {                     

                     if (a_player.m_focusedTarget.m_buildBehavior.IsBuilding())
                     {                         

                         ThingType f_type = a_player.m_focusedTarget.m_buildBehavior.GetBuildingType();
                         float a_requiredBuildTime = a_player.m_thingsAssets.GetThing(f_type).m_requiredBuildTime;

                         m_buildProgress.SetProgress(a_player.m_focusedTarget.m_buildBehavior.GetBuildTimer() / a_requiredBuildTime);

                         string f_buildingInfo = string.Format("Building: {0}\n{1:0.0} / {2:0.0} {3:0.0}% ", HUD.GetUnitName(f_type),a_player.m_focusedTarget.m_buildBehavior.GetBuildTimer(), a_requiredBuildTime, m_buildProgress.Percentage * 100);

                         a_spriteBatch.Draw(a_gameAssets.m_button, m_buildProgress.m_rectangle, Color.DarkGray);
                         a_spriteBatch.Draw(a_gameAssets.m_button, m_buildProgress.m_progressArea, Color.Green);

                         a_spriteBatch.DrawString(a_gameAssets.m_normalFont, f_buildingInfo, m_buildInfo, Color.White);
                     }

                     if (a_player.m_focusedTarget.m_buildBehavior is ModelClasses.BehaviorInterfaces.StandardBuild)
                     {
                         f_info += "Workers: " + a_player.m_focusedTarget.m_buildBehavior.GetSacrificeCount();
                     }                     
                 }

                //Checks if the attack behavior is null or not! to write out that data!
                if (a_player.m_focusedTarget.m_attackBehavior != null)
                {
                    f_info += string.Format("Damage: {0} \nRange: {1}",a_player.m_focusedTarget.m_attackBehavior.GetDamage(),a_player.m_focusedTarget.m_attackBehavior.GetAttackRange());
                }

                if (a_player.m_selectedThings.Count > 1)
                {                               
                    //Should have draw portraits or something here instead, just temp stuff.. I wanna see selected info!!!
                    //Extremely temp code
                    if (a_player.m_focusedTarget.m_isUnit)
                    {
                        string f_selectedInfo = string.Format("Units selected: {0}", a_player.m_selectedThings.Count);
                        a_spriteBatch.DrawString(a_gameAssets.m_normalFont, f_selectedInfo, new Vector2(m_infoAreaPadded.X + m_infoArea.Width*0.5f, m_area.Bottom - 45), Color.White);
                    }
                    else
                    {
                        string f_selectedInfo = string.Format("Buildings selected: {0}", a_player.m_selectedThings.Count);
                        a_spriteBatch.DrawString(a_gameAssets.m_normalFont, f_selectedInfo, new Vector2(m_infoAreaPadded.X + m_infoArea.Width*0.5f, m_area.Bottom - 45), Color.White);
                    }

                    
                }

                //Draw text
                a_spriteBatch.DrawString(a_gameAssets.m_normalFont, f_info, m_infoAreaPadded, Color.White);
            }
            else if (a_player.m_selectedWorldObject != null)
            {
                if (a_player.m_selectedWorldObject.m_type == WorldObjectType.SoL)
                {
                    //Creates a sol variable to access the SoL variables
                    SoL f_SoL = (SoL)a_player.m_selectedWorldObject;

                    string f_info = string.Format("SoLs: {0}", f_SoL.m_resources);

                    a_spriteBatch.DrawString(a_gameAssets.m_normalFont, f_info, m_infoAreaPadded, Color.White);
                }
            }       
        }

        private void DrawHUDBackground(SpriteBatch a_spriteBatch, GameAssets a_gameAssets)
        {

            //TEMP to see the HUD area
            a_spriteBatch.Draw(a_gameAssets.m_button, m_area, Color.Black);
        }

        private void DrawResourcesInfo(Player a_player,SpriteBatch a_spriteBatch, GameAssets a_gameAssets)
        {
            if (a_player.m_race == Races.Cubes)
            {
                a_spriteBatch.Draw(a_gameAssets.m_cubesSupplyImage, m_supplyImageArea, Color.White);
            }
            a_spriteBatch.DrawString(a_gameAssets.m_smallFont, a_player.CurrentSupply + " / " + a_player.CurrentMaxSupply, m_supplyTextPos, Color.Silver);

        }

        public void Update()
        {
            //unpress all pressed buttons (except the pending one(s))
            foreach (Button button in m_actionboxButtons)
            {
                if (button.m_state == Button.BtnState.Pressed)
                {
                    button.NormalState();
                }
            }

            //reset tooltip
            m_tooltipData = null;
        }       

        //checks for pending buttons
        public bool HasAPendingButton()
        {
            for (int y = 0; y < m_actionboxButtons.GetLength(0); y++)
            {
                for (int x = 0; x < m_actionboxButtons.GetLength(1); x++)
                {
                    if (m_actionboxButtons[x, y].m_state == Button.BtnState.Pending)
                    {
                        return true;
                    }
                }
            }

            return false;
        }

        /// <summary>
        /// This returns all pending buttons to normal state
        /// Used when a new action has been choosen, to remove the possibilities of multiple pending buttons
        /// </summary>
        public void ClearPendingButtons()
        {
            for (int y = 0; y < m_actionboxButtons.GetLength(0); y++)
            {
                for (int x = 0; x < m_actionboxButtons.GetLength(1); x++)
                {
                    if (m_actionboxButtons[x, y].m_state == Button.BtnState.Pending)
                    {
                        m_actionboxButtons[x, y].m_state = Button.BtnState.Normal;
                    }
                }
            }
        }

        public static string GetUnitName(ModelClasses.Units.ThingType a_type)
        {
            //Removes the prefix infront of type, thus returning the name ^_^
            return a_type.ToString().Substring(2);
        }        
    }
}
