//Simple vertex shader:
//transfers texturecoordinates and calculates screenspace position for vertex	

	attribute highp vec3 aVertexPosition;
	attribute highp vec2 aTextureCoord;
	//attribute highp vec3 aNormalPosition;

	//Uniforms
	uniform highp mat4 uWorldMatrix;	
	uniform highp mat4 uViewMatrix;
	uniform highp mat4 uProjMatrix;

	//Varying variables	
	varying highp vec2 vTextureCoord;       
	
	//Vertex Shader
	void main(void) 
	{		
		vTextureCoord = aTextureCoord;

		gl_Position = uProjMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
	}