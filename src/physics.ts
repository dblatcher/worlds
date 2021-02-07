import { World } from './World'
import { Thing } from './Thing'
import { Force } from './Force'

import * as Geometry from './geometry'

interface Point { x: number, y: number }
interface Vector { x: number, y: number }

interface CollisionReport {
    type: string
    x: number //the point of impact
    y: number //the point of impace
    stopPoint: Point,
    item1: Thing,
    item2: Thing,
    force: number,
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
        h: item1.momentum.direction,
        m: item1.momentum.magnitude
    }


    function errorTest(Q: any) {
        var badValues = [];
        if (!isFinite(Q.x)) { badValues.push('x') }
        if (!isFinite(Q.y)) { badValues.push('y') }
        if (!isFinite(Q.m)) { badValues.push('m') }
        if (!isFinite(Q.h)) { badValues.push('h') }
        if (badValues.length) { return badValues }
        return null;
    };

    if (errorTest(vector)) {
        console.log('bad vector for ' + item1.data.color + ' ' + item1.data.shape.id + 'in checkForCircleCollisions')
        console.log(vector)
    }


    var force = item1.mass && item1.momentum ? item1.mass * item1.momentum.magnitude : 0;
    var force2 = item2.mass && item2.momentum ? item2.mass * item2.momentum.magnitude : force;

    var movedObject = {
        x: (item1.data.x + vector.x),
        y: (item1.data.y + vector.y),
        circular: true,
        radius: item1.data.size,
        size: item1.data.size
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

    var d = Geometry.closestpointonline(item1.shapeValues, movedObject, item2.shapeValues);
    var closestDist = Geometry.getDistanceBetweenPoints(item2.shapeValues, d);
    var closestDistSq = closestDist * closestDist;
    var movementvectorlength = Force.fromVector(vector.x, vector.y).magnitude;
    var backdist = Math.sqrt(Math.pow(movedObject.radius + item2.shapeValues.radius, 2) - closestDistSq);
    var item1PointWhenHit = {
        x: d.x + backdist * (-vector.x / movementvectorlength),
        y: d.y + backdist * (vector.y / movementvectorlength)
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


export { getGravitationalForce, checkForCircleCollisions }