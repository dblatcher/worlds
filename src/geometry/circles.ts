import { Point, Circle, Vector, Wedge, _90deg, _360deg, _extreme, originPoint } from './definitions';
import { getDistanceBetweenPoints, getHeadingFromPointToPoint } from './basics';

/**
 * 
 * @param circle1 
 * @param circle2 
 * @returns whether those circles intersect
 */
function areCirclesIntersecting(circle1: Circle, circle2: Circle) {
    return getDistanceBetweenPoints(circle1, circle2) < circle1.radius + circle2.radius
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

export {areCirclesIntersecting, getCircleTangentAtPoint}