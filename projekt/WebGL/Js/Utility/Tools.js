///<reference path="References.js" />
if (window.Irinori === undefined) window.Irinori = {};
if (window.Irinori.Tools === undefined) window.Irinori.Tools = {};

//Should remove all linebreaks \r types
Irinori.Tools.RemoveRLinebreakRegex = /(\r)/g;
/*
    Table of Contents:
    
    requestAnimFrame
    Add & Remove event
    Simulate_Click
    Stop event
    GetElementPosition
    InitTools 
        * Calls CreateRequestAnimFrameFunction
        * Checks if console.error & warn exists, if they do not make them as console.log functions
*/

//NO NEED TO CALL -- Creates a function for Irinori.Tools.requestAnimFrame so it doesn't put the temporary function object on the window object.
//It's not needed to call this cause it is called in Irinori.Tools.InitTools(). This function just selects the proper requestAnimationFrame function that is browser dependant.
Irinori.Tools.CreateRequestAnimFrameFunction = function()
{   
    var m_requestAnimationFunction;    
    
    //Checks browser dependent functions and if it can't find any, uses regular setTimeout
    if (window.requestAnimationFrame)
    {
        m_requestAnimationFunction = window.requestAnimationFrame;
    }
    else if (window.webkitRequestAnimationFrame)
    {
        m_requestAnimationFunction = window.webkitRequestAnimationFrame;
    }
    else if (window.mozRequestAnimationFrame)
    {
        m_requestAnimationFunction = window.mozRequestAnimationFrame;
    }
    else if(window.mozRequestAnimationFrame)
    {
        m_requestAnimationFunction = window.mozRequestAnimationFrame;
    }
    else if (window.oRequestAnimationFrame)
    {
        m_requestAnimationFunction = window.oRequestAnimationFrame;
    }
    else if (window.msRequestAnimationFrame)
    {
        m_requestAnimationFunction = window.msRequestAnimationFrame;
    }
    else
    {
        m_requestAnimationFunction = function(callback){
            window.setTimeout(callback, 1000 / 60);
            };
    }  

    return function(a_scene)
    {
        m_requestAnimationFunction( function(a_elapsedTime) { a_scene.Render(a_elapsedTime) } );   
    }

};

//Adds an event to a html element of a certain type
Irinori.Tools.addEvent = function( a_obj, a_type, a_func )
{
    //Source: Crockford
    if ( a_obj.attachEvent )
    {
        a_obj['e' + a_type + a_func] = a_func;
        a_obj[a_type + a_func] = function () { a_obj['e' + a_type + a_func]( window.event ); };
        a_obj.attachEvent( 'on' + a_type, a_obj[a_type + a_func] );
    } 
    else
    {
        a_obj.addEventListener( a_type, a_func, false );
    }
    
};
//Removes an eventhandler from a html element of a certain type
Irinori.Tools.removeEvent = function( a_obj, a_type, a_func )
{
    //Source: Crockford
    if ( a_obj.detachEvent ) 
    {
        a_obj.detachEvent( 'on'+a_type, a_obj[a_type+a_func] );
        a_obj[a_type+a_func] = null;
    } 
    else
    {
        a_obj.removeEventListener( a_type, a_func, false );
    }
};
//Simulates a click on an element
Irinori.Tools.SimulateClick = function(a_element)
{    
    if (a_element.click !== undefined)
    {
        a_element.click();
    }
    else
    {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a_element.dispatchEvent(event);
    }
};

//Stops an event from bubbling upwards in the event chain
Irinori.Tools.stop_event = function(e)
{
    if(!e) 
    {
        e = window.event;
    }
    if (e.stopPropagation) e.stopPropagation();
    e.cancelBubble = true;
    if (e.preventDefault) e.preventDefault();
    e.returnValue = false;
    return false;
};
//Get the position of a HTML element, returns an object with x and y properties, eg:  obj.x & obj.y
Irinori.Tools.GetElementPosition = function(a_element)
{
    var curleft = 0;
    var curtop = 0;

    if (a_element.offsetParent) 
    {
        do 
        {
			curleft += a_element.offsetLeft;
			curtop += a_element.offsetTop;
        } 
        while (a_element = a_element.offsetParent);
    }

    return { "x":curleft, "y":curtop };
};
//Checks if a value is a string
Irinori.Tools.IsString = function ( a_value )
{
    return typeof ( a_value ) === 'string' || a_value instanceof String;
};
//Checks if value is a number
Irinori.Tools.IsNumber = function( a_number )
{
    //Source for this: http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
    //Main reason for this is because it seems that when I used isNaN( 0 ) it reported true 
    return !isNaN( parseFloat( a_number ) ) && isFinite( a_number );
}

//Creates a html element
//a_elementName: the name of html element, eg: a, br, div
//2 optional parameters in either order, innerHTML or attributes array
//attributes array: [ [attributeName, attributeValue], [...] ]
Irinori.Tools.CreateHTMLElement = function ( a_elementName )
{   
    var element = document.createElement( a_elementName );
    //If there are more arguments
    if ( arguments.length > 1 )
    {
        for ( var i = 1; i < arguments.length; i++ )
        {
            var argument = arguments[i];

            //If the argument is a string it assumes that it's the innerHTML
            if ( Irinori.Tools.IsString( argument ) )
            {
                element.innerHTML = argument;
            }
            //if the argument is an array it assumes it's an attribute array
            else if ( Array.isArray( argument ) )
            {
                var length = argument.length;

                if ( length === 2 && !Array.isArray( argument[0] ) )
                {                    
                    element.setAttribute( argument[0], argument[1] );
                }
                else
                {
                    for ( var j = 0; j < length; j++ )
                    {
                        element.setAttribute( argument[j][0], argument[j][1] );
                    }
                }                
            }
        }
    }
    
    return element;
};

//Generic function for updating a worldmatrix
//a_position: the position of the object
//a_rotation: a rotation matrix
//a_destMatrix: the world matrix that's result is written to
//[ a_optionals ]: an object with optional properties, the optional properties are:
//scale, startMatrix
Irinori.Tools.UpdateWorldMatrix = function ( a_position, a_rotation, a_destMatrix, a_optionals )
{
    //scale the matrix, translate it, then rotate it!
    
    //Check if optional arguments have a startMatrix to set instead of identity
    if ( a_optionals && a_optionals.startMatrix )
    {
        mat4.set( a_optionals.startMatrix, a_destMatrix );
    }
    else
    {
        mat4.identity( a_destMatrix );
    }

    mat4.translate( a_destMatrix, a_position );

    //Check if optional arguments have scale
    if ( a_optionals && a_optionals.scale )
    {
        mat4.scale( a_destMatrix, a_optionals.scale );
    }   

    mat4.multiply( a_destMatrix, a_rotation );
};

//Automatically runs this code when this script is finished loading
Irinori.Tools.InitTools = function()
{
    //Creates the requestAnimFrame function
    if (!Irinori.Tools.requestAnimFrame)
    {
        Irinori.Tools.requestAnimFrame = Irinori.Tools.CreateRequestAnimFrameFunction();
    };

    //Checks if console.error & warn exists, if they don't they become console.log
    if (!console.error)
    {
        console.error = console.log;
    };
    if (!console.warn)
    {
        console.warn = console.log;
    };

};

Irinori.Tools.InitTools();
