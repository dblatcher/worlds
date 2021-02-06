interface Point {x:number, y:number}

/**
 * Calculate the direction of an [x,y] vector
 * 
 * @param x the x value of the vector
 * @param y the y value of the vector
 * @returns the direction in radians
 */
function getDirection(x: number, y: number) {
    if (x == 0 && y == 0) { return 0; }
    if (y != 0 && x != 0) {
        if (y > 0) {
            return Math.atan(x / y);
        }
        if (y < 0) {
            return Math.PI + Math.atan(x / y);
        }
    }
    if (y == 0 && x != 0) {
        return x < 0 ? Math.PI * 1.5 : Math.PI * 0.5;
    }
    if (x == 0 && y != 0) {
        return y > 0 ? 0 : Math.PI * 1;
    }
}

/**
 * Calculate the magnitude of an [x,y] vector, using pythagoras' theorum
 * 
 * @param x the x value of the vector
 * @param y the y value of the vector
 * @returns the vector magnitude
 */
function getMagnitude(x: number, y: number) {
    return Math.sqrt((x * x) + (y * y))
}



function getDistanceBetweenPoints(point1:Point, point2:Point) {
    let dx = point1.x - point2.x, dy=point1.y-point2.y;
    return getMagnitude(dx,dy)
}

function getHeadingFromPointToPoint (origin:Point, destination:Point) {
    let dx = origin.x - destination.x, dy=origin.y-destination.y;
    return getDirection(dx,dy)
}

function getVectorX(magnitude: number, direction: number) { return magnitude * Math.sin(direction) }

function getVectorY(magnitude: number, direction: number) { return magnitude * Math.cos(direction) }

export {
    getDirection, getMagnitude, getVectorX, getVectorY,
    getDistanceBetweenPoints, getHeadingFromPointToPoint,
}