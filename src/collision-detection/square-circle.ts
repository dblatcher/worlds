import { Body } from '../Body'
import { Force } from '../Force'
import * as Geometry from '../geometry'
import { Vector, _90deg } from '../geometry'

import { CollisionReport } from './CollisionReport'
import { getCircleSquareCollisionInfo, getInfoAboutNearestPointOnPolygon, getPolygonPathArea } from './utility'


/**
 * Get the collision report when the polygon starts inside the circle
 * 
 * @param item1 the moving polygon body
 * @param item2 the impacted circular body
 * @param force 
 * @param force2 
 * @returns the collision report for a start inside collisions
 */
function getStartInsideCollision(item1: Body, item2: Body, force: number, force2: number): CollisionReport {

    const { polygonPoints } = item1
    const circleShapeValues = item2.shapeValues

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


/**
 * 
 *  detect collision of one a moving square body with a circular body
 * [INCOMPLETE] - doesn't detect pass through-collisions
 * 
 * @param item1 a moving square body
 * @param item2 a circular body
 * @returns a collision report (or null)
 */
function detectSquareCollidingWithCircle(item1: Body, item2: Body): CollisionReport {

    if (item1 === item2) { return null };

    const force = item1.mass && item1.momentum ? item1.mass * item1.momentum.magnitude : 0;
    const force2 = item2.mass && item2.momentum ? item2.mass * item2.momentum.magnitude : force;


    //START INSIDE
    if (item1.isIntersectingWith(item2)) {
        return getStartInsideCollision(item1, item2, force, force2);
    }

    const item1CopyAfterMoving = item1.duplicate() as Body
    item1CopyAfterMoving.data.x += item1CopyAfterMoving.momentum.vectorX
    item1CopyAfterMoving.data.y += item1CopyAfterMoving.momentum.vectorY

    if (item1CopyAfterMoving.isIntersectingWith(item2)) {

        const stuff = getImpactAndStopPointAndWallAngle(item2, item1)
        const { wallAngle, stopPoint, impactPoint } = stuff

        return {
            type: 'end inside',
            wallAngle, stopPoint, impactPoint,
            item1, item2, force, force2
        }
    }

    const pathArea = getPolygonPathArea(item1)

    if (Geometry.areCircleAndPolygonIntersecting(item2.shapeValues, pathArea)) {
        const stuff = getImpactAndStopPointAndWallAngle(item2, item1)
        const { wallAngle, stopPoint, impactPoint } = stuff

        return {
            type: 'passed through',
            wallAngle, stopPoint, impactPoint,
            item1, item2, force, force2
        }
    }

    //TO DO - detect pass-through collisions

    return null

    function getImpactAndStopPointAndWallAngle(circularBody: Body, squareBody: Body) {
        //pretend circle is moving towards polygon in opposite direction
        // find where it would hit the edge, get vector
        // apply opposite vector to find where the polygon his the circle

        const copyofCircleBody = circularBody.duplicate() as Body;
        const copyofSquareBody = squareBody.duplicate() as Body;
        copyofCircleBody.momentum = new Force(squareBody.momentum.magnitude, Geometry.reverseHeading( squareBody.momentum.direction))

        const { stopPoint:stopPointIfBackwards, impactPoint:impactPointIfBackwards } = getCircleSquareCollisionInfo(copyofCircleBody, copyofSquareBody)

        const backwardsPath:Vector = {
            x: stopPointIfBackwards.x - copyofCircleBody.data.x,
            y: stopPointIfBackwards.y - copyofCircleBody.data.y,
        }
        const realSquareCenterToImpactPointIfBackwards: Vector = {
            x: impactPointIfBackwards.x - squareBody.data.x,
            y: impactPointIfBackwards.y - squareBody.data.y,
        }

        const stopPoint = Geometry.translatePoint(copyofSquareBody.data, backwardsPath);
        const impactPoint = Geometry.translatePoint(stopPoint, realSquareCenterToImpactPointIfBackwards);

        const wallAngle = Geometry.getCircleTangentAtPoint(circularBody.shapeValues, impactPoint)

        // new Effect({ color: 'yellow', x: stopPoint.x, y: stopPoint.y, duration: 15 }).enterWorld(circularBody.world)
        // new Effect({ color: 'green', x: impactPoint.x, y: impactPoint.y, duration: 15 }).enterWorld(circularBody.world)

        return {
            stopPoint, impactPoint,wallAngle,
        }

    }

}

export { detectSquareCollidingWithCircle }

