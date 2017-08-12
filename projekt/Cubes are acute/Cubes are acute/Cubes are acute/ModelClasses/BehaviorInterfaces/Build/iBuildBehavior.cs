using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Cubes_are_acute.ModelClasses.Units;
using Microsoft.Xna.Framework;

namespace Cubes_are_acute.ModelClasses.BehaviorInterfaces
{
    interface iBuildBehavior
    {
        void AddToBuildQueue(ThingType a_thingy);
        void AddToBuildQueue(ThingType a_thingy, Vector3 a_position);

        void DoBuildBehavior(float a_elapsedTime);

        void StartBuild();

        void FinishBuild();

        bool UpdateBuildTimer(float a_elapsedTime);

        void CancelBuild();

        void Destroyed();

        bool IsBuilding();

        int GetAspiringSacrificeCount();        

        void AddSacrifice(Thing a_sacrifice);
        void RemoveSacrifice();
        void RemoveAllSacrifices();

        int GetSacrificeCount();

        int GetSupplyValue();

        Vector3 GetSize();

        float GetBuildRangeSquared();

        float GetBuildTimer();

        ThingType GetBuildingType();

        Vector3 GetSpawnPosition();
    }
}
