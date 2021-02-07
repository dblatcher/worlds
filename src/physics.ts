import { World } from './World'
import { Thing } from './Thing'
import { Force } from './Force'

import * as Geometry from './geometry'

interface Point { x: number, y: number }
interface Vector { x: number, y: number }

class CollisionReport {
    type: "end inside" | "passed through" | "start inside"
    x: number //the point of impact
    y: number //the point of impact
    stopPoint: Point
    item1: Thing
    item2: Thing
    force: number
    force2: number
}

/**
 * Calculation the gravitational effect of one Thing on another
 * 
 * @param gravitationalConstant The gravitational constant of the world the things are in
 * @param affectedThing The Thing being pulled towards the gravity source
 * @param thing2 The gravity source
 * 
 * @return the Force exerted on the affectedThing
 */
function getGravitationalForce(gravitationalConstant: number, affectedThing: Thing, thing2: Thing) {
    if (affectedThing === thing2) { return new Force(0, 0) }
    if (Geometry.areCirclesIntersecting(affectedThing.shapeValues, thing2.shapeValues)) { return new Force(0, 0) }

    const r = Geometry.getDistanceBetweenPoints(affectedThing.data, thing2.data);
    const magnitude = gravitationalConstant * ((affectedThing.mass * thing2.mass / Math.pow(r, 2)));
    const direction = Geometry.getHeadingFromPointToPoint(thing2.data, affectedThing.data)
    return new Force(magnitude, direction)
}


function checkForCircleCollisions(item1: Thing, item2: Thing) {
    // can't collide with self!
    if (item1 === item2) { return null };

    var vector = {
        x: item1.momentum.vectorX,
        y: item1.momentum.vectorY,
    }


    function errorTest(Q: any) {
        var badValues = [];
        if (!isFinite(Q.x)) { badValues.push('x') }
        if (!isFinite(Q.y)) { badValues.push('y') }
        if (badValues.length) { return badValues }
        return null;
    };

    if (errorTest(vector)) {
        console.log('bad vector for ' + item1.data.color + ' ' + item1.data.shape.id + 'in checkForCircleCollisions')
        console.log(vector)
        return null
    }


    var force = item1.mass && item1.momentum ? item1.mass * item1.momentum.magnitude : 0;
    var force2 = item2.mass && item2.momentum ? item2.mass * item2.momentum.magnitude : force;

    var movedObject = {
        x: (item1.data.x + vector.x),
        y: (item1.data.y + vector.y),
        circular: true,
        radius: item1.shapeValues.radius,
    }

    if (Geometry.areCirclesIntersecting(item1.shapeValues, item2.shapeValues)) {
        var unitVector: Vector = { x: undefined, y: undefined };
        var stopPoint: Point = { x: item1.data.x, y: item1.data.y };

        // this doesn't work well - shoves the object back the shortest route out of item2
        // should move backward relative to direction of travel - use the c calculation below
        if (item1.mass <= item2.mass) { // only move the lighter object out of the way
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
        }

        return ({
            type: 'start inside',
            x: item1.data.x,
            y: item1.data.y,
            stopPoint: stopPoint,
            item1: item1,
            item2: item2,
            force: force,
            force2: force2
        } as CollisionReport);
    };

    // TO DO - optimise calculations - only calculate if needed

    // d is the closest point to item2 on the path taken by item1
    var d = Geometry.closestpointonline(item1.shapeValues, movedObject, item2.shapeValues);
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

    if (Geometry.areCirclesIntersecting(movedObject, item2.shapeValues)) {

        var impactPoint = {
            x: item1PointWhenHit.x + (movedObject.radius * -Math.sin(
                directionFromItem2ToImpactPoint
            )),

            y: item1PointWhenHit.y + (movedObject.radius * -Math.cos(
                directionFromItem2ToImpactPoint
            ))
        } as Point

        return {
            type: 'end inside',
            x: impactPoint.x,
            y: impactPoint.y,
            stopPoint: item1PointWhenHit,
            item1: item1,
            item2: item2,
            force: force,
            force2: force2
        } as CollisionReport;
    };


    if (closestDist <= item2.shapeValues.radius + movedObject.radius) { // is on collision course
        var item1WouldPassThroughItem2;

        if (vector.x !== 0) {
            if (
                (item1.shapeValues.x < item1PointWhenHit.x && item1PointWhenHit.x < movedObject.x) ||
                (item1.shapeValues.x > item1PointWhenHit.x && item1PointWhenHit.x > movedObject.x)
            ) {
                item1WouldPassThroughItem2 = true;
            }
        } else { //no x velocity, so check by y coords
            if (
                (item1.shapeValues.y < item1PointWhenHit.y && item1PointWhenHit.y < movedObject.y) ||
                (item1.shapeValues.y > item1PointWhenHit.y && item1PointWhenHit.y > movedObject.y)
            ) {
                item1WouldPassThroughItem2 = true;
            }
        }

        if (item1WouldPassThroughItem2) {
            var impactPoint = {
                x: item1PointWhenHit.x + (movedObject.radius * -Math.sin(
                    directionFromItem2ToImpactPoint
                )),
                y: item1PointWhenHit.y + (movedObject.radius * -Math.cos(
                    directionFromItem2ToImpactPoint
                ))
            };
            return {
                type: 'passed through',
                x: impactPoint.x,
                y: impactPoint.y,
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

/**
 * calculate the vectors at which two colliding bodies will bounce off each other
 * 
 * @param body1 
 * @param body2 
 * @returns the vectors they will bounce off at
 */
function findBounceVectors(body1: Thing, body2: Thing) {
    //step 1 - normal unit vector and tangent unit vector
    var n = { x: body2.shapeValues.x - body1.shapeValues.x, y: body2.shapeValues.y - body1.shapeValues.y, mag: 0 };
    n.mag = Geometry.getDistanceBetweenPoints(n);

    var un = { x: n.x / n.mag, y: n.y / n.mag }
    var ut = { x: -un.y, y: un.x };

    //step 2 - define pre collision vectors
    var v1 = body1.momentum.vector;
    var v2 = body2.momentum.vector;

    // step3 express pre collision vectors in unit normal and tangent
    var v1n = (un.x * v1.x) + (un.y * v1.y);
    var v1t = (ut.x * v1.x) + (ut.y * v1.y);
    var v2n = (un.x * v2.x) + (un.y * v2.y);
    var v2t = (ut.x * v2.x) + (ut.y * v2.y);

    //step 4 tangential velocity doesn't change
    var v_1t = v1t;
    var v_2t = v2t;

    //step 5 new normal velocity
    var v_1n = ((v1n * (body1.mass - body2.mass)) + 2 * body2.mass * v2n) / (body1.mass + body2.mass);
    var v_2n = ((v2n * (body2.mass - body1.mass)) + 2 * body1.mass * v1n) / (body1.mass + body2.mass);

    //step 6 convert new normal and tangential velocities in Vectors 
    //mutliply by unit vectors 
    var V_1n = { x: v_1n * un.x, y: v_1n * un.y };
    var V_1t = { x: v_1t * ut.x, y: v_1t * ut.y };

    var V_2n = { x: v_2n * un.x, y: v_2n * un.y };
    var V_2t = { x: v_2t * ut.x, y: v_2t * ut.y };

    // step 7 - add component vectors
    var newVector1 = { x: V_1n.x + V_1t.x, y: V_1n.y + V_1t.y } as Vector;
    var newVector2 = { x: V_2n.x + V_2t.x, y: V_2n.y + V_2t.y } as Vector;

    return {
        vector1: newVector1,
        vector2: newVector2
    };

};

/**
 * move the first item to the stop point in the collsion, then
 * move the two items appart if they are still intersecting
 * assumes round items
 * 
 * @param collision the collidion report
 */
function separateCollidingBodies(collision: CollisionReport) {

    // this seems wrong - moving out of sequence
    collision.item1.data.x = collision.stopPoint.x;
    collision.item1.data.y = collision.stopPoint.y;

    var shape1 = collision.item1.shapeValues
    var shape2 = collision.item2.shapeValues

    if (Geometry.areCirclesIntersecting(shape1, shape2)) {
        var distanceToSeparate = 1 + shape1.radius + shape2.radius - Geometry.getDistanceBetweenPoints(shape1, shape2);

        var headingToSeparate = Force.fromVector(shape1.x - shape2.x, shape1.y - shape2.y).direction;
        var magicV: Vector = new Force(distanceToSeparate, headingToSeparate).vector
        collision.item1.data.x += magicV.x / 2;
        collision.item1.data.y += magicV.y / 2;
        collision.item2.data.x -= magicV.x / 2;
        collision.item2.data.y -= magicV.y / 2;
    }
}

/**
 * make a the items in a collision report bounce off each other (assumes both are circular)
 * 
 * @param collision the CollisionReport
 */
function mutualRoundBounce(collision: CollisionReport) {

    separateCollidingBodies(collision)

    var bounce = findBounceVectors(collision.item1, collision.item2);
    collision.item1.momentum = Force.fromVector(bounce.vector1.x, bounce.vector1.y)
    collision.item2.momentum = Force.fromVector(bounce.vector2.x, bounce.vector2.y)
};


export { getGravitationalForce, checkForCircleCollisions, CollisionReport, mutualRoundBounce }