class FbxData
{
	public:	
		//The meshes it can find
		Mesh* m_meshes;
		//Amount of meshes
		int m_meshCount;
		//What current meshID it's on when 
		int m_currentMeshID;

		//The skeletons in a fbx scene
		Skeleton* m_skeletons;
		//The amount of skeletons
		int m_skeletonCount;
		//What skeleton is currently being created
		int m_currentSkeletonID;

		//The animation data a.k.a. Takes data
		Animation* m_animations;
		//The amount of animations / takes
		int m_animationCount;
		//The current animation ID that is being 
		int m_currentAnimationID;
		//The FPS / Framerate that scene is using
		double m_frameRate;
		//Time between 2 frames (1 / m_frameRate), can be used to get what frame it is after x time has passed by taking secondsPassed / deltaFrameTime
		double m_deltaFrameTime;
		//Resets all variables
		void Reset()
		{			
			m_meshCount = 0;
			m_currentMeshID = 0;
			m_skeletonCount = 0;
			m_currentSkeletonID = 0;
			m_animationCount = 0;
			m_currentAnimationID = 0;
			m_frameRate = 0;
			m_deltaFrameTime = 0;
		}

		//This function checks if meshes, skeletons and animations are done by checking the current variables are equaled to their count
		bool IsDataDone()
		{
			return (m_currentMeshID == m_meshCount && m_currentSkeletonID == m_skeletonCount && m_currentAnimationID == m_animationCount);

		}
};