//Extern g_root from converter.cpp (the root node in the scene)
extern FbxNode* g_root;
extern FbxScene* g_scene;


extern bool g_usingDualQuaternions;

//Extern function from converter.h to get ID of the node from the "node map"
extern int GetNodeID(FbxNode* a_node);
extern FbxAMatrix GetPoseMatrix(FbxPose* a_pose, int a_poseIndex);

extern FbxAMatrix GetGlobalPosition(FbxNode* a_node, FbxPose* a_pose, FbxAMatrix* a_parentGlobalPosition);

extern FbxAMatrix GetGeometry(FbxNode* a_node);

extern void SetDualQuaternion(FbxAMatrix a_matrix, double* a_dest);
extern void SetDualQuaternion(FbxDualQuaternion a_dualQuat, double* a_dest);

extern void SetMatrix(FbxAMatrix a_matrix, double* a_dest);

extern FbxQuaternion CreateQuaternion( FbxVector4 a_rotation, bool a_isEuler);

extern void AddStatusMessage(const wchar_t* a_message);

class Bone
{
	public:
		//The amount of link indices
		int m_linkIndicesCount;
		//The index pointing to mesh vertex in vertices array
		int* m_linkIndices;
		//The value it affects each linkIndex, so as many weightvalues as m_linkIndicesCount
		double* m_weightValues;
		//Name of bone
		FbxString m_name;
		int m_id;
		//Name of parent bone
		FbxString m_parentName;
		int m_parentID;

		bool m_usingDualQuat;

		//The transform matrix 4x4
		double* m_transformMatrix;

		double* m_transformDualQuat;
		//The Transform Matrix in fbx file in the cluster
		double* m_bindTransform;
		//The TransformLink Matrix in the fbx file in the cluster
		double* m_boneTransformLink;
	
		Bone()
		{
			m_name = "";
			m_linkIndicesCount = 0;
			m_parentName = "";
			m_parentID = -1;

			if (g_usingDualQuaternions)
			{
				m_transformDualQuat = new double[8];
				m_bindTransform = new double[8];
				//m_boneTransformLink = new double[8];
			}
			else
			{
				m_transformMatrix = new double[16];
				m_bindTransform = new double[16];
				//m_boneTransformLink = new double[16];
			}	
			
		}

		void Init(FbxCluster* a_cluster, FbxMesh* a_mesh)
		{
			FbxNode* node = a_cluster->GetLink();
			FbxNode* parentNode = node->GetParent();			

			m_name = node->GetName();
			m_id = GetNodeID(node);

			//Check if parentNode exists and that it's not root node
			if (parentNode != NULL && parentNode != g_root )
			{
				m_parentName = parentNode->GetName();
				m_parentID = GetNodeID(parentNode);
			}			

			m_linkIndicesCount = a_cluster->GetControlPointIndicesCount();

			//These two arrays are needed because they pointer gets destroyed, another way is to destroy the scene after exporting
			int* linkIndices = a_cluster->GetControlPointIndices();

			double* weightValues = a_cluster->GetControlPointWeights();	

			m_linkIndices = new int[m_linkIndicesCount];

			m_weightValues = new double[m_linkIndicesCount];

			for (int i = 0; i < m_linkIndicesCount; i++)
			{
				m_linkIndices[i] = linkIndices[i];

				m_weightValues[i] = weightValues[i];
			}	

			SetGlobalPositionMatrix(node, a_cluster, a_mesh);		
		}

	private:
		void SetGlobalPositionMatrix(FbxNode* a_node, FbxCluster* a_cluster, FbxMesh* a_mesh)
		{			
			//The final matrix
			FbxAMatrix transformMatrix;	
			
			FbxCluster::ELinkMode lClusterMode = a_cluster->GetLinkMode();

			FbxAMatrix referenceGlobalInitPosition;
			FbxAMatrix referenceGlobalCurrentPosition;
			FbxAMatrix associateGlobalInitPosition;
			FbxAMatrix associateGlobalCurrentPosition;
			FbxAMatrix clusterGlobalInitPosition;
			FbxAMatrix clusterGlobalCurrentPosition;

			FbxAMatrix referenceGeometry;
			FbxAMatrix associateGeometry;
			FbxAMatrix clusterGeometry;

			FbxAMatrix clusterRelativeInitPosition;
			FbxAMatrix clusterRelativeCurrentPositionInverse;

			//Global position Matrix
			FbxAMatrix globalPosition;
			FbxAMatrix globalParentPosition;

			FbxAMatrix geometryOffset;
			FbxAMatrix globalOffPosition;

			//Get the scene so the poses are retrievable
			//FbxScene* scene = a_cluster->GetScene();
			
			int poseCount = g_scene->GetPoseCount();

			for (int i = 0; i < poseCount; i++)
			{
				FbxPose* pose = g_scene->GetPose(i);	
				
				//I'd use != -1, but the examples use > -1, so maybe there's some special cases where nodeIndex is -2 or something
				if (pose->Find(a_node) > -1)
				{

					FbxAMatrix matrix = GetPoseMatrix( pose, pose->Find( a_node ) );

					//Calculate the global position of the mesh I guess!
					globalPosition = GetGlobalPosition(a_mesh->GetNode(), pose, &globalParentPosition );
					geometryOffset = GetGeometry(a_mesh->GetNode());
					globalOffPosition = globalPosition * geometryOffset;

					
					a_cluster->GetTransformMatrix(referenceGlobalInitPosition);						
					//Seemed to get an idendity matrix when I had globalPosition
					referenceGlobalCurrentPosition = globalOffPosition;
					// Multiply lReferenceGlobalInitPosition by Geometric Transformation
					referenceGeometry = GetGeometry(a_mesh->GetNode());
					referenceGlobalInitPosition *= referenceGeometry;

					// Get the link initial global position and the link current global position.
					a_cluster->GetTransformLinkMatrix(clusterGlobalInitPosition);
					//a_pose parameter is NULL because result will be identity matrix if it isn't
					clusterGlobalCurrentPosition = GetGlobalPosition(a_cluster->GetLink(), NULL, NULL);

					// Compute the initial position of the link relative to the reference.
					clusterRelativeInitPosition = clusterGlobalInitPosition.Inverse() * referenceGlobalInitPosition;

					// Compute the current position of the link relative to the reference.
					clusterRelativeCurrentPositionInverse = referenceGlobalCurrentPosition.Inverse() * clusterGlobalCurrentPosition;

					// Compute the shift of the link relative to the reference.
					transformMatrix = referenceGlobalCurrentPosition.Inverse();//clusterRelativeCurrentPositionInverse * clusterRelativeInitPosition;
													
					break;
					
					//mesh & currentPos has to be calculated somehow
					//TransformMatrix & TransformLink 
					//transform = ( inverse(meshCurrentPosition) * currentPosition ) *  (inverse(TransformMatrix * GeometryMatrix) * TransformLink)  
				}
				
			}

			if (g_usingDualQuaternions)
			{	
				SetDualQuaternion(transformMatrix, m_transformDualQuat);
				//clusterInitPosition.inverse * referenceInitPosition
				SetDualQuaternion(clusterRelativeInitPosition, m_bindTransform);
				//SetDualQuaternion(referenceGlobalInitPosition, m_boneTransform);
			}
			else
			{
				SetMatrix(transformMatrix, m_transformMatrix);
				//SetMatrix(clusterGlobalInitPosition, m_boneTransformLink);
				//SetMatrix(referenceGlobalInitPosition, m_bindTransform);
			}

			
		}
};