import { Body } from '../Body'
import { Force } from '../Force'
import { Vector, Point, Circle, _90deg } from '../geometry'

import { EdgeCollisionReport } from './CollisionReport'

/**
 * detect collision of one a moving circular body with an edge of its World
 * 
 * @param body a circular body
 * @return a collision report describing how item will hit the fixed edge, or null if it won't
 */
function detectCircleCollidingWithEdge(body: Body): EdgeCollisionReport {

    const { height, width } = body.world
    const circle = body.shapeValues
    const vector = body.momentum.vector
    const bodyAtEnd: Circle = { x: circle.x + vector.x, y: circle.y + vector.y, radius: circle.radius }
    const edgesCrossedAtEnd = getHardEdgesCrossed(bodyAtEnd)

    if (edgesCrossedAtEnd.length === 0) { return null }

    let wallAngle: number;
    let stopPoint: Point = { x: circle.x, y: circle.y }

    if (edgesCrossedAtEnd.includes("BOTTOM")) {
        stopPoint.y = height - circle.radius
        wallAngle = Math.PI * 0.5
    }
    if (edgesCrossedAtEnd.includes("TOP")) {
        stopPoint.y = circle.radius
        wallAngle = Math.PI * 0.5
    }
    if (edgesCrossedAtEnd.includes("LEFT")) {
        stopPoint.x = circle.radius
        wallAngle = Math.PI * 0.01
    }
    if (edgesCrossedAtEnd.includes("RIGHT")) {
        stopPoint.x = width - circle.radius
        wallAngle = Math.PI * 0.01
    }

    const vectorFromStopPointToImpactPoint: Vector = new Force(circle.radius, body.momentum.direction).vector

    return {
        type: "edge",
        wallAngle,
        impactPoint: {
            x: stopPoint.x + vectorFromStopPointToImpactPoint.x,
            y: stopPoint.y + vectorFromStopPointToImpactPoint.y
        },
        item1: body,
        item2: null,
        stopPoint: stopPoint,
        force: body.momentum.magnitude,
        force2: 0,
    }

    function getHardEdgesCrossed(circle: Circle) {
        const { x, y, radius } = circle
        let edges: string[] = []
        if (x - radius < 0 && body.world.edges.left === "HARD") { edges.push("LEFT") }
        if (x + radius > width && body.world.edges.right === "HARD") { edges.push("RIGHT") }
        if (y - radius < 0 && body.world.edges.top === "HARD") { edges.push("TOP") }
        if (y + radius > height && body.world.edges.bottom === "HARD") { edges.push("BOTTOM") }
        return edges
    }
}

export { detectCircleCollidingWithEdge }