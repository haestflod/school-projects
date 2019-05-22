/// <reference path="References.js" />
if (!window.Irinori) window.Irinori = {};
if (!window.Irinori.Math)  window.Irinori.Math = {};
//Create the DualQuat object
if (!window.Irinori.Math.DualQuat) window.Irinori.Math.DualQuat = {};
//The vector3 object
if (!window.Irinori.Math.Vector3) window.Irinori.Math.Vector3 = {};

//This Math Library mainly extends glMatrix what it's currently missing

Irinori.Math.ConvertDegreeToRadian = function(a_degree)
{    
    return Math.PI * a_degree / 180;
};

/********************
    Dual Quaternion
********************/

//Copies values from a_dq otherwise creates an identity DQ
Irinori.Math.DualQuat.Create = function ( a_dq )
{
    var dq = new Float32Array(8);

    //If there's a dual quaternion to copy values from
    if (a_dq)
    {    
        dq[0] = a_dq[0];
        dq[1] = a_dq[1];
        dq[2] = a_dq[2];
        dq[3] = a_dq[3];
        dq[4] = a_dq[4];
        dq[5] = a_dq[5];
        dq[6] = a_dq[6];
        dq[7] = a_dq[7];
    }
    //If no dual quaternion wants to be copied, return an identity DQ
    else
    {
        dq[3] = 1;
    }

    return dq;
};

//Possibly garbage friendly way of setting a dual quaternion and reference friendly because if something is pointing to a_dest the reference does not change
Irinori.Math.DualQuat.set = function( a_dq, a_dest )
{
    a_dest[0] = a_dq[0];
    a_dest[1] = a_dq[1];
    a_dest[2] = a_dq[2];
    a_dest[3] = a_dq[3];
    a_dest[4] = a_dq[4];
    a_dest[5] = a_dq[5];
    a_dest[6] = a_dq[6];
    a_dest[7] = a_dq[7];

    return a_dest;
};

//This function is based on Ladislav Kavan's code, can be found at: http://isg.cs.tcd.ie/projects/DualQuaternions/
Irinori.Math.DualQuat.CreateFromQuatTrans = function( a_quat, a_trans )
{   
    //The dual quaternion to be retured
    var dq = new Float32Array(8);
   
    //Caches the values to speed it up a bit!
    var qx = a_quat[0], qy = a_quat[1], qz = a_quat[2], qw = a_quat[3],
        tx = a_trans[0], ty = a_trans[1], tz = a_trans[2];
    //First part is the quaternion
    dq[0] = qx;
    dq[1] = qy;
    dq[2] = qz;
    dq[3] = qw;
    //Second part is the translation   
    dq[4] = 0.5 * (tx * qw + ty * qz - tz * qy);
    dq[5] = 0.5 * (-tx * qz + ty * qw + tz * qx);
    dq[6] = 0.5 * (tx * qy - ty * qx + tz * qw);
    dq[7]= -0.5 * (tx * qx + ty * qy + tz * qz);

    return dq;
};

//DEBUG: probably
//Returns an array with quaternion at [0] and translation at [1]
Irinori.Math.DualQuat.GetQuatTrans = function( a_dquat )
{
    
    var qx = a_dquat[0], qy = a_dquat[1], qz = a_dquat[2], qw = a_dquat[3],
        sqx = a_dquat[4], sqy = a_dquat[5], sqz = a_dquat[6], sqw = a_dquat[7];

    var quat = new Float32Array(4);
    quat[0] = qx;
    quat[1] = qy;
    quat[2] = qz;
    quat[3] = qw;

    /*  
    // translation vector:
    t[0] = 2.0*(-dq[1][0]*dq[0][1] + dq[1][1]*dq[0][0] - dq[1][2]*dq[0][3] + dq[1][3]*dq[0][2]);
    t[1] = 2.0*(-dq[1][0]*dq[0][2] + dq[1][1]*dq[0][3] + dq[1][2]*dq[0][0] - dq[1][3]*dq[0][1]);
    t[2] = 2.0*(-dq[1][0]*dq[0][3] - dq[1][1]*dq[0][2] + dq[1][2]*dq[0][1] + dq[1][3]*dq[0][0]);
    */
    var trans = new Float32Array(3);
    trans[0] = 2 * ( -sqw * qx + sqx * qw - sqy * qz + sqz * qy );
    trans[1] = 2 * ( -sqw * qy + sqx * qz + sqy * qw - sqz * qx );
    trans[2] = 2 * ( -sqw * qz + sqx * qy + sqy * qx + sqz * qw );

    return [ quat, trans ];
};


//Multiplies a with b, if a_dest is not set it writes result to a
Irinori.Math.DualQuat.Multiply = function( a, b , a_dest )
{
    ///<summary>Multiplies a with b. If a_dest is not given value is written to a</summary>
    ///<param name="a_dest" type="DualQuat">OPTIONAL, if undefined result is written to a </param>
    if (!a_dest) { a_dest = a; }
    
    //Cache the variables to make it faster!
    //q = first quaternion,  sq = second quaternion
    var aqx = a[0], aqy = a[1], aqz = a[2], aqw = a[3], asqx = a[4], asqy = a[5], asqz = a[6], asqw = a[7],
        bqx = b[0], bqy = b[1], bqz = b[2], bqw = b[3], bsqx = b[4], bsqy = b[5], bsqz = b[6], bsqw = b[7];

    //first quat = aQ * bQ    
    a_dest[0] = aqw * bqx + aqx * bqw + aqy * bqz - aqz * bqy ;
    a_dest[1] = aqw * bqy + aqy * bqw + aqz * bqx - aqx * bqz ;
    a_dest[2] = aqw * bqz + aqz * bqw + aqx * bqy - aqy * bqx ;
    a_dest[3] = aqw * bqw - aqx * bqx - aqy * bqy - aqz * bqz ;
    //The commented function description is not 100% correct!
    //second quat = bQ * aSQ + aQ * bSQ
    a_dest[4] = asqw *  bqx + asqx * bqw + asqy * bqz - asqz * bqy + aqw *  bsqx + aqx * bsqw + aqy * bsqz - aqz * bsqy ;
    a_dest[5] = asqw *  bqy + asqy * bqw + asqz * bqx - asqx * bqz + aqw *  bsqy + aqy * bsqw + aqz * bsqx - aqx * bsqz ;
    a_dest[6] = asqw *  bqz + asqz * bqw + asqx * bqy - asqy * bqx + aqw *  bsqz + aqz * bsqw + aqx * bsqy - aqy * bsqx ;
    a_dest[7] = asqw *  bqw - asqx * bqx - asqy * bqy - asqz * bqz + aqw *  bsqw - aqx * bsqx - aqy * bsqy - aqz * bsqz ;

    return a_dest;   
    
};
//Inverses a dualquaternion
Irinori.Math.DualQuat.Inverse = function( a_dq )
{
    //I'm not sure this function is correct but have seemed to work so far!
    var ax = a_dq[0], ay = a_dq[1], az = a_dq[2], aw = a_dq[3],
        bx = a_dq[4], by = a_dq[5], bz = a_dq[6], bw = a_dq[7],
        dotA = ax*ax + ay*ay + az*az + aw*aw,
        invDotA = dotA ? 1.0/dotA : 0;
         
    a_dq[0] *= -invDotA;
    a_dq[1] *= -invDotA;
    a_dq[2] *= -invDotA;
    a_dq[3] *= invDotA;

    a_dq[4] *= -invDotA;
    a_dq[5] *= -invDotA;
    a_dq[6] *= -invDotA;
    a_dq[7] *= invDotA;
    
    return a_dq; 
};
//Get an identity dq
Irinori.Math.DualQuat.GetIdentity = function()
{
    //0,0,0,1
    //0,0,0,0
    var dq = new Float32Array(8);
    dq[3] = 1;
    
    return dq;
};

//Lerp - Interpolated between a_start to a_targte based on a_lerp,  a value from 0-1
Irinori.Math.DualQuat.Lerp = function( a_start, a_target, a_slerp )
{
    //Theese should be to find bugs with the animation code thus should never happen!
    if (a_slerp > 1)
    {
        a_slerp = 1;
        console.warn( "DualQuat.Slerp: a_slerp was larger than 1.0");
    }
    else if (a_slerp < 0)
    {
        a_slerp = 0;
        console.warn( "DualQuat.Slerp: a_slerp was less than 0.0");
    }
    /*
    Simplification of formula!

    (1 - a_slerp) * a_start + a_slerp * a_target
    --------------------------------------------   (divided by)
    || Length of above formula! ||
    */
    var startScalar = 1 - a_slerp;

    //Copies the dq values from a_start & a_target and scales them based on a_slerp
    //q = first quaternion, sq = second quaternion of the dq
    var startqx = a_start[0] * startScalar, startqy = a_start[1] * startScalar, startqz = a_start[2] * startScalar, startqw = a_start[3] * startScalar,
        startsqx = a_start[4] * startScalar, startsqy = a_start[5] * startScalar, startsqz = a_start[6] * startScalar, startsqw = a_start[7] * startScalar,
        //the target quaternion
        targetqx = a_target[0] * a_slerp, targetqy = a_target[1] * a_slerp, targetqz = a_target[2] * a_slerp, targetqw = a_target[3] * a_slerp, 
        targetsqx = a_target[4] * a_slerp, targetsqy = a_target[5] * a_slerp, targetsqz = a_target[6] * a_slerp, targetsqw = a_target[7] * a_slerp;

    //Calculates the Q1 + Q2 with their scale modifiers
    var qx = startqx + targetqx, qy = startqy + targetqy, qz = startqz + targetqz, qw = startqw + targetqw,
        sqx = startsqx + targetsqx, sqy = startsqy + targetsqy, sqz = startsqz + targetsqz, sqw = startsqw + targetsqw;
    
    var length = 1 / Math.sqrt( qx * qx + qy * qy + qz *qz + qw * qw + sqx * sqx + sqy * sqy + sqz * sqz + sqw * sqw );

    var dquat = new Float32Array(8);
    dquat[0] = qx * length;
    dquat[1] = qy * length;
    dquat[2] = qz * length;
    dquat[3] = qw * length;
    dquat[4] = sqx * length;
    dquat[5] = sqy * length;
    dquat[6] = sqz * length;
    dquat[7] = sqw * length;

    return dquat;
};

/********************
    Vector3
********************/

Irinori.Math.Vector3.Forward = new Float32Array( [0, 0, 1] );
Irinori.Math.Vector3.Right = new Float32Array( [1, 0, 0] );
Irinori.Math.Vector3.Up = new Float32Array( [0, 1, 0] );

//Returns the length of a vector3 squared
Irinori.Math.Vector3.LengthSquared = function ( a_vec )
{
    var x = a_vec[0], y = a_vec[1], z = a_vec[2];
    return x * x + y * y + z * z;
};

//Had to make this function myself as glMatrix doesn't have it :(
//Source: http://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
Irinori.Math.Vector3.RadianToQuaternion = function ( a_vec )
{
    ///<summary>It assumes the values are in radians</summary>
    var x = a_vec[0] * 0.5;
    var y = a_vec[1] * 0.5;
    var z = a_vec[2] * 0.5;
    var sx, cx, sy, cy, sz, cz;

    sx = Math.sin( x ); cx = Math.cos( x );
    sy = Math.sin( y ); cy = Math.cos( y );
    sz = Math.sin( z ); cz = Math.cos( z );

    var quaternion = new Float32Array( 4 );

    quaternion[0] = ( sx * cy * cz ) - ( cx * sy * sz );
    quaternion[1] = ( cx * sy * cz ) + ( sx * cy * sz );
    quaternion[2] = ( cx * cy * sz ) - ( sx * sy * cz );
    quaternion[3] = ( cx * cy * cz ) + ( sx * sy * sz );

    return quaternion;
};

//Creates a quaternion from euler degrees
Irinori.Math.Vector3.EulerToQuaternion = function ( a_vec )
{
    return Irinori.Math.Vector3.RadianToQuaternion( [Irinori.Math.ConvertDegreeToRadian( a_vec[0] ),
                                                    Irinori.Math.ConvertDegreeToRadian( a_vec[1] ),
                                                    Irinori.Math.ConvertDegreeToRadian( a_vec[2] )
    ] );
};

//Calculates a quaternion that represents the rotation between vector1 -> vector2
//Source: http://www.gamedev.net/topic/429507-finding-the-quaternion-betwee-two-vectors/
Irinori.Math.Vector3.GetRotationToQuaternion = function ( a_start, a_end, a_isUnit )
{
    var quat = new Float32Array(4);
    var newVec = vec3.cross( a_start, a_end );
    quat[0] = newVec[0], quat[1] = newVec[1], quat[2] = newVec[2];
    var dotprod = vec3.dot( a_start, a_end );

    if ( a_isUnit )
    {
        quat[3] = 1 + dotprod;
    }
    else
    {        
        quat[3] = sqrt( Irinori.Math.Vector3.LengthSquared( a_start) + Irinori.Math.Vector3.LengthSquared(a_end)  ) + dotprod;
    }
    

    return quat;
};

//Returns an identity quaternion
Irinori.Math.GetIdentityQuaternion = function()
{
    //0 0 0 1
    var quat = new Float32Array(4);
    quat[3] = 1;
    return quat;
};
//Returns an Identity mat4x4
Irinori.Math.GetIdentity4x4Matrix = function()
{
    //1 0 0 0
    //0 1 0 0
    //0 0 1 0
    //0 0 0 1
    var m = new Float32Array(16);

    m[0] = 1;
    m[5] = 1;
    m[10] = 1;
    m[15] = 1;

    return m;
};
