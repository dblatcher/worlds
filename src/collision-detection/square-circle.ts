import { Body } from '../Body'
import * as Geometry from '../geometry'
import { Point,Vector, Circle, areCircleAndPolygonIntersecting, _90deg } from '../geometry'

import { CollisionReport } from './CollisionReport'
import { getCircleSquareCollisionInfo, getInfoAboutNearestPointOnPolygon } from './utility'

/**
 * 
 * [INCOMPLETE] detect collision of one a moving square body with a circular body
 * 
 * @param item1 a moving square body
 * @param item2 a circular body
 * @returns a collision report (or null)
 */
 function detectSquareCollidingWithCircle(item1: Body, item2: Body): CollisionReport {

    if (item1 === item2) { return null };

    const force = item1.mass && item1.momentum ? item1.mass * item1.momentum.magnitude : 0;
    const force2 = item2.mass && item2.momentum ? item2.mass * item2.momentum.magnitude : force;

    const { polygonPoints } = item1
    const circleShapeValues = item2.shapeValues

    //START INSIDE
    if (item1.isIntersectingWith(item2)) {
        const nearestIntersection = getInfoAboutNearestPointOnPolygon(circleShapeValues, polygonPoints)
        const cicleCenterIsInside = Geometry.isPointInsidePolygon(circleShapeValues, polygonPoints)

        let vectorToMoveCircleOut: Vector

        if (cicleCenterIsInside) {
            const directionToImpactPoint = Geometry.getHeadingFromPointToPoint(nearestIntersection.point, circleShapeValues)
            vectorToMoveCircleOut = {
                x: nearestIntersection.point.x + Geometry.getVectorX(circleShapeValues.radius + 1, directionToImpactPoint) - circleShapeValues.x,
                y: nearestIntersection.point.y + Geometry.getVectorY(circleShapeValues.radius + 1, directionToImpactPoint) - circleShapeValues.y
            }
        } else {
            vectorToMoveCircleOut = {
                x: nearestIntersection.point.x + Geometry.getVectorX(circleShapeValues.radius + 1, nearestIntersection.edgeAngle - _90deg) - circleShapeValues.x,
                y: nearestIntersection.point.y + Geometry.getVectorY(circleShapeValues.radius + 1, nearestIntersection.edgeAngle - _90deg) - circleShapeValues.y
            }
        }


        return {
            type: 'start inside',
            impactPoint: nearestIntersection.point,
            wallAngle: nearestIntersection.edgeAngle,
            stopPoint: Geometry.translatePoint(item1.data, vectorToMoveCircleOut, true),
            item1, item2, force, force2
        }
    }

    const item1CopyAfterMoving = item1.duplicate() as Body
    item1CopyAfterMoving.data.x += item1CopyAfterMoving.momentum.vectorX
    item1CopyAfterMoving.data.y += item1CopyAfterMoving.momentum.vectorY

    if (item1CopyAfterMoving.isIntersectingWith(item2)) {

        // TO DO - calculate stopPoint, wallAngle, impactPoint
        const stuff = getImpactAndStopPointAndWallAngle(item2, item1)
        const { wallAngle, stopPoint, impactPoint } = stuff

        return {
            type: 'end inside',
            wallAngle, stopPoint, impactPoint,
            item1, item2, force, force2
        }
    }

    //TO DO - detect pass-through collisions

    return null

    function getImpactAndStopPointAndWallAngle(circularBody: Body, squareBody: Body) {
        //pretend circle is moving towards polygon in opposit direction
        // find where it would hit the edge, get vector
        // apply opposite vector to find where the polygon his the circle


        // have to handle 'glancing' impacts (forward point of circle is past the edge)
        // can maybe just handle by 'extending' the edges for the purpose of finding pointWherePathWouldIntersectEdge
        console.warn('MOVING SQUARE, NOT HANDLED')

        return {
            stopPoint: { x: squareBody.data.x, y: squareBody.data.y },
            impactPoint: { x: squareBody.data.x, y: squareBody.data.y },
            wallAngle: null as number,
        }

    }

}

export {detectSquareCollidingWithCircle}