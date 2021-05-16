import { Force, World } from '..'
import { Body } from '../Body'
import { Effect } from '../Effect'
import * as Geometry from '../geometry'
import { Vector, Point, _90deg, getSortedIntersectionInfoWithCircle, closestPointOnLineSegment } from '../geometry'


/**
 * Find the point on a polygon's edges closest to a given starting point
 *
 * @param startingPoint a point
 * @param polygon a polygon
 * @returns the point on the polygon edge closest to the startingPoint,
 * the distance between them, which edge they are on and the angle of that edge
 */
function getInfoAboutNearestPointOnPolygon(startingPoint: Point, polygon: Point[]): {
    point: Point, distance: number, edge: [Point, Point], edgeAngle: number
} {
    const intersectionsFromInside = Geometry.getPolygonLineSegments(polygon).map(edge => {
        const pointOnEdge = closestPointOnLineSegment(edge[0], edge[1], startingPoint)
        const distance = Geometry.getDistanceBetweenPoints(pointOnEdge, startingPoint)
        return { edge, point: pointOnEdge, distance, edgeAngle: 0 }
    })
        .sort((intersectionA, intersectionB) => intersectionA.distance - intersectionB.distance)

    const nearestIntersection = intersectionsFromInside[0]
    nearestIntersection.edgeAngle = Geometry.getHeadingFromPointToPoint(...nearestIntersection.edge)

    return nearestIntersection
}


/**
 * Get the area that would be under the path of a moving polygonal body.
 * ASSUMES BODY IS NOT CONCAVE - path is a paralellogram using the
 * left most and right most corners of the shape to defin the sides
 * obstables within body's bounding circle could be missed
 * 
 * @param body1 
 * @returns a polygon describing the area covered by body1's path ahead
 */
 function getPolygonPathArea(body1: Body): Point[] {

    const { polygonPoints, shapeValues } = body1
    const tangentUnitVectorLeft = new Force(1, body1.momentum.direction - _90deg);
    const tangentUnitVectorRight = new Force(1, body1.momentum.direction + _90deg);

    const pointsWithDistances = polygonPoints.map(point => {
        const displacementFromCenter: Vector = {
            x: point.x - shapeValues.x,
            y: point.y - shapeValues.y
        }
        const leftDistance = (tangentUnitVectorLeft.vectorX * displacementFromCenter.x) + (tangentUnitVectorLeft.vectorY * displacementFromCenter.y)
        const rightDistance = (tangentUnitVectorRight.vectorX * displacementFromCenter.x) + (tangentUnitVectorRight.vectorY * displacementFromCenter.y)
        return { point, leftDistance, rightDistance }
    })

    let leftMostPoint = pointsWithDistances[0], rightMostPoint = pointsWithDistances[0];

    for (let index = 1; index < pointsWithDistances.length; index++) {
        let element = pointsWithDistances[index];
        if (element.leftDistance > leftMostPoint.leftDistance) { leftMostPoint = element }
        if (element.rightDistance > rightMostPoint.rightDistance) { rightMostPoint = element }
    }

    return [
        leftMostPoint.point, rightMostPoint.point,
        Geometry.translatePoint(rightMostPoint.point, body1.momentum.vector),
        Geometry.translatePoint(leftMostPoint.point, body1.momentum.vector),
    ]
}


/**
 * find collision information between a circlular and square body
 * @param circularBody the moving circlular body
 * @param squareBody the still square body
 * @returns the stopPoint, impactPoint and wallAngle of the circular body's collision with the square
 */
function getCircleSquareCollisionInfo(circularBody: Body, squareBody: Body, worldToMarkWithIndicators: World = null) {

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

    /** The routine below seems to work as a general solution, so crufting this for now

    // 'push out' each egde from polygon center by distance equal to circle radius
    // by creating duplicate of square body and increasing data.size
    const expandedSquareBody = squareBody.duplicate() as Body
    expandedSquareBody.data.size += circularBody.data.size

    // the point that centerPathOfCircle interesects with the expanded edge is the stop point
    // the closestPointOnLine (real egde, stopPoint) = impactPoint
    const intersectionsWithExpandedSquare = Geometry.getSortedIntersectionInfoWithEdges(centerPathOfCircle, Geometry.getPolygonLineSegments(expandedSquareBody.polygonPoints))

    if (intersectionsWithExpandedSquare.length > 0) {
        const edgeWhichCircleWillHit = squareEdges[intersectionsWithExpandedSquare[0].edgeIndex];

        const stopPoint = intersectionsWithExpandedSquare[0].point;
        const impactPoint = Geometry.closestpointonline(...edgeWhichCircleWillHit, stopPoint);
        const wallAngle = Geometry.getHeadingFromPointToPoint(...edgeWhichCircleWillHit)
        return { stopPoint, impactPoint, wallAngle }
    }

    // above fails where the center path will not hit the expanding edges, but will hit the real edges
    // because the center stays between the expanded and real edges!

    const intersectionsWithExtendedEdges = Geometry.getSortedIntersectionInfoWithEdges(centerPathOfCircle, squareEdges.map(edge => Geometry.extendLineSegment(edge, 2)))
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

*/


    // the circle will hit the point on the polygon which is closest to its centre
    const impactIntersection = getInfoAboutNearestPointOnPolygon(circularBody.shapeValues, squareBody.polygonPoints);
    const impactPoint = impactIntersection.point

    // the circle's stop point will be a point where the distance between the center and impact point
    // is equal to the circle's radius...
    const intersectionsWithPathAndCircleAroundImpactPoint = getSortedIntersectionInfoWithCircle(centerPathOfCircle, {
        radius: circularBody.shapeValues.radius,
        x: impactPoint.x,
        y: impactPoint.y,
    })

    // ...which is the closest of those point to the starting point
    const stopPoint = intersectionsWithPathAndCircleAroundImpactPoint[0]
        ? intersectionsWithPathAndCircleAroundImpactPoint[0].point
        : { x: circularBody.shapeValues.x, y: circularBody.shapeValues.y }; // default to starting point of can't find where the circle would be

    // if the impact point is a corner, the wallAngle should be null (angle of deflection defaults to tangent angle at the impactPoint)
    const impactPointDistanceFromCorner: number = Math.min(
        Geometry.getDistanceBetweenPoints(impactPoint, impactIntersection.edge[0]),
        Geometry.getDistanceBetweenPoints(impactPoint, impactIntersection.edge[1]),
    )

    const wallAngle = impactPointDistanceFromCorner == 0 ? null : impactIntersection.edgeAngle

    if (worldToMarkWithIndicators) {
        new Effect({ color: 'blue', x: impactPoint.x, y: impactPoint.y, duration: 15, size: 8 })
            .enterWorld(worldToMarkWithIndicators)
        new Effect({ color: 'rgba(0,0,250,.25)', x: impactPoint.x, y: impactPoint.y, duration: 15, size: circularBody.shapeValues.radius })
            .enterWorld(worldToMarkWithIndicators)
        new Effect({ color: 'yellow', x: stopPoint.x, y: stopPoint.y, duration: 15 })
            .enterWorld(worldToMarkWithIndicators)
        new Effect({ color: 'rgba(100,250,0,.125)', x: stopPoint.x, size: circularBody.data.size, y: stopPoint.y, duration: 15 })
            .enterWorld(worldToMarkWithIndicators)
    }

    return { stopPoint, impactPoint, wallAngle }
}


export { getInfoAboutNearestPointOnPolygon, getCircleSquareCollisionInfo, getPolygonPathArea }