interface Point { x: number, y: number }
interface Circle { x: number, y: number, radius: number }
interface Vector { x: number, y: number }


const extreme = 10 ** 30
const _90deg = Math.PI * .5
const origin: Point = { x: 0, y: 0 }

function getPolygonLineSegments(polygon: Point[]) {
    const segments: [Point, Point][] = []
    for (let i = 0; i < polygon.length; i++) {
        segments.push([polygon[i], i + 1 >= polygon.length ? polygon[0] : polygon[i + 1]])
    }
    return segments
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
 * Calculate the distance between point1 and either point2 if present or 
 * between point1 and origin
 * 
 * @param point1 the first point
 * @param point2 (optional) the second point
 * @return the distance between point1 and either point2 if present or 
 * between point1 and origin
 */
function getDistanceBetweenPoints(point1: Point, point2?: Point) {
    if (!point2) { point2 = origin }
    let dx = point1.x - point2.x, dy = point1.y - point2.y;
    return getMagnitude(dx, dy)
}

function getHeadingFromPointToPoint(startingPoint: Point, destination: Point) {
    let dx = startingPoint.x - destination.x, dy = startingPoint.y - destination.y;
    return getDirection(dx, dy)
}


/**
 * Calculate tangent at the point on the circle circumference which intersects
 * with radius to the point
 * 
 * @param circle a circle
 * @param point a point
 * 
 * @return the tangent at the point on the circle circumference which intersects
 * with radius to the point
 */

function getCircleTangentAtPoint(circle: Circle, point: Point) {
    let radiusHeading = getHeadingFromPointToPoint(circle, point);
    let tangentHeading = radiusHeading + (Math.PI) * 0.5;
    if (tangentHeading > (Math.PI) * 2) { tangentHeading -= (Math.PI) * 2 };
    return tangentHeading;
};


function getVectorX(magnitude: number, direction: number) { return magnitude * Math.sin(direction) }

function getVectorY(magnitude: number, direction: number) { return magnitude * Math.cos(direction) }



function closestPointOnLineSegment(segmentPoint1: Point, segmentPoint2: Point, p0: Point) {
    const v: Vector = { x: segmentPoint2.x - segmentPoint1.x, y: segmentPoint2.y - segmentPoint1.y }
    const u: Vector = { x: segmentPoint1.x - p0.x, y: segmentPoint1.y - p0.y }
    const vu = v.x * u.x + v.y * u.y
    const vv = v.x ** 2 + v.y ** 2
    const t = -vu / vv
    if (t >= 0 && t <= 1) return _vectorToSegment2D(t, origin, segmentPoint1, segmentPoint2)
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



function closestpointonline(L1: Point, L2: Point, p0: Point) {

    if (!isFinite(L2.x) && !isFinite(L2.y)) {
        console.log('bad L2 passed to closestpointonline, returning L1 coords');
        return ({ x: L1.x, y: L1.y });
    }

    let A1 = L2.y - L1.y;
    let B1 = L1.x - L2.x;
    let C1 = (L2.y - L1.y) * L1.x + (L1.x - L2.x) * L1.y;
    let C2 = -B1 * p0.x + A1 * p0.y;
    let det = A1 * A1 - -B1 * B1;
    let cx = 0;
    let cy = 0;
    if (det !== 0) {
        cx = ((A1 * C1 - B1 * C2) / det);
        cy = ((A1 * C2 - -B1 * C1) / det);
    } else {
        cx = p0.x;
        cy = p0.y;
    }

    if (!isFinite(cx) || !isFinite(cy)) {
        console.log('closestpointonline error');
        console.log(L1, L2, p0);
    }

    return { x: cx, y: cy } as Point;
}

function areCirclesIntersecting(circle1: Circle, circle2: Circle) {
    return getDistanceBetweenPoints(circle1, circle2) < circle1.radius + circle2.radius
}

function areCircleAndPolygonIntersecting(circle: Circle, polygon: Point[]) {

    let point1, point2, closestPointToCenter, edgeIntersects = false
    for (let i = 0; i < polygon.length; i++) {
        point1 = polygon[i]
        point2 = i + 1 >= polygon.length ? polygon[0] : polygon[i + 1]
        closestPointToCenter = closestPointOnLineSegment(point1, point2, circle)
        if (getDistanceBetweenPoints(closestPointToCenter, circle) <= circle.radius) {
            edgeIntersects = true
            break
        }
    }
    if (edgeIntersects) { return true }

    // is the circle inside the polygon?
    return isPointInsidePolygon(circle, polygon);
}

function arePolygonsIntersecting(polygon1: Point[], polygon2: Point[]) {

    const edges1 = getPolygonLineSegments(polygon1)
    const edges2 = getPolygonLineSegments(polygon2)
    let i, j
    for (i = 0; i < edges1.length; i++) {
        for (j = 0; j < edges2.length; j++) {
            if (doLineSegmentsIntersect(edges1[i], edges2[j])) {
                console.log('polygon edges intersect', edges1[i], edges2[j])
                return true
            }
        }
    }

    for (i = 0; i < polygon1.length; i++) {
        if (isPointInsidePolygon(polygon1[i], polygon2)) {
            console.log('polygon vertex inside other polygon', polygon1[i])
            return true
        }
    }

    for (i = 0; i < polygon2.length; i++) {
        if (isPointInsidePolygon(polygon2[i], polygon1)) {
            console.log('polygon vertex inside other polygon', polygon2[i])
            return true
        }
    }

    return false
}


function isPointInsidePolygon(point: Point, polygon: Point[]) {
    var n = polygon.length;
    if (n < 3) { return false };
    var extremeXPoint = { y: point.y, x: extreme };
    var intersections = 0;

    let point1, point2
    for (let i = 0; i < polygon.length; i++) {
        point1 = polygon[i]
        point2 = i + 1 >= polygon.length ? polygon[0] : polygon[i + 1]
        if (doLineSegmentsIntersect([point, extremeXPoint], [point1, point2])) { intersections++ }
    }

    return intersections % 2 !== 0
}


function reverseHeading(heading: number) {
    let result = heading + Math.PI;
    if (result > Math.PI * 2) { result -= Math.PI * 2 }
    return result;
};

function reflectHeading(heading: number, wallAngle: number) {
    let reflect = 2 * wallAngle - heading;
    if (reflect < (Math.PI) * 0) { reflect += (Math.PI) * 2 };
    if (reflect > (Math.PI) * 2) { reflect -= (Math.PI) * 2 };
    if (reflect === heading) { reflect = reverseHeading(reflect) }
    return reflect;
}



/**
 * Check if two line segments will intersect
 * 
 * @param segment1 the two points of the first segment
 * @param segment2 the two points of the second segment
 * @returns whether the sements intersect
 */
function doLineSegmentsIntersect(segment1: [Point, Point], segment2: [Point, Point]): boolean {
    // Given three colinear points p, q, r, the function checks if 
    // point q lies on line segment 'pr' 
    function onSegment(p: Point, q: Point, r: Point) {
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
            return true;
        }
        return false;
    }

    // To find orientation of ordered triplet (p, q, r). 
    // The function returns following values 
    // 0 --> p, q and r are colinear 
    // 1 --> Clockwise 
    // 2 --> Counterclockwise 
    function orientation(p: Point, q: Point, r: Point) {
        let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val == 0) return 0;  // colinear 
        return (val > 0) ? 1 : 2; // clock or counterclock wise 
    }

    // Find the four orientations needed for general and 
    // special cases 
    let o1 = orientation(segment1[0], segment1[1], segment2[0]);
    let o2 = orientation(segment1[0], segment1[1], segment2[1]);
    let o3 = orientation(segment2[0], segment2[1], segment1[0]);
    let o4 = orientation(segment2[0], segment2[1], segment1[1]);

    // General case 
    if (o1 != o2 && o3 != o4) { return true };

    // Special Cases 
    // segment1[0], segment1[1] and segment2[0] are colinear and segment2[0] lies on segment p1q1 
    if (o1 == 0 && onSegment(segment1[0], segment2[0], segment1[1])) { return true };

    // segment1[0], segment1[1] and segment2[1] are colinear and segment2[1] lies on segment p1q1 
    if (o2 == 0 && onSegment(segment1[0], segment2[1], segment1[1])) { return true };

    // segment2[0], segment2[1] and segment1[0] are colinear and segment1[0] lies on segment p2q2 
    if (o3 == 0 && onSegment(segment2[0], segment1[0], segment2[1])) { return true };

    // segment2[0], segment2[1] and segment1[1] are colinear and segment1[1] lies on segment p2q2 
    if (o4 == 0 && onSegment(segment2[0], segment1[1], segment2[1])) { return true };

    return false; // Doesn't fall in any of the above cases 
}


function findIntersectionPointOfLineSegments(segment1: [Point, Point], segment2: [Point, Point]): Point {

    if (!doLineSegmentsIntersect(segment1, segment2)) { return null }

    const gradient1 = (segment1[0].y - segment1[1].y) / (segment1[0].x - segment1[1].x)
    const gradient2 = (segment2[0].y - segment2[1].y) / (segment2[0].x - segment2[1].x)

    if (gradient1 == gradient2) {
        const pointsInOrder  = isFinite(gradient1) 
            ? [segment1[0], segment1[1], segment2[0], segment2[1]].sort((pointA, pointB) => pointA.x-pointB.x)
            : [segment1[0], segment1[1], segment2[0], segment2[1]].sort((pointA, pointB) => pointA.y-pointB.y)

        return {
            x: (pointsInOrder[1].x + pointsInOrder[2].x)/2,
            y: (pointsInOrder[1].y + pointsInOrder[2].y)/2,
        }
    }

    if (isFinite(gradient1) && isFinite(gradient2)) {
        const constant1 = segment1[0].y - (gradient1 * segment1[0].x)
        const constant2 = segment2[0].y - (gradient2 * segment2[0].x)

        const intersectX = (constant2 - constant1) / (gradient1 - gradient2)
        const intersectY = (gradient1 * intersectX) + constant1
        return ({ x: intersectX, y: intersectY })
    }

    if (isFinite(gradient1) && !isFinite(gradient2)) {
        return getIntersectionWithAVertical(segment1, segment2)
    }

    if (isFinite(gradient2) && !isFinite(gradient1)) {
        return getIntersectionWithAVertical(segment2, segment1)
    }

    return null

    function getIntersectionWithAVertical(nonVerticalSegment:[Point, Point], verticalSegment:[Point, Point]):Point {

        const verticalConstant = verticalSegment[0].x
        const nonVerticalGradient = (nonVerticalSegment[0].y - nonVerticalSegment[1].y) / (nonVerticalSegment[0].x - nonVerticalSegment[1].x)
        const nonVerticalConstant = nonVerticalSegment[0].y - (nonVerticalGradient * nonVerticalSegment[0].x)

        return ({ 
            x: verticalConstant,
            y: (nonVerticalGradient * verticalConstant) + nonVerticalConstant
        })
    }
}


export {
    Point, Circle, Vector,
    _90deg,
    getDirection, getMagnitude, getVectorX, getVectorY,
    doLineSegmentsIntersect, findIntersectionPointOfLineSegments,
    arePolygonsIntersecting, getPolygonLineSegments,
    getDistanceBetweenPoints, getHeadingFromPointToPoint, closestpointonline,
    areCirclesIntersecting, reflectHeading, reverseHeading, getCircleTangentAtPoint,
    areCircleAndPolygonIntersecting, isPointInsidePolygon,
}