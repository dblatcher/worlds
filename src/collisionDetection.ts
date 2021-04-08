import { Shape } from './Shape'

import { CollisionReport, EdgeCollisionReport } from './collision-detection/CollisionReport'
import { detectCircleCollidingWithCircle } from './collision-detection/circle-circle'
import { detectCircleCollidingWithEdge } from './collision-detection/circle-edge'
import { detectCircleCollidingWithSquare } from './collision-detection/circle-square'
import { detectSquareCollidingWithCircle } from './collision-detection/square-circle'




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