/*

VERSION 1.0

*/

//The Matrixes
						//float4x4 WorldViewProj : WorldViewProjection;  Commented away as probably not needed
float4x4 World : World;
float4x4 View : View;
float4x4 Projection : Projection;

//Lights & Color attributes

float3 PointLight;
float3 LampColor;

//Attributes for HeightTransformations

float maxHeight;
float textureSize;		// = 256.0f;
float texelSize;		// =  1.0f / 256.0f; //size of one texel;
float tileSize;

texture heightMap;
sampler displacementSampler = sampler_state
{
    Texture   = <heightMap>;
    MipFilter = Point;
    MinFilter = Point;
    MagFilter = Point;
    AddressU  = Clamp;
    AddressV  = Clamp;
};

texture sandMap;
sampler sandSampler = sampler_state
{
    Texture   = <sandMap>;
    MipFilter = Linear;
    MinFilter = Linear;
    MagFilter = Linear;
    AddressU  = Wrap;
    AddressV  = Wrap;
};

texture grassMap;
sampler grassSampler = sampler_state
{
    Texture   = <grassMap>;
    MipFilter = Linear;
    MinFilter = Linear;
    MagFilter = Linear;
    AddressU  = Wrap;
    AddressV  = Wrap;
};

texture rockMap;
sampler rockSampler = sampler_state
{
    Texture   = <rockMap>;
    MipFilter = Linear;
    MinFilter = Linear;
    MagFilter = Linear;
    AddressU  = Wrap;
    AddressV  = Wrap;
};

texture snowMap;
sampler snowSampler = sampler_state
{
    Texture   = <snowMap>;
    MipFilter = Linear;
    MinFilter = Linear;
    MagFilter = Linear;
    AddressU  = Wrap;
    AddressV  = Wrap;
};


/*****************
  
END OF ATTRIBUTES 

******************/

struct VS_OUTPUT
{
	float4 pos : POSITION;

	//float4 wpos : TEXCOORD4;

	float3 wnorm : TEXCOORD0;
	float3 ldir : TEXCOORD1;
	float diff : TEXCOORD2;
};


VS_OUTPUT mainVS(float4 pos : POSITION, float3 norm : NORMAL)
{
	VS_OUTPUT Out = (VS_OUTPUT)0;
	
	float4 wpos = mul(pos, World);
	
	float3 wnorm = normalize(mul(norm, World));
	
	float3 ldir = normalize(PointLight - wpos.xyz);
	
	float diff = max(dot(wnorm, ldir),0);

	Out.pos = mul(mul(wpos,View),Projection);
	//Out.wpos = wpos;

	Out.wnorm = wnorm;
	Out.ldir = ldir;
	Out.diff = diff;

	return Out;
}

float4 mainPS(VS_OUTPUT In) : COLOR 
{
	
	float4 result = float4(LampColor * In.diff, 1.0) + float4(0.1, 0.1, 0.1, 1);

	return float4(result.xyz,1);
	//return float4(In.wpos,1);
}

float4 beingBuiltPS(VS_OUTPUT In) : COLOR 
{
	
	float4 result = float4(LampColor * 0.65 * In.diff, 1.0) + float4(0.1, 0.1, 0.1, 1);

	return float4(result.xyz,1);
	//return float4(In.wpos,1);
}

struct Transform_INPUT 
{
    float4 position	: POSITION;
    float4 uv : TEXCOORD0;
	float3 norm : NORMAL;
};
struct Transform_OUTPUT
{
    float4 position  : POSITION;
    float4 uv : TEXCOORD0;
    float4 worldPos : TEXCOORD1;
    float4 textureWeights : TEXCOORD2;
	float diff : TEXCOORD3;
	
};

// ***************
// Beginning of Transform
// ***************

float4 tex2Dlod_bilinear( sampler texSam, float4 uv )
{

	float4 height00 = tex2Dlod(texSam, uv);
	float4 height10 = tex2Dlod(texSam, uv + float4(texelSize, 0, 0, 0)); 
	float4 height01 = tex2Dlod(texSam, uv + float4(0, texelSize, 0, 0)); 
	float4 height11 = tex2Dlod(texSam, uv + float4(texelSize , texelSize, 0, 0)); 

	float2 f = frac( uv.xy * textureSize );

	float4 tA = lerp( height00, height10, f.x );
	float4 tB = lerp( height01, height11, f.x );

	return lerp( tA, tB, f.y );
}

 
Transform_OUTPUT Transform(Transform_INPUT In)
{
    Transform_OUTPUT Out = (Transform_OUTPUT)0;

    float4x4 viewProj = mul(View, Projection);   
    
	Out.uv = In.uv;	
	    
    float height = tex2Dlod_bilinear( displacementSampler, float4(Out.uv.xy,0,0)).r;

    In.position.z = height * maxHeight;
	In.position.xy += tileSize;
	
    Out.worldPos = mul(In.position, World);
    Out.position = mul(Out.worldPos,viewProj);
    
	
	float4 TexWeights = 0;
    
    TexWeights.x = saturate( 1.0f - abs(height - 0) / 0.2f);
    TexWeights.y = saturate( 1.0f - abs(height - 0.3) / 0.25f);
    TexWeights.z = saturate( 1.0f - abs(height - 0.6) / 0.25f);
    TexWeights.w = saturate( 1.0f - abs(height - 0.9) / 0.25f);

	float3 ldir = normalize(PointLight - Out.worldPos.xyz);	
	float3 wnorm = normalize(mul(In.norm, World));

	float diff = max(dot(wnorm, ldir),0);

    float totalWeight = TexWeights.x + TexWeights.y + TexWeights.z + TexWeights.w;
    TexWeights /=totalWeight;

	Out.diff = diff;	

	Out.textureWeights = TexWeights;       
    
    return Out;
}

float4 HeightPS(Transform_OUTPUT In) : COLOR
{
	float4 sand = tex2D(sandSampler,In.uv*8);
	float4 grass = tex2D(grassSampler,In.uv*8);
	float4 rock = tex2D(rockSampler,In.uv*8);
	float4 snow = tex2D(snowSampler,In.uv*8);
	
	float4 color = float4(sand * In.textureWeights.x + grass * In.textureWeights.y + rock * In.textureWeights.z + snow * In.textureWeights.w);

	return float4(color.xyz*LampColor,1); 

	//float4 yo = In.worldPos / maxHeight;	
}


// ****************
// Techniques
// ***************

technique technique0 
{
	pass p0 
	{
		//CullMode = None;		
		//For debug reasons
		//FIllMode = WireFrame;

		VertexShader = compile vs_3_0 mainVS();
		PixelShader = compile ps_3_0 mainPS();
	}
}

technique tech_isBeingBuilt
{
	pass p0 
	{
		

		VertexShader = compile vs_3_0 mainVS();
		PixelShader = compile ps_3_0 beingBuiltPS();
	}
}

technique tech_heightMap
{
	pass p0
	{
		//FillMode = WireFrame;
		VertexShader = compile vs_3_0 Transform();
		PixelShader = compile ps_3_0 HeightPS();
	}
}
