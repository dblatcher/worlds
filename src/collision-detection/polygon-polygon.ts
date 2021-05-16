import { Body } from '../Body'
import { Effect } from '../Effect'
import { Force } from '../Force'
import * as Geometry from '../geometry'
import { Vector, _90deg, Point } from '../geometry'
import { arePolygonsIntersecting } from '../geometry/polygons'

import { CollisionReport } from './CollisionReport'
import { getPolygonPathArea } from './utility'


interface CornerHittingEdgeData {
    corner: Geometry.Point
    intersection: Geometry.IntersectionInfo
    distance: number
}

/**
 * Find the stop point by moving body1 away from body2 until it is not intersecting anymore.
 * DONE VERY CRUDELY with bounding circle - moving polygon will 'jump back'
 * this uses the smallest shift distance that would always separate the bodies, regardless of orientation
 * could potentially calculate the exact shift distance by examining how the polygons intersect
 * getting the greatest distance of any vertex is inside the other shape
 * 
 * @param body1 
 * @param body2 
 * @param force 
 * @param force2 
 * @returns the CollisionReport for when body1 started inside body2
 */
function getStartInsideCollision(body1: Body, body2: Body, force: number, force2: number): CollisionReport {
    const unitVector = Geometry.getUnitVectorBetweenPoints(body1.data, body2.data);
    var shiftDistance = body1.boundingCircle.radius + body2.boundingCircle.radius - Geometry.getDistanceBetweenPoints(body1.data, body2.data);
    const stopPoint = { x: body1.data.x, y: body1.data.y }
    stopPoint.x += unitVector.x * shiftDistance;
    stopPoint.y += unitVector.y * shiftDistance;

    const impactPoint = { x: body1.data.x, y: body1.data.y }
    const wallAngle: number = null

    return {
        type: "start inside",
        impactPoint, stopPoint, wallAngle,
        item1: body1, item2: body2, force, force2
    }
}


/**
 * Find where body1 hits body2 when its path would collide with body2
 * works by finding the first corner of either body to hit an edge of the other
 * then working backwards to find the stop point for that impact
 * can fail, defaulting to stop body1 at current position
 * 
 * @param body1 
 * @param body2 
 * @param force 
 * @param force2 
* @returns the CollisionReport
 */
function getEndInsideOrPassThroughCollision(body1: Body, body2: Body, force: number, force2: number, type: "end inside" | "passed through"): CollisionReport {

    const { vector } = body1.momentum;
    const { polygonPoints } = body1
    const { polygonPoints: polygonPoints2 } = body2
    const edges = Geometry.getPolygonLineSegments(polygonPoints);
    const edges2 = Geometry.getPolygonLineSegments(polygonPoints2);

    let impactPoint: Point, wallAngle: number, stopPoint: Point;

    let item1CornersHittingItem2Edges: CornerHittingEdgeData[] = []
    polygonPoints.forEach(corner => {
        const pointPath: [Point, Point] = [corner, Geometry.translatePoint(corner, vector)];
        const intersection = Geometry.getSortedIntersectionInfoWithEdges(pointPath, edges2)[0] || null
        if (!intersection) { return }
        const distance = Geometry.getDistanceBetweenPoints(intersection.point, corner)
        item1CornersHittingItem2Edges.push({ corner, intersection, distance })
    })
    item1CornersHittingItem2Edges = item1CornersHittingItem2Edges.sort((data1, data2) => data1.distance - data2.distance);
    const closestCornerHit = item1CornersHittingItem2Edges[0] || null;


    let item2CornersHittingItem1Edges: CornerHittingEdgeData[] = []
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
        stopPoint = { x: body1.data.x, y: body1.data.y };
        impactPoint = { x: body1.data.x, y: body1.data.y };
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
        type, wallAngle, stopPoint, impactPoint,
        item1: body1, item2: body2, force, force2
    }
}


/**
 * detect collision of one a moving polygon body with another polygon body
 * [INCOMPLETE] not pushing out overlapping at start properly
 *
 * @param body1 a moving polygon body
 * @param body2 a polygon body
 * @returns a collision report (or null)
 */
function detectPolygonCollidingWithPolygon(body1: Body, body2: Body): CollisionReport {

    if (body1 === body2) { return null };

    const force = body1.mass && body1.momentum ? body1.mass * body1.momentum.magnitude : 0;
    const force2 = body2.mass && body2.momentum ? body2.mass * body2.momentum.magnitude : force;

    if (body1.isIntersectingWith(body2)) {
        return getStartInsideCollision(body1, body2, force, force2);
    }

    const body1CopyAfterMoving = body1.duplicate() as Body
    body1CopyAfterMoving.data.x += body1CopyAfterMoving.momentum.vectorX
    body1CopyAfterMoving.data.y += body1CopyAfterMoving.momentum.vectorY

    if (body1CopyAfterMoving.isIntersectingWith(body2)) {
        return getEndInsideOrPassThroughCollision(body1, body2, force, force2, 'end inside');
    }

    const pathArea = getPolygonPathArea(body1)
    if (arePolygonsIntersecting(pathArea, body2.polygonPoints)) {
        return getEndInsideOrPassThroughCollision(body1, body2, force, force2, 'passed through');
    }

    return null
}

export { detectPolygonCollidingWithPolygon }

