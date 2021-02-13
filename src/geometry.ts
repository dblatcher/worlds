interface Point { x: number, y: number }
interface Circle { x: number, y: number, radius: number }

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
 * Calculate he distance between point1 and either point2 if present or 
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

function getCircleTangentAtPoint (circle: Circle, point:Point) {
    var radiusHeading = getHeadingFromPointToPoint (circle, point);
    var tangentHeading = radiusHeading + (Math.PI)*0.5;
    if (tangentHeading > (Math.PI)*2) {tangentHeading -= (Math.PI)*2};
    return tangentHeading;
};


function getVectorX(magnitude: number, direction: number) { return magnitude * Math.sin(direction) }

function getVectorY(magnitude: number, direction: number) { return magnitude * Math.cos(direction) }


function closestpointonline(L1: Point, L2: Point, p0: Point) {

    if (!isFinite(L2.x) && !isFinite(L2.y)) {
        console.log('bad L2 passed to closestpointonline, returning L1 coords');
        return ({ x: L1.x, y: L1.y });
    }

    var A1 = L2.y - L1.y;
    var B1 = L1.x - L2.x;
    var C1 = (L2.y - L1.y) * L1.x + (L1.x - L2.x) * L1.y;
    var C2 = -B1 * p0.x + A1 * p0.y;
    var det = A1 * A1 - -B1 * B1;
    var cx = 0;
    var cy = 0;
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

export {
    getDirection, getMagnitude, getVectorX, getVectorY,
    getDistanceBetweenPoints, getHeadingFromPointToPoint, closestpointonline,
    areCirclesIntersecting, reflectHeading,reverseHeading, getCircleTangentAtPoint
}