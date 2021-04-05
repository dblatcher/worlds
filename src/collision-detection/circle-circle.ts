import { CollisionReport } from './CollisionReport'

import { Body } from '../Body'
import { Force } from '../Force'
import * as Geometry from '../geometry'
import { Vector, Point, Circle, areCircleAndPolygonIntersecting, _90deg } from '../geometry'


/**
 * detect collision of one a moving circular body with another circular body
 * 
 * @param item1 a circular body
 * @param item2 another circular body
 * @returns a collision report describing how item1 will intersect with item2 on item1's path
 * or null if no collision will occur
 */
function detectCircleCollidingWithCircle(item1: Body, item2: Body): CollisionReport {
    // can't collide with self!
    if (item1 === item2) { return null };

    var vector = {
        x: item1.momentum.vectorX,
        y: item1.momentum.vectorY,
    }


    var force = item1.mass && item1.momentum ? item1.mass * item1.momentum.magnitude : 0;
    var force2 = item2.mass && item2.momentum ? item2.mass * item2.momentum.magnitude : force;


    const item1AtEnd = item1.duplicate() as Body
    item1AtEnd.data.x = (item1.data.x + vector.x)
    item1AtEnd.data.y = (item1.data.y + vector.y)

    if (item1.isIntersectingWith(item2)) {
        var unitVector: Vector = { x: undefined, y: undefined };
        var stopPoint: Point = { x: item1.data.x, y: item1.data.y };

        // this doesn't work well - shoves the object back the shortest route out of item2
        // should move backward relative to direction of travel - use the c calculation below

        var distanceBetweenCenters = Geometry.getDistanceBetweenPoints(item1.data, item2.data);
        if (distanceBetweenCenters) {
            var vectorBetweenCenters = { x: item1.data.x - item2.data.x, y: item1.data.y - item2.data.y };
            var vectorSize = Force.fromVector(vectorBetweenCenters.x, vectorBetweenCenters.y).magnitude
            unitVector = {
                x: vectorBetweenCenters.x / vectorSize,
                y: vectorBetweenCenters.y / vectorSize
            };
        } else {
            unitVector.x = Math.random()
            unitVector.y = 1 - unitVector.x;
        }

        var shiftDistance = item1.data.size + item2.data.size - distanceBetweenCenters;
        stopPoint.x += unitVector.x * shiftDistance;
        stopPoint.y += unitVector.y * shiftDistance;

        return ({
            type: 'start inside',
            impactPoint: {
                x: item1.data.x,
                y: item1.data.y,
            },
            stopPoint: stopPoint,
            item1: item1,
            item2: item2,
            force: force,
            force2: force2
        } as CollisionReport);
    };

    // TO DO - optimise calculations - only calculate if needed

    // d is the closest point to item2 on the path taken by item1
    var d = Geometry.closestpointonline(item1.shapeValues, item1AtEnd.shapeValues, item2.shapeValues);
    var closestDist = Geometry.getDistanceBetweenPoints(item2.shapeValues, d);
    var closestDistSq = closestDist * closestDist;

    // backdist how far back item1 needs to go from d to be at impact Point? relative to vectorMagnitude?
    var backdist = Math.sqrt(Math.pow(item1.shapeValues.radius + item2.shapeValues.radius, 2) - closestDistSq);


    var vectorMagnitude = Force.fromVector(vector.x, vector.y).magnitude;
    // check this - should be negative?
    // changed y to be negative - (used to be positive in the old application, the y vector was reversed so plus == up)
    var item1PointWhenHit = {
        x: d.x + backdist * (-vector.x / vectorMagnitude),
        y: d.y + backdist * (-vector.y / vectorMagnitude)
    } as Point;

    var directionFromItem2ToImpactPoint = Force.fromVector(item1PointWhenHit.x - item2.shapeValues.x, item1PointWhenHit.y - item2.shapeValues.y).direction

    if (item1AtEnd.isIntersectingWith(item2)) {

        var impactPoint = {
            x: item1PointWhenHit.x + (item1AtEnd.shapeValues.radius * -Math.sin(
                directionFromItem2ToImpactPoint
            )),

            y: item1PointWhenHit.y + (item1AtEnd.shapeValues.radius * -Math.cos(
                directionFromItem2ToImpactPoint
            ))
        } as Point

        return {
            type: 'end inside',
            x: impactPoint.x,
            y: impactPoint.y,
            impactPoint,
            stopPoint: item1PointWhenHit,
            item1: item1,
            item2: item2,
            force: force,
            force2: force2
        } as CollisionReport;
    };


    if (closestDist <= item2.shapeValues.radius + item1AtEnd.shapeValues.radius) { // is on collision course
        var item1WouldPassThroughItem2;

        if (vector.x !== 0) {
            if (
                (item1.shapeValues.x < item1PointWhenHit.x && item1PointWhenHit.x < item1AtEnd.shapeValues.x) ||
                (item1.shapeValues.x > item1PointWhenHit.x && item1PointWhenHit.x > item1AtEnd.shapeValues.x)
            ) {
                item1WouldPassThroughItem2 = true;
            }
        } else { //no x velocity, so check by y coords
            if (
                (item1.shapeValues.y < item1PointWhenHit.y && item1PointWhenHit.y < item1AtEnd.shapeValues.y) ||
                (item1.shapeValues.y > item1PointWhenHit.y && item1PointWhenHit.y > item1AtEnd.shapeValues.y)
            ) {
                item1WouldPassThroughItem2 = true;
            }
        }

        if (item1WouldPassThroughItem2) {
            var impactPoint = {
                x: item1PointWhenHit.x + (item1AtEnd.shapeValues.radius * -Math.sin(
                    directionFromItem2ToImpactPoint
                )),
                y: item1PointWhenHit.y + (item1AtEnd.shapeValues.radius * -Math.cos(
                    directionFromItem2ToImpactPoint
                ))
            };
            return {
                type: 'passed through',
                impactPoint,
                stopPoint: item1PointWhenHit,
                item1: item1,
                item2: item2,
                force: force,
                force2: force2
            } as CollisionReport;
        }

    };

    return null;

}

export { detectCircleCollidingWithCircle }