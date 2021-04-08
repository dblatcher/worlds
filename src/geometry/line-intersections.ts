import { Point, _90deg, _360deg, _extreme } from './definitions'



// Given three colinear points p, q, r, the function checks if 
// point q lies on line segment 'pr' 
function onSegment(p: Point, q: Point, r: Point) {
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
        return true;
    }
    return false;
}


// To find orientation of ordered triplet (p, q, r). 
// The function returns following values 
// 0 --> p, q and r are colinear 
// 1 --> Clockwise 
// 2 --> Counterclockwise 
function orientation(p: Point, q: Point, r: Point) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0) return 0;  // colinear 
    return (val > 0) ? 1 : 2; // clock or counterclock wise 
}

function getIntersectionWithAVertical(nonVerticalSegment: [Point, Point], verticalSegment: [Point, Point]): Point {

    const verticalConstant = verticalSegment[0].x
    const nonVerticalGradient = (nonVerticalSegment[0].y - nonVerticalSegment[1].y) / (nonVerticalSegment[0].x - nonVerticalSegment[1].x)
    const nonVerticalConstant = nonVerticalSegment[0].y - (nonVerticalGradient * nonVerticalSegment[0].x)

    return ({
        x: verticalConstant,
        y: (nonVerticalGradient * verticalConstant) + nonVerticalConstant
    })
}



/**
 * Check if two line segments will intersect
 * 
 * @param segment1 the two points of the first segment
 * @param segment2 the two points of the second segment
 * @returns whether the sements intersect
 */
 function doLineSegmentsIntersect(segment1: [Point, Point], segment2: [Point, Point]): boolean {

    // Find the four orientations needed for general and 
    // special cases 
    let o1 = orientation(segment1[0], segment1[1], segment2[0]);
    let o2 = orientation(segment1[0], segment1[1], segment2[1]);
    let o3 = orientation(segment2[0], segment2[1], segment1[0]);
    let o4 = orientation(segment2[0], segment2[1], segment1[1]);

    // General case 
    if (o1 != o2 && o3 != o4) { return true };

    // Special Cases 
    // segment1[0], segment1[1] and segment2[0] are colinear and segment2[0] lies on segment p1q1 
    if (o1 == 0 && onSegment(segment1[0], segment2[0], segment1[1])) { return true };

    // segment1[0], segment1[1] and segment2[1] are colinear and segment2[1] lies on segment p1q1 
    if (o2 == 0 && onSegment(segment1[0], segment2[1], segment1[1])) { return true };

    // segment2[0], segment2[1] and segment1[0] are colinear and segment1[0] lies on segment p2q2 
    if (o3 == 0 && onSegment(segment2[0], segment1[0], segment2[1])) { return true };

    // segment2[0], segment2[1] and segment1[1] are colinear and segment1[1] lies on segment p2q2 
    if (o4 == 0 && onSegment(segment2[0], segment1[1], segment2[1])) { return true };

    return false; // Doesn't fall in any of the above cases 
}




/**
 * Find where two line segments will intersect
 * 
 * @param segment1 the two points of the first segment
 * @param segment2 the two points of the second segment
 * @returns the point where the sements intersect, or null if they do not
 */
function findIntersectionPointOfLineSegments(segment1: [Point, Point], segment2: [Point, Point]): Point {

    if (!doLineSegmentsIntersect(segment1, segment2)) { return null }

    const gradient1 = (segment1[0].y - segment1[1].y) / (segment1[0].x - segment1[1].x)
    const gradient2 = (segment2[0].y - segment2[1].y) / (segment2[0].x - segment2[1].x)

    if (gradient1 == gradient2) {
        const pointsInOrder = isFinite(gradient1)
            ? [segment1[0], segment1[1], segment2[0], segment2[1]].sort((pointA, pointB) => pointA.x - pointB.x)
            : [segment1[0], segment1[1], segment2[0], segment2[1]].sort((pointA, pointB) => pointA.y - pointB.y)

        return {
            x: (pointsInOrder[1].x + pointsInOrder[2].x) / 2,
            y: (pointsInOrder[1].y + pointsInOrder[2].y) / 2,
        }
    }

    if (isFinite(gradient1) && isFinite(gradient2)) {
        const constant1 = segment1[0].y - (gradient1 * segment1[0].x)
        const constant2 = segment2[0].y - (gradient2 * segment2[0].x)

        const intersectX = (constant2 - constant1) / (gradient1 - gradient2)
        const intersectY = (gradient1 * intersectX) + constant1
        return ({ x: intersectX, y: intersectY })
    }

    if (isFinite(gradient1) && !isFinite(gradient2)) {
        return getIntersectionWithAVertical(segment1, segment2)
    }

    if (isFinite(gradient2) && !isFinite(gradient1)) {
        return getIntersectionWithAVertical(segment2, segment1)
    }

    return null
}



export { doLineSegmentsIntersect, findIntersectionPointOfLineSegments}