//Sprite fragment shader
//Draws the diffusecolor only	

	//The textures
	//Diffuse map 
	uniform sampler2D uDiffuseSampler;		

	varying highp vec2 vTextureCoord; 

	void main(void) 
	{
		highp vec4 diffuseColor = texture2D(uDiffuseSampler, vec2(vTextureCoord.s, vTextureCoord.t));
            
		//Real color!
		gl_FragColor = diffuseColor;

		/*
			Debug stuff
		*/
		
		//Draws anything that's visible as white color
		//gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);	

		//Texture position debugging
		//gl_FragColor = vec4(vTextureCoord.s , vTextureCoord.t, 0.0, 1.0);       
	}