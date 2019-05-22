//If skeletal animations
#ifdef SKELETAL

#define BONECOUNT 40
attribute highp vec4 aBoneWeight;
attribute highp vec4 aBoneIndex;  
      
//Quaternion with the rotation
uniform highp vec4 uBoneTransformsQR[BONECOUNT];
//Quaternion with the translation
uniform highp vec4 uBoneTransformsQT[BONECOUNT];
   
#endif

//The equivalent in the js code is in Shader.js
attribute highp vec3 aVertexPosition;
attribute highp vec2 aTextureCoord;
attribute highp vec3 aNormalPosition;
 
//Uniforms
uniform highp mat4 uWorldMatrix;	
uniform highp mat4 uViewMatrix;
uniform highp mat4 uProjMatrix;

//Varying variables
varying highp vec4 m_position;
varying highp vec2 vTextureCoord;
        
varying highp vec4 m_worldpos;
//worldspaceNormal
varying highp vec3 m_wsnormal;      
   
//Vertex Shader
void main(void) 
{   
	#ifdef SKELETAL
		//Add the weights from x,y,z,w
		vec4 blendDQR = aBoneWeight.x * uBoneTransformsQR[int(aBoneIndex.x)];
		vec4 blendDQT = aBoneWeight.x * uBoneTransformsQT[int(aBoneIndex.x)];

		blendDQR += aBoneWeight.y * uBoneTransformsQR[int(aBoneIndex.y)];
		blendDQT += aBoneWeight.y * uBoneTransformsQT[int(aBoneIndex.y)];

		blendDQR += aBoneWeight.z * uBoneTransformsQR[int(aBoneIndex.z)];
		blendDQT += aBoneWeight.z * uBoneTransformsQT[int(aBoneIndex.z)];

		blendDQR += aBoneWeight.w * uBoneTransformsQR[int(aBoneIndex.w)];
		blendDQT += aBoneWeight.w * uBoneTransformsQT[int(aBoneIndex.w)];
		//Normalize the dq
		float len = length(blendDQR);
		blendDQR /= len;
		blendDQT /= len;
		//The object means object space
		vec3 objectpos = aVertexPosition + 2.0 * cross(blendDQR.xyz, cross(blendDQR.xyz, aVertexPosition) + blendDQR.w * aVertexPosition);
		//The translation part
		vec3 trans =  2.0*(blendDQR.w * blendDQT.xyz - blendDQT.w * blendDQR.xyz + cross(blendDQR.xyz, blendDQT.xyz)) ;
		objectpos += trans;

		vec3 objectNormal = aNormalPosition + 2.0 * cross(blendDQR.xyz, cross(blendDQR.xyz, aNormalPosition) + blendDQR.w * aNormalPosition);

		m_worldpos = uWorldMatrix * vec4(objectpos, 1.0); 
		highp vec4 wsnormals = uWorldMatrix * vec4(objectNormal, 1.0);                          	
	#else
		m_worldpos = uWorldMatrix * vec4( aVertexPosition, 1.0);
		highp vec4 wsnormals = uWorldMatrix * vec4(aNormalPosition, 1.0);   
	#endif

	m_position = uProjMatrix * uViewMatrix * m_worldpos;
	         
	m_wsnormal = normalize(wsnormals.xyz);

	vTextureCoord = aTextureCoord;

	gl_Position = m_position;            
}