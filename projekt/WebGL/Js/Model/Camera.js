///<reference path="References.js" />
if (window.Irinori === undefined)  window.Irinori = {};

Irinori.Camera = function ( a_cameraPosition, a_yawAngle, a_pitchAngle, a_rollAngle, a_width, a_height )
{
    ///<summary> Creates the camera and sets matrixes </summary>
    ///<param type="vec3" name="a_cameraPosition" > The position the camera has </param> 
    ///<param type="float" name="a_yawAngle" > Horizontal rotation in radians </param>
    ///<param type="float" name="a_pitchAngle" > Vertical rotation in radians </param>    
    ///<param type="float" name="a_rollAngle" >Spin around in radians</param>
    ///<param type="int" name="a_width" > Width of viewport </param>
    ///<param type="int" name="a_height" > Height of the viewport </param>

    this.m_projectionMatrix = Irinori.Math.GetIdentity4x4Matrix();
    this.m_viewMatrix = Irinori.Math.GetIdentity4x4Matrix();

    this.m_projViewMatrix = mat4.create();

    //The "up" vector in mat4.lookAt creation
    this.m_vectorUp = vec3.create([0,1,0]);
    this.m_cameraPosition = a_cameraPosition;
    this.m_lookAtPoint = vec3.create([0,0,0]);
    //Used to calculate upvector, camera direction, camera right direction
    this.m_cameraDirectionQuat = quat4.create();

    this.m_cameraDir = vec3.create();
    //The strafe to left direction
    this.m_cameraRightDir = vec3.create();    

    //Perspective matrix stuff!
    this.m_fov;
    this.m_width;
    this.m_height;
    this.m_aspectRatio;
    
    //Rotation around axises,
    //around z axis
    this.m_yaw = a_yawAngle;
    //around x
    this.m_pitch = a_pitchAngle;
    //around y
    this.m_roll = a_rollAngle;

    //How many radians per second
    this.m_rotateSpeed = Math.PI * 0.5;
    //How many units per second
    this.m_moveSpeed = 3;
    
    //When a vec3 is needed to store values so one doesn't have to be created all the time!
    this.m_tempVec3 = vec3.create();

    //Functions called in camera constructor
    this.SetCameraDirection();
    this.SetViewMatrix();
    this.SetProjectionMatrix(90, a_width, a_height);       
};
//Sets the ViewMatrix
Irinori.Camera.prototype.SetViewMatrix = function()
{
    mat4.lookAt(this.m_cameraPosition, this.m_lookAtPoint, this.m_vectorUp, this.m_viewMatrix  );

    this.SetViewProjMatrix();    
};
//Sets the projection matrix by accepting a FoV, canvas width, canvas height
Irinori.Camera.prototype.SetProjectionMatrix = function(a_fov, a_width, a_height)
{
    this.m_fov = a_fov;
    this.m_width = a_width;
    this.m_height = a_height;

    this.m_aspectRatio = this.m_width / this.m_height;

    this.UpdateProjectionMatrix();
};
//Updates the projectionmatrix and viewproj matrix
Irinori.Camera.prototype.UpdateProjectionMatrix = function()
{
    mat4.perspective(this.m_fov, this.m_aspectRatio, 0.1, 1000, this.m_projectionMatrix);

    this.SetViewProjMatrix();
};
//TODO: evaluate if neccesary
Irinori.Camera.prototype.SetViewProjMatrix = function()
{             
     mat4.multiply(this.m_viewMatrix, this.m_projectionMatrix, this.m_projViewMatrix);    
};

//Sets the m_cameraDir vector based on xyz rotation
Irinori.Camera.prototype.SetCameraDirection = function()
{        
    this.m_cameraDirectionQuat = Irinori.Math.Vector3.RadianToQuaternion( [this.m_pitch, this.m_yaw, this.m_roll] );

    //Set the "forward" direction
    quat4.multiplyVec3(this.m_cameraDirectionQuat, Irinori.Math.Vector3.Forward, this.m_cameraDir);
    
    //Sets the right and up vector!
    quat4.multiplyVec3( this.m_cameraDirectionQuat, Irinori.Math.Vector3.Right , this.m_cameraRightDir );
    quat4.multiplyVec3( this.m_cameraDirectionQuat, Irinori.Math.Vector3.Up, this.m_vectorUp );
    
    //Sets look at point
    vec3.add(this.m_cameraPosition, this.m_cameraDir, this.m_lookAtPoint);    
};
//Rotate around X-axis
Irinori.Camera.prototype.RotateVertical = function(a_radian)
{     
    this.m_pitch += a_radian;
};
//Rotating around Y-axis
Irinori.Camera.prototype.RotateHorizontal = function(a_radian)
{
    this.m_yaw += a_radian;
};
//Strafes the camera left
Irinori.Camera.prototype.MoveLeft = function(a_elapsedTime)
{
    //Camera Direction + 90 degrees
    vec3.scale( this.m_cameraRightDir, a_elapsedTime * this.m_moveSpeed, this.m_tempVec3 );
    vec3.add(this.m_cameraPosition, this.m_tempVec3);
    vec3.add(this.m_lookAtPoint, this.m_tempVec3);       
};
//Strafes it right!
Irinori.Camera.prototype.MoveRight = function(a_elapsedTime)
{
    //Camera Direction - 90 degrees
    vec3.scale(this.m_cameraRightDir, a_elapsedTime * -this.m_moveSpeed, this.m_tempVec3);
    vec3.add(this.m_cameraPosition, this.m_tempVec3);
    vec3.add(this.m_lookAtPoint, this.m_tempVec3);       
};

Irinori.Camera.prototype.MoveForward = function(a_elapsedTime)
{    
    vec3.scale(this.m_cameraDir, a_elapsedTime * this.m_moveSpeed, this.m_tempVec3);
    vec3.add(this.m_cameraPosition, this.m_tempVec3);
    vec3.add(this.m_lookAtPoint, this.m_tempVec3);      
};

Irinori.Camera.prototype.MoveBackwards = function(a_elapsedTime)
{
    vec3.scale(this.m_cameraDir, a_elapsedTime * -this.m_moveSpeed, this.m_tempVec3);
    vec3.add(this.m_cameraPosition, this.m_tempVec3);
    vec3.add(this.m_lookAtPoint, this.m_tempVec3);   
};
//Rotates camera upwards, like looking towards sky!
Irinori.Camera.prototype.TurnUpwards = function(a_elapsedTime)
{
    this.RotateVertical(-this.m_rotateSpeed * a_elapsedTime);
};
//Like looking at the ocean if you're above it!
Irinori.Camera.prototype.TurnDownwards = function(a_elapsedTime)
{
    this.RotateVertical(this.m_rotateSpeed * a_elapsedTime);
};

Irinori.Camera.prototype.TurnLeft = function(a_elapsedTime)
{    
    this.RotateHorizontal(this.m_rotateSpeed * a_elapsedTime);
};

Irinori.Camera.prototype.TurnRight = function(a_elapsedTime)
{
    //Seems that the pitch positive rotation is to the left so negative rotatespeed!
    this.RotateHorizontal(-this.m_rotateSpeed * a_elapsedTime);
};

