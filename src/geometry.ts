import { Point, Circle, Vector, Wedge, _deg, _90deg, _360deg, _extreme, originPoint, IntersectionInfo, AlignedRectangle } from './geometry/definitions';

import { getDirection, getDistanceBetweenPoints, getMagnitude, getVectorX, getVectorY, getXYVector, getHeadingFromPointToPoint, closestPointOnLineSegment } from './geometry/basics';
import { normaliseHeading, reflectHeading, reverseHeading } from './geometry/headings';
import { doLineSegmentsIntersect, findIntersectionPointOfLineSegments, getSortedIntersectionInfoWithEdges, getSortedIntersectionInfoWithCircle } from './geometry/line-intersections';
import { arePolygonsIntersecting, getPolygonLineSegments, isPointInsidePolygon } from './geometry/polygons';
import { areCirclesIntersecting, getCircleTangentAtPoint } from './geometry/circles';


function extendLineSegment(lineSegment: [Point, Point], factor = _extreme): [Point, Point] {
    const vector: Vector = {
        x: (lineSegment[1].x - lineSegment[0].x) * factor,
        y: (lineSegment[1].y - lineSegment[0].y) * factor
    }

    const extendedPoint1: Point = translatePoint(lineSegment[0], vector, true)
    const extendedPoint2: Point = translatePoint(lineSegment[1], vector)
    return [extendedPoint1, extendedPoint2]
}


function translatePoint(start: Point, vector: Vector, reverse = false): Point {
    const multiplier = reverse ? -1 : 1;
    return {
        x: start.x + (multiplier * vector.x),
        y: start.y + (multiplier * vector.y),
    }
}




function closestpointonline(L1: Point, L2: Point, p0: Point) {

    if (!isFinite(L2.x) && !isFinite(L2.y)) {
        console.log('bad L2 passed to closestpointonline, returning L1 coords');
        return ({ x: L1.x, y: L1.y });
    }

    let A1 = L2.y - L1.y;
    let B1 = L1.x - L2.x;
    let C1 = (L2.y - L1.y) * L1.x + (L1.x - L2.x) * L1.y;
    let C2 = -B1 * p0.x + A1 * p0.y;
    let det = A1 * A1 - -B1 * B1;
    let cx = 0;
    let cy = 0;
    if (det !== 0) {
        cx = ((A1 * C1 - B1 * C2) / det);
        cy = ((A1 * C2 - -B1 * C1) / det);
    } else {
        cx = p0.x;
        cy = p0.y;
    }

    if (!isFinite(cx) || !isFinite(cy)) {
        console.log('closestpointonline error');
        console.log(L1, L2, p0);
    }

    return { x: cx, y: cy } as Point;
}


function areCircleAndPolygonIntersecting(circle: Circle, polygon: Point[], applyHackForEqualYValue: boolean = false) {

    let point1, point2, closestPointToCenter, edgeIntersects = false
    for (let i = 0; i < polygon.length; i++) {
        point1 = polygon[i]
        point2 = i + 1 >= polygon.length ? polygon[0] : polygon[i + 1]
        closestPointToCenter = closestPointOnLineSegment(point1, point2, circle)
        if (getDistanceBetweenPoints(closestPointToCenter, circle) <= circle.radius) {
            edgeIntersects = true
            break
        }
    }
    if (edgeIntersects) { return true }

    // is the circle inside the polygon?

    if (applyHackForEqualYValue) {
        let circleCopy: Circle = {
            x: circle.x,
            y: circle.y - .001,
            radius: circle.radius,
        }
        return isPointInsidePolygon(circleCopy, polygon);
    } else {
        return isPointInsidePolygon(circle, polygon);
    }

}



export {
    Point, Circle, Vector, Wedge, IntersectionInfo, AlignedRectangle, _deg, _90deg, _360deg,
    getDirection, getDistanceBetweenPoints, getMagnitude, getVectorX, getVectorY, getXYVector, getHeadingFromPointToPoint,
    normaliseHeading, reflectHeading, reverseHeading,
    doLineSegmentsIntersect, findIntersectionPointOfLineSegments, getSortedIntersectionInfoWithEdges, getSortedIntersectionInfoWithCircle,
    arePolygonsIntersecting, getPolygonLineSegments, isPointInsidePolygon,
    areCirclesIntersecting, getCircleTangentAtPoint,

    closestpointonline,
    areCircleAndPolygonIntersecting,
    translatePoint,
    extendLineSegment
}