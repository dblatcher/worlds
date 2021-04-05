import { Body } from '../Body'
import * as Geometry from '../geometry'
import { Vector, Point, _90deg } from '../geometry'


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


export { getInfoAboutNearestPointOnPolygon, getCircleSquareCollisionInfo }