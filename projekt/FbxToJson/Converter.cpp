#include "stdafx.h"
#include <fstream>
#include <iostream>
#include <string>
#include <sstream>

using namespace std;

FbxManager* g_sdkManager = NULL;
FbxNode* g_root = NULL;
FbxScene* g_scene = NULL;

//A map of all the nodes, used to fetch their IDs
FbxNode** g_nodeMap;
int g_currentNodeMapID;
int g_nodeMapCount;

bool g_usingDualQuaternions = true;

//If true, it doesn't do linebreak when printing json making it as minimized as it can be
bool g_minimize = false;
FbxData g_data = FbxData();

bool g_firstAnim = true;

#ifdef IOS_REF
	#undef  IOS_REF
	#define IOS_REF (*(g_sdkManager->GetIOSettings()))
#endif

#define CurveTranslation "T"
#define CurveRotation "R"
#define CurveScale "S"

//The amount of elements it will print before making a new line when printing data to json. Is ignored if it's minimized
#define ElementsPerRow 75

//Multiply degrees with this to get radians
#define Deg2Rad 3.1415926535897932384626433832795 / 180

extern void AddStatusMessage(const wchar_t* a_message);

//The main function in converting, When this function is finished, a_exportPath file has all the data from a_importPath FBX file in the json way made by Hopesy!
bool ConvertFbxToJson(wchar_t* a_importPath, const WCHAR* a_exportPath)
{	
	//Resets the data variables
	g_data.Reset();	
	
	//Initilize the manager and set some IOS Setting
	g_sdkManager = FbxManager::Create();	
	FbxIOSettings* ios = FbxIOSettings::Create(g_sdkManager, IOSROOT );
	g_sdkManager->SetIOSettings(ios);
	
	//Create a scene
	//FbxScene* scene = FbxScene::Create(g_sdkManager, "");
	g_scene = FbxScene::Create(g_sdkManager, "");	

	//Failed to load scene if false, when loaded it has all the data from the fbx file
	if (!TryToLoadScene(g_scene, a_importPath) )
	{
		g_scene->Destroy();
		g_sdkManager->Destroy();
		AddStatusMessage(L"Failed to load fbx scene\r\n");
		return false;
	}

	int animationStacks = g_scene->GetSrcObjectCount(FBX_TYPE(FbxAnimStack));	

	if (animationStacks > 0)
	{
		//AnimationStack pointer
		FbxAnimStack* animationStack	= FbxCast<FbxAnimStack>(g_scene->GetSrcObject(FBX_TYPE(FbxAnimStack), 0));	
		
		g_scene->GetEvaluator()->SetContext( animationStack );
		g_firstAnim = false;
		
	}	
	

	//Inits the g_data arrays as I don't know how to use lists in c++
	InitFbxData(g_scene);

	AddStatusMessage(L"Finished loading fbx scene\r\n");

	AddStatusMessage(L"Started storing data to export ...\r\n");
	//Get the root node to check it's children for attribute types of eMesh and eSkeleton to set mesh & skeleton data 
	g_root = g_scene->GetRootNode();
	
	
	//Polygon size is not correct if it's false
	HandleNode(g_root);	

	HandleAnimations(g_scene);	

	g_scene->Destroy();
	g_sdkManager->Destroy();

	//It should always be true, otherwise it found more or less animation, meshes or skeletons when it's saving the data to g_data compared to when it looks up how much data there is in InitFbxData()
	if (g_data.IsDataDone() )
	{
		AddStatusMessage(L"Finished Storing data to be exported\r\n");
	}
	else
	{
		AddStatusMessage(L"This message should never be seen, converter bug\r\n");
		return false;
	}	

	return SaveDataToJSON(a_exportPath);
}

#pragma region TryToLoadScreen
//Attempts to load the scene and check if it's password protected
bool TryToLoadScene(FbxScene* a_scene, wchar_t* a_importPath )
{
	// Create an importer.
    FbxImporter* importer = FbxImporter::Create(g_sdkManager,"");
	
	char* importPath;
	FbxWCToUTF8(a_importPath, importPath);
	
	bool importerStatus = importer->Initialize(importPath, -1, g_sdkManager->GetIOSettings() );
	
	//If it failed to set up the importer
	if (!importerStatus)
	{		
		AddStatusMessage( _T("Failed to setup FBX importer. One possible reason is foreign characters such as ��� in the import path\r\n") );
		return false;
	}

	bool succesful = importer->Import(a_scene);

	if (!succesful && importer->GetLastErrorID() == FbxIOBase::ePasswordError)
	{
		AddStatusMessage( _T("Password protected: Please enter password\r\n") );

		char password[1024];
		password[0] = '\0';		
		
		scanf("%s", password);

		FbxString string(password);
		
		IOS_REF.SetStringProp(IMP_FBX_PASSWORD, string);
        IOS_REF.SetBoolProp(IMP_FBX_PASSWORD_ENABLE, true);

		succesful = importer->Import(a_scene);

        if(succesful == false && importer->GetLastErrorID() ==
            FbxIOBase::ePasswordError)
        {
            AddStatusMessage( _T("Error: Wrong password \r\n") );
        }	
	}

	importer->Destroy();

	return succesful;
}

#pragma endregion

#pragma region InitFbxData

//Loops through the nodes to setup the arrays like m_meshes in g_data
void InitFbxData(FbxScene* a_scene)
{
	FbxNode* rootNode = a_scene->GetRootNode();

	g_nodeMapCount = a_scene->GetNodeCount();

	g_nodeMap = new FbxNode*[ g_nodeMapCount ];	
	g_currentNodeMapID = 0;

	InitFbxDataNodes(rootNode);	

	g_data.m_animationCount = a_scene->GetSrcObjectCount(FBX_TYPE(FbxAnimStack));	

	FbxGlobalSettings* globalSettings = &a_scene->GetGlobalSettings();
	
	g_data.m_frameRate = FbxGetFrameRate( globalSettings->GetTimeMode() );
	g_data.m_deltaFrameTime = 1 / g_data.m_frameRate;

	g_data.m_meshes = new Mesh[g_data.m_meshCount];
	g_data.m_skeletons = new Skeleton[g_data.m_skeletonCount];
	g_data.m_animations = new Animation[g_data.m_animationCount];
}

void InitFbxDataNodes(FbxNode* a_node)
{
	//Adds the node to the nodemap
	g_nodeMap[g_currentNodeMapID] = a_node;
	g_currentNodeMapID++;

	FbxNodeAttribute* attribute = a_node->GetNodeAttribute();	

	if(attribute != NULL)
	{
		FbxNodeAttribute::EType attributeType = attribute->GetAttributeType();

		switch (attributeType)
		{
			//If type is a mesh, add a meshcount 
			case FbxNodeAttribute::eMesh:
			{					
				//A mesh was found, so total meshes ++!
				g_data.m_meshCount++;
				break;
			}
			case FbxNodeAttribute::eSkeleton:
				g_data.m_skeletonCount++;
				break;
		}
	}

	int childCount = a_node->GetChildCount();
	//FbxNode* childNode;

	for	(int i = 0; i < childCount; i++)
	{
		InitFbxDataNodes(a_node->GetChild(i) );
	}
	
}

#pragma endregion

#pragma region GetNodeID
//Returns the id of a node where it is in the nodemap, creating unique IDs! 
int GetNodeID(FbxNode* a_node)
{		
	for (int i = 0; i < g_nodeMapCount; i++)
	{
		if (g_nodeMap[i] == a_node)
		{
			return i;
		}
	}

	//-1 is could not find a node... should theoretically never happen
	return -1;
}
#pragma endregion

#pragma region GetGlobalPosition

//Recursive function to get the matrix to move object to world space
FbxAMatrix GetGlobalPosition(FbxNode* a_node, FbxPose* a_pose, FbxAMatrix* a_parentGlobalPosition)
{
	FbxAMatrix globalPosition; 
	bool positionFound = false;
    
	if (a_pose)
	{
		int nodeIndex = a_pose->Find(a_node);

		if (nodeIndex > -1)
		{
			// The bind pose is always a global matrix.
			// If we have a rest pose, we need to check if it is
			// stored in global or local space.
			if (a_pose->IsBindPose() || !a_pose->IsLocalMatrix(nodeIndex))
			{
				globalPosition = GetPoseMatrix(a_pose, nodeIndex);
			}
			else
			{
				// We have a local matrix, we need to convert it to
				// a global space matrix.
				FbxAMatrix parentGlobalPosition;
				//If the a_parent parameter isn't null
				if (a_parentGlobalPosition)
				{
					parentGlobalPosition = *a_parentGlobalPosition;
				}
				else
				{
					if (a_node->GetParent())
					{
						//A recursive loop that goes until nodeIndex < -1 
						parentGlobalPosition = GetGlobalPosition(a_node->GetParent(), a_pose);
					}
				}

				//the local matrix for the node
				FbxAMatrix localPosition = GetPoseMatrix(a_pose, nodeIndex);
				globalPosition = parentGlobalPosition * localPosition;

			
			} 

			positionFound = true;
		}
	}

	if (!positionFound)
	{
		FbxTime time;
		time.SetSecondDouble(0);
		globalPosition = g_scene->GetEvaluator()->GetNodeGlobalTransform(a_node);//a_node->EvaluateGlobalTransform( time  );
	}    

    return globalPosition;
}

#pragma endregion

#pragma region GetGeometry
// Get the geometry offset to a node. It is never inherited by the children.
FbxAMatrix GetGeometry(FbxNode* a_node)
{	
    const FbxVector4 t = a_node->GetGeometricTranslation(FbxNode::eSourcePivot);
    const FbxVector4 r = a_node->GetGeometricRotation(FbxNode::eSourcePivot);
    const FbxVector4 s = a_node->GetGeometricScaling(FbxNode::eSourcePivot);
	
    return FbxAMatrix(t, r, s);
}

#pragma endregion

#pragma region GetPoseMatrix
//Gets a pose matrix, then converts the FbxMatrix to FbxAMatrix  (the extra X)
FbxAMatrix GetPoseMatrix(FbxPose* a_pose, int a_poseIndex)
{
    FbxAMatrix poseMatrix;
    FbxMatrix matrix = a_pose->GetMatrix(a_poseIndex);

    memcpy((double*)poseMatrix, (double*)matrix, sizeof(matrix.mData));

    return poseMatrix;
}

#pragma endregion

FbxQuaternion CreateQuaternion( FbxVector4 a_rotation, bool a_isEuler )
{
	//If it's euler degrees, convert to radians
	if (a_isEuler)
	{
		a_rotation[0] *= Deg2Rad;
		a_rotation[1] *= Deg2Rad;
		a_rotation[2] *= Deg2Rad;
	}

	double x =  a_rotation[0] * 0.5;    
    double y = a_rotation[1] * 0.5;
    double z = a_rotation[2] * 0.5;
    double sx, cx, sy, cy, sz, cz;
    
    sx = sin( x ); cx = cos( x ); 
    sy = sin( y ); cy = cos( y );
    sz = sin( z ); cz = cos( z );     
    
    double qx = ( sx * cy * cz ) - ( cx * sy * sz );
    double qy = ( cx * sy * cz ) + ( sx * cy * sz );
    double qz = ( cx * cy * sz ) - ( sx * sy * cz ); 
    double qw = ( cx * cy * cz ) + ( sx * sy * sz ); 

	return FbxQuaternion( qx, qy, qz, qw );
}

#pragma region SetDualQuaternion

void SetDualQuaternion(FbxAMatrix a_matrix, double* a_dest)
{
	FbxQuaternion quat = a_matrix.GetQ();
	FbxVector4 T = a_matrix.GetT();

	FbxDualQuaternion dualQuat = FbxDualQuaternion(quat, T);
	
	//Get the first quat to set the first quat in m_transformDualQuat
	SetDualQuaternion(dualQuat, a_dest);
	/*quat = dualQuat.GetFirstQuaternion();

	a_dest[0] = quat[0];
	a_dest[1] = quat[1];
	a_dest[2] = quat[2];
	a_dest[3] = quat[3];

	//Get the second one
	quat = dualQuat.GetSecondQuaternion();

	a_dest[4] = quat[0];
	a_dest[5] = quat[1];
	a_dest[6] = quat[2];
	a_dest[7] = quat[3];*/
}

void SetDualQuaternion(FbxDualQuaternion a_dualQuat, double* a_dest)
{
	FbxQuaternion quat = a_dualQuat.GetFirstQuaternion();

	a_dest[0] = quat[0];
	a_dest[1] = quat[1];
	a_dest[2] = quat[2];
	a_dest[3] = quat[3];

	//Get the second one
	quat = a_dualQuat.GetSecondQuaternion();

	a_dest[4] = quat[0];
	a_dest[5] = quat[1];
	a_dest[6] = quat[2];
	a_dest[7] = quat[3];
}

#pragma endregion

#pragma region SetMatrix

void SetMatrix(FbxAMatrix a_matrix, double* a_dest)
{
	for (int y = 0; y < 4; y ++)
	{
		FbxVector4 rowVector = a_matrix.GetRow(y);

		int row = y * 4;

		a_dest[row] = rowVector[0];
		a_dest[row + 1] = rowVector[1];
		a_dest[row + 2] = rowVector[2];
		a_dest[row + 3] = rowVector[3];
	}
}

#pragma endregion

#pragma region HandleNode
//The function that loops through whole scene, node by node and handles it depending on what it finds to store it properly
void HandleNode(FbxNode* a_node)
{
	
	FbxNodeAttribute* attribute = a_node->GetNodeAttribute();
	
	if(attribute != NULL)
	{
		FbxNodeAttribute::EType attributeType = attribute->GetAttributeType();

		//Time to see what function to call to save the data correctly
		switch (attributeType)
		{
			//Meshes
			case FbxNodeAttribute::eMesh:			
				HandleMeshNode(a_node);				
				break;
			
			case FbxNodeAttribute::eSkeleton:
				HandleSkeletonNode(a_node);
				break;
		}
	}

	int childCount = a_node->GetChildCount();	

	for	(int i = 0; i < childCount; i++)
	{
		//If it "crashes" return false
		HandleNode(a_node->GetChild(i) );		
	}	
	
}
#pragma endregion

#pragma region HandleMeshNode
//Handles a mesh node, reads data and puts the data in the g_data.m_meshes[] array.
void HandleMeshNode(FbxNode* a_node)
{
	//The mesh data
	Mesh mesh;
	
	//Sets the mesh name
	mesh.m_name = a_node->GetName();
	mesh.m_id = GetNodeID(a_node);
	
	//Creates the fbxMesh
	FbxMesh* fbxMesh = (FbxMesh*) a_node->GetNodeAttribute();

	if (!fbxMesh->IsTriangleMesh() )
	{
		AddStatusMessage(L"Found a not triangulated mesh, made it into triangles\r\n");
		
		FbxGeometryConverter converter = FbxGeometryConverter(g_sdkManager);
		
		fbxMesh = converter.TriangulateMesh( fbxMesh );
	}

	mesh.Init( fbxMesh, a_node->LclTranslation.Get(), a_node->LclRotation.Get(), a_node->LclScaling.Get(), a_node  );			

	int index = 0;

	FbxVector4* vertices = fbxMesh->GetControlPoints();
	//To get vertices
	for (int i = 0; i < mesh.m_verticeCount; i++)
	{		
		index = i * 3;	

		//x
		mesh.m_vertices[index] = vertices[i][0];
		//y
		mesh.m_vertices[index + 1] = vertices[i][1];
		//z
		mesh.m_vertices[index + 2] = vertices[i][2];

		
		FbxGeometryElementNormal* normalElement = fbxMesh->GetElementNormal(0);
		if (normalElement->GetMappingMode() == FbxGeometryElement::eByControlPoint)
		{				
			if (normalElement->GetReferenceMode() == FbxGeometryElement::eDirect)
			{
				FbxVector4 normal = normalElement->GetDirectArray().GetAt(i);

				mesh.m_normals[index] = normal[0];
				mesh.m_normals[index + 1] = normal[1];
				mesh.m_normals[index + 2] = normal[2];
			}
		}
        
	}	

	index = 0;

	//Loop through every face
	for (int i = 0; i < mesh.m_facesCount; i++)
	{			
		//Loops through each point in the face
		for (int j = 0; j < 3; j++)
		{
			int vertexIndex = fbxMesh->GetPolygonVertex(i, j);
			//Gets the index for vertex in a face!
			mesh.m_verticeIndex[index++] = vertexIndex;			

			//Get UV coordinates for each channel
			for (int l = 0; l < fbxMesh->GetElementUVCount(); l++)
			{
				FbxGeometryElementUV* elementUV = fbxMesh->GetElementUV( l );				
				FbxVector2 UVCoords;

				switch (elementUV->GetMappingMode())
				{
				case FbxGeometryElement::eByControlPoint:
						switch (elementUV->GetReferenceMode())
						{
							case FbxGeometryElement::eDirect:
								UVCoords = elementUV->GetDirectArray().GetAt(vertexIndex);								
								break;
							case FbxGeometryElement::eIndexToDirect:
							{
								int id = elementUV->GetIndexArray().GetAt(vertexIndex);
								UVCoords = elementUV->GetDirectArray().GetAt(id);						
								break;
							}
							default:
								break; // other reference modes not shown here!
						}
						break;

				case FbxGeometryElement::eByPolygonVertex:
					{
						int textureUVIndex = fbxMesh->GetTextureUVIndex(i, j);
						switch (elementUV->GetReferenceMode() )
						{
							case FbxGeometryElement::eDirect:
							case FbxGeometryElement::eIndexToDirect:									
								UVCoords = elementUV->GetDirectArray().GetAt(textureUVIndex);	
								break;
							default:
								break; // other reference modes not shown here!
						}						
						break;
					}
					/*case FbxGeometryElement::eBY_POLYGON: // doesn't make much sense for UVs
					case FbxGeometryElement::eALL_SAME:   // doesn't make much sense for UVs
					case FbxGeometryElement::eNONE:       // doesn't make much sense for UVs
						break;*/
				}					
				
				if (UVCoords != NULL)
				{
					//6 multiplier because 3*2 is 6!
					int uvIndex = i * 6 + j * 2;

					mesh.m_uvCoordinates[l][uvIndex] = UVCoords[0];
					mesh.m_uvCoordinates[l][uvIndex + 1] = UVCoords[1];
				}
				else
				{					
					AddStatusMessage( _T("Found some UV coordinates it could not read!\r\n") );
				}

			}//End Get UV coordinates		

		}//End Face point loop

	}//End looping through all faces

	int clusterCount = 0;
	FbxCluster* cluster;

	//Gets the amount of deformers affecting the model
	int deformerCount = fbxMesh->GetDeformerCount(FbxDeformer::eSkin);

	for (int i = 0; i < deformerCount; i++)
	{
		//Not sure what this does, cause seems that several bones seemed to just create more skincount / bone count
		clusterCount = ((FbxSkin *) fbxMesh->GetDeformer(i, FbxDeformer::eSkin))->GetClusterCount();
        for (int j = 0; j < clusterCount; j++)
        {			
			cluster = ((FbxSkin *) fbxMesh->GetDeformer(i, FbxDeformer::eSkin))->GetCluster(j);			

			//cluster->GetTransformLinkMatrix(transformLinkMatrix);

			mesh.m_bones[mesh.m_currentBoneIndex].Init(cluster, fbxMesh);				

			mesh.m_currentBoneIndex ++;
		}
	}
	
	//Inserting the mesh data into the data to be converted
	g_data.m_meshes[g_data.m_currentMeshID] = mesh;
	g_data.m_currentMeshID++;	
}

#pragma endregion

#pragma region HandleSkeletonNode

void HandleSkeletonNode(FbxNode* a_node)
{
	Skeleton skeleton;

	skeleton.Init( a_node );	

	g_data.m_skeletons[g_data.m_currentSkeletonID] = skeleton;

	g_data.m_currentSkeletonID++;
}

#pragma endregion

#pragma region HandleAnimations

//Takes a scene, splits it up in animation stacks ( animations/ takes ) 
void HandleAnimations(FbxScene* a_scene)
{
	//a_scene->GetS
	//Get the amount of animations
	int animationStacks = a_scene->GetSrcObjectCount(FBX_TYPE(FbxAnimStack));
	//AnimationStack pointer
	FbxAnimStack* animationStack; 	
	
	//Loop through all stacks
	for (int i = 0; i < animationStacks; i++)
	{
		//Get the animation stack at i
		animationStack = FbxCast<FbxAnimStack>(a_scene->GetSrcObject(FBX_TYPE(FbxAnimStack), i));			
		
		//Get the amount of layers
		int animLayersCount = animationStack->GetMemberCount(FBX_TYPE(FbxAnimLayer));

		//Init the animation data by setting layersCount and the name of animation
		g_data.m_animations[g_data.m_currentAnimationID].Init(animLayersCount, animationStack->GetName(), animationStack->GetLocalTimeSpan(), g_data.m_deltaFrameTime );

		//Animation layer pointer
		//FbxAnimLayer* animLayer;

		for (int j = 0; j < animLayersCount; j++)
		{
			//Get stuff from the layer!
			HandleAnimationLayer(animationStack->GetMember(FBX_TYPE(FbxAnimLayer), j), g_root);

			g_data.m_animations[g_data.m_currentAnimationID].m_currentLayer++;
		}

		//Add currentAnimationID by 1 to set next one! 
		g_data.m_currentAnimationID++;
	}
}

//Checks this node for appropriate animationNode data and then checks the children of a_node for the same amount too
void HandleAnimationLayer(FbxAnimLayer* a_layer, FbxNode* a_node)
{	
	FbxAnimCurve* animeCurve = NULL;
	
	AnimationNode animNode;

	animNode.m_name = a_node->GetName();
	animNode.m_id = GetNodeID(a_node);

	FbxNode* parentNode = a_node->GetParent();

	if (parentNode != NULL && parentNode != g_root)
	{
		animNode.m_parentName = parentNode->GetName();
		animNode.m_parentID = GetNodeID(parentNode);
	}
	else
	{
		animNode.m_parentName = "";
	}

	bool animNodeValidated = false;

	//T = Translation
	//R = Rotation
	//S = Scale

	//TX	
    if (HandleAnimCurve(&animNode.m_translation.m_x, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_X, CurveTranslation) )
    {
		animNodeValidated = true;
	}
	//TY        
	if (HandleAnimCurve(&animNode.m_translation.m_y, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_Y, CurveTranslation) )
	{
		animNodeValidated = true;
	}
	//TZ
	if (HandleAnimCurve(&animNode.m_translation.m_z, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_Z, CurveTranslation) )
	{
		animNodeValidated = true;
	}	
	//RX
	if (HandleAnimCurve(&animNode.m_rotation.m_x, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_X, CurveRotation) )
	{
		animNodeValidated = true;
	}				
	//RY					
	if (HandleAnimCurve(&animNode.m_rotation.m_y, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_Y, CurveRotation) )
	{			
		animNodeValidated = true;
	}
	//RZ
	if (HandleAnimCurve(&animNode.m_rotation.m_z, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_Z, CurveRotation) )
	{
		animNodeValidated = true;
	}
						
	//SX
	if (HandleAnimCurve(&animNode.m_scale.m_x, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_X, CurveScale) )
	{  
		animNodeValidated = true;
	}
	//SY
	if (HandleAnimCurve(&animNode.m_scale.m_y, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_Y, CurveScale) )
	{ 
		animNodeValidated = true;
	}
	//SZ
	if (HandleAnimCurve(&animNode.m_scale.m_z, a_node, a_layer, FBXSDK_CURVENODE_COMPONENT_Z, CurveScale) )
	{ 
		animNodeValidated = true;
	}
	
	if (animNodeValidated)
	{
		//converts the translation & rotation parts to a dual quaternion
		animNode.CalculateDualQuaternionTransform(a_node);

		g_data.m_animations[g_data.m_currentAnimationID].m_layers[g_data.m_animations[g_data.m_currentAnimationID].m_currentLayer].AddNode(animNode);
	}

	int childCount =  a_node->GetChildCount();

	for (int i = 0; i < childCount; i ++)
	{
		HandleAnimationLayer(a_layer, a_node->GetChild(i) );
	}	
}

//Returns true if succesful False if can't find a curve. 
bool HandleAnimCurve(CurveInfo* a_curveInfo, FbxNode* a_node ,FbxAnimLayer* a_layer, const char* a_channelDimension, const char* a_curveType )
{
	FbxAnimCurve* animeCurve = NULL;
	
	if (a_curveType == CurveTranslation)
	{
		animeCurve = a_node->LclTranslation.GetCurve<FbxAnimCurve>(a_layer, a_channelDimension);
	}
	else if (a_curveType == CurveRotation)
	{
		animeCurve = a_node->LclRotation.GetCurve<FbxAnimCurve>(a_layer, a_channelDimension);
	}
	else if (a_curveType == CurveScale)
	{
		animeCurve = a_node->LclScaling.GetCurve<FbxAnimCurve>(a_layer, a_channelDimension);
	}
	else
	{
		return false;
	}
	
    if (animeCurve)
    {		
		//FCurve* curve = animeCurve->GetFCurve();		
		int frameCount = animeCurve->KeyGetCount();//curve->KeyGetCount();
		FbxTime time;

		a_curveInfo->Init(frameCount);
		
		for (int i = 0; i < a_curveInfo->m_frameCount; i++)
		{
			a_curveInfo->m_frameValue[i] = static_cast<double>(animeCurve->KeyGetValue(i));
			time = animeCurve->KeyGetTime(i);			

			a_curveInfo->m_frameNumber[i] = time.GetSecondDouble() / g_data.m_deltaFrameTime;

			//redudant.. should probably remove
			a_curveInfo->m_currentFrameID++;
		}
		
		return true;
	}
	else
	{
		return false;
	}

}



#pragma endregion

#pragma region SaveDataToJson

#pragma region MainFunction
//Loops through the data gained from importing, saving it to javascript file!
bool SaveDataToJSON(const wchar_t* a_exportPath)
{	
	/*
		How it loops through it to print out the data
		ToC:

		METADATA
			meshCount
			skeletonCount
			animationCount
			framerate
		MESHES
			meshdata
				name
				verticesCount
				facesCount
				verticesPerFace
				uvChannelCount
				boneCount
			bindpose
			localTranslation
			localRotation
			localScaling			
			vertices
			verticeIndex
			uvchannels
			normals
			bones
				bonedata
					name
					linkIndicesCount
				linkIndices
				weightValues
		SKELETONS
			name
			id
			parentName
			parentID
			length
			bindpose
			localTranslation
			localRotation
			localScaling
			
			
		ANIMATIONS
			animationdata
				name
				layerCount
				animationLength
			layers
				nodecount
				nodes
					nodedata
						name
						id
						parentName
						parentID												
					channels
						transform							
							keyCount
							keys
								frame
								frameValue											
						scale
							x,y,z
								keyCount
								keys
									frame
									frameValue						
								
			
	*/

	try
	{
		AddStatusMessage(L"Started exporting to json file\r\n");		

		int tabCount = 0;		
	
		wofstream jsonFile;
		jsonFile.open(a_exportPath);
		
		FbxString tempString = "{";
		//Tab count is 1
		tabCount++;

		tempString += PrintNewLine(tabCount);

		AddStatusMessage(L"\tExporting Metadata\r\n");

		tempString += PrintMetadata(tabCount);	
		
		//appending metadata to file
		jsonFile << tempString;	
		
		AddStatusMessage(L"\tFinished exporting Metadata\r\n");

		AddStatusMessage(L"\tExporting Meshes\r\n");
		//Gets the output from meshes data
		tempString = PrintMeshes(tabCount);				

		jsonFile << tempString; 
		AddStatusMessage(L"\tFinished exporting Meshes\r\n");	
		//If any skeletons, otherwise don't print the data
		if (g_data.m_skeletonCount > 0)
		{		
			AddStatusMessage(L"\tExporting Skeletons\r\n");
			//Gets the utput from skeletons data
			tempString = PrintSkeletons(tabCount);
			
			jsonFile << tempString;
			AddStatusMessage(L"\tFinished exporting Skeletons\r\n");

		}

		//IF there are any animations, then print the data
		if ( g_data.m_animationCount > 0)
		{
			AddStatusMessage(L"\tExporting Animations\r\n");
			//Gets the utput from animtation data
			tempString = PrintAnimations(tabCount);

			//End of animations!
			jsonFile << tempString;
			AddStatusMessage(L"\tFinished exporting Animations\r\n");

		}

		tabCount--;

		tempString = PrintNewLine(tabCount);
		tempString += "}";

		//End of json
		jsonFile << tempString;

		jsonFile.close();	

		AddStatusMessage(L"Finished exporting to json file \r\n");

		return true;
	}
	catch (char* str)
	{
		AddStatusMessage( _T("Failed to write to destination\r\n") );
		return false;
	}
	
}

#pragma endregion

#pragma region metadata
FbxString PrintMetadata(int a_tabCount)
{
	FbxString tempString = "";
	tempString += "\"metadata\":";

	tempString += PrintNewLine(a_tabCount);

	tempString += "{";
	//Count is 2
	a_tabCount++;
	
	tempString += PrintElement("meshCount", g_data.m_meshCount, a_tabCount, false);
		
	tempString += PrintElement("skeletonCount", g_data.m_skeletonCount, a_tabCount, false);

	tempString += PrintElement("animationCount", g_data.m_animationCount, a_tabCount, false);

	tempString += PrintElement("framerate", g_data.m_frameRate, a_tabCount, true);
	//Count is now 1
	a_tabCount--;

	tempString += PrintNewLine(a_tabCount);

	tempString += "}";		
	tempString += ",";

	tempString += PrintNewLine(a_tabCount);

	return tempString;
	
}
#pragma endregion

#pragma region Meshes
FbxString PrintMeshes(int a_tabCount)
{	
	int i,j;
	FbxString tempString = "";
	//Start of meshes	
 	tempString += "\"meshes\": ";

	tempString += PrintNewLine(a_tabCount);

	tempString += "[ ";

	//Should be 2 now
	a_tabCount++;

	for (i = 0; i < g_data.m_meshCount; i++)
	{	
		
		tempString += PrintNewLine(a_tabCount);		

		//Caches the i mesh
		Mesh mesh = g_data.m_meshes[i];		
		
		//Start of a mesh
		tempString += "{";

		//Should be 3
		a_tabCount ++;

		tempString += PrintNewLine(a_tabCount);
			
		tempString += "\"meshdata\":";

		tempString += PrintNewLine(a_tabCount);

		tempString += "{";
		//up to 4
		a_tabCount++;

		tempString += PrintElement("name", mesh.m_name, a_tabCount, false);
		tempString += PrintElement("id", mesh.m_id, a_tabCount, false);
		tempString += PrintElement("verticeCount", mesh.m_verticeCount, a_tabCount, false);
		tempString += PrintElement("facesCount", mesh.m_facesCount, a_tabCount, false);
		tempString += PrintElement("verticesPerFace", mesh.m_verticesPerFace, a_tabCount, false);
		tempString += PrintElement("uvChannelCount", mesh.m_uvChannelCount, a_tabCount, false);
		tempString += PrintElement("boneCount", mesh.m_boneCount, a_tabCount, true);
		
		//End of meshdata

		//Down to 3
		a_tabCount--;

		tempString += PrintNewLine(a_tabCount);

		tempString += "}";
		tempString += ",";

		if (g_usingDualQuaternions)
		{
			tempString += PrintElements("bindpose", 8, mesh.m_bindpose, a_tabCount, false);
		}
		else
		{
			tempString += PrintElements("bindpose", 16, mesh.m_bindpose, a_tabCount, false);
		}
		
		tempString += PrintElements("localTranslation", 3, mesh.m_localTranslation, a_tabCount, false);
		tempString += PrintElements("localRotation", 3, mesh.m_localRotation, a_tabCount, false);
		tempString += PrintElements("localScale", 3, mesh.m_localScale, a_tabCount, false);		
		
		int totalIndexes = mesh.m_facesCount * mesh.m_verticesPerFace;

		tempString += PrintElements("vertices", mesh.m_verticeCount * 3, mesh.m_vertices, a_tabCount, false);
		tempString += PrintElements("verticeIndex", totalIndexes, mesh.m_verticeIndex, a_tabCount, true);
		
		//UV CHANNELS
		
		//If it has any texture coordinates
		if (mesh.m_uvChannelCount > 0)
		{
			tempString += ",";
			tempString += PrintNewLine(a_tabCount);
			tempString += "\"uvChannels\":";
			tempString += PrintNewLine(a_tabCount);
			tempString += "[";

			a_tabCount++;

			for	(j = 0; j < mesh.m_uvChannelCount; j++)
			{
				int totalUVCoords = mesh.m_facesCount * 2 * mesh.m_verticesPerFace;

				tempString += PrintElements(totalUVCoords, mesh.m_uvCoordinates[j], a_tabCount, true);				

				if (j < mesh.m_uvChannelCount - 1)
				{
					tempString += ",";
				}
			}

			a_tabCount--;
			tempString += PrintNewLine(a_tabCount);
			//End of a UV channel 
			tempString += "]";
		}

		tempString += ",";

		totalIndexes = mesh.m_verticeCount * 3;
		tempString += PrintElements("normals", totalIndexes, mesh.m_normals, a_tabCount, true);
#pragma region Bones		
		if (mesh.m_boneCount > 0)
		{

			tempString += ",";
			tempString += PrintNewLine(a_tabCount);

			tempString += "\"bones\":";
			tempString += PrintNewLine(a_tabCount);
			tempString += "[";

			a_tabCount++;

			for (j = 0; j < mesh.m_boneCount; j++)
			{
				Bone bone = mesh.m_bones[j];
				tempString += PrintNewLine(a_tabCount);
				//Start of bone data
				tempString += "{";

				a_tabCount ++;

				tempString+= PrintNewLine(a_tabCount);

				tempString += "\"bonedata\":";			
				tempString += PrintNewLine(a_tabCount);

				tempString +="{";

				a_tabCount++;

				tempString += PrintElement("name", bone.m_name, a_tabCount, false);
				tempString += PrintElement("id", bone.m_id, a_tabCount, false);				

				if ( mesh.m_bones[j].m_parentName != "")
				{
					tempString += PrintElement("parentName", bone.m_parentName, a_tabCount, false);
					tempString += PrintElement("parentID", bone.m_parentID, a_tabCount, false);
				}				

				tempString += PrintElement("linkIndicesCount", bone.m_linkIndicesCount, a_tabCount, true);

				a_tabCount--;
				tempString += PrintNewLine(a_tabCount);
				tempString += "}";

				tempString += ",";

				tempString += PrintElements("linkIndices", bone.m_linkIndicesCount, bone.m_linkIndices, a_tabCount, false);
				tempString += PrintElements("weightValues", bone.m_linkIndicesCount,bone.m_weightValues, a_tabCount, false);				

				if (bone.m_usingDualQuat)
				{
					tempString += PrintElements("bindtransform", 8 ,bone.m_bindTransform, a_tabCount, false);
					//tempString += PrintElements("transformLink", 8, bone.m_boneTransformLink, a_tabCount, false);
					tempString += PrintElements("transform", 8, bone.m_transformDualQuat, a_tabCount, true);
				}
				else
				{
					tempString += PrintElements("bindtransform", 16 ,bone.m_bindTransform, a_tabCount, false);
					//tempString += PrintElements("transformLink", 16, bone.m_boneTransformLink, a_tabCount, false);
					tempString += PrintElements("transform", 16, bone.m_transformMatrix, a_tabCount, true);
				}				
				
				a_tabCount--;
				tempString += PrintNewLine(a_tabCount);
				//End of a bone data
				tempString += "}";

				if (j < mesh.m_boneCount - 1)
				{
					tempString += ",";
				}

			}

			a_tabCount--;

			tempString += PrintNewLine(a_tabCount);
			//End of bones
			tempString += "]";

		}
#pragma endregion
		a_tabCount--;
		tempString += PrintNewLine(a_tabCount);
		//End of a mesh
		tempString += "}";

		if (i < g_data.m_meshCount - 1)
		{
			tempString += ",";			
		}

		tempString += PrintNewLine(a_tabCount);
	}

	a_tabCount --;

	tempString += PrintNewLine(a_tabCount);
	tempString += "]";

	return tempString;
}

#pragma endregion

#pragma region Skeletons

FbxString PrintSkeletons(int a_tabCount)
{
	FbxString tempString = ",";
	
	tempString += PrintNewLine(a_tabCount);
	tempString += "\"skeletons\":";
	tempString += PrintNewLine(a_tabCount);
	tempString += "[";

	a_tabCount++;

	for	(int i = 0; i < g_data.m_skeletonCount; i++)
	{
		Skeleton skeleton = g_data.m_skeletons[i];

		tempString += PrintNewLine(a_tabCount);
		tempString += "{";

		a_tabCount++;		

		tempString += PrintElement("name", skeleton.m_name, a_tabCount, false);
		tempString += PrintElement("id", skeleton.m_id, a_tabCount, false);
		//If parentNam
		if (skeleton.m_parentName != "")
		{
			tempString += PrintElement("parentName", skeleton.m_parentName, a_tabCount, false);
			tempString += PrintElement("parentID", skeleton.m_parentID, a_tabCount, false);
		}	

		tempString += PrintElement("length", skeleton.m_length, a_tabCount, false);

		if (g_usingDualQuaternions)
		{
			tempString += PrintElements("bindpose", 8, skeleton.m_bindpose, a_tabCount, false);
		}
		else
		{
			tempString += PrintElements("bindpose", 16, skeleton.m_bindpose, a_tabCount, false);
		}

		tempString += PrintElements("localTranslation", 3, skeleton.m_localTranslation, a_tabCount, false);
		tempString += PrintElements("localRotation", 3, skeleton.m_localRotation, a_tabCount, false);
		tempString += PrintElements("localScale", 3, skeleton.m_localScale, a_tabCount, true);
		
		a_tabCount--;
		tempString += PrintNewLine(a_tabCount);

		tempString += "}";			

		if (i < g_data.m_skeletonCount - 1)
		{
			tempString += ",";
		}

		//tempString += "\n";
	}

	a_tabCount--;

	tempString += PrintNewLine(a_tabCount);
	//END of skeletons string
	tempString += "]";

	return tempString;
}


#pragma endregion

#pragma region Animations

FbxString PrintAnimations(int a_tabCount)
{
	FbxString tempString = ",";
	tempString += PrintNewLine(a_tabCount);

	tempString += "\"animations\":";
	tempString += PrintNewLine(a_tabCount);
	
	tempString += "[";

	a_tabCount++;

	for( int i= 0; i < g_data.m_animationCount; i++)
	{
		Animation animation = g_data.m_animations[i];

		tempString += PrintNewLine(a_tabCount);

		tempString += "{";

		a_tabCount++;

		tempString += PrintNewLine(a_tabCount);

		tempString += "\"animationdata\":";
		tempString += PrintNewLine(a_tabCount);
		tempString += "{";

		a_tabCount++;

		tempString += PrintElement("name", animation.m_name, a_tabCount, false);	
		tempString += PrintElement("layerCount", animation.m_layerCount, a_tabCount, false);
		tempString += PrintElement("animationLength", animation.m_frameCount, a_tabCount, true);

		a_tabCount--;

		tempString += PrintNewLine(a_tabCount);
		tempString += "}";

		//Start of layers
		tempString += ",";
		tempString += PrintNewLine(a_tabCount);
		tempString += "\"layers\":";
			
		tempString += PrintNewLine(a_tabCount);
		tempString += "[";

		a_tabCount++;

		for (int j = 0; j < animation.m_layerCount; j++)
		{
			AnimationLayer layer = animation.m_layers[j];

			tempString += PrintNewLine(a_tabCount);

			tempString += "{";

			a_tabCount++;
			tempString += PrintNewLine(a_tabCount);

			tempString += "\"layerdata\":";
			
			tempString += PrintNewLine(a_tabCount);
			tempString += "{";

			a_tabCount++;

				tempString += PrintElement("nodeCount", layer.m_nodeCount, a_tabCount, true);
				
			a_tabCount--;

			tempString += PrintNewLine(a_tabCount);
			//End of layerdata
			tempString += "}";
			tempString += ",";

			tempString += PrintNewLine(a_tabCount);

			tempString += "\"nodes\":";
			tempString += PrintNewLine(a_tabCount);
			tempString += "[";

			a_tabCount++;

			for (int k = 0; k < layer.m_nodeCount; k++)
			{
				AnimationNode animNode = layer.m_nodes[k];

				tempString += PrintNewLine(a_tabCount);
				tempString += "{";

				a_tabCount++;
				tempString += PrintNewLine(a_tabCount);

				tempString += "\"nodedata\":";
				tempString += PrintNewLine(a_tabCount);
				tempString += "{";

				a_tabCount++;

				tempString += PrintElement("name", animNode.m_name, a_tabCount, false);
				tempString += PrintElement("id", animNode.m_id, a_tabCount, true);
				
				if (animNode.m_parentName != "")
				{
					tempString += ",";
					tempString += PrintElement("parentName", animNode.m_parentName, a_tabCount, false);
					tempString += PrintElement("parentID", animNode.m_parentID, a_tabCount, true);
				}				
				
				a_tabCount--;

				tempString += PrintNewLine(a_tabCount);
				//END of nodedata
				tempString += "}";
				tempString += ",";				
				

				tempString += PrintNewLine(a_tabCount);

				tempString += "\"channels\":";
				tempString += PrintNewLine(a_tabCount);
				tempString += "{";

				a_tabCount++;

				tempString += PrintCurveTransform(animNode.m_transform, a_tabCount, false);
					
				//tempString += PrintChannel(animNode.m_translation, "translation", a_tabCount, false);
					
				//tempString += PrintChannel(animNode.m_rotation, "rotation", a_tabCount, false);
					
				tempString += PrintChannel(animNode.m_scale, "scale", a_tabCount, true);
					
				a_tabCount--;
				tempString += PrintNewLine(a_tabCount);
				tempString += "}";

				a_tabCount--;
				tempString += PrintNewLine(a_tabCount);
				tempString += "}";

				if (k < layer.m_nodeCount - 1)
				{
					tempString += ",";
				}
			}

			a_tabCount--;

			tempString += PrintNewLine(a_tabCount);
			//End of nodes!
			tempString += "]";

			a_tabCount--;
			tempString += PrintNewLine(a_tabCount);

			tempString += "}";

			if (j < animation.m_layerCount - 1)
			{
				tempString += ",";
			}
		}

		a_tabCount--;

		tempString += PrintNewLine(a_tabCount);

		//End of layers
		tempString += "]";

		a_tabCount--;
		tempString += PrintNewLine(a_tabCount);

		tempString += "}";

		if (i < g_data.m_animationCount - 1)
		{
			tempString += ",";
		}
	}

	a_tabCount--;
	tempString += PrintNewLine(a_tabCount);

	//END of animations string
	tempString += "]";

	return tempString;
}

#pragma endregion

#pragma region PrintFunctions

FbxString PrintChannel(Channel a_channel, const char* a_channelName,int a_tabCount, bool a_lastLine)
{

	FbxString tempString = "";

	tempString += PrintNewLine(a_tabCount);			

	tempString += "\"";
	tempString += a_channelName;
	tempString += "\":";

	tempString += PrintNewLine(a_tabCount);
	tempString += "{";	

	a_tabCount++;
												
	tempString += PrintCurveInfo(a_channel.m_x, "x", a_tabCount, false);
	
	tempString += PrintCurveInfo(a_channel.m_y, "y", a_tabCount, false);
	
	tempString += PrintCurveInfo(a_channel.m_z, "z", a_tabCount, true);

	a_tabCount--;
	tempString += PrintNewLine(a_tabCount);
	//End of Translation
	tempString += "}";

	if (!a_lastLine)
	{
		tempString += ",";
	}

	return tempString;
}

FbxString PrintCurveTransform(CurveTransform a_curveTransform, int a_tabCount, bool a_lastLine)
{
	FbxString string = "";

	string += PrintNewLine(a_tabCount);

	string += "\"transform\":";
	string += PrintNewLine(a_tabCount);
	string += "{";

	a_tabCount++;

	string += PrintElement("keyCount", a_curveTransform.m_frameCount, a_tabCount, false);
	string += PrintNewLine(a_tabCount);
	string += "\"keys\":";
	string += PrintNewLine(a_tabCount);
	string += "[";

	a_tabCount++;
	
	string += PrintNewLine(a_tabCount);

	int elementsPrinted = 0;

	for (int i = 0; i < a_curveTransform.m_frameCount; i++)
	{			
		string += "{ ";

		string += "\"frame\":";
		string += a_curveTransform.m_frameNumber[i];
		string += ",";

		string += " \"frameValue\":[";
		
		for (int j = 0; j < 8; j++)
		{
			string += a_curveTransform.m_frameValue[i][j];

			if (j < 7)
			{
				string += ",";
			}
		}

		string += "]";
			
		string += " }";

		if (i < a_curveTransform.m_frameCount - 1)
		{
			string += ",";

			elementsPrinted += 10;

			//This is to counter that it grows almost infintely in size and for instance visual studio lags quite badly when it's making the text editor wider and wider
			if (elementsPrinted > ElementsPerRow)
			{
				elementsPrinted = 0;
				string += PrintNewLine(a_tabCount);
			}
		}		
	}	

	a_tabCount--;

	string += PrintNewLine(a_tabCount);

	string += "]";

	a_tabCount--;
	string += PrintNewLine(a_tabCount);
	//END of X
	string += "}";

	if (!a_lastLine)
	{
		string += ",";
	}	

	return string;
}

FbxString PrintCurveInfo(CurveInfo a_curveInfo, const char* a_curveDimension, int a_tabCount, bool a_lastLine)
{
	FbxString string = "";

	string += PrintNewLine(a_tabCount);

	string += "\"";
	string += a_curveDimension;
	string += "\":";

	string += PrintNewLine(a_tabCount);
	string += "{";

	a_tabCount++;

	string += PrintElement("keyCount", a_curveInfo.m_frameCount, a_tabCount, false);
	string += PrintNewLine(a_tabCount);
	string += "\"keys\":";
	string += PrintNewLine(a_tabCount);
	string += "[";

	a_tabCount++;
	
	string += PrintNewLine(a_tabCount);

	int elementsPrinted = 0;

	for (int l = 0; l < a_curveInfo.m_frameCount; l++)
	{			
		string += "{ ";

		string += "\"frame\":";
		string += a_curveInfo.m_frameNumber[l];
		string += ",";

		string += " \"frameValue\":";
		string += a_curveInfo.m_frameValue[l];
			
		string += " }";

		if (l < a_curveInfo.m_frameCount - 1)
		{
			string += ",";

			elementsPrinted += 2;

			//This is to counter that it grows almost infintely in size and for instance visual studio lags quite badly when it's making the text editor wider and wider
			if (elementsPrinted > ElementsPerRow)
			{
				elementsPrinted = 0;
				string += PrintNewLine(a_tabCount);
			}
		}		
	}	

	a_tabCount--;

	string += PrintNewLine(a_tabCount);

	string += "]";

	a_tabCount--;
	string += PrintNewLine(a_tabCount);
	//END of X
	string += "}";

	if (!a_lastLine)
	{
		string += ",";
	}

	return string;
}
	
FbxString PrintElement(const char* a_name, int a_value, int a_tabCount, bool a_lastLine)
{
	FbxString string = "";

	string += PrintNewLine(a_tabCount);

	string += "\"";
	string += a_name;
	string += "\":";
	string += a_value;

	if (!a_lastLine)
	{
		string += ",";
	}

	return string;
}

FbxString PrintElement(const char* a_name, double a_value, int a_tabCount, bool a_lastLine)
{
	FbxString string = "";

	string += PrintNewLine(a_tabCount);

	string += "\"";
	string += a_name;
	string += "\":";
	string += a_value;

	if (!a_lastLine)
	{
		string += ",";
	}

	return string;
}

FbxString PrintElement(const char* a_name, FbxString a_value, int a_tabCount, bool a_lastLine)
{
	FbxString string = "";

	string += PrintNewLine(a_tabCount);

	string += "\"";
	string += a_name;
	string += "\":\"";
	string += a_value;
	string += "\"";

	if (!a_lastLine)
	{
		string += ",";
	}

	return string;
}


FbxString PrintElements(int a_count, int* a_values, int a_tabCount, bool a_lastLine)
{
	FbxString string = "";

	string += PrintNewLine(a_tabCount);

	string += "[";

	a_tabCount++;

	string += PrintNewLine(a_tabCount);

	int elementsPrinted = 0;

	for (int i = 0; i < a_count; i++)
	{
		string += a_values[i];

		if (i < a_count - 1)
		{
			string += ",";

			elementsPrinted++;
			//This is to counter that it grows almost infintely in size and for instance visual studio lags quite badly when it's making the text editor wider and wider
			if (elementsPrinted > ElementsPerRow)
			{
				string += PrintNewLine(a_tabCount);
				elementsPrinted = 0;
			}
		}
	}

	a_tabCount--;

	string += PrintNewLine(a_tabCount);

	string += "]";

	if (!a_lastLine)
	{
		string += ",";
	}

	return string;
}

FbxString PrintElements(const char* a_name, int a_count, int* a_values, int a_tabCount, bool a_lastLine)
{
	FbxString string;

	string = PrintNewLine(a_tabCount);
	
	string += "\"";
	string += a_name;
	string += "\":";	

	string  += PrintElements(a_count, a_values, a_tabCount, a_lastLine);

	return string;
}

FbxString PrintElements(int a_count, double* a_values, int a_tabCount, bool a_lastLine)
{
	FbxString string = "";

	string += PrintNewLine(a_tabCount);

	string += "[";

	a_tabCount++;

	string += PrintNewLine(a_tabCount);

	int elementsPrinted = 0;

	for (int i = 0; i < a_count; i++)
	{
		string += a_values[i];		

		if (i < a_count - 1)
		{
			string += ",";

			elementsPrinted++;
			//This is to counter that it grows almost infintely in size and for instance visual studio lags quite badly when it's making the text editor wider and wider
			if (elementsPrinted > ElementsPerRow)
			{
				string += PrintNewLine(a_tabCount);
				elementsPrinted = 0;
			}
		}
	}

	a_tabCount--;

	string += PrintNewLine(a_tabCount);

	string += "]";

	if (!a_lastLine)
	{
		string += ",";
	}

	return string;
}

FbxString PrintElements(const char* a_name, int a_count, double* a_values, int a_tabCount, bool a_lastLine)
{
	FbxString string;

	string = PrintNewLine(a_tabCount);
	
	string += "\"";
	string += a_name;
	string += "\":";	

	string  += PrintElements(a_count, a_values, a_tabCount, a_lastLine);

	return string;
}

FbxString GetTabString(int a_tabCount)
{
	FbxString string = "";

	for (int i = 0; i < a_tabCount; i++)
	{
		string += "\t";
	}

	return string;
}

//If g_minimize is false it makes new line and then adds tabs depending on tabCount
FbxString PrintNewLine(int a_tabCount)
{
	FbxString string = "";

	if (!g_minimize)
	{
		string += "\n";
		string += GetTabString(a_tabCount);
	}

	return string;

}
//Printfunctions
#pragma endregion

//SaveDataToJSON
#pragma endregion