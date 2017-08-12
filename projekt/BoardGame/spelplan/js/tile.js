/**
 * tile.js
 */
 //Intellisense stuff
 ///<reference path="references.js" />

// Initialize namespace.
if (window.irinori === undefined) {
    window.irinori = {};
}

//the tile type enumerator
irinori.TileType = { "Normal": 0, "Hole": 1, "ConveyorBelt": 2, "ExpressConveyorBelt": 3, "RotatingConveyorBeltRight": 4, "RotatingConveyorBeltLeft": 5, "GearRight": 6, "GearLeft": 7, "Repair": 8, "RepairAndEquip": 9 };

//the side object enumerator
irinori.SideObject = { "None": 0, "Wall": 1, "Laserx1": 2, "Laserx2": 3, "Laserx3": 4, "PusherOdd": 5, "PusherEven": 6 };

/**
 * Object: Tile (model side).
 */
 //The constructor
irinori.Tile = function (a_type, a_direction, a_topObject, a_leftObject, a_rightObject, a_bottomObject) {
    this.m_type = a_type || irinori.TileType.Normal;

    if (a_direction !== undefined)
    {
        this.m_direction = a_direction
    }
    else
    {
        this.m_direction = irinori.Direction.Top;
    }     

    this.m_top = a_topObject || irinori.SideObject.None;
    this.m_left = a_leftObject || irinori.SideObject.None;
    this.m_right = a_rightObject || irinori.SideObject.None;
    this.m_bottom = a_bottomObject || irinori.SideObject.None;

    this.r_robot = null;

    this.m_checkpoint = 0;
};

irinori.Tile.prototype.HasSideObject = function (a_direction, a_sideObject) {

    switch (a_direction) {
        case irinori.Direction.Left:
            if (this.m_left === a_sideObject) {
                return true;
            }
            break;
        case irinori.Direction.Top:
            if (this.m_top === a_sideObject) {
                return true;
            }
            break;
        case irinori.Direction.Right:
            if (this.m_right === a_sideObject) {
                return true;
            }
            break;
        case irinori.Direction.Bottom:
            if (this.m_bottom === a_sideObject) {
                return true;
            }
            break;
        //if a strange value came in
        default:
            throw "Error occured in Tile.HasSideObject! From input: a_direction: " + a_direction + ", a_sideObject: " + a_sideObject;

    }
    
    return false;
}

