interface Point { x: number, y: number }
interface Circle { x: number, y: number, radius: number }
interface Vector { x: number, y: number }


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
    if (!point2) { point2 = { x: 0, y: 0 } }
    let dx = point1.x - point2.x, dy = point1.y - point2.y;
    return getMagnitude(dx, dy)
}

function getHeadingFromPointToPoint(origin: Point, destination: Point) {
    let dx = origin.x - destination.x, dy = origin.y - destination.y;
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
function doLineSegmentsIntersect(segment1:[Point, Point], segment2:[Point, Point]) {
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



export {
    Point, Circle, Vector,
    getDirection, getMagnitude, getVectorX, getVectorY,
    doLineSegmentsIntersect,
    getDistanceBetweenPoints, getHeadingFromPointToPoint, closestpointonline,
    areCirclesIntersecting, reflectHeading, reverseHeading, getCircleTangentAtPoint
}