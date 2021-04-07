import { Fluid } from "./Fluid"
import { Point } from "./geometry"
import { AbstractGradientFill } from "./GradientFill"
import { Shape, shapes, ShapeValues } from "./Shape"
import { ViewPort } from "./ViewPort"

interface ThingWithShapeData {
    x: number
    y: number
    size?: number
    shape?: Shape
    density?: number
    heading?: number
    color?: string
    fillColor?: string | AbstractGradientFill
}

class ThingWithShape {

    data: ThingWithShapeData

    constructor(config: ThingWithShapeData) {
        this.data = config
        this.data.shape = config.shape || shapes.circle
    }

    get isFluid() { return false }
    get isArea() { return false }
    get isBody() { return false }


    get polygonPoints() {
        return this.data.shape.getPolygonPoints.apply(this, []) as Point[]
    }

    get shapeValues() {
        return this.data.shape.getShapeValues.apply(this, []) as ShapeValues
    }

    duplicate() {
        const myPrototype = Object.getPrototypeOf(this)
        return new myPrototype.constructor(Object.assign({}, this.data))
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        this.data.shape.renderOnCanvas(ctx, this, viewPort);
    }

    checkIfContainsPoint(point: { x: number, y: number }) {
        return this.data.shape.containsPoint.apply(this, [point]) as boolean
    }

    isIntersectingWith(otherThing: ThingWithShape | Fluid) {
        return this.data.shape.intersectingWithShape.apply(this, [otherThing]) as boolean
    }

}


export { ThingWithShape }