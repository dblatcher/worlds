import { Thing } from './Thing'
import { Force } from './Force'
import * as Geometry from './geometry'
import { Vector, Point, Circle } from './geometry'
import { Shape } from './Shape'

class CollisionReport {
    type: "end inside" | "passed through" | "start inside" | "edge"
    impactPoint: Point
    stopPoint: Point
    item1: Thing
    item2: Thing
    force: number
    force2: number
}

class EdgeCollisionReport extends CollisionReport {
    item2: null
    force2: 0
    wallAngle: number
}

/**
 * detect collision of one a moving circular thing with an edge of its World
 * 
 * @param item a circular thing
 * @return a collision report describing how item will hit the fixed edge, or null if it won't
 */
function detectCircleCollidingWithEdge(item: Thing): EdgeCollisionReport {

    const { height, width } = item.world
    const body = item.shapeValues
    const vector = item.momentum.vector
    const bodyAtEnd: Circle = { x: body.x + vector.x, y: body.y + vector.y, radius: body.radius }
    const edgesCrossedAtEnd = getEdgesCrossed(bodyAtEnd)
    const edgesCrossedAtStart = getEdgesCrossed(body)

    if (edgesCrossedAtStart.length > 0) {
        console.warn({ item, edgesCrossedAtStart })
    }

    if (edgesCrossedAtEnd.length === 0) { return null }


    let wallAngle: number;
    let stopPoint: Point = { x: body.x, y: body.y }

    if (edgesCrossedAtEnd.includes("BOTTOM")) {
        stopPoint.y = height - body.radius
        wallAngle = Math.PI * 0.5
    }
    if (edgesCrossedAtEnd.includes("TOP")) {
        stopPoint.y = body.radius
        wallAngle = Math.PI * 0.5
    }
    if (edgesCrossedAtEnd.includes("LEFT")) {
        stopPoint.x = body.radius
        wallAngle = Math.PI * 0.01
    }
    if (edgesCrossedAtEnd.includes("RIGHT")) {
        stopPoint.x = width - body.radius
        wallAngle = Math.PI * 0.01
    }

    const vectorFromStopPointToImpactPoint: Vector = new Force(body.radius, item.momentum.direction).vector

    return {
        type: "edge",
        wallAngle,
        impactPoint: {
            x: stopPoint.x + vectorFromStopPointToImpactPoint.x,
            y: stopPoint.y + vectorFromStopPointToImpactPoint.y
        },
        item1: item,
        item2: null,
        stopPoint: stopPoint,
        force: item.momentum.magnitude,
        force2: 0,
    }

    function getEdgesCrossed(circle: Circle) {
        const { x, y, radius } = circle
        let edges: string[] = []
        if (x - radius < 0) { edges.push("LEFT") }
        if (x + radius > width) { edges.push("RIGHT") }
        if (y - radius < 0) { edges.push("TOP") }
        if (y + radius > height) { edges.push("BOTTOM") }
        return edges
    }
}


/**
 * detect collision of one a moving circular thing with another circular thing
 * 
 * @param item1 a circular thing
 * @param item2 another circular thing
 * @returns a collision report describing how item1 will intersect with item2 on item1's path
 * or null if no collision will occur
 */
function detectCircleCollidingWithCircle(item1: Thing, item2: Thing) {
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

    if (item1.isIntersectingWith(item2)) {
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

    if (item1.isIntersectingWith(item2)) {

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
            impactPoint,
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

function getCollisionDetectionFunction(shape1: Shape, shape2: Shape) {

    const collisionType = shape1.id + "-" + shape2.id;

    switch (collisionType) {
        case "circle-circle":
            return detectCircleCollidingWithCircle
        case "square-circle": // TO DO - more detection functions
        case "circle-square":
        case "square-square":
        default:
            return () => null as CollisionReport
    }
}

function getEdgeCollisionDetectionFunction(shape: Shape) {

    switch (shape.id) {
        case "circle":
            return detectCircleCollidingWithEdge
        case "square": // TO DO - write detectSquareCollidingWithEdge
            return detectCircleCollidingWithEdge
        default:
            return detectCircleCollidingWithEdge
    }

}

export { CollisionReport, EdgeCollisionReport, getEdgeCollisionDetectionFunction, getCollisionDetectionFunction }