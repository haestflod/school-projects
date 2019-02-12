class Skeleton
{
	public:
		//Name of the skeleton/bone,  fbx has them all tagged as skeletons 
		FbxString m_name;
		//The unique id
		int m_id;
		//Name of parent, kind of not needed since it has the unique id but hey it's there incase of!
		FbxString m_parentName;
		//The unique id of parent
		int m_parentID;
		//The local trs!
		double* m_localTranslation;
		double* m_localRotation;
		double* m_localScale;
		//The length of the skeleton/bone
		double m_length;
		//Dual quaternion values for the pose
		double* m_bindpose;

		void Init(FbxNode* a_node)
		{
			m_localTranslation = new double[3];
			m_localRotation = new double[3];
			m_localScale = new double[3];

			if (g_usingDualQuaternions)
			{
				m_bindpose = new double[8];
			}
			else
			{
				m_bindpose = new double[16];
			}

			m_parentName = "";
			m_name = "";
			m_parentID = -1;

			FbxSkeleton* skeleton =  (FbxSkeleton*) a_node->GetNodeAttribute();			
			m_length = skeleton->LimbLength.Get();

			for (int i = 0; i < 3; i++)
			{
				m_localTranslation[i] = a_node->LclTranslation.Get()[i];
				m_localRotation[i] = a_node->LclRotation.Get()[i];
				m_localScale[i] = a_node->LclScaling.Get()[i];
			}
			
			//Look after parent name
			FbxNode* parent = a_node->GetParent();

			if (parent != NULL && parent != g_root)
			{
				m_parentName = parent->GetName();
				m_parentID = GetNodeID(parent);
			}			
			
			m_name += a_node->GetName();
			m_id = GetNodeID(a_node);			

			int poseCount = g_scene->GetPoseCount();			

			for (int i = 0; i < poseCount; i++)
			{
				FbxPose* pose = g_scene->GetPose(i);	
				
				int poseNodeIndex = pose->Find(a_node);
				//I'd use != -1, but the examples use > -1, so maybe there's some special cases where nodeIndex is -2 or something
				if (poseNodeIndex > -1)
				{
					
					FbxAMatrix poseMatrix = GetPoseMatrix(pose, poseNodeIndex);

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
		}
};