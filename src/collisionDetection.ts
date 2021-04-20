import { Shape } from './Shape'

import { CollisionReport, EdgeCollisionReport } from './collision-detection/CollisionReport'
import { detectCircleCollidingWithCircle } from './collision-detection/circle-circle'
import { detectCircleCollidingWithEdge } from './collision-detection/circle-edge'
import { detectCircleCollidingWithSquare } from './collision-detection/circle-square'
import { detectSquareCollidingWithCircle } from './collision-detection/square-circle'
import { detectPolyGonCollidingWithEdge } from './collision-detection/polygon-edge'
import { detectPolygonCollidingWithPolygon } from './collision-detection/polygon-polygon'




function getCollisionDetectionFunction(shape1: Shape, shape2: Shape) {

    const collisionType = shape1.id + "-" + shape2.id;

    switch (collisionType) {
        case "circle-circle":
            return detectCircleCollidingWithCircle
        case "circle-square":
        case "circle-polygon":
            return detectCircleCollidingWithSquare
        case "square-circle":
        case "polygon-circle":
            return detectSquareCollidingWithCircle
        default:
            return detectPolygonCollidingWithPolygon
    }
}

function getEdgeCollisionDetectionFunction(shape: Shape) {

    switch (shape.id) {
        case "circle":
            return detectCircleCollidingWithEdge
        case "square": 
            return detectPolyGonCollidingWithEdge
        default:
            return detectPolyGonCollidingWithEdge
    }

}

export { CollisionReport, EdgeCollisionReport, getEdgeCollisionDetectionFunction, getCollisionDetectionFunction }