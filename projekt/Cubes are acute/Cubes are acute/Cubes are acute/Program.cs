using System;

namespace Cubes_are_acute
{
#if WINDOWS || XBOX
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        static void Main(string[] args)
        {         
            using (ControllerClasses.MasterController game = new ControllerClasses.MasterController())
            {
                game.Run();
            }          
        }
    }
#endif
}

