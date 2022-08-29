import { Point, _90deg, _360deg, _extreme } from './definitions';
import { doLineSegmentsIntersect } from './line-intersections';


function getPolygonLineSegments(polygon: Point[]) {
    const segments: [Point, Point][] = []
    for (let i = 0; i < polygon.length; i++) {
        segments.push([polygon[i], i + 1 >= polygon.length ? polygon[0] : polygon[i + 1]])
    }
    return segments
}

function arePolygonsIntersecting(polygon1: Point[], polygon2: Point[]) {

    const edges1 = getPolygonLineSegments(polygon1)
    const edges2 = getPolygonLineSegments(polygon2)
    let i, j
    for (i = 0; i < edges1.length; i++) {
        for (j = 0; j < edges2.length; j++) {
            if (doLineSegmentsIntersect(edges1[i], edges2[j])) {
                // console.log('polygon edges intersect', edges1[i], edges2[j])
                return true
            }
        }
    }

    for (i = 0; i < polygon1.length; i++) {
        if (isPointInsidePolygon(polygon1[i], polygon2)) {
            // console.log('polygon vertex inside other polygon', polygon1[i])
            return true
        }
    }

    for (i = 0; i < polygon2.length; i++) {
        if (isPointInsidePolygon(polygon2[i], polygon1)) {
            // console.log('polygon vertex inside other polygon', polygon2[i])
            return true
        }
    }

    return false
}

/**
 * BUG - if line from point to the extreme point passes through a vertex
 * the same vertex is on two edges of the polygon, so this is counted
 * as two intersections, not one!!
 * 
 * TO DO - count intersections between the point-extreme line and polygon vertices
 * subtract the number of vertex intersections from the segment intersections
 * for final test
 * 
 * @param point 
 * @param polygon 
 * @returns if the point is inside the polygon
 */
function isPointInsidePolygon(point: Point, polygon: Point[]) {
    var n = polygon.length;
    if (n < 3) { return false };
    var extremeXPoint = { y: point.y, x: _extreme };
    var segmentIntersections = 0;

    let point1, point2
    for (let i = 0; i < polygon.length; i++) {
        point1 = polygon[i]
        point2 = i + 1 >= polygon.length ? polygon[0] : polygon[i + 1]
        if (doLineSegmentsIntersect([point, extremeXPoint], [point1, point2])) { segmentIntersections++ }
    }

    return segmentIntersections % 2 !== 0
}


export { getPolygonLineSegments, arePolygonsIntersecting, isPointInsidePolygon }