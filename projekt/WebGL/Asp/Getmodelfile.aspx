<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Getmodelfile.aspx.cs" Inherits="Asp_getmodelfile" %>

<%    
    //The path to the root folder, assuming this file is placed in root/asp/GetModelfile.aspx
    const string rootpath = "../";    
    const string queryUrl = "url";
    const string queryName = "name";
    //What folders that is allowed by this asp file incase some malicious user tries to call this asp file to get other files    
    string[] allowedFolders = { "Models/", "Shaders/" };
    //The allowed file extensions as an additional layer of security so this script couldn't be used to fetch other files
    string[] allowedFileExtensions = { "txt", "obj", "json", "shader" };
    //If the name of the file is not allowed certain characters which in this case is /\ which is new folder
    char[] notAllowedCharsInName = { '/', '\\' };
    bool allowedFolder = false, allowedFilenameChars = false, allowedFileExtension = false;   

    string folderurl = "", filename = "";

    string responseString = "";
    
    try
    {
        //First check if the folder is valid
        //The url to the folder where the file is, needs to be validated so it's not a folder that -
        //- is not meant to be accessed by this script
        folderurl = Request.QueryString.Get(queryUrl);
        //Validates the folder url
        for (int i = 0; i < allowedFolders.Length; i++)
        {
            if (folderurl == allowedFolders[i])
            {
                allowedFolder = true;
                break;
            }
        }
        //Then check that the filename is valid
        filename = Request.QueryString.Get(queryName);

        //Check if the filename has any / \ in it, if it doesn't IndexOfAny will return -1
        if (filename.IndexOfAny(notAllowedCharsInName) == -1)
        {
            allowedFilenameChars = true;
        }        
        //Last check that the filextension is valid
        string[] fileExtensionParts = filename.Split('.');
        string fileExtension = fileExtensionParts[fileExtensionParts.Length - 1];

        for (int i = 0; i < allowedFileExtensions.Length; i++)
        {
            if (fileExtension == allowedFileExtensions[i])
            {
                allowedFileExtension = true;
                break;
            }
        }

    }
    catch (Exception e)
    {
        allowedFileExtension = false;
        allowedFolder = false;
        allowedFilenameChars = false;

        responseString += "the querystring was in bad format <br/>";
    }
   
    
    //If the folder url wasn't allowed, or the name had illegal chars in it or the file extension wasn't allowed
    if (!allowedFileExtension || !allowedFilenameChars || !allowedFolder)
    {
        //Response.Write("url was not found");
        responseString += "url was not found";
    }
    else
    {          
        string url = Server.MapPath(rootpath + folderurl + filename);
        
        if (System.IO.File.Exists(url))
        {            
            using (System.IO.StreamReader sr = new System.IO.StreamReader(url))
            {
                string fileContent = sr.ReadToEnd();

                responseString += fileContent;
                
            }
        }
        else
        {
            responseString = "url was not found";            
        }
    }

    Response.Write(responseString);    
%>