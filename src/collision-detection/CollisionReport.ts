import { Point } from '../geometry'
import { Body } from '../Body'

class CollisionReport {
    type: "end inside" | "passed through" | "start inside" | "edge"
    impactPoint: Point
    stopPoint: Point
    item1: Body
    item2: Body
    force: number
    force2: number
    wallAngle?: number
}

class EdgeCollisionReport extends CollisionReport {
    item2: null
    force2: 0
    wallAngle: number
}


export { CollisionReport, EdgeCollisionReport }