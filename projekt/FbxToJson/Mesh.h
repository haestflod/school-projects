class Mesh
{
	public:
		//Name of the mesh
		FbxString m_name;
		//Unique ID of the mesh
		int m_id;
		//The vertex array
		double* m_vertices;
		//Amount of vertexes in total
		int m_verticeCount;
		//Amount of faces/polyfons/triangles
		int m_facesCount;
		//Amount of vertexes per face, 3 for triangles 4 for quads e.t.c.
		int m_verticesPerFace;
		//The vertex index on each face, should be m_facesCount * m_verticesPerFace
		int* m_verticeIndex;
		//Amount of UV channels
		int m_uvChannelCount;
		//The coordinates in each channel
		double** m_uvCoordinates;
		//The vertex normals
		double* m_normals;
		//Amount of bones / deformers
		int m_boneCount;
		//What bone that's currently being initiated 
		int m_currentBoneIndex;
		//The bones that is tied to a mesh
		Bone* m_bones;
		//The local TRS of the mesh, without it all meshes would be at origo
		double* m_localTranslation;
		double* m_localRotation;
		double* m_localScale;

		double* m_bindpose;

		Mesh()
		{
			//Only handling triangles for now
			m_verticesPerFace = 3;
			m_boneCount = 0;
			m_verticeCount = 0;
			m_facesCount = 0;
			m_uvChannelCount = 0;
			m_currentBoneIndex = 0;
			m_name = "";
			m_id = -1;
		}

		//Only initiates the arrays that are to be used so they exist, except the TRS values which are set in the function
		void Init(FbxMesh* a_fbxMesh, FbxVector4 a_lclTranslation, FbxVector4 a_lclRotation,  FbxVector4 a_lclScale, FbxNode* a_node)
		{				
			//Create the TRS arrays
			m_localTranslation = new double[3];
			m_localRotation = new double[3];
			m_localScale = new double[3];

			//Set the TRS arrays
			for (int i = 0; i < 3; i++)
			{
				m_localTranslation[i] = a_lclTranslation[i];
				m_localRotation[i] = a_lclRotation[i];
				m_localScale[i] = a_lclScale[i];
			}

			m_verticeCount = a_fbxMesh->GetControlPointsCount();
			m_facesCount = a_fbxMesh->GetPolygonCount();

			//It's 3 float coordinates per vertex
			m_vertices = new double[m_verticeCount * m_verticesPerFace];
			m_verticeIndex = new int[m_facesCount * m_verticesPerFace];

			//Initilize the UV arrays (if it has UV maps) 
			if (a_fbxMesh->GetElementUVCount() > 0)
			{
				//Sets the amount of texture coordinate layers
				m_uvChannelCount = a_fbxMesh->GetElementUVCount();
				
				//Initiates the array that holds the uv coordinates, each index is 1 uv channel
				m_uvCoordinates = new double*[m_uvChannelCount];

				for (int l = 0; l < m_uvChannelCount; l++)
				{					
					m_uvCoordinates[l] = new double[m_facesCount * 2 * m_verticesPerFace];
				}
			}	

			//Initilize the Normal array 
			//There's amount of faces * amount of vertexes amount of normals
			m_normals = new double[m_facesCount * m_verticesPerFace];
			
			//Gets the amount of deformers affecting the model, 1 deformer is one bone basicly
			int deformerCount = a_fbxMesh->GetDeformerCount(FbxDeformer::eSkin);
			//Sets boneCount to 0 incase it was set int default value
			m_boneCount = 0;			
			
			if (deformerCount > 0)
			{
				int boneCount = 0;
				int clusterCount = 0;				
				
				for (int i = 0; i < deformerCount; i++)
				{
					//Not sure what this does, cause seems that several bones seemed to just create more skincount / bone count
					clusterCount = ((FbxSkin *) a_fbxMesh->GetDeformer(i, FbxDeformer::eSkin))->GetClusterCount();

					//Most often this is just ++ I think... :p
					m_boneCount += clusterCount;
				}

				m_bones = new Bone[m_boneCount];
			}

			if (g_usingDualQuaternions)
			{
				m_bindpose = new double[8];
			}
			else
			{
				m_bindpose = new double[16];
			}

			int poseCount = g_scene->GetPoseCount();
			bool poseFound = false;

			for (int i = 0; i < poseCount; i++)
			{
				FbxPose* pose = g_scene->GetPose(i);					

				int poseNodeIndex = pose->Find( a_node );
				//I'd use != -1, but the examples use > -1, so maybe there's some special cases where nodeIndex is -2 or something
				if (poseNodeIndex > -1)
				{
					FbxAMatrix poseMatrix = GetPoseMatrix(pose, poseNodeIndex);
					poseFound = true;
					if (g_usingDualQuaternions)
					{
						SetDualQuaternion(poseMatrix, m_bindpose);
					}
					else
					{
						SetMatrix(poseMatrix, m_bindpose);
					}	

					break;
				}
			}

			//If it doesn't find a bind pose... ERROR... but ... program shouldn't crash
			if (!poseFound)
			{
				AddStatusMessage(L"\tWARNING: No bindpose was found\r\n");
				if (g_usingDualQuaternions)
				{
					SetDualQuaternion(FbxAMatrix(), m_bindpose);
				}
				else
				{
					SetMatrix(FbxAMatrix(), m_bindpose);
				}	
			}

		}
		
};