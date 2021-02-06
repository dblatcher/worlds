import { getDistanceBetweenPoints } from "./geometry"
import { Thing } from "./Thing"

interface Point { x: number, y: number }

interface ContainsPointFunction {
    (point: Point): boolean
}

interface AreCollidingFunction {
    (otherThing: Thing): boolean
}

class Shape {
    id: string
    containsPoint: ContainsPointFunction
    collidingWithShape: AreCollidingFunction
    constructor(id: string, containsPoint: ContainsPointFunction, collidingWithShape: AreCollidingFunction) {
        this.id = id
        this.containsPoint = containsPoint
        this.collidingWithShape = collidingWithShape
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
                return getDistanceBetweenPoints(thisThing.data, otherThing.data) < thisThing.data.size + otherThing.data.size
            default:
                return false
        }
    })

const shapes = { circle }

export { Shape, shapes }