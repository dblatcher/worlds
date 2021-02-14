import { areCirclesIntersecting, getDistanceBetweenPoints, Point } from "./geometry"
import { Thing } from "./Thing"


interface ContainsPointFunction {
    (point: Point): boolean
}

interface AreIntersectingFunction {
    (otherThing: Thing): boolean
}

interface ShapeValuesFunction {
    (thisThing: Thing): ShapeValues
}

interface ShapeConfig {
    id: string
    getShapeValues: ShapeValuesFunction
    containsPoint: ContainsPointFunction
    intersectingWithShape: AreIntersectingFunction
}

interface ShapeValues {
    radius: number
    x: number
    y: number
    top: number
    bottom: number
    left: number
    right: number
}

class Shape {
    id: string
    getShapeValues: ShapeValuesFunction
    containsPoint: ContainsPointFunction
    intersectingWithShape: AreIntersectingFunction
    constructor(config: ShapeConfig) {
        this.id = config.id
        this.getShapeValues = config.getShapeValues
        this.containsPoint = config.containsPoint
        this.intersectingWithShape = config.intersectingWithShape
    }
}

const circle = new Shape({
    id: 'circle',
    getShapeValues() {
        const thisThing = this as Thing
        return {
            radius: thisThing.data.size,
            x: thisThing.data.x,
            y: thisThing.data.y,
            top: thisThing.data.y - thisThing.data.size,
            bottom: thisThing.data.y + thisThing.data.size,
            left: thisThing.data.x - thisThing.data.size,
            right: thisThing.data.x + thisThing.data.size,
        }

    },
    containsPoint(point) {
        const thisThing = this as Thing
        return getDistanceBetweenPoints(thisThing.data, point) <= thisThing.data.size
    },
    intersectingWithShape(otherThing: Thing) {
        const thisThing = this as Thing
        switch (otherThing.data.shape.id) {

            case 'circle':
                return areCirclesIntersecting(thisThing.shapeValues, otherThing.shapeValues)
            default:
                return false
        }
    }
})

const shapes = { circle }

export { Shape, shapes, ShapeValues }