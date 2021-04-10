import { Point, _90deg, _360deg, _extreme, originPoint, Vector } from './definitions';

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



function closestPointOnLineSegment(segmentPoint1: Point, segmentPoint2: Point, p0: Point) {
    const v: Vector = { x: segmentPoint2.x - segmentPoint1.x, y: segmentPoint2.y - segmentPoint1.y }
    const u: Vector = { x: segmentPoint1.x - p0.x, y: segmentPoint1.y - p0.y }
    const vu = v.x * u.x + v.y * u.y
    const vv = v.x ** 2 + v.y ** 2
    const t = -vu / vv
    if (t >= 0 && t <= 1) return _vectorToSegment2D(t, originPoint, segmentPoint1, segmentPoint2)
    const g0 = _sqDiag2D(_vectorToSegment2D(0, p0, segmentPoint1, segmentPoint2))
    const g1 = _sqDiag2D(_vectorToSegment2D(1, p0, segmentPoint1, segmentPoint2))
    return g0 <= g1 ? segmentPoint1 : segmentPoint2
}

function _vectorToSegment2D(t: number, P: Point, A: Point, B: Point) {
    return {
        x: (1 - t) * A.x + t * B.x - P.x,
        y: (1 - t) * A.y + t * B.y - P.y,
    } as Vector
}

function _sqDiag2D(P: Vector) { return P.x ** 2 + P.y ** 2 }



export { getDistanceBetweenPoints, getMagnitude, getDirection, getVectorX,getVectorY,getXYVector, getHeadingFromPointToPoint, closestPointOnLineSegment }