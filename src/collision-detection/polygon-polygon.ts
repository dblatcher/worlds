import { Body } from '../Body'
import { Effect } from '../Effect'
import { Force } from '../Force'
import * as Geometry from '../geometry'
import { Vector, _90deg } from '../geometry'
import { Point } from '../geometry/definitions'

import { CollisionReport } from './CollisionReport'
import { getCircleSquareCollisionInfo, getInfoAboutNearestPointOnPolygon } from './utility'


interface CornerHittingEgdeData {
    corner: Geometry.Point
    intersection: Geometry.IntersectionInfo
    distance: number
}

/**
 *
 * detect collision of one a moving polygon body with another polygon body
 * [INCOMPLETE] not pushing out overlapping at start
 * [INCOMPLETE] not finding passthrough collisions
 *
 * @param body1 a moving polygon body
 * @param body2 a polygon body
 * @returns a collision report (or null)
 */
function detectPolygonCollidingWithPolygon(body1: Body, body2: Body): CollisionReport {

    if (body1 === body2) { return null };

    const force = body1.mass && body1.momentum ? body1.mass * body1.momentum.magnitude : 0;
    const force2 = body2.mass && body2.momentum ? body2.mass * body2.momentum.magnitude : force;

    const { vector } = body1.momentum;
    const { polygonPoints } = body1
    const edges = Geometry.getPolygonLineSegments(polygonPoints);
    const { polygonPoints: polygonPoints2 } = body2
    const edges2 = Geometry.getPolygonLineSegments(polygonPoints2);

    let impactPoint: Point, wallAngle: number, stopPoint: Point;

    if (body1.isIntersectingWith(body2)) {

        //find stop point moving body1 away from body2 until it is not intersecting
        // DONE VERY CRUDELY with bounding circle - moving polygon will 'jump back'
        // this uses the smallest shift distance that would always separate the bodies, regardless of orientation
        // could potentially calculate the exact shift distance by examining how the polygons intersect
        // getting the greatest distance of any vertex is inside the other shape

        const unitVector = Geometry.getUnitVectorBetweenPoints(body1.data, body2.data);
        var shiftDistance = body1.boundingCircle.radius + body2.boundingCircle.radius - Geometry.getDistanceBetweenPoints(body1.data, body2.data);
        stopPoint = { x: body1.data.x, y: body1.data.y }
        stopPoint.x += unitVector.x * shiftDistance;
        stopPoint.y += unitVector.y * shiftDistance;

        impactPoint = { x: body1.data.x, y: body1.data.y }
        wallAngle = null

        return {
            type: 'start inside',
            impactPoint, stopPoint, wallAngle,
            item1: body1, item2: body2, force, force2
        }
    }

    const item1CopyAfterMoving = body1.duplicate() as Body
    item1CopyAfterMoving.data.x += item1CopyAfterMoving.momentum.vectorX
    item1CopyAfterMoving.data.y += item1CopyAfterMoving.momentum.vectorY

    if (item1CopyAfterMoving.isIntersectingWith(body2)) {

        let item1CornersHittingItem2Edges: CornerHittingEgdeData[] = []
        polygonPoints.forEach(corner => {
            const pointPath: [Point, Point] = [corner, Geometry.translatePoint(corner, vector)];
            const intersection = Geometry.getSortedIntersectionInfoWithEdges(pointPath, edges2)[0] || null
            if (!intersection) { return }
            const distance = Geometry.getDistanceBetweenPoints(intersection.point, corner)
            item1CornersHittingItem2Edges.push({ corner, intersection, distance })
        })
        item1CornersHittingItem2Edges = item1CornersHittingItem2Edges.sort((data1, data2) => data1.distance - data2.distance);
        const closestCornerHit = item1CornersHittingItem2Edges[0] || null;


        let item2CornersHittingItem1Edges: CornerHittingEgdeData[] = []
        polygonPoints2.forEach(corner => {
            const pointPath: [Point, Point] = [corner, Geometry.translatePoint(corner, vector, true)];
            const intersection = Geometry.getSortedIntersectionInfoWithEdges(pointPath, edges)[0] || null
            if (!intersection) { return }
            const distance = Geometry.getDistanceBetweenPoints(intersection.point, corner)
            item2CornersHittingItem1Edges.push({ corner, intersection, distance })
        })
        item2CornersHittingItem1Edges = item2CornersHittingItem1Edges.sort((data1, data2) => data1.distance - data2.distance);
        const closestEdgeHit = item2CornersHittingItem1Edges[0] || null;

        if (!closestCornerHit && !closestEdgeHit) {
            console.warn('failed to find impact point in polygon-polygon collision');
            stopPoint = {x: body1.data.x, y:body1.data.y};
            impactPoint = {x: body1.data.x, y:body1.data.y};
            return {
                type: 'end inside',
                wallAngle, stopPoint, impactPoint,
                item1: body1, item2: body2, force, force2
            }
        }

        let useEdgeHit: boolean;

        if (!closestEdgeHit) {
            useEdgeHit = false;
        } else if (!closestCornerHit) {
            useEdgeHit = true;
        } else {
            useEdgeHit = closestEdgeHit.distance < closestCornerHit.distance
        }

        if (useEdgeHit) {
            impactPoint = closestEdgeHit.corner
            wallAngle = Geometry.getHeadingFromPointToPoint(...closestEdgeHit.intersection.edge);
            const fromPointOnItem1EdgeToItem1Center: Vector = {
                x: body1.data.x - closestEdgeHit.intersection.point.x,
                y: body1.data.y - closestEdgeHit.intersection.point.y
            }
            stopPoint = Geometry.translatePoint(closestEdgeHit.corner, fromPointOnItem1EdgeToItem1Center)
        } else {
            impactPoint = closestCornerHit.intersection.point
            wallAngle = Geometry.getHeadingFromPointToPoint(...closestCornerHit.intersection.edge);
            const fromCornerToCenter: Vector = {
                x: body1.data.x - closestCornerHit.corner.x,
                y: body1.data.y - closestCornerHit.corner.y
            }
            stopPoint = Geometry.translatePoint(impactPoint, fromCornerToCenter)
        }

        // new Effect({ color: 'yellow', x: stopPoint.x, y: stopPoint.y, duration: 15 }).enterWorld(item1.world)
        // new Effect({ color: 'green', x: impactPoint.x, y: impactPoint.y, duration: 15 }).enterWorld(item1.world)
        return {
            type: 'end inside',
            wallAngle, stopPoint, impactPoint,
            item1: body1, item2: body2, force, force2
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
        copyofCircleBody.momentum = new Force(squareBody.momentum.magnitude, Geometry.reverseHeading(squareBody.momentum.direction))

        const { stopPoint: stopPointIfBackwards, impactPoint: impactPointIfBackwards } = getCircleSquareCollisionInfo(copyofCircleBody, copyofSquareBody)

        const backwardsPath: Vector = {
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
            stopPoint, impactPoint, wallAngle,
        }

    }

}

export { detectPolygonCollidingWithPolygon }