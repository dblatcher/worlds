import { Body } from './Body'
import { Force } from './Force'

import * as Geometry from './geometry'
import { Vector } from './geometry'
import { CollisionReport, EdgeCollisionReport } from './collisionDetection'
import { Fluid } from './Fluid'
import { Point, _90deg } from './geometry/definitions'


function getUpthrustForce(gravitationalConstant: number, globalGravityForce: Force, body: Body, fluid: Fluid): Force {
    if (!globalGravityForce) { return Force.none }

    const { shapeValues } = body
    const distanceAboveFluidSurface = fluid.surfaceLevel - shapeValues.top

    // https://en.wikipedia.org/wiki/Spherical_cap
    const volumeAboveSurface = distanceAboveFluidSurface < 0
        ? 0
        : ((Math.PI * distanceAboveFluidSurface ** 2) / 3) * ((3 * shapeValues.radius) - distanceAboveFluidSurface)

    const distanceBelowFluidBottom = shapeValues.bottom - fluid.bottomLevel
    const volumeBelowBottom = distanceBelowFluidBottom < 0
        ? 0
        : ((Math.PI * distanceBelowFluidBottom ** 2) / 3) * ((3 * shapeValues.radius) - distanceBelowFluidBottom)

    const volumeOfFluidDisplaced = body.volume - volumeAboveSurface - volumeBelowBottom

    // boyancy = fluid.density * [volume of fluid displaced] * g
    const bouyancy = gravitationalConstant * globalGravityForce.magnitude * fluid.data.density * volumeOfFluidDisplaced
    return new Force(bouyancy, globalGravityForce.direction + Math.PI)
}


function calculateDragForce(body: Body, currentForce: Force): Force {
    if (!body.world) { return Force.none }
    const { fluids, airDensity, areas } = body.world
    if (fluids.length == 0 && areas.length == 0 && airDensity == 0) { return Force.none }

    // assuming sphere
    const crossSectionalArea = body.shapeValues.radius ** 2 * Math.PI
    let velocity = currentForce.magnitude
    const expectedEndPoint = Geometry.translatePoint(body.data, body.momentum.vector)
    const path:[Point, Point] = [{x:body.data.x, y:body.data.y}, expectedEndPoint];

    // assumes the body never passes through an area/fluid in one tick or crosses muliple boundaries
    // to do - build list of the mediums (air, fluid) on the body's path with distances traveled through each
    // calculate the drag through the first
    // if drag through the first would stop the body reaching the second
    // calculate the drag through the remaining velocity in the second
    // apply total drag


    // possible problem - only looking at center point of body
    // models perfect spheres moving on a flat surface

    const fluidBodyStartsIn = fluids.find(fluid => Geometry.isPointInsidePolygon(body.data, fluid.polygonPoints))
    const fluidBodyEndsIn = fluids.find(fluid => Geometry.isPointInsidePolygon(expectedEndPoint, fluid.polygonPoints))
    const areaBodyStartsIn = areas.find(area => area.checkIfContainsPoint(body.data)) || null;
    const areaBodyEndsIn = areas.find(area => area.checkIfContainsPoint(expectedEndPoint)) || null;

    const startMedium = fluidBodyStartsIn || areaBodyStartsIn || null
    const endMedium = fluidBodyEndsIn || areaBodyEndsIn || null

    const startingMediumDensity = startMedium
        ? startMedium.data.density
        : airDensity

    const endingMediumDensity = endMedium
        ? endMedium.data.density
        : airDensity

    const averageDensity = startingMediumDensity + endingMediumDensity / 2
    const backwards = Geometry.reverseHeading(currentForce.direction)
    const densityChange = (startingMediumDensity - endingMediumDensity) / (startingMediumDensity + endingMediumDensity)

    let dragMagnitude: number,
        dragDirection: number,
        crossingInfo: Geometry.IntersectionInfo;



    if (startMedium == endMedium) {
        dragMagnitude = calculateDragThroughMedium(averageDensity, body.mass, velocity, crossSectionalArea);
        dragDirection = Geometry.reverseHeading(currentForce.direction);
    }
    else if (startMedium == null) {

        if (endMedium.isArea) {
            crossingInfo = areaBodyEndsIn.getIntersectionsWithPath(path)[0];
        }

        if (endMedium.isFluid) {
            crossingInfo = Geometry.getSortedIntersectionInfoWithEdges(path, Geometry.getPolygonLineSegments(fluidBodyEndsIn.polygonPoints))[0]
        }

        if (crossingInfo) {
            // new Effect({ color: 'yellow', x: crossingInfo.point.x, y: crossingInfo.point.y, duration: 15 })
            //     .enterWorld(body.world)

            const normalAngle = Geometry.normaliseHeading(crossingInfo.edgeAngle - _90deg)
            const incomingAngleOfincidence = Geometry.normaliseHeading(normalAngle - Geometry.getHeadingFromPointToPoint(body.data, expectedEndPoint))

            dragDirection = Geometry.normaliseHeading(backwards + (densityChange * incomingAngleOfincidence));
        } else {
            console.log('no crossing info into medium')
            dragDirection = backwards;
        }

    }
    else if (endMedium == null) {
        if (startMedium.isArea) {
            crossingInfo = areaBodyStartsIn.getIntersectionsWithPath(path)[0];
        }
        if (startMedium.isFluid) {
            crossingInfo = Geometry.getSortedIntersectionInfoWithEdges(path, Geometry.getPolygonLineSegments(fluidBodyStartsIn.polygonPoints))[0]
        }

        if (crossingInfo) {
            // new Effect({ color: 'blue', x: crossingInfo.point.x, y: crossingInfo.point.y, duration: 15 })
            //     .enterWorld(body.world)

            const normalAngle = Geometry.normaliseHeading(crossingInfo.edgeAngle - _90deg)
            const incomingAngleOfincidence = Geometry.normaliseHeading(normalAngle - Geometry.getHeadingFromPointToPoint(body.data, expectedEndPoint))

            dragDirection = Geometry.normaliseHeading(backwards - (densityChange * incomingAngleOfincidence));
        }else {
            console.log('no crossing info out of medium')
            dragDirection = backwards;
        }

    } else {
        dragDirection = backwards;
    }

    // problem - body would not reach expectedEndPoint if it will collide with another body first,
    // so might not actually cross the boundary. 
    // For greater accuracy may need to detect collisions with Areas in the same way as detect collisions
    // with Bodies and apply the effects (momentum changes) in order and recalculate the path and
    // after each one.
    // Would only use this method to calculate drag from starting medium.

    dragMagnitude = calculateDragThroughMedium(averageDensity, body.mass, velocity, crossSectionalArea);

    return new Force(
        Math.min(dragMagnitude, velocity),
        dragDirection
    )

    // https://en.wikipedia.org/wiki/Drag_(physics)
    //dragForce = (1/2) * density * (speed**2) * dragCoefficient * crossSectionalArea
    function calculateDragThroughMedium(mediumDensity: number, bodyMass: number, bodyVelocity: number, bodyCrossSectionalArea: number, dragCoefficient: number = 1) {
        return ((1 / 2) * mediumDensity * (bodyVelocity * 2) * dragCoefficient * bodyCrossSectionalArea) / bodyMass
    }
}

/**
 * Calculation the gravitational effect of one Body on another
 *
 * @param gravitationalConstant The gravitational constant of the world the bodies are in
 * @param affectedBody The Body being pulled towards the gravity source
 * @param gravitySource The body exherting gravity
 *
 * @return the Force exerted on the affectedBody
 */
function getGravitationalForce(gravitationalConstant: number, affectedBody: Body, gravitySource: Body) {
    if (affectedBody === gravitySource) { return Force.none }

    if (affectedBody.isIntersectingWith(gravitySource)) { return Force.none }

    const r = Geometry.getDistanceBetweenPoints(affectedBody.data, gravitySource.data);
    const magnitude = gravitationalConstant * ((affectedBody.mass * gravitySource.mass / Math.pow(r, 2)));
    const direction = Geometry.getHeadingFromPointToPoint(gravitySource.data, affectedBody.data)
    return new Force(magnitude, direction)
}

/**
 * Find the vector resulting from a round body bouncing off a straight edge
 * 
 * @param edgeCollisionReport the edge collision report
 */
function findEdgeBounceForce(edgeCollisionReport: EdgeCollisionReport) {
    const { item1, wallAngle } = edgeCollisionReport

    return new Force(
        item1.momentum.magnitude * item1.data.elasticity,
        Geometry.reflectHeading(item1.momentum.direction, wallAngle)
    )
}

/**
 * Find the vector resulting from a round body bouncing off an immobile body
 * 
 * @param collisionReport the collision report
 */
function findBounceOfImmobileBodyForce(collisionReport: CollisionReport) {
    const { item1, item2, impactPoint } = collisionReport

    const angleToReflectOff = typeof collisionReport.wallAngle === 'number'
        ? collisionReport.wallAngle
        : Geometry.getCircleTangentAtPoint(item2.shapeValues, impactPoint)

    const reflectedForce = new Force(
        item1.momentum.magnitude * (item1.data.elasticity + item2.data.elasticity) / 2,
        Geometry.reflectHeading(item1.momentum.direction, angleToReflectOff)
    )

    return reflectedForce
}

/**
 * calculate the vectors at which two round colliding bodies will bounce off each other
 * with an elastic collision
 *
 * @param collision the collision report
 * @returns the vectors they will bounce off at
 */
function findRoundBounceCollisionVectorsMethod2(collision: CollisionReport) {
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

    const coefficientOfRestitution = ((item1.data.elasticity + item2.data.elasticity) / 2)

    newVector1.x = newVector1.x * coefficientOfRestitution
    newVector1.y = newVector1.y * coefficientOfRestitution
    newVector2.x = newVector2.x * coefficientOfRestitution
    newVector2.y = newVector2.y * coefficientOfRestitution

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

    const { item1, item2, stopPoint } = collision;

    // this seems wrong - moving out of sequence
    item1.data.x = stopPoint.x;
    item1.data.y = stopPoint.y;

    var shape1 = item1.shapeValues
    var shape2 = item2.shapeValues

    if (item1.isIntersectingWith(item2)) {
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
 * NOT USING - LOOK WRONG IN PRACTISE
 * calculate the vectors at which two colliding bodies will bounce off each other
 * taking account of energy lost to inelasticity
 *
 * @param collision the collision report
 * @returns the vectors they will bounce off at
 */
function findRoundBounceCollisionVectorsMethod1(collision: CollisionReport) {
    //step 1 - normal unit vector and tangent unit vector
    const { item1, item2 } = collision
    const coefficientOfRestitution = ((item1.data.elasticity + item2.data.elasticity) / 2)

    // is the coefficient of restitution; if it is 1 we have an elastic collision; if it is 0 we have a perfectly inelastic collision, see below.

    function getVectorComponent(item: Body, property: "vectorX" | "vectorY") {
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
function bounceCircleOffCircle(collision: CollisionReport) {

    separateCollidingBodies(collision)

    // problem - after a collision, the only force acting to form the momentum used by Body.move()
    // is the reflected force - for gravity from other bodies, thrust etc are ignored
    // need to recalculate withouth them 'applying double'
    if (collision.item2.data.immobile) {
        collision.item1.momentum = findBounceOfImmobileBodyForce(collision)
    } else {
        const bounce = findRoundBounceCollisionVectorsMethod2(collision)
        collision.item1.momentum = Force.fromVector(bounce.vector1.x, bounce.vector1.y)
        collision.item2.momentum = Force.combine([Force.fromVector(bounce.vector2.x, bounce.vector2.y), collision.item2.momentum])
    }
};


function bounceCircleOffSquare(collision: CollisionReport) {

    if (collision.item2.data.immobile) {

        const copyOfCircle = collision.item1.duplicate()
        copyOfCircle.data.x = collision.stopPoint.x
        copyOfCircle.data.y = collision.stopPoint.y

        const wouldIntersectAtStopPoint = copyOfCircle.isIntersectingWith(collision.item2)

        if (wouldIntersectAtStopPoint && collision.type != 'start inside') {
            // const indexNumber = collision.item1.world.bodies.indexOf(collision.item1)
            // console.log(`#${indexNumber}: ${collision.type}: [${collision.item1.data.x}, ${collision.item1.data.y}] -> [${copyOfCircle.data.x}, ${copyOfCircle.data.y}]`)
        } else {
            collision.item1.data.x = collision.stopPoint.x
            collision.item1.data.y = collision.stopPoint.y
        }

        if (collision.type != 'start inside') {
            collision.item1.momentum = findBounceOfImmobileBodyForce(collision)
        }

    } else {
        console.warn(`Unhandled circle-mobile square collision`, collision)
    }

}


/**
 * DOES NOT WORK PROPERLY YET
 * @param collision 
 */
function bounceSquareOffCircle(collision: CollisionReport) {

    if (collision.item2.data.immobile) {
        const copyOfCircle = collision.item1.duplicate()
        copyOfCircle.data.x = collision.stopPoint.x
        copyOfCircle.data.y = collision.stopPoint.y

        const wouldIntersectAtStopPoint = copyOfCircle.isIntersectingWith(collision.item2)

        if (wouldIntersectAtStopPoint && collision.type != 'start inside') {
            // const indexNumber = collision.item1.world.bodies.indexOf(collision.item1)
            // console.log(`#${indexNumber}: ${collision.type}: [${collision.item1.data.x}, ${collision.item1.data.y}] -> [${copyOfCircle.data.x}, ${copyOfCircle.data.y}]`)
        } else {
            collision.item1.data.x = collision.stopPoint.x
            collision.item1.data.y = collision.stopPoint.y
        }

        if (collision.type != 'start inside') {
            collision.item1.momentum = findBounceOfImmobileBodyForce(collision)
        }

    } else {
        console.warn(`Unhandled square -> mobile-circle collision`, collision)
    }

}

function bounceOffWorldEdge(edgeCollisionReport: EdgeCollisionReport) {

    const { item1, stopPoint } = edgeCollisionReport
    item1.data.x = stopPoint.x;
    item1.data.y = stopPoint.y;

    edgeCollisionReport.item1.momentum = findEdgeBounceForce(edgeCollisionReport)
}

function handleCollisionAccordingToShape(collisionReport: CollisionReport) {

    const collisionType = collisionReport.item1.data.shape.id + "-" + collisionReport.item2.data.shape.id;

    switch (collisionType) {
        case "circle-circle":
            return bounceCircleOffCircle(collisionReport)
        case "circle-square":
            return bounceCircleOffSquare(collisionReport)
        case "square-circle": // TO DO - more detection functions
            return bounceSquareOffCircle(collisionReport)
        case "square-square":
        default:
            console.log(`Unhandled ${collisionType} collision`, collisionReport)
            return
    }

}

export { getUpthrustForce, getGravitationalForce, bounceCircleOffCircle, bounceOffWorldEdge, handleCollisionAccordingToShape, calculateDragForce }