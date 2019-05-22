///<reference path="References.js" />
window.Irinori = window.Irinori || {};
window.Irinori.Ajax = {};

Irinori.Ajax.GetXHR = function()
{
    /// <summary>Returns a XML Http Request object</summary>
    var xhr = null;
    try 
    {
        xhr = new XMLHttpRequest();
    } 
    catch (error)
    {
        try 
        {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } 
        catch (error)
        {
            console.error("No XHR object available, can't get file through ajax");
        }
    }
    return xhr;
};

Irinori.Ajax.ReadFile = function(a_url, a_callback,isAsynchronous)
{	
/// <summary>Opens a file based on url. Invokes callback when it's ready. Does it asynchronously or synchronously</summary>
/// <param name="a_url" type="string">The url to file path</param>
/// <param name="a_callback" type="function">Function that is invoked when ready</param>
/// <param name="isAsynchronous" type="bool"> Is asynchronous until false is given. Then it's synchronous </param>

	var READY_STATE_COMPLETE = 4;

	var xhr = Irinori.Ajax.GetXHR();

    var m_isAsynchronous = true;
    //if a_isAsynchronous is explicitly false then ajax will be synchronous, otherwise it will be asynchronous
    if (isAsynchronous === false)
    {
        m_isAsynchronous = false;
    }    

	xhr.onreadystatechange = function() 
    {		
		if(xhr.readyState === READY_STATE_COMPLETE)
		{
			if(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)
			{
				a_callback(xhr.responseText);				
			}
			else
			{
                //Error I had when trying to use ajax without a server 
                if (xhr.status === 0)
                {
                    console.error("Ajax error, status:" + xhr.status + " could be because of not running through webserver");
                }
                else
                {
                    console.error("Ajax error, status:" + xhr.status);	
                }				
			}
		}
	};

    //The real filename will be stored at filename.length - 1 index
    var filename = a_url.split("/");
    
    var url = "";

    //Loop through 'filename' to recreate the url to the last folder
    for (var i = 0; i < filename.length - 1; i++)
    {
        url += filename[i];
        //Got to re-add the / as it was cut away when splitting
        url += "/";
    }

    var query = "?url=" + url + "&name=" + filename[filename.length - 1];
    
	xhr.open("get", Irinori.Paths.CurrentScripts.GetFile + query, m_isAsynchronous);
	
    xhr.send(null);
};

