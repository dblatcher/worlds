import { Thing } from './Thing'
import { Force } from './Force'

import * as Geometry from './geometry'
import { CollisionReport } from './collisionDetection'

interface Vector { x: number, y: number }


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
    if (affectedThing === thing2) { return Force.none }
    if (Geometry.areCirclesIntersecting(affectedThing.shapeValues, thing2.shapeValues)) { return Force.none }

    const r = Geometry.getDistanceBetweenPoints(affectedThing.data, thing2.data);
    const magnitude = gravitationalConstant * ((affectedThing.mass * thing2.mass / Math.pow(r, 2)));
    const direction = Geometry.getHeadingFromPointToPoint(thing2.data, affectedThing.data)
    return new Force(magnitude, direction)
}

/**
 * Find the vector resulting from a round body bouncing off a straight edge
 * 
 * @param edgeCollisionReport the collision report, with type edge
 */
function findFlatBounceVector(edgeCollisionReport: CollisionReport) {
    const { item1, stopPoint, wallAngle } = edgeCollisionReport

    item1.data.x = stopPoint.x;
    item1.data.y = stopPoint.y;

    item1.momentum = new Force(
        item1.momentum.magnitude * item1.data.elasticity,
        Geometry.reflectHeading(item1.momentum.direction, wallAngle)
    )
}

/**
 * calculate the vectors at which two colliding bodies will bounce off each other
 * with an elastic collision
 *
 * @param collision the collision report
 * @returns the vectors they will bounce off at
 */
function findElasticCollisionVectors(collision: CollisionReport) {
    const { item1, item2 } = collision
    //step 1 - normal unit vector and tangent unit vector
    var n = { x: item2.shapeValues.x - item1.shapeValues.x, y: item2.shapeValues.y - item1.shapeValues.y, mag: 0 };
    n.mag = Geometry.getDistanceBetweenPoints(n);

    var un = { x: n.x / n.mag, y: n.y / n.mag }
    var ut = { x: -un.y, y: un.x };

    //step 2 - define pre collision vectors
    var v1 = item1.momentum.vector;
    var v2 = item2.momentum.vector;

    // step3 express pre collision vectors in unit normal and tangent
    var v1n = (un.x * v1.x) + (un.y * v1.y);
    var v1t = (ut.x * v1.x) + (ut.y * v1.y);
    var v2n = (un.x * v2.x) + (un.y * v2.y);
    var v2t = (ut.x * v2.x) + (ut.y * v2.y);

    //step 4 tangential velocity doesn't change
    var v_1t = v1t;
    var v_2t = v2t;

    //step 5 new normal velocity
    var v_1n = ((v1n * (item1.mass - item2.mass)) + 2 * item2.mass * v2n) / (item1.mass + item2.mass);
    var v_2n = ((v2n * (item2.mass - item1.mass)) + 2 * item1.mass * v1n) / (item1.mass + item2.mass);

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
 * @param collision the collision report
 */
function separateCollidingBodies(collision: CollisionReport) {

    const {item1, item2, stopPoint} = collision;

    // this seems wrong - moving out of sequence
    item1.data.x = stopPoint.x;
    item1.data.y = stopPoint.y;

    var shape1 = item1.shapeValues
    var shape2 = item2.shapeValues

    if (Geometry.areCirclesIntersecting(shape1, shape2)) {
        var distanceToSeparate = 1 + shape1.radius + shape2.radius - Geometry.getDistanceBetweenPoints(shape1, shape2);

        var headingToSeparate = Force.fromVector(shape1.x - shape2.x, shape1.y - shape2.y).direction;
        var magicV: Vector = new Force(distanceToSeparate, headingToSeparate).vector
        
        if (item2.data.immobile) {
            item1.data.x += magicV.x;
            item1.data.y += magicV.y;
        } else {
            item1.data.x += magicV.x / 2;
            item1.data.y += magicV.y / 2;
            item2.data.x -= magicV.x / 2;
            item2.data.y -= magicV.y / 2;
        }

    }
}


/**
 * calculate the vectors at which two colliding bodies will bounce off each other
 * taking account of energy lost to inelasticity
 *
 * @param collision the collision report
 * @returns the vectors they will bounce off at
 */
function findInelasticCollisionVectors(collision: CollisionReport) {
    //step 1 - normal unit vector and tangent unit vector
    const { item1, item2 } = collision
    const coefficientOfRestitution = ((item1.data.elasticity + item2.data.elasticity)/2)

    // is the coefficient of restitution; if it is 1 we have an elastic collision; if it is 0 we have a perfectly inelastic collision, see below.

    function getVectorComponent(item: Thing, property: "vectorX" | "vectorY") {
        const otherItem = item === item1 ? item2 : item1
        return (
            coefficientOfRestitution * otherItem.mass * (otherItem.momentum[property] - item.momentum[property]) +
            item1.mass * item.momentum[property] +
            otherItem.mass * otherItem.momentum[property]
        ) / (item.mass + otherItem.mass)
    }

    const vector1: Vector = {
        x: getVectorComponent(item1, "vectorX"),
        y: getVectorComponent(item1, "vectorY")
    }
    const vector2: Vector = {
        x: getVectorComponent(item2, "vectorX"),
        y: getVectorComponent(item2, "vectorY")
    }

    return {
        vector1, vector2
    };

};

/**
 * make a the items in a collision report bounce off each other (assumes both are circular)
 *
 * @param collision the CollisionReport
 */
function mutualRoundBounce(collision: CollisionReport) {

    separateCollidingBodies(collision)

    const bounce = findInelasticCollisionVectors(collision);
    collision.item1.momentum = Force.fromVector(bounce.vector1.x, bounce.vector1.y)
    collision.item2.momentum = Force.fromVector(bounce.vector2.x, bounce.vector2.y)
};


export { getGravitationalForce, mutualRoundBounce, findFlatBounceVector }