
import { Body } from '../Body'
import * as Geometry from '../geometry'
import { Point, Circle, areCircleAndPolygonIntersecting, _90deg } from '../geometry'

import { CollisionReport } from './CollisionReport'
import { getCircleSquareCollisionInfo, getInfoAboutNearestPointOnPolygon } from './utility'


/**
 * detect collision of one a moving circular body with a square body
 * 
 * @param item1 a moving circular body
 * @param item2 a square body
 * @returns a collision report describing how item1 will intersect with item2 on item1's path
 * or null if no collision will occur
 */
 function detectCircleCollidingWithSquare(item1: Body, item2: Body): CollisionReport {

    if (item1 === item2) { return null };

    const { polygonPoints } = item2
    const circleShapeValues = item1.shapeValues

    var vector = {
        x: item1.momentum.vectorX,
        y: item1.momentum.vectorY,
    }

    const force = item1.mass && item1.momentum ? item1.mass * item1.momentum.magnitude : 0;
    const force2 = item2.mass && item2.momentum ? item2.mass * item2.momentum.magnitude : force;



    // path of the circular item1 is described by circle for start position(item1), circle for end position (movedObject) and a rectangle(pathArea)
    // the pathArea's length is the distance traveled by item1, its height is item1's radius*2 (diameter). 
    // The mid point of each height edge are the centers of (item1) and (movedObject)


    if (areCircleAndPolygonIntersecting(circleShapeValues, polygonPoints)) {
        // find the edge closest point on any edge [P] to the circle's center
        // set the stopPoint as the point that takes the circle out of the polygon
        // by moving towards P (if circle center is inside the polygon)
        // or by moving away from P (if the center is already outside) 

        const placeOnEdgesNearestCircle = getInfoAboutNearestPointOnPolygon(circleShapeValues, polygonPoints)

        let stopPoint

        if (Geometry.isPointInsidePolygon(circleShapeValues, polygonPoints)) {
            const directionToImpactPoint = Geometry.getHeadingFromPointToPoint(placeOnEdgesNearestCircle.point, circleShapeValues)
            stopPoint = {
                x: placeOnEdgesNearestCircle.point.x + Geometry.getVectorX(circleShapeValues.radius + 1, directionToImpactPoint),
                y: placeOnEdgesNearestCircle.point.y + Geometry.getVectorY(circleShapeValues.radius + 1, directionToImpactPoint)
            }
        } else {
            stopPoint = {
                x: placeOnEdgesNearestCircle.point.x + Geometry.getVectorX(circleShapeValues.radius + 1, placeOnEdgesNearestCircle.edgeAngle - _90deg),
                y: placeOnEdgesNearestCircle.point.y + Geometry.getVectorY(circleShapeValues.radius + 1, placeOnEdgesNearestCircle.edgeAngle - _90deg)
            }
        }

        return {
            type: "start inside",
            impactPoint: placeOnEdgesNearestCircle.point,
            wallAngle: placeOnEdgesNearestCircle.edgeAngle,
            stopPoint,
            item1, item2, force, force2
        }
    };

    var movedObject: Circle = {
        x: (item1.data.x + vector.x),
        y: (item1.data.y + vector.y),
        radius: item1.data.size
    }

    if (areCircleAndPolygonIntersecting(movedObject, polygonPoints)) {
        const stuff = getCircleSquareCollisionInfo(item1, item2)
        const { wallAngle, stopPoint, impactPoint } = stuff
        return {
            type: 'end inside',
            wallAngle, stopPoint, impactPoint,
            item1, item2, force, force2
        };
    };

    const rightX = Geometry.getVectorX(item1.data.size, item1.momentum.direction + _90deg)
    const rightY = Geometry.getVectorY(item1.data.size, item1.momentum.direction + _90deg)

    const pathArea: Point[] = [
        { x: item1.data.x + rightX, y: item1.data.y + rightY },
        { x: item1.data.x - rightX, y: item1.data.y - rightY },
        { x: movedObject.x - rightX, y: movedObject.y - rightY },
        { x: movedObject.x + rightX, y: movedObject.y + rightY },
    ]

    if (Geometry.arePolygonsIntersecting(pathArea, polygonPoints)) {
        const stuff = getCircleSquareCollisionInfo(item1, item2)
        const { wallAngle, stopPoint, impactPoint } = stuff
        return {
            type: 'passed through',
            wallAngle, stopPoint, impactPoint,
            item1, item2, force, force2
        };
    }

    return null;
}

export {detectCircleCollidingWithSquare}

