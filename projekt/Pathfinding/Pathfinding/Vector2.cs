using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Pathfinding
{
    struct Vector2
    {
        public float X;
        public float Y;

        public Vector2(float a_x, float a_y)
        {
            X = a_x;
            Y = a_y;
        }

        public void Normalize()
        {
            float length = (float)Math.Sqrt(X * X + Y * Y);

            X /= length;
            Y /= length;
        }

        public float GetLength()
        {
            return (float)Math.Sqrt((X * X) + (Y * Y));
        }

        public float GetLengthSquared()
        {
            return X * X + Y * Y;
        }

        public static float DotProduct(Vector2 v1, Vector2 v2)
        {
            Vector2 dotVector = v1 * v2;

            return dotVector.X + dotVector.Y;            
        }

        public static Vector2 operator +(Vector2 v1, Vector2 v2)
        {
            return new Vector2(v1.X + v2.X, v1.Y + v2.Y);
        }

        public static Vector2 operator -(Vector2 v1, Vector2 v2)
        {
            return new Vector2(v1.X - v2.X, v1.Y - v2.Y);
        }

        public static Vector2 operator *(Vector2 v1, Vector2 v2)
        {
            return new Vector2(v1.X * v2.X, v1.Y * v2.Y);
        }

        public static Vector2 operator *(Vector2 v1, float a_float)
        {
            return new Vector2(v1.X * a_float, v1.Y * a_float);
        }

        public static bool operator !=(Vector2 v1, Vector2 v2)
        {
            return !(v1.X == v2.X && v1.Y == v2.Y);
        }        

        public static bool operator ==(Vector2 v1, Vector2 v2)
        {
            return v1.X == v2.X && v1.Y == v2.Y;
        }
    }
}
