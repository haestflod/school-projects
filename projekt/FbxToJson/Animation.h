class CurveInfo
{
	public:
		//The amount of frames
		int m_frameCount;
		//The current frameID
		int m_currentFrameID;

		//Curve info:
		int* m_frameNumber;
		double* m_frameValue;
		//The type of the curve -- CURRENTLY NOT IN USE!
		//Type* m_frameCurveType

		CurveInfo()
		{
			m_currentFrameID = 0;
			m_frameCount = 0;
		}

		void Init(int a_frameCount)
		{
			m_currentFrameID = 0;
			m_frameCount = a_frameCount;

			m_frameNumber = new int[m_frameCount];
			m_frameValue = new double[m_frameCount];
		}

		//Returns the framenumber that m_currentFrameID is on, returns -1 if m_currentFrameID is outside array scope
		int GetCurrentFrameNumber()
		{
			if (m_currentFrameID >= 0 && m_currentFrameID < m_frameCount)
			{
				return m_frameNumber[m_currentFrameID];
			}
			
			return -1;
		}

		//This function doesn't have the safety as GetCurrentFrameNumber has against out of array exception
		double GetCurrentFrameValue()
		{
			return m_frameValue[m_currentFrameID];
		}
};

//A combination of CurveInfo from translation & rotation
class CurveTransform
{
	public:
		//The amount of frames
		int m_frameCount;
		//the current frameID that is being handled
		int m_currentFrameID;

		//The frameNumber in each currentFrame as it's not going from 0 -> end, it can be 0, 5, 6 9 15 e.t.c.!
		int* m_frameNumber;
		//The Dualquaternion value on each currentFrame value! 
		double** m_frameValue;
	
		CurveTransform()
		{
			m_frameCount = 0;
			m_currentFrameID = 0;
		}

		//Initilizes the arrays
		void Init( int a_frameCount )
		{
			m_frameCount = a_frameCount;

			m_frameNumber = new int[m_frameCount];

			m_frameValue = new double*[m_frameCount];

			for (int i = 0; i < m_frameCount; i++)
			{
				//8 values as a dual quaternion has 8 values
				m_frameValue[i] = new double[8];
			}
		}
		
		void SetValue( int a_frameNumber, FbxDualQuaternion a_dquat)
		{
			m_frameNumber[m_currentFrameID] = a_frameNumber;
			SetDualQuaternion(a_dquat, m_frameValue[m_currentFrameID] );

			m_currentFrameID++;
		}
};

//A Channel has CurveInfo in it
class Channel
{
	public:
		CurveInfo m_x;
		CurveInfo m_y;
		CurveInfo m_z;
};

class AnimationNode
{
	public:
		FbxString m_name;
		int m_id;
		FbxString m_parentName;
		int m_parentID;
		Channel m_translation;
		Channel m_rotation;
		Channel m_scale;
		//Is like a Channel but instead of xyz CurveInfo in each channel it has only 1 single dual quaternion
		CurveTransform m_transform;

		//Node to get the local rotation & translation as default local values
		void CalculateDualQuaternionTransform(FbxNode* a_node)
		{
			FbxVector4 translation = a_node->LclTranslation.Get();
			FbxVector4 rotation = a_node->LclRotation.Get();
			
			//Get the total animation length that rotation and translation are affecting
			int animationLength = GetAnimationLength();
			//The amount of frames that has a value where the dual quaternion will change somehow
			int framesWithChangesCount = 0;
			bool hasValue = false;

			FbxVector4* translations = new FbxVector4[animationLength];
			FbxVector4* rotations = new FbxVector4[animationLength];
			bool* hasValues = new bool[animationLength];

			m_rotation.m_x.m_currentFrameID = 0;
			m_rotation.m_y.m_currentFrameID = 0;
			m_rotation.m_z.m_currentFrameID = 0;

			m_translation.m_x.m_currentFrameID = 0;
			m_translation.m_y.m_currentFrameID = 0;
			m_translation.m_z.m_currentFrameID = 0;

			for (int i = 0; i < animationLength; i++)
			{
				hasValue = false;

				//Loop through translation & rotation and check if they have value
				//Translation
				if (m_translation.m_x.GetCurrentFrameNumber() == i)
				{
					translation[0] = m_translation.m_x.GetCurrentFrameValue();
					m_translation.m_x.m_currentFrameID++;
					hasValue = true;
				}
				if (m_translation.m_y.GetCurrentFrameNumber() == i)
				{
					translation[1] = m_translation.m_y.GetCurrentFrameValue();
					m_translation.m_y.m_currentFrameID++;
					hasValue = true;
				}
				if (m_translation.m_z.GetCurrentFrameNumber() == i)
				{
					translation[2] = m_translation.m_z.GetCurrentFrameValue();
					m_translation.m_z.m_currentFrameID++;
					hasValue = true;
				}
				//Rotation
				if (m_rotation.m_x.GetCurrentFrameNumber() == i)
				{
					rotation[0] = m_rotation.m_x.GetCurrentFrameValue();
					m_rotation.m_x.m_currentFrameID++;
					hasValue = true;
				}
				if (m_rotation.m_y.GetCurrentFrameNumber() == i)
				{
					rotation[1] = m_rotation.m_y.GetCurrentFrameValue();
					m_rotation.m_y.m_currentFrameID++;
					hasValue = true;
				}
				if (m_rotation.m_z.GetCurrentFrameNumber() == i)
				{
					rotation[2] = m_rotation.m_z.GetCurrentFrameValue();
					m_rotation.m_z.m_currentFrameID++;
					hasValue = true;
				}

				if (hasValue)
				{
					framesWithChangesCount++;
				}

				translations[i] = translation;
				rotations[i] = rotation;
				hasValues[i] = hasValue;
				 
			}

			m_transform.Init(framesWithChangesCount);			

			for (int i = 0; i < animationLength; i++)
			{
				if (hasValues[i])
				{					
					m_transform.SetValue(i, FbxDualQuaternion( CreateQuaternion(rotations[i], true) , translations[i] ) );
				}
			}
			
			//Delete the arrays
			delete [] translations;
			delete [] rotations;
			delete [] hasValues;
		}
	private:
		int GetAnimationLength()
		{
			int animationLength = 0;

			int tempAnimationLength = GetAnimationLength(m_translation.m_x);
			if (tempAnimationLength > animationLength) { animationLength = tempAnimationLength; }

			tempAnimationLength = GetAnimationLength(m_translation.m_y);
			if (tempAnimationLength > animationLength) { animationLength = tempAnimationLength; }

			tempAnimationLength = GetAnimationLength(m_translation.m_z);
			if (tempAnimationLength > animationLength) { animationLength = tempAnimationLength; }

			tempAnimationLength = GetAnimationLength(m_rotation.m_x);
			if (tempAnimationLength > animationLength) { animationLength = tempAnimationLength; }

			tempAnimationLength = GetAnimationLength(m_rotation.m_y);
			if (tempAnimationLength > animationLength) { animationLength = tempAnimationLength; }

			tempAnimationLength = GetAnimationLength(m_rotation.m_z);
			if (tempAnimationLength > animationLength) { animationLength = tempAnimationLength; }

			return animationLength;			
		}

		//Returns the last value in m_frameNumber array
		int GetAnimationLength(CurveInfo a_curve)
		{
			//number + 1 because it starts on frame 0
			return a_curve.m_frameNumber[a_curve.m_frameCount - 1] + 1;
		}
};

class AnimationLayer
{
	public:
		//The nodes in a layer
		AnimationNode* m_nodes;
		//How many nodes
		int m_nodeCount;
		//The current node being written to
		int m_currentNode;

		AnimationLayer()
		{
			m_nodeCount = 0;
			m_currentNode = 0;
		}

		//Adds a node, behaves like a list from C# kinda! 
		void AddNode(AnimationNode a_node)
		{
			AnimationNode* tempNodes = m_nodes;

			//Create a new AnimationNode array that is 1 size bigger
			m_nodes = new AnimationNode[m_nodeCount + 1];

			//Transfers the temporary nodes back to the real array
			for (int i = 0; i < m_nodeCount; i++)
			{
				m_nodes[i] = tempNodes[i];
			}

			m_nodes[m_nodeCount] = a_node;			

			m_nodeCount++;					
		}
};

class Animation
{
	public:
		//The name of the animation
		FbxString m_name;
		//Amount of different layers
		int m_layerCount;
		//The current layer that is being worked on
		int m_currentLayer;
		//The different layers
		AnimationLayer* m_layers;
		//Amount of frames in the animation
		int m_frameCount;
		
		void Init(int a_layerCount, FbxString a_name, FbxTimeSpan a_timeSpan, double a_deltaFrameTime)
		{
			m_layerCount = a_layerCount;

			m_currentLayer = 0;

			m_name = a_name;

			m_layers = new AnimationLayer[m_layerCount];			
			//
			m_frameCount = (int)(a_timeSpan.GetDuration().GetSecondDouble() / a_deltaFrameTime);
			//Has to add 1 more frame cause it gives length - 1 the calculation above
			m_frameCount += 1;
		}
};