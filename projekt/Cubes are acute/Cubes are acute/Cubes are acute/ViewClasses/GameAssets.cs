using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Content;
using Microsoft.Xna.Framework;


namespace Cubes_are_acute.ViewClasses
{    
    class GameAssets
    {
        //Cubes
        public Model c_cube;
        public Model c_barbarian;

        public Model c_extractor;
        public Model c_igloo;
        public Model c_barrack;

        public Model m_ground;
        public Model m_normalGround;
        public Model m_projektil;

        public Model m_sparkOfLife;

        public Effect m_effect;

        public SpriteFont m_normalFont;
        public SpriteFont m_smallFont;

        //HUD / Menu textures
        public Texture2D m_button;
        public Texture2D m_checked;
        public Texture2D m_unchecked;
        public Texture2D m_cubesSupplyImage;
        public Texture2D m_up;
        public Texture2D m_down;
        public Texture2D m_main;
        public Texture2D m_pause;
        public Texture2D m_background;
        public Texture2D m_move;
        public Texture2D m_hold;
        public Texture2D m_factory;
        public Texture2D m_emptybox;
        public Texture2D m_igloo;
        public Texture2D m_barbarian;
        public Texture2D m_cancel;
        public Texture2D m_cancelAll;
        public Texture2D m_cancelBuild;

        //Game textures
        public Texture2D m_heightMap;
        public Texture2D m_sandMap;
        public Texture2D m_grassMap;
        public Texture2D m_rockMap;
        public Texture2D m_snowMap;
        public Texture2D m_cubePortrait;
        public Texture2D m_emptyPortrait;
        
       
        public void LoadResources(ContentManager a_contentManager,GraphicsDevice a_graphics)
        {
            //Cubes initilizations
            c_cube = a_contentManager.Load<Model>("Models/cube");
            c_barbarian = a_contentManager.Load<Model>("Models/C_barbarian");

            c_extractor = a_contentManager.Load<Model>("Models/C_Extractor");
            c_igloo = a_contentManager.Load<Model>("Models/C_Igloo");
            c_barrack = a_contentManager.Load<Model>("Models/C_barrack");

            m_ground = a_contentManager.Load<Model>("Models/plane");
            m_normalGround = a_contentManager.Load<Model>("Models/normalGround");
            m_projektil = a_contentManager.Load<Model>("Models/projektil");

            m_sparkOfLife = a_contentManager.Load<Model>("Models/sparkOfLife");

            m_effect = a_contentManager.Load<Effect>("Shader/GameShader");

            m_normalFont = a_contentManager.Load<SpriteFont>("Fonts/NormalFont");
            m_smallFont = a_contentManager.Load<SpriteFont>("Fonts/SmallFont");

            m_button = a_contentManager.Load<Texture2D>("Images/Button");

            m_emptyPortrait = a_contentManager.Load<Texture2D>("Images/Empty_Portrait");
            m_cubePortrait = a_contentManager.Load<Texture2D>("Images/Cube_Portrait");

            m_unchecked = a_contentManager.Load<Texture2D>("Images/Unchecked");
            m_checked = a_contentManager.Load<Texture2D>("Images/Checked");

            m_cubesSupplyImage = a_contentManager.Load<Texture2D>("Images/cubeSupply");

            m_up = a_contentManager.Load<Texture2D>("Images/Up");
            m_down = a_contentManager.Load<Texture2D>("Images/Down");

            m_main = a_contentManager.Load<Texture2D>("Images/MainMenu");
            m_pause = a_contentManager.Load<Texture2D>("Images/Paus_Screen");
            m_background = a_contentManager.Load<Texture2D>("Images/menuBackground");

            m_emptybox = a_contentManager.Load<Texture2D>("Images/Empty_Box");
            m_move = a_contentManager.Load<Texture2D>("Images/Move");
            m_hold = a_contentManager.Load<Texture2D>("Images/Hold");
            m_factory = a_contentManager.Load<Texture2D>("Images/Extractor");
            m_igloo = a_contentManager.Load<Texture2D>("Images/Igloo");
            m_barbarian = a_contentManager.Load<Texture2D>("Images/Barbarian");
            m_cancel = a_contentManager.Load<Texture2D>("Images/Cancel");
            m_cancelAll = a_contentManager.Load<Texture2D>("Images/CancelAll");
            m_cancelBuild = a_contentManager.Load<Texture2D>("Images/CancelBuild");

            m_sandMap = a_contentManager.Load<Texture2D>("Images/sand");
            m_grassMap = a_contentManager.Load<Texture2D>("Images/grass");
            m_rockMap = a_contentManager.Load<Texture2D>("Images/rock");
            m_snowMap = a_contentManager.Load<Texture2D>("Images/snow");                  
        }

        public void LoadHeightMap(GraphicsDevice a_graphics, ModelClasses.Map a_map)
        {
            float[] vec4Buffer = new float[a_map.m_mapWidth * a_map.m_mapDepth];

            int i = 0;
            
            for (int y = 0; y < a_map.m_mapDepth; y++)
            {
                
                for (int x = 0; x < a_map.m_mapWidth; x++)
			    {                  
                    vec4Buffer[i] = (float)a_map.m_tiles[x,y].m_height / ModelClasses.Map.m_maxHeight;
                    i++;
			    }
            }

            m_heightMap = new Texture2D(a_graphics, a_map.m_mapWidth , a_map.m_mapDepth, false, SurfaceFormat.Single);
            m_heightMap.SetData(vec4Buffer);
           
        }
    }
}
