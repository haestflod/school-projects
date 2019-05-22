<?php
//TODO: needs parsity with aspx file

//only going upwards once as the script is currently in php/
//So for instance if this file was in php/foo/ 
//it'd be ../../ to get to root instead!
$rootpath = "../";
//The names of the get variables from $_GET
$geturl = "url";
$getname = "name";

//What folders that is allowed by this php file incase some malicious user tries to call this php file
$allowedFolders = array("Models/", "Shaders/");
//To possibly add 1 extra layer of protection, can also check the filetype of the file being returned that it's either 
//txt, obj, json, js

if (isset($_GET[$geturl] ) && isset($_GET[$getname]) )
{
	$allowed = false;
	
	//The url to the folder where the file is
	$folderUrl = $_GET[$geturl];
	
	//Loop through to see that the requested file is in an allowed folder
	//Otherwise it's a security hole where user could maliciously try to fetch php scripts and stuff like that.
	for ($i = 0; $i < count($allowedFolders); $i++)
	{
		//Compare the strings to see if they are equal, case sensative
		if (strcmp($folderUrl, $allowedFolders[$i]) === 0)
		{
			$allowed = true;
			break;
		}
	}
	
	//Checks if this folder is allowed access
	if ($allowed !== true)
	{
		//Could have different error message here but it should never happen unless user is trying to do malicious stuff
		Error404();
	}
	else
	{
		$filename = $_GET[$getname];
	
		$url = $rootpath . $folderUrl . $filename;
		
		$fileContent = file_get_contents($url);
		
		echo $fileContent;
	}	
}
else
{
	Error404();
}

function Error404()
{
	echo "url was not found";
}

?>
