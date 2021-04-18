import { Body } from '../Body'
import { Vector, Point, _90deg, AlignedRectangle, translatePoint } from '../geometry'

import { EdgeCollisionReport } from './CollisionReport'

/**
 * detect collision of one a moving polygonal body with an edge of its World
 * 
 * @param body a polygonal body
 * @return a collision report describing how item will hit the fixed edge, or null if it won't
 */
function detectPolyGonCollidingWithEdge(body: Body): EdgeCollisionReport {

    const { height, width } = body.world
    const { boundingRectangle, polygonPoints } = body
    const vector = body.momentum.vector

    const rectangleAtEnd: AlignedRectangle = {
        top: boundingRectangle.top + vector.y,
        bottom: boundingRectangle.bottom + vector.y,
        left: boundingRectangle.left + vector.x,
        right: boundingRectangle.right + vector.x,
        x: boundingRectangle.x + vector.x,
        y: boundingRectangle.y + vector.y,
    }

    const edgesCrossedAtEnd = getHardEdgesCrossed(rectangleAtEnd)
    if (edgesCrossedAtEnd.length === 0) { return null }

    let wallAngle: number;
    let stopPoint: Point = { x: undefined, y: undefined };
    let impactPoint: Point = { x: undefined, y: undefined };
    let cornerThatWillHit: Point = { x: undefined, y: undefined };

    if (edgesCrossedAtEnd.includes("BOTTOM")) {
        cornerThatWillHit = polygonPoints.find(point => point.y === boundingRectangle.bottom);
        impactPoint.y = height
        setPointsForCornerOnHorizontal();
    }
    else if (edgesCrossedAtEnd.includes("TOP")) {
        cornerThatWillHit = polygonPoints.find(point => point.y === boundingRectangle.top);
        impactPoint.y = 0;
        setPointsForCornerOnHorizontal();
    }
    else if (edgesCrossedAtEnd.includes("LEFT")) {
        cornerThatWillHit = polygonPoints.find(point => point.x === boundingRectangle.left);
        impactPoint.x = 0
        setPointsForCornerOnVertical();
    }
    else if (edgesCrossedAtEnd.includes("RIGHT")) {
        cornerThatWillHit = polygonPoints.find(point => point.x === boundingRectangle.right);
        impactPoint.x = width
        setPointsForCornerOnVertical();
    }

    return {
        type: "edge",
        wallAngle,
        impactPoint,
        stopPoint,
        item1: body,
        item2: null,
        force: body.momentum.magnitude,
        force2: 0,
    }

    function setPointsForCornerOnHorizontal() {
        const vectorFromCornerThatWillHitToXY: Vector = { 
            x: boundingRectangle.x - cornerThatWillHit.x, 
            y: boundingRectangle.y - cornerThatWillHit.y 
        };
        let adjacentLength = impactPoint.y - cornerThatWillHit.y;
        let oppositeLength = Math.tan(body.momentum.direction) * adjacentLength;
        impactPoint.x = cornerThatWillHit.x + oppositeLength;
        stopPoint = translatePoint(impactPoint,vectorFromCornerThatWillHitToXY);
        wallAngle = Math.PI * 0.5
    }

    function setPointsForCornerOnVertical() {
        const vectorFromCornerThatWillHitToXY: Vector = { 
            x: boundingRectangle.x - cornerThatWillHit.x, 
            y: boundingRectangle.y - cornerThatWillHit.y 
        };
        let adjacentLength = impactPoint.x - cornerThatWillHit.x;
        let oppositeLength = Math.tan(body.momentum.direction - _90deg) * adjacentLength;
        impactPoint.y = cornerThatWillHit.y + oppositeLength;
        stopPoint = translatePoint(impactPoint,vectorFromCornerThatWillHitToXY);
        wallAngle = 0;
    }

    function getHardEdgesCrossed(rect: AlignedRectangle) {
        let edges: string[] = []
        if (rect.left < 0 && body.world.edges.left === "HARD") { edges.push("LEFT") }
        if (rect.right > width && body.world.edges.right === "HARD") { edges.push("RIGHT") }
        if (rect.top < 0 && body.world.edges.top === "HARD") { edges.push("TOP") }
        if (rect.bottom > height && body.world.edges.bottom === "HARD") { edges.push("BOTTOM") }
        return edges
    }
}

export { detectPolyGonCollidingWithEdge }