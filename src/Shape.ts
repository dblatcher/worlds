import { areCirclesIntersecting, getDistanceBetweenPoints } from "./geometry"
import { Thing } from "./Thing"

interface Point { x: number, y: number }

interface ContainsPointFunction {
    (point: Point): boolean
}

interface AreIntersectingFunction {
    (otherThing: Thing): boolean
}

class Shape {
    id: string
    containsPoint: ContainsPointFunction
    intersectingWithShape: AreIntersectingFunction
    constructor(id: string, containsPoint: ContainsPointFunction, intersectingWithShape: AreIntersectingFunction) {
        this.id = id
        this.containsPoint = containsPoint
        this.intersectingWithShape = intersectingWithShape
    }
}

const circle = new Shape('circle',
    function (point) {
        const thisThing = this as Thing
        return getDistanceBetweenPoints(thisThing.data, point) <= thisThing.data.size
    },
    function (otherThing:Thing) {
        const thisThing = this as Thing
        switch (otherThing.data.shape.id) {

            case 'circle':
                return areCirclesIntersecting(thisThing.shapeValues, otherThing.shapeValues)
            default:
                return false
        }
    })

const shapes = { circle }

export { Shape, shapes }