using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework.GamerServices;
using Microsoft.Xna.Framework.Storage;
using System.Xml.Serialization;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Diagnostics;
using System.IO;
using Cubes_are_acute.ModelClasses.Units;
using Cubes_are_acute.ModelClasses;

namespace Cubes_are_acute.ModelClasses
{    
    class Save 
    {
        public IAsyncResult m_result;
        public StorageDevice m_device;                   
        
        public void TryToSave(Game a_game, String a_file)
        {            
            m_result = StorageDevice.BeginShowSelector(null, null); 

            m_device = StorageDevice.EndShowSelector(m_result);

            if (m_device != null && m_device.IsConnected)
            {
                DoSaveGame(m_device, a_game, a_file);
            }               
        }

        public Game TryToLoad(String a_file)
        {
            m_result = StorageDevice.BeginShowSelector(null, null);

            m_device = StorageDevice.EndShowSelector(m_result);

            if (m_device != null && m_device.IsConnected)
            {
                return DoLoadSave(m_device, a_file);
            }

            return null;
        }
        
        public String[] TryToGetSaves()
        {            
            m_result = StorageDevice.BeginShowSelector(null, null);

            m_device = StorageDevice.EndShowSelector(m_result);

            if (m_device != null && m_device.IsConnected)
            {
                return GetSaves(m_device);
            }

            return null;
        }

        //Returns the number of existing savefiles
        private String[] GetSaves(StorageDevice a_device)
        {            
            try
            {
                IAsyncResult f_result = a_device.BeginOpenContainer("Cubes_are_acute", null, null);                

                // Wait for the WaitHandle to become signaled.
                f_result.AsyncWaitHandle.WaitOne();

                StorageContainer container = a_device.EndOpenContainer(f_result);

                // Close the wait handle.
                f_result.AsyncWaitHandle.Close();

                string[] filename = container.GetFileNames();                               

                container.Dispose();

                return filename;
            }
            catch (Exception)
            {                
                throw;
            }
        }        

        //Creates folder on users computer where data will be saved
        private void DoSaveGame(StorageDevice a_device, Game a_game, string a_file)
        {
            try
            {
                // Open a storage container.
                IAsyncResult f_result = a_device.BeginOpenContainer("Cubes_are_acute", null, null);
                
                // Wait for the WaitHandle to become signaled.
                f_result.AsyncWaitHandle.WaitOne();

                StorageContainer container = a_device.EndOpenContainer(f_result);

                // Close the wait handle.
                f_result.AsyncWaitHandle.Close();

                //Path is Documents/SavedGames/Cubes_are_acute on C:
                string filename = a_file;

                String[] f_str = container.GetFileNames();

                if (filename == "Empty")
                {
                    filename = "Save" + (f_str.Length + 1);
                }
                else if (filename == "New Save")
                {
                    filename = "Save" + (f_str.Length + 1);
                }
                else
                {
                    filename = a_file;
                }                

                // Check to see whether the save exists.
                if (container.FileExists(filename))
                {
                    // Delete it so that we can create one fresh.
                    container.DeleteFile(filename);
                }

                // Create the file.
                Stream stream = container.CreateFile(filename);

                // Convert the object to Binary data and put it in the stream.                       
                BinaryFormatter binFormatter = new BinaryFormatter();

                //serializes Game and writes it's data to savegame.sav
                binFormatter.Serialize(stream, a_game);

                // Close the file.
                stream.Close();

                // Dispose the container, to commit changes.
                container.Dispose();    
            }
            catch (Exception)
            {                
                throw;
            }                    
        }

        //Loads the users selected game
        private Game DoLoadSave(StorageDevice a_device, String a_file)
        {
            try
            {
                // Open a storage container.
                IAsyncResult f_result = a_device.BeginOpenContainer("Cubes_are_acute", null, null);

                // Wait for the WaitHandle to become signaled.
                f_result.AsyncWaitHandle.WaitOne();

                using (StorageContainer container = a_device.EndOpenContainer(f_result))
                {                                        
                    // Close the wait handle.
                    f_result.AsyncWaitHandle.Close();                                                            

                    string filename = a_file;                    

                    // Check to see whether the save exists.
                    if (!container.FileExists(filename))
                    {
                        // If not, dispose of the container and return.
                        container.Dispose();
                        return null;
                    }

                    using (Stream stream = container.OpenFile(filename, FileMode.Open, FileAccess.Read))
                    {
                        BinaryFormatter serializer = new BinaryFormatter();

                        Game f_game = (Game)serializer.Deserialize(stream);

                        // Close the file. 
                        stream.Close();

                        // Dispose the container. 
                        container.Dispose();

                        return f_game;
                    }                             
                }
                
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return null;
            }

        }
    }
}
