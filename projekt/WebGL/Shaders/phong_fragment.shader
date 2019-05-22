struct DirectionalLight 
{            
	highp vec3 m_lightDir;
	highp vec3 m_lightColor;
};

//The textures
//Diffuse map 
uniform sampler2D uDiffuseSampler;
//The normal map
uniform sampler2D uNormalSampler;	

uniform DirectionalLight uDirectionalLight;        
varying highp vec4 m_position;
varying highp vec2 vTextureCoord; 
     
varying highp vec4 m_worldpos;
varying highp vec3 m_wsnormal;          

void main(void) 
{
	//highp float f_depth = 1.0 - ( m_position.z / m_position.w);                                

	highp vec4 diffuseColor = texture2D(uDiffuseSampler, vec2(vTextureCoord.s, vTextureCoord.t));
	highp vec3 normalColor = vec3(texture2D(uNormalSampler, vec2(vTextureCoord.s, vTextureCoord.t)));

	highp vec3 ambientColor = vec3(0.2 * diffuseColor);

	//The final color of the pixel that is being rendered, starts with adding ambientColor
	highp vec3 finalColor = vec3(ambientColor);   

	/*
		Calculate Worldpos normal!
	*/
	//the normal from normalMap in tangentspace, need to get tangent & binormal of face to create matrix
	//to multiply it with this to move ts_normal to worldspace!
	highp vec3 ts_normal = (normalColor - 0.5) * 2.0;            

	highp vec3 tangent;

	highp vec3 c1 = cross(m_wsnormal, vec3(0.0, 0.0, 1.0)); 
	highp vec3 c2 = cross(m_wsnormal, vec3(0.0, 1.0, 0.0));

	//tanget = (length(c1) > length(c2) ) ? c1: c2;

	if(length(c1) > length(c2)) 
	{
		tangent = c1;	
	}
	else 
	{
		tangent = c2;	
	}
	tangent = normalize(tangent);

	highp vec3 binormal;

	binormal = cross(m_wsnormal, tangent); 
	binormal = normalize(binormal);
		
	highp mat3 rotmat = mat3(tangent,binormal,m_wsnormal);
            
	//Voilá, the worldspace normal!
	highp vec3 ws_normal = normalize(rotmat * ts_normal);                    
	/*
		End of ws normal calculation
	*/
                   
	highp float diffuseIntensity = clamp(dot(ws_normal, uDirectionalLight.m_lightDir), 0.0, 1.0);           
            
	highp vec3 final_diffuseColor = diffuseColor.xyz * vec3(uDirectionalLight.m_lightColor);
	final_diffuseColor *= diffuseIntensity;

	finalColor += final_diffuseColor;
            
	//Real color!
	gl_FragColor = vec4(finalColor, 1.0);

	/*
		Debug stuff
	*/

	//DiffuseIntensity
	//gl_FragColor = vec4(diffuseIntensity, diffuseIntensity ,diffuseIntensity, 1.0);

	//Lightdirection
	//gl_FragColor = vec4(uDirectionalLight.m_lightDir, 1.0);
		
	//Draws anything that's visible as white color
	//gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

	//Weights color
	//gl_FragColor = vec4(m_weights.xyz, 1.0);

	//Diffusetexture color, no light
	//gl_FragColor = vec4( diffuseColor.x, diffuseColor.y, diffuseColor.z, 1.0);

	//Worldpos debugging
	//gl_FragColor = vec4(m_worldpos.x , m_worldpos.y , m_worldpos.z, 1.0);

	//Texture position debugging
	//gl_FragColor = vec4(vTextureCoord.s , vTextureCoord.t, 0.0, 1.0);

	//Normal diffused color space
	//gl_FragColor = vec4(normalColor.x ,normalColor.y , normalColor.z, 1.0);
	//Normal tangent pos
	//gl_FragColor = vec4(ts_normal.x ,ts_normal.y , ts_normal.z , 1.0);
	//Normal debugging worldspace
	//gl_FragColor = vec4(ws_normal.x ,ws_normal.y , ws_normal.z , 1.0);            
            
}