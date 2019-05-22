///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};
if (window.Irinori.Paths === undefined) window.Irinori.Paths = {};
Irinori.Paths.JScripts = {};
Irinori.Paths.PHPScripts = {};
Irinori.Paths.ASPScripts = {};

//The path to the folder where the models are
Irinori.Paths.ModelFolder = "Models/";
//The path to the file that has all the info about models, where to find them , what textures e.t.c.!
Irinori.Paths.ModelList = Irinori.Paths.ModelFolder + "Models.txt";
//The path to the folder where thumbnails of how models looks like-ish
Irinori.Paths.ModelThumbnailFolder = Irinori.Paths.ModelFolder + "Thumbnails/";
//The path to the folder where textures are
Irinori.Paths.TextureFolder = "Textures/";

//****************
//Paths to javascripts
//****************
//Root folder where all javascript is
Irinori.Paths.JScripts.Root = "Js/";
//Path to the model classes in the javascript folder
Irinori.Paths.JScripts.ModelFolder = Irinori.Paths.JScripts.Root + "Model/";
//Shader classes eg. Phong
Irinori.Paths.JScripts.Model_ShaderFolder = Irinori.Paths.JScripts.ModelFolder + "Shaders/";
//Path to the utility classes in the javascript folder
Irinori.Paths.JScripts.UtilityFolder = Irinori.Paths.JScripts.Root + "Utility/";
//Path to the view classes in the javascript folder
Irinori.Paths.JScripts.ViewFolder = Irinori.Paths.JScripts.Root + "View/";
//Library classes, like external stuff for example glMatrix
Irinori.Paths.JScripts.LibFolder = Irinori.Paths.JScripts.Root + "lib/";

//**************************
//Paths to Shader source code
//**************************
Irinori.Paths.ShaderFolderPath = "Shaders/";


//****************
//Paths to PHP scripts
//****************
//Root folder where the php scripts are
Irinori.Paths.PHPScripts.Root = "Php/";
Irinori.Paths.PHPScripts.GetFile = Irinori.Paths.PHPScripts.Root + "Getfile.php";

//****************
//Paths to ASP scripts
//****************
//Root folder where the php scripts are
Irinori.Paths.ASPScripts.Root = "Asp/";
Irinori.Paths.ASPScripts.GetFile = Irinori.Paths.ASPScripts.Root + "Getmodelfile.aspx";

//*******************
//Current Script Path
//*******************
//Depending on what the web server has support for, asp or php, tho I'd say php is default!
//Irinori.Paths.CurrentScripts = Irinori.Paths.ASPScripts;
Irinori.Paths.CurrentScripts = Irinori.Paths.ASPScripts;
