using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Cubes_are_acute.ViewClasses.UI;
using Cubes_are_acute.ControllerClasses;


namespace Cubes_are_acute.ViewClasses.Menu
{
    class Menu
    {
        public MenuState m_menuState = MenuState.Main;

        //The pause state overlay 
        public static Rectangle m_pause;

        //The background for the main menu
        public Rectangle m_mainBackground;

        //Shows all menus options except the Main Menu
        public static Rectangle m_menu;            

        //Contains all savefiles that kan be saved to        
        public Button[] m_saves = new Button[5];

        //Contains files to be loaded 
        public Button[] m_loaded = new Button[5];

        //the button text for save/load
        public String[] m_slotText = new String[5];       

        //The buttons and checkboxes
        public Button[] m_menuButtons = new Button[5];
        public Button[] m_mainButtons = new Button[4];
        public Button[] m_optionsButtons = new Button[1];
        public CheckBox[] m_checkBoxes = new CheckBox[7];   

        //The text for buttons and checkboxes
        public String[] m_menuText = new String[5];
        public String[] m_mainText = new String[4];
        public String[] m_optText = new String[1];
        public String[] m_checkText = new String[7];        

        //buttons        
        public Button m_return;
        public Button m_options;
        public Button m_save;
        public Button m_load;
        public Button m_quit;
        public Button m_debug;
        public Button m_play;
        public Button m_observer;

        //Return button
        public Button m_ret;

        //To scroll in save
        public Button m_Sup;
        public Button m_Sdown;

        //To scroll in load
        public Button m_Lup;
        public Button m_Ldown;

        //Create new save
        public Button m_newSave;                    

        //constant values
        const int m_buttonSize = 75;
        const int m_boxSize = 40;
        const int padding = 10;
        
        private int m_page = 0;

        //the different menus
        public enum MenuState
        {
            None,
            Main,
            InGameMenu,
            Options,
            DebugMenu,
            PreGame,
            Save,
            Load,
            Win,
            Lose
        }

        public Menu(GameAssets a_gameAssets, ModelClasses.Save a_save)
        {           
            //Creates and sets the width, height and position on screen of menu rectangles
            InitializeMenu();

            //Creates the button and checkboxes
            InitializeItems(a_gameAssets, a_save);
        }

        #region Initialize      

        private void InitializeMenu()
        {
            int width = 350;
            int height = 350;
                   
            //Sets menu position on screen and size
            if (m_menuState == MenuState.Main)
            {
                m_menu = new Rectangle(367, (MasterController.m_windowHeight - HUD.m_area.Height - height) / 2, width, height);
            }
            else
            {
                m_menu = new Rectangle((MasterController.m_windowWidth - width) / 2,
                    (MasterController.m_windowHeight - HUD.m_area.Height - height) / 2, width, height);
            }           

            m_mainBackground = new Rectangle(0, 0, MasterController.m_windowWidth, MasterController.m_windowHeight);           

            m_pause = new Rectangle(0, 0, MasterController.m_windowWidth, MasterController.m_windowHeight);
        }

        //Creates and setts text and assets for each button and checkbox
        public void InitializeItems(GameAssets a_gameAssets, ModelClasses.Save a_save)
        {            
            //Set text for buttons and checkboxes
            SetText();

            SetButtons(m_mainButtons, m_mainText);

            SetButtons(m_menuButtons, m_menuText);            

            SetSlots(a_save);

            SetButtons(m_saves, m_slotText);

            SetButtons(m_loaded, m_slotText);
            
            SetButtons(m_optionsButtons, m_optText);

            SetCheckBoxes(a_gameAssets, m_checkBoxes, m_checkText);            

            SetName();
        }

        #endregion

        #region Set

        //Set the positions of buttons on screen 
        private void SetButtons(Button[] a_array, String[] a_strings)
        {                                  
                m_newSave = new Button(m_menu.Left + padding * 7 + (padding), m_menu.Top + (padding * 2),
                                                                    m_buttonSize + (m_boxSize * 3), m_buttonSize / 2, "New Save");

                m_play = new Button(m_menu.Left + padding * 5 + (padding), m_menu.Top + (padding * 5),
                                                                    m_buttonSize + (m_boxSize * 3), m_buttonSize / 2, "Vs Computer");

                m_observer = new Button(m_menu.Left + padding * 5 + (padding), m_play.m_rectangle.Bottom + (padding * 2),
                                                                    m_buttonSize + (m_boxSize * 4), m_buttonSize / 2, "Observe Computer");
                if (m_menuState == MenuState.PreGame)
                {
                    m_ret = new Button(m_observer.m_rectangle.Left, m_observer.m_rectangle.Bottom + (padding * 2), m_buttonSize * 2, m_buttonSize / 2);                
                }

                m_ret = new Button(m_menu.Left + padding * 5 + (padding), m_menu.Bottom - (padding * 4), m_buttonSize * 2, m_buttonSize / 2);                

                if (a_array == m_mainButtons)
                {                    
                    for (int y = 0; y < a_array.Length; y++)
                    {
                        a_array[y] = new Button(m_menu.Left + padding * 7 + (padding), m_menu.Top + padding * 5 + (m_buttonSize - padding * 2) * y,
                                                                        (m_buttonSize * 2) + m_boxSize, m_buttonSize / 2, a_strings[y]);
                    }                    
                }                
                else if (a_array == m_saves)
                {
                    for (int y = 0; y < a_array.Length; y++)
                    {
                        a_array[y] = new Button(m_menu.Left + padding * 7 + (padding), m_newSave.m_rectangle.Bottom + padding * 2 + (m_buttonSize - padding * 2) * y,
                                                                        m_buttonSize + m_boxSize, m_buttonSize / 2, a_strings[y]);
                    }

                    m_Sup = new Button(m_saves[0].m_rectangle.Right + padding * 5, m_saves[0].m_rectangle.Top + 8, m_boxSize / 2, m_boxSize / 2);
                    m_Sdown = new Button(m_saves[4].m_rectangle.Right + padding * 5, m_saves[4].m_rectangle.Top + 8, m_boxSize / 2, m_boxSize / 2);
                }
                else if (a_array == m_loaded)
                {
                    for (int y = 0; y < a_array.Length; y++)
                    {
                        a_array[y] = new Button(m_menu.Left + padding * 7 + (padding), m_menu.Top + padding * 5 + (m_buttonSize - padding * 2) * y,
                                                                        m_buttonSize + m_boxSize, m_buttonSize / 2, a_strings[y]);
                    }

                    m_Lup = new Button(m_loaded[0].m_rectangle.Right + padding * 5, m_loaded[0].m_rectangle.Top + 8, m_boxSize / 2, m_boxSize / 2);
                    m_Ldown = new Button(m_loaded[4].m_rectangle.Right + padding * 5, m_loaded[4].m_rectangle.Top + 8, m_boxSize / 2, m_boxSize / 2);
                }
                else
                {
                    for (int y = 0; y < a_array.Length; y++)
                    {
                        a_array[y] = new Button(m_menu.Left + padding * 5 + (padding), m_menu.Top + padding * 2 + (m_buttonSize - padding * 2) * y,
                                                                        m_buttonSize * 3, m_buttonSize / 2, a_strings[y]);
                    }
                }                                              
        }

        private void SetCheckBoxes(GameAssets a_assets, CheckBox[] a_array, String[] a_strings)
        {
            for (int y = 0; y < a_array.Length; y++)
            {
                a_array[y] = new CheckBox(m_menu.Left + padding * 2 + (padding / 2), m_menu.Y + padding * 2 + (padding + m_boxSize) * y,
                                                                m_boxSize, m_boxSize, a_assets.m_checked, a_assets.m_unchecked, a_strings[y]);
            }           
        }

        private void SetSlots(ModelClasses.Save a_save)
        {
            String[] f_strings = a_save.TryToGetSaves();

            int f_post = 0;

            if (m_page < 0)
            {
                m_page = 0;
            }
            else if (f_strings.Length > 0)
            {
                for (int i = 0; i < m_slotText.Length; i++)
                {
                    f_post = i + m_page;

                    if (f_post < f_strings.Length)
                    {
                        m_slotText[i] = f_strings[f_post];
                    }
                    else
                    {
                        m_slotText[i] = "Empty";
                    }
                }
            }
            else
            {
                for (int i = 0; i < m_slotText.Length; i++)
                {
                    m_slotText[i] = "Empty";
                }
            }
        }

        private void SetText()
        {

            m_menuText[0] = "Return to game";
            m_menuText[1] = "Options";
            m_menuText[2] = "Save";
            m_menuText[3] = "Load";
            m_menuText[4] = "To Main";

            m_mainText[0] = "New Game";
            m_mainText[1] = "Load Game";
            m_mainText[2] = "Options";            
            m_mainText[3] = "Quit game";

            m_optText[0] = "Debug";

            m_checkText[0] = "Show/Hide FPS";
            m_checkText[1] = "Show/Hide UnitInfo";
            m_checkText[2] = "Show/Hide GridBB";
            m_checkText[3] = "Show/Hide MouseWPos";
            m_checkText[4] = "Show/Hide UnitBB";
            m_checkText[5] = "E/D Freelook";
            m_checkText[6] = "E/D Virtual Sync";
        }

        private void SetName()
        {
            m_return = m_menuButtons[0];
            m_options = m_menuButtons[1];
            m_save = m_menuButtons[2];
            m_load = m_menuButtons[3];
            m_quit = m_menuButtons[4];

            m_debug = m_optionsButtons[0];
        }

        #endregion

        #region Draw

        public void Draw(SpriteBatch a_spritebatch, GameAssets a_gameAssets, ModelClasses.Game a_game, DebugView a_debugView, ModelClasses.Save a_save)
        {
            a_spritebatch.Begin();
            
            //Checks debugoptions and checks the options in Debug menu if they return true else unchecks them
            CheckState(a_debugView);

            //Draws differint screens depending on if u won or lost
            if (a_game.m_state == ModelClasses.Game.GameState.GameOver)
            {
                if (a_game.HasWon(a_game.m_player))
                {
                    m_menuState = ViewClasses.Menu.Menu.MenuState.Win;
                }
                else
                {
                    m_menuState = ViewClasses.Menu.Menu.MenuState.Lose;
                }
            }

            //Draws the pause overlay that is transparent (black) if state is Pause ^_^
            if (a_game.m_state == ModelClasses.Game.GameState.Pause)
            {
                DrawObject(a_spritebatch, a_gameAssets.m_pause, m_pause, Color.White);
            }          

            //Draws the menu
            DrawMenu(a_spritebatch, a_game, a_gameAssets, a_save);            

            a_spritebatch.End();
        }        

        private void DrawMenu(SpriteBatch a_spriteBatch, ModelClasses.Game a_game, GameAssets a_gameAssets, ModelClasses.Save a_save)
        {                       
            if (m_menuState == MenuState.Main || m_menuState == MenuState.PreGame || m_menuState == MenuState.InGameMenu || m_menuState == MenuState.Options ||
                m_menuState == MenuState.DebugMenu || m_menuState == MenuState.Save || m_menuState == MenuState.Load 
                || m_menuState == MenuState.Win || m_menuState == MenuState.Lose)
            {
                if (a_game.m_state == ModelClasses.Game.GameState.Main)
                {
                    DrawObject(a_spriteBatch, a_gameAssets.m_main, m_mainBackground, Color.White);                    
                }
        
                DrawObject(a_spriteBatch, a_gameAssets.m_background, m_menu, Color.White);
            }             

            if (m_menuState == MenuState.Main)
            {                
                //Draws the items in the main screen 
                DrawMenuItems(a_spriteBatch, a_gameAssets, m_mainButtons);
            }
            else if (m_menuState == MenuState.PreGame)
            {                
                DrawMenuItems(a_spriteBatch, a_gameAssets, null);
            }
            else if (m_menuState == MenuState.InGameMenu)
            {                
                //Draws the items in menu screen
                DrawMenuItems(a_spriteBatch, a_gameAssets, m_menuButtons);
            }
            else if (m_menuState == MenuState.Options)
            {                
                //Draws the items in options screen 
                DrawMenuItems(a_spriteBatch, a_gameAssets, m_optionsButtons);
            }
            else if (m_menuState == MenuState.DebugMenu)
            {                
                //Draws the items in debug screen 
                DrawMenuItems(a_spriteBatch, a_gameAssets, m_checkBoxes);
            }
            else if (m_menuState == MenuState.Save)
            {               
                //Draws the saveslots
                DrawMenuItems(a_spriteBatch, a_gameAssets, m_saves);
            }
            else if (m_menuState == MenuState.Load)
            {                
                DrawMenuItems(a_spriteBatch, a_gameAssets, m_loaded);
            }
            else if (m_menuState == MenuState.Win)
            {
                DrawMenuItems(a_spriteBatch, a_gameAssets, null);
            }
            else if (m_menuState == MenuState.Lose)
            {
                DrawMenuItems(a_spriteBatch, a_gameAssets, null);
            }                                                                 
        }        

        //Draws the buttons and checkboxes for respective screen 
        private void DrawMenuItems(SpriteBatch a_spriteBatch, GameAssets a_gameAssets, Array a_array=null)
        {
            //The main menu hera you can start a game, load or change options 
            if (m_menuState == MenuState.Main)
            {                
                m_menu.Height = 350;

                foreach (Button button in a_array)
                {
                    DrawObject(a_spriteBatch, a_gameAssets.m_button, button.m_rectangle, Color.Transparent);
                    DrawString(a_spriteBatch, a_gameAssets.m_normalFont, button.m_rectangle, button.m_buttonText, Color.Red);
                }                
            }
            //This screen is after you've pressed New Game and allows u to choose observe and fight 
            else if (m_menuState == MenuState.PreGame)
            {                
                m_menu.Height = 200;
                m_ret.m_rectangle.X = m_observer.m_rectangle.Left;
                m_ret.m_rectangle.Y = m_observer.m_rectangle.Bottom + (padding * 2);
                
                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_play.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_play.m_rectangle, m_play.m_buttonText, Color.Red);

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_observer.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_observer.m_rectangle, m_observer.m_buttonText, Color.Red);

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_ret.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_ret.m_rectangle, "To Main", Color.Red);
            }
            //This state is for the InGame menu That u open and close with f1
            else if (m_menuState == MenuState.InGameMenu)
            {
                m_menu.Height = 350;
                m_ret.m_rectangle.X = m_menuButtons[4].m_rectangle.Left;
                m_ret.m_rectangle.Y = m_menuButtons[4].m_rectangle.Bottom + (padding * 2);

                foreach (Button button in a_array)
                {
                    DrawObject(a_spriteBatch, a_gameAssets.m_button, button.m_rectangle, Color.Transparent);
                    DrawString(a_spriteBatch, a_gameAssets.m_normalFont, button.m_rectangle, button.m_buttonText, Color.Red);                   
                }

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_ret.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_ret.m_rectangle, "Quit game", Color.Red);
            }
            //Where all options is and for now there is only one Menu here Debug for debug purposes
            else if (m_menuState == MenuState.Options)
            {
                m_menu.Height = 350;
                m_ret.m_rectangle.Y = m_menu.Bottom - (padding * 4);

                foreach (Button button in a_array)
                {
                    DrawObject(a_spriteBatch, a_gameAssets.m_button, button.m_rectangle, Color.Transparent);
                    DrawString(a_spriteBatch, a_gameAssets.m_normalFont, button.m_rectangle, button.m_buttonText, Color.Red);
                }

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_ret.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_ret.m_rectangle, "To Menu", Color.Red);
            }                
            //This screen holds options to help debugging while ingame 
            else if (m_menuState == MenuState.DebugMenu)
            {               
                m_menu.Height = 410;
                m_ret.m_rectangle.Y = m_menu.Bottom - (padding * 4);               

                foreach (CheckBox checkbox in a_array)
	            {
                    if (checkbox.m_state == CheckBox.ChkState.Checked)
                    {
                        DrawObject(a_spriteBatch, a_gameAssets.m_checked, checkbox.m_rectangle, Color.White);                        
                    }
                    else
                    {
                        DrawObject(a_spriteBatch, a_gameAssets.m_emptybox, checkbox.m_rectangle, Color.White);                        
                    }

                    DrawString(a_spriteBatch, a_gameAssets.m_smallFont, checkbox.m_rectangle, checkbox.m_checkBoxText, Color.Red);
	            }

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_ret.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_ret.m_rectangle, "To Options", Color.Red);
            }
            //This menu is where u save your current game and is only accesible while playing the game 
            else if (m_menuState == MenuState.Save)
            {
                m_menu.Height = 390;
                m_ret.m_rectangle.X = m_saves[4].m_rectangle.Left;
                m_ret.m_rectangle.Y = m_menu.Bottom - (padding * 4);

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_newSave.m_rectangle, Color.Transparent);

                DrawObject(a_spriteBatch, a_gameAssets.m_up, m_Sup.m_rectangle, Color.White);
                DrawObject(a_spriteBatch, a_gameAssets.m_down, m_Sdown.m_rectangle, Color.White); 

                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_newSave.m_rectangle, m_newSave.m_buttonText, Color.Red);                

                foreach (Button item in a_array)
                {
                    DrawObject(a_spriteBatch, a_gameAssets.m_button, item.m_rectangle, Color.Transparent);

                    DrawString(a_spriteBatch, a_gameAssets.m_normalFont, item.m_rectangle, item.m_buttonText, Color.Red); 
                }

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_ret.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_ret.m_rectangle, "To Menu", Color.Red);
            }
            //The Load Menu 
            else if (m_menuState == MenuState.Load)
            {
                m_menu.Height = 380;
                m_ret.m_rectangle.X = m_loaded[4].m_rectangle.Left;
                m_ret.m_rectangle.Y = m_menu.Bottom - (padding * 4); 

                DrawObject(a_spriteBatch, a_gameAssets.m_up, m_Lup.m_rectangle, Color.White);
                DrawObject(a_spriteBatch, a_gameAssets.m_down, m_Ldown.m_rectangle, Color.White);                

                foreach (Button item in a_array)
                {
                    DrawObject(a_spriteBatch, a_gameAssets.m_button, item.m_rectangle, Color.Transparent);

                    DrawString(a_spriteBatch, a_gameAssets.m_normalFont, item.m_rectangle, item.m_buttonText, Color.Red);
                }

                DrawObject(a_spriteBatch, a_gameAssets.m_background, m_ret.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_ret.m_rectangle, "To Menu", Color.Red);
            }
            //The screen that comes upp after youv'e won 
            else if (m_menuState == MenuState.Win)
            {
                m_menu.Height = 200;
                m_ret.m_rectangle.Y = m_menu.Bottom - (padding * 5);

                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_menu, "You Won!", Color.Red);

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_ret.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_ret.m_rectangle, "OK!", Color.Red);
            }
            //The screen that comes upp after youv'e lost 
            else if (m_menuState == MenuState.Lose)
            {
                m_menu.Height = 200;
                m_ret.m_rectangle.Y = m_menu.Bottom - (padding * 5);

                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_menu, "You Lose!", Color.Red);

                DrawObject(a_spriteBatch, a_gameAssets.m_button, m_ret.m_rectangle, Color.Transparent);
                DrawString(a_spriteBatch, a_gameAssets.m_normalFont, m_ret.m_rectangle, "OK!", Color.Red);
            }  
        }

        //Draws an object such as a button or checkbox or something that uses rectangles and sets Texture, and Color for the object 
        private void DrawObject(SpriteBatch a_spriteBatch, Texture2D a_texture, Rectangle a_rect, Color a_color)        
        {
            a_spriteBatch.Draw(a_texture, a_rect, a_color);                   
        }

        //Draws a String of Text on the the chosen rectangle and kan change font and color of Text as well 
        private void DrawString(SpriteBatch a_spriteBatch, SpriteFont a_font, Rectangle a_rect, String a_string, Color a_color)
        {                        
            if (m_menuState == MenuState.DebugMenu)
            {
                if (a_rect != m_ret.m_rectangle)
                {
                    a_spriteBatch.DrawString(a_font, a_string,
                    new Vector2(a_rect.Right + padding, a_rect.Y - 2), a_color);
                }
                else
                {
                    a_spriteBatch.DrawString(a_font, a_string,
                    new Vector2(a_rect.Left + padding, a_rect.Y - 2), a_color);
                }
            }
            else if (m_menuState == MenuState.Win || m_menuState == MenuState.Lose)
            {
                if (a_rect != m_ret.m_rectangle)
                {
                    a_spriteBatch.DrawString(a_font, a_string,
                    new Vector2(a_rect.Left + (padding * 11), a_rect.Y + (padding * 3)), a_color);
                }
                else
                {
                    a_spriteBatch.DrawString(a_font, a_string,
                    new Vector2(a_rect.Left + (padding * 9), a_rect.Bottom - (padding * 5)), a_color);
                }
            }
            else if (a_rect == m_ret.m_rectangle)
            {
                a_spriteBatch.DrawString(a_font, a_string,
                new Vector2(a_rect.Left + padding, a_rect.Y - 2), a_color);
            }
            else
            {
                a_spriteBatch.DrawString(a_font, a_string,
                new Vector2(a_rect.Left + padding, a_rect.Y), a_color);
            }
        }       

        #endregion        

        #region Update

        //Scroll one post up in Save/Load
        public void ScrollUp()
        {
            m_page--;
        }

        //Scroll one post down in Save/Load
        public void ScrollDown()
        {
            m_page++;           
        }                      

        //Checks debugoptions and for each true value checks a option in debug screen
        private void CheckState(DebugView a_debugView)
        {            
            for (int i = 0; i < a_debugView.m_debugOptions.m_options.Length; i++)
            {
                if (a_debugView.m_debugOptions.m_options[i])
                {
                    m_checkBoxes[i].m_state = CheckBox.ChkState.Checked;
                }
                else if(!a_debugView.m_debugOptions.m_options[i])
                {
                    m_checkBoxes[i].m_state = CheckBox.ChkState.Unchecked;
                }
            }                    
        }        

        //Updates the save/load menus to populate new saves 
        public void UpdateSlots(GameAssets a_assets, ModelClasses.Save a_save)
        {
            InitializeItems(a_assets, a_save);                                                            
        }

        #endregion       
    }
}
