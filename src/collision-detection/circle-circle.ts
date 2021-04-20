import { CollisionReport } from './CollisionReport'

import { Body } from '../Body'
import { Force } from '../Force'
import * as Geometry from '../geometry'
import { Point, _90deg } from '../geometry'


/**
 * detect collision of one a moving circular body with another circular body
 * 
 * @param body1 a circular body
 * @param body2 another circular body
 * @returns a collision report describing how body1 will intersect with body2 on body1's path
 * or null if no collision will occur
 */
function detectCircleCollidingWithCircle(body1: Body, body2: Body): CollisionReport {
    // can't collide with self!
    if (body1 === body2) { return null };

    var vector = {
        x: body1.momentum.vectorX,
        y: body1.momentum.vectorY,
    }


    var force = body1.mass && body1.momentum ? body1.mass * body1.momentum.magnitude : 0;
    var force2 = body2.mass && body2.momentum ? body2.mass * body2.momentum.magnitude : force;


    const body1AtEnd = body1.duplicate() as Body
    body1AtEnd.data.x = (body1.data.x + vector.x)
    body1AtEnd.data.y = (body1.data.y + vector.y)

    if (body1.isIntersectingWith(body2)) {

        var stopPoint: Point = { x: body1.data.x, y: body1.data.y };

        // this doesn't work well - shoves the object back the shortest route out of body2
        // should move backward relative to direction of travel - use the c calculation below

        const unitVector = Geometry.getUnitVectorBetweenPoints(body1.data, body2.data);

        var shiftDistance = body1.data.size + body2.data.size - Geometry.getDistanceBetweenPoints(body1.data, body2.data);
        stopPoint.x += unitVector.x * shiftDistance;
        stopPoint.y += unitVector.y * shiftDistance;

        return ({
            type: 'start inside',
            impactPoint: {
                x: body1.data.x,
                y: body1.data.y,
            },
            stopPoint: stopPoint,
            item1: body1,
            item2: body2,
            force: force,
            force2: force2
        } as CollisionReport);
    };

    // TO DO - optimise calculations - only calculate if needed

    // d is the closest point to body2 on the path taken by body1
    var d = Geometry.closestpointonline(body1.shapeValues, body1AtEnd.shapeValues, body2.shapeValues);
    var closestDist = Geometry.getDistanceBetweenPoints(body2.shapeValues, d);
    var closestDistSq = closestDist * closestDist;

    // backdist how far back body1 needs to go from d to be at impact Point? relative to vectorMagnitude?
    var backdist = Math.sqrt(Math.pow(body1.shapeValues.radius + body2.shapeValues.radius, 2) - closestDistSq);


    var vectorMagnitude = Force.fromVector(vector.x, vector.y).magnitude;
    // check this - should be negative?
    // changed y to be negative - (used to be positive in the old application, the y vector was reversed so plus == up)
    var stopPoint = {
        x: d.x + backdist * (-vector.x / vectorMagnitude),
        y: d.y + backdist * (-vector.y / vectorMagnitude)
    } as Point;

    var directionFromBody2ToImpactPoint = Force.fromVector(stopPoint.x - body2.shapeValues.x, stopPoint.y - body2.shapeValues.y).direction

    if (body1AtEnd.isIntersectingWith(body2)) {

        var impactPoint = {
            x: stopPoint.x + (body1AtEnd.shapeValues.radius * -Math.sin(
                directionFromBody2ToImpactPoint
            )),

            y: stopPoint.y + (body1AtEnd.shapeValues.radius * -Math.cos(
                directionFromBody2ToImpactPoint
            ))
        } as Point

        return {
            type: 'end inside',
            x: impactPoint.x,
            y: impactPoint.y,
            impactPoint,
            stopPoint: stopPoint,
            item1: body1,
            item2: body2,
            force: force,
            force2: force2
        } as CollisionReport;
    };


    if (closestDist <= body2.shapeValues.radius + body1AtEnd.shapeValues.radius) { // is on collision course
        var body1WouldPassThroughBody2;

        if (vector.x !== 0) {
            if (
                (body1.shapeValues.x < stopPoint.x && stopPoint.x < body1AtEnd.shapeValues.x) ||
                (body1.shapeValues.x > stopPoint.x && stopPoint.x > body1AtEnd.shapeValues.x)
            ) {
                body1WouldPassThroughBody2 = true;
            }
        } else { //no x velocity, so check by y coords
            if (
                (body1.shapeValues.y < stopPoint.y && stopPoint.y < body1AtEnd.shapeValues.y) ||
                (body1.shapeValues.y > stopPoint.y && stopPoint.y > body1AtEnd.shapeValues.y)
            ) {
                body1WouldPassThroughBody2 = true;
            }
        }

        if (body1WouldPassThroughBody2) {
            var impactPoint = {
                x: stopPoint.x + (body1AtEnd.shapeValues.radius * -Math.sin(
                    directionFromBody2ToImpactPoint
                )),
                y: stopPoint.y + (body1AtEnd.shapeValues.radius * -Math.cos(
                    directionFromBody2ToImpactPoint
                ))
            };
            return {
                type: 'passed through',
                impactPoint,
                stopPoint: stopPoint,
                item1: body1,
                item2: body2,
                force: force,
                force2: force2
            } as CollisionReport;
        }

    };

    return null;

}

export { detectCircleCollidingWithCircle }