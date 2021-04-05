import { Body } from '../Body'
import { Force } from '../Force'
import * as Geometry from '../geometry'
import { Vector, Point, Circle, areCircleAndPolygonIntersecting, _90deg } from '../geometry'
import { Shape } from '../Shape'
import { detectCircleCollidingWithCircle } from './circle-circle'

import {CollisionReport, EdgeCollisionReport} from './CollisionReport'

/**
 * Find the point on a polygon's edges closest to a give starting point
 * 
 * @param startingPoint a point
 * @param polygon a pollygon
 * @returns the point on the polygon edge closest to the startingPoint, 
 * the distance between them, which edge they are on and the angle of that edge
 */
function getInfoAboutNearestPointOnPolygon(startingPoint: Point, polygon: Point[]): {
    point: Point, distance: number, edge: [Point, Point], edgeAngle: number
} {
    const intersectionsFromInside = Geometry.getPolygonLineSegments(polygon).map(edge => {
        const pointOnEdge = Geometry.closestpointonline(edge[0], edge[1], startingPoint)
        const distance = Geometry.getDistanceBetweenPoints(pointOnEdge, startingPoint)
        return { edge, point: pointOnEdge, distance, edgeAngle: 0 }
    })
        .sort((intersectionA, intersectionB) => intersectionA.distance - intersectionB.distance)

    const nearestIntersection = intersectionsFromInside[0]
    nearestIntersection.edgeAngle = Geometry.getHeadingFromPointToPoint(...nearestIntersection.edge)

    return nearestIntersection
}


/**
 * detect collision of one a moving circular body with an edge of its World
 * 
 * @param item a circular body
 * @return a collision report describing how item will hit the fixed edge, or null if it won't
 */
function detectCircleCollidingWithEdge(item: Body): EdgeCollisionReport {

    const { height, width } = item.world
    const body = item.shapeValues
    const vector = item.momentum.vector
    const bodyAtEnd: Circle = { x: body.x + vector.x, y: body.y + vector.y, radius: body.radius }
    const edgesCrossedAtEnd = getEdgesCrossed(bodyAtEnd)
    const edgesCrossedAtStart = getEdgesCrossed(body)

    if (edgesCrossedAtStart.length > 0) {
        //     console.warn({ item, edgesCrossedAtStart })
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
 * detect collision of one a moving circular body with a square body
 * 
 * @param item1 a moving circular body
 * @param item2 a square body
 * @returns a collision report describing how item1 will intersect with item2 on item1's path
 * or null if no collision will occur
 */
function detectCircleCollidingWithSquare(item1: Body, item2: Body): CollisionReport {

    if (item1 === item2) { return null };

    const { polygonPoints } = item2
    const circleShapeValues = item1.shapeValues

    var vector = {
        x: item1.momentum.vectorX,
        y: item1.momentum.vectorY,
    }

    const force = item1.mass && item1.momentum ? item1.mass * item1.momentum.magnitude : 0;
    const force2 = item2.mass && item2.momentum ? item2.mass * item2.momentum.magnitude : force;



    // path of the circular item1 is described by circle for start position(item1), circle for end position (movedObject) and a rectangle(pathArea)
    // the pathArea's length is the distance traveled by item1, its height is item1's radius*2 (diameter). 
    // The mid point of each height edge are the centers of (item1) and (movedObject)


    if (areCircleAndPolygonIntersecting(circleShapeValues, polygonPoints)) {
        // find the edge closest point on any edge [P] to the circle's center
        // set the stopPoint as the point that takes the circle out of the polygon
        // by moving towards P (if circle center is inside the polygon)
        // or by moving away from P (if the center is already outside) 

        const placeOnEdgesNearestCircle = getInfoAboutNearestPointOnPolygon(circleShapeValues, polygonPoints)

        let stopPoint

        if (Geometry.isPointInsidePolygon(circleShapeValues, polygonPoints)) {
            const directionToImpactPoint = Geometry.getHeadingFromPointToPoint(placeOnEdgesNearestCircle.point, circleShapeValues)
            stopPoint = {
                x: placeOnEdgesNearestCircle.point.x + Geometry.getVectorX(circleShapeValues.radius + 1, directionToImpactPoint),
                y: placeOnEdgesNearestCircle.point.y + Geometry.getVectorY(circleShapeValues.radius + 1, directionToImpactPoint)
            }
        } else {
            stopPoint = {
                x: placeOnEdgesNearestCircle.point.x + Geometry.getVectorX(circleShapeValues.radius + 1, placeOnEdgesNearestCircle.edgeAngle - _90deg),
                y: placeOnEdgesNearestCircle.point.y + Geometry.getVectorY(circleShapeValues.radius + 1, placeOnEdgesNearestCircle.edgeAngle - _90deg)
            }
        }

        return {
            type: "start inside",
            impactPoint: placeOnEdgesNearestCircle.point,
            wallAngle: placeOnEdgesNearestCircle.edgeAngle,
            stopPoint,
            item1, item2, force, force2
        }
    };

    var movedObject: Circle = {
        x: (item1.data.x + vector.x),
        y: (item1.data.y + vector.y),
        radius: item1.data.size
    }

    if (areCircleAndPolygonIntersecting(movedObject, polygonPoints)) {
        const stuff = getCircleSquareCollisionInfo(item1, item2)
        const { wallAngle, stopPoint, impactPoint } = stuff
        return {
            type: 'end inside',
            wallAngle, stopPoint, impactPoint,
            item1, item2, force, force2
        };
    };

    const rightX = Geometry.getVectorX(item1.data.size, item1.momentum.direction + _90deg)
    const rightY = Geometry.getVectorY(item1.data.size, item1.momentum.direction + _90deg)

    const pathArea: Point[] = [
        { x: item1.data.x + rightX, y: item1.data.y + rightY },
        { x: item1.data.x - rightX, y: item1.data.y - rightY },
        { x: movedObject.x - rightX, y: movedObject.y - rightY },
        { x: movedObject.x + rightX, y: movedObject.y + rightY },
    ]

    if (Geometry.arePolygonsIntersecting(pathArea, polygonPoints)) {
        const stuff = getCircleSquareCollisionInfo(item1, item2)
        const { wallAngle, stopPoint, impactPoint } = stuff
        return {
            type: 'passed through',
            wallAngle, stopPoint, impactPoint,
            item1, item2, force, force2
        };
    }

    return null;


}


/**
 * find collision information between a circlular and square body
 * @param circularBody the moving circlular body
 * @param squareBody the still square body
 * @returns the stopPoint, impactPoint and wallAngle of the circular body's collision with the square
 */
function getCircleSquareCollisionInfo(circularBody: Body, squareBody: Body) {

    const squareEdges = Geometry.getPolygonLineSegments(squareBody.polygonPoints)

    const fromCenterToFront: Vector = {
        x: Geometry.getVectorX(circularBody.data.size, circularBody.momentum.direction),
        y: Geometry.getVectorY(circularBody.data.size, circularBody.momentum.direction),
    }

    var vector = {
        x: circularBody.momentum.vectorX,
        y: circularBody.momentum.vectorY,
    }

    const circleShapeValues = circularBody.shapeValues

    const centerPathOfCircle: [Point, Point] = [
        { x: circularBody.data.x, y: circularBody.data.y },
        { x: circularBody.data.x + fromCenterToFront.x * 2 + vector.x, y: circularBody.data.y + vector.y + fromCenterToFront.y * 2 },
    ]

    let intersections: { edgeIndex: number, point: Point, edge: [Point, Point] }[] = []

    squareEdges.forEach((edge, edgeIndex) => {
        let point = Geometry.findIntersectionPointOfLineSegments(edge, centerPathOfCircle)

        if (point !== null) {
            intersections.push({ edgeIndex, point, edge })
        }
    })

    if (intersections.length > 0) {
        intersections = intersections
            .sort((intersectionA, intersectionB) =>
                Geometry.getDistanceBetweenPoints(intersectionA.point, circleShapeValues) - Geometry.getDistanceBetweenPoints(intersectionB.point, circleShapeValues)
            )


        const pointWherePathWouldIntersectEdge = intersections[0].point
        const edgeWhichCircleWillHit = intersections[0].edge
        const angleOfEdge = Geometry.getHeadingFromPointToPoint(...edgeWhichCircleWillHit)
        const angleBetweenEdgeAndPath = Math.abs(circularBody.momentum.direction - angleOfEdge)

        // distance from pointWherePathWouldIntersectEdge and the stop point is
        // radius of circle / sine of interior angle between edge and path

        const distanceFromPointWherePathWouldIntersectEdge = circleShapeValues.radius / Math.sin(angleBetweenEdgeAndPath)

        const vectorFromPointWherePathWouldIntersectEdgeToStopPoint = Geometry.getXYVector(-distanceFromPointWherePathWouldIntersectEdge, circularBody.momentum.direction)
        const stopPoint = Geometry.translatePoint(pointWherePathWouldIntersectEdge, vectorFromPointWherePathWouldIntersectEdgeToStopPoint);


        return {
            stopPoint,
            impactPoint: Geometry.closestpointonline(...edgeWhichCircleWillHit, stopPoint),
            wallAngle: angleOfEdge
        }
    }

    // have to handle 'glancing' impacts (forward point of circle is past the edge)
    // can maybe just handle by 'extending' the edges for the purpose of finding pointWherePathWouldIntersectEdge
    console.warn('GLANCING HIT, NOT HANDLED')
    return {
        stopPoint: {
            x: circularBody.data.x,
            y: circularBody.data.x,
        },
        impactPoint: {
            x: circularBody.data.x,
            y: circularBody.data.x,
        },
        wallAngle: null
    }
}

function detectSquareCollidingWithCircle(item1: Body, item2: Body): CollisionReport {

    if (item1 === item2) { return null };

    const force = item1.mass && item1.momentum ? item1.mass * item1.momentum.magnitude : 0;
    const force2 = item2.mass && item2.momentum ? item2.mass * item2.momentum.magnitude : force;

    const { polygonPoints } = item1
    const circleShapeValues = item2.shapeValues

    //START INSIDE
    if (item1.isIntersectingWith(item2)) {
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

    const item1CopyAfterMoving = item1.duplicate() as Body
    item1CopyAfterMoving.data.x += item1CopyAfterMoving.momentum.vectorX
    item1CopyAfterMoving.data.y += item1CopyAfterMoving.momentum.vectorY

    if (item1CopyAfterMoving.isIntersectingWith(item2)) {

        // TO DO - calculate stopPoint, wallAngle, impactPoint
        const stuff = getImpactAndStopPointAndWallAngle(item2, item1)
        const { wallAngle, stopPoint, impactPoint } = stuff

        return {
            type: 'end inside',
            wallAngle, stopPoint, impactPoint,
            item1, item2, force, force2
        }
    }

    //TO DO - detect pass-through collisions

    return null

    function getImpactAndStopPointAndWallAngle(circularBody: Body, squareBody: Body) {
        //pretend circle is moving towards polygon in opposit direction
        // find where it would hit the edge, get vector
        // apply opposite vector to find where the polygon his the circle


        // have to handle 'glancing' impacts (forward point of circle is past the edge)
        // can maybe just handle by 'extending' the edges for the purpose of finding pointWherePathWouldIntersectEdge
        console.warn('GLANCING HIT, NOT HANDLED')

        return {
            stopPoint: { x: squareBody.data.x, y: squareBody.data.y },
            impactPoint: { x: squareBody.data.x, y: squareBody.data.y },
            wallAngle: null as number,
        }

    }

}

function getCollisionDetectionFunction(shape1: Shape, shape2: Shape) {

    const collisionType = shape1.id + "-" + shape2.id;

    switch (collisionType) {
        case "circle-circle":
            return detectCircleCollidingWithCircle
        case "circle-square":
            return detectCircleCollidingWithSquare
        case "square-circle": // TO DO - more detection functions
            return detectSquareCollidingWithCircle
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