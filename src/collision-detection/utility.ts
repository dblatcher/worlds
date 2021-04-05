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


interface IntersectionInfo { edgeIndex: number, point: Point, edge: [Point, Point] }[]


function getSortedIntersectionInfo(path: [Point, Point], edges: [Point, Point][]): IntersectionInfo[] {

    let intersections: IntersectionInfo[] = []
    edges.forEach((edge, edgeIndex) => {
        let point = Geometry.findIntersectionPointOfLineSegments(edge, path)
        if (point !== null) {
            intersections.push({ edgeIndex, point, edge })
        }
    })

    intersections = intersections
        .sort((intersectionA, intersectionB) =>
            Geometry.getDistanceBetweenPoints(intersectionA.point, path[0]) - Geometry.getDistanceBetweenPoints(intersectionB.point, path[0])
        )

    return intersections
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

    const centerPathOfCircle: [Point, Point] = [
        {
            x: circularBody.data.x,
            y: circularBody.data.y
        },
        {
            x: circularBody.data.x + fromCenterToFront.x + circularBody.momentum.vectorX,
            y: circularBody.data.y + fromCenterToFront.y + circularBody.momentum.vectorY
        },
    ]

    // 'push out' each egde from polygon center by distance equal to circle radius
    // by creating duplicate of square body and increasing data.size
    const expandedSquareBody = squareBody.duplicate() as Body
    expandedSquareBody.data.size += circularBody.data.size

    // the point that centerPathOfCircle interesects with the expanded edge is the stop point
    // the closestPointOnLine (real egde, stopPoint) = impactPoint
    const intersectionsWithExpandedSquare = getSortedIntersectionInfo(centerPathOfCircle, Geometry.getPolygonLineSegments(expandedSquareBody.polygonPoints))

    if (intersectionsWithExpandedSquare.length > 0) {
        const edgeWhichCircleWillHit = squareEdges[intersectionsWithExpandedSquare[0].edgeIndex];

        const stopPoint = intersectionsWithExpandedSquare[0].point;
        const impactPoint = Geometry.closestpointonline(...edgeWhichCircleWillHit, stopPoint);
        const wallAngle = Geometry.getHeadingFromPointToPoint(...edgeWhichCircleWillHit)
        return { stopPoint, impactPoint, wallAngle }
    }



    // above fails where the center path will not hit the expanding edges, but will hit the real edges
    // because the center stays between the expanded and real edges!

    const intersectionsWithExtendedEdges = getSortedIntersectionInfo(centerPathOfCircle, squareEdges.map(edge => Geometry.extendLineSegment(edge, 2)))
    if (intersectionsWithExtendedEdges.length > 0) {
        const pointWherePathWouldIntersectEdge = intersectionsWithExtendedEdges[0].point
        const edgeWhichCircleWillHit = squareEdges[intersectionsWithExtendedEdges[0].edgeIndex]
        const wallAngle = Geometry.getHeadingFromPointToPoint(...edgeWhichCircleWillHit)
        const angleBetweenEdgeAndPath = Math.abs(circularBody.momentum.direction - wallAngle)

        // distance from pointWherePathWouldIntersectEdge and the stop point is
        // radius of circle / sine of interior angle between edge and path

        const distanceFromPointWherePathWouldIntersectEdge = circularBody.shapeValues.radius / Math.sin(angleBetweenEdgeAndPath)
        const vectorFromPointWherePathWouldIntersectEdgeToStopPoint = Geometry.getXYVector(-distanceFromPointWherePathWouldIntersectEdge, circularBody.momentum.direction)
        const stopPoint = Geometry.translatePoint(pointWherePathWouldIntersectEdge, vectorFromPointWherePathWouldIntersectEdgeToStopPoint);
        const impactPoint = Geometry.closestpointonline(...edgeWhichCircleWillHit, stopPoint)
        return { stopPoint, impactPoint, wallAngle }
    }



    console.warn('GLANCING HIT, NOT HANDLED')

    // new Effect({ color: 'yellow', x: circularBody.data.x, y: circularBody.data.y, duration: 15 })
    //     .enterWorld(circularBody.world)
    // new Effect({ color: 'rgba(100,250,0,.25)', x: circularBody.data.x, size: circularBody.data.size, y: circularBody.data.y, duration: 15 })
    //     .enterWorld(circularBody.world)

    // new Effect({ color: 'yellow', x: centerPathOfCircle[1].x, y: centerPathOfCircle[1].y, duration: 15 })
    //     .enterWorld(circularBody.world)
    // new Effect({ color: 'rgba(250,100,0,.25)', x: centerPathOfCircle[1].x, size: circularBody.data.size, y: centerPathOfCircle[1].y, duration: 15 })
    //     .enterWorld(circularBody.world)


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