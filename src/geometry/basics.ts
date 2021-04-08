import { Point, _90deg, _360deg, _extreme, originPoint } from './definitions';

/**
 * Calculate the distance between point1 and either point2 if present or 
 * between point1 and originPoint
 * 
 * @param point1 the first point
 * @param point2 (optional) the second point
 * @return the distance between point1 and either point2 if present or 
 * between point1 and originPoint
 */
function getDistanceBetweenPoints(point1: Point, point2?: Point) {
    if (!point2) { point2 = originPoint }
    let dx = point1.x - point2.x, dy = point1.y - point2.y;
    return getMagnitude(dx, dy)
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


function getHeadingFromPointToPoint(startingPoint: Point, destination: Point) {
    let dx = startingPoint.x - destination.x, dy = startingPoint.y - destination.y;
    return getDirection(dx, dy)
}


function getVectorX(magnitude: number, direction: number) { return magnitude * Math.sin(direction) }

function getVectorY(magnitude: number, direction: number) { return magnitude * Math.cos(direction) }

function getXYVector(magnitude: number, direction: number) { return { x: getVectorX(magnitude, direction), y: getVectorY(magnitude, direction) } }



export { getDistanceBetweenPoints, getMagnitude, getDirection, getVectorX,getVectorY,getXYVector, getHeadingFromPointToPoint }