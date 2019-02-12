
#include <fbxsdk.h>

#include "Bone.h"
#include "Mesh.h"
#include "Skeleton.h"
#include "Animation.h"
#include "FbxData.h"

#ifndef KARCH_ENV_WIN
    #define KARCH_ENV_WIN
#endif

//Returns an ID based on a nodemap that is created during InitFbxData
int GetNodeID(FbxNode* a_node);
//Recursive function to get the matrix to move object to world space 
FbxAMatrix GetGlobalPosition(FbxNode* a_node, FbxPose* a_pose, FbxAMatrix* a_parentGlobalPosition = NULL);
//Gets a pose matrix, then converts the FbxMatrix to FbxAMatrix  (the extra X)
FbxAMatrix GetPoseMatrix(FbxPose* a_pose, int a_poseIndex);
// Get the geometry offset to a node. It is never inherited by the children.
FbxAMatrix GetGeometry(FbxNode* a_node);

FbxQuaternion CreateQuaternion( FbxVector4 a_rotation, bool a_isEuler);

void SetDualQuaternion(FbxAMatrix a_matrix, double* a_dest);
void SetDualQuaternion(FbxDualQuaternion a_dualQuat, double* a_dest);

void SetMatrix(FbxAMatrix a_matrix, double* a_dest);


//Main function that sets everything in motion! (When the function is done, a json file exists if everything went as planned)
bool ConvertFbxToJson(wchar_t* a_importPath,const WCHAR* a_exportPath);
//Try to loads the fbx scene, if it succeeds it returns true
bool TryToLoadScene(FbxScene* a_scene, wchar_t* a_importer);
//Inits the fbx data structures
void InitFbxData(FbxScene* a_scene);
//Used by InitFbxData to loop through the scene node by node
void InitFbxDataNodes(FbxNode* a_node);
//Is used to loop through the scene node by node, calling each HandleXSpecializedNode when it finds the node types it's looking for
void HandleNode(FbxNode* a_node);
//Handles a mesh node
void HandleMeshNode(FbxNode* a_node);
//A skeleton node, not a deformer, just the skeleton information
void HandleSkeletonNode(FbxNode* a_node);
//Handles the Animations/Takes
void HandleAnimations(FbxScene* a_scene);
//Each animation layer!
void HandleAnimationLayer(FbxAnimLayer* a_layer, FbxNode* a_node);
//The curves inside each animation node inside each animation layer
bool HandleAnimCurve(CurveInfo* a_curveInfo, FbxNode* a_node ,FbxAnimLayer* a_layer, const char* a_channelDimension, const char* a_curveType );

//The function that saves the data from all the handle functions into a json file
bool SaveDataToJSON(const wchar_t* a_exportPath);

FbxString PrintMetadata(int a_tabCount);
FbxString PrintMeshes(int a_tabCount);
FbxString PrintSkeletons(int a_tabCount);
FbxString PrintAnimations(int a_tabCount);
FbxString PrintChannel(Channel a_channel, const char* a_channelName,int a_tabCount, bool a_lastLine);
FbxString PrintCurveTransform(CurveTransform a_curveTransform, int a_tabCount, bool a_lastLine);
FbxString PrintCurveInfo(CurveInfo a_curveInfo, const char* a_curveDimension, int a_tabCount, bool a_lastLine);

//Functions that the Print functions above uses to print the data that's inside them
FbxString PrintElement(const char* a_name, int a_value, int a_tabCount, bool a_lastLine);
FbxString PrintElement(const char* a_name, double a_value, int a_tabCount, bool a_lastLine);
FbxString PrintElement(const char* a_name, FbxString a_value, int a_tabCount, bool a_lastLine);
FbxString PrintElements(int a_count, int* a_values, int a_tabCount, bool a_lastLine);
FbxString PrintElements(const char* a_name, int a_count, int* a_values, int a_tabCount, bool a_lastLine);
FbxString PrintElements(int a_count, double* a_values, int a_tabCount, bool a_lastLine);
FbxString PrintElements(const char* a_name, int a_count, double* a_values, int a_tabCount, bool a_lastLine);
FbxString GetTabString(int a_tabCount);
FbxString PrintNewLine(int a_tabCount);
