import { Fluid } from "./Fluid"
import { IntersectionInfo, Point, Vector, AlignedRectangle, Circle, getDistanceBetweenPoints } from "./geometry"
import { AbstractGradientFill } from "./GradientFill"
import { Shape, shapes, ShapeValues } from "./Shape"
import { ViewPort } from "./ViewPort"

interface ThingWithShapeData {
    x: number
    y: number
    size?: number
    shape?: Shape
    heading?: number
    color?: string
    fillColor?: string | AbstractGradientFill
    corners?:Vector[]
}

class ThingWithShape {

    data: ThingWithShapeData

    constructor(config: ThingWithShapeData) {
        this.data = config
        this.data.shape = config.shape || shapes.circle
        this.data.corners = config.corners || []
    }

    get isFluid() { return false }
    get isArea() { return false }
    get isBody() { return false }


    get polygonPoints() {
        return this.data.shape.getPolygonPoints.apply(this, []) as Point[]
    }

    get boundingRectangle():AlignedRectangle {
        const { polygonPoints, shapeValues } = this;
        let rect: AlignedRectangle;

        if (polygonPoints[0]) {
            rect = {
                top: polygonPoints[0].y,
                left: polygonPoints[0].x,
                bottom: polygonPoints[0].y,
                right: polygonPoints[0].x,
                x: this.data.x,
                y: this.data.y,
            }

            polygonPoints.forEach(point => {
                rect.top = point.y < rect.top ? point.y : rect.top;
                rect.bottom = point.y > rect.bottom ? point.y : rect.bottom;
                rect.left = point.x < rect.left ? point.x : rect.left;
                rect.right = point.x > rect.right ? point.x : rect.right;
            })

        } else {
            rect = {
                top: shapeValues.top,
                left: shapeValues.left,
                bottom: shapeValues.bottom,
                right: shapeValues.right,
                x: this.shapeValues.x,
                y: this.shapeValues.y,
            }
        }
        return rect;
    }

    get boundingCircle():Circle {
        const { polygonPoints } = this
        if (polygonPoints.length == 0) { return this.shapeValues }

        let greatestPointDistance = 0
        polygonPoints.forEach(point => {
            const distance = getDistanceBetweenPoints(point, this.data)
            greatestPointDistance = distance > greatestPointDistance ? distance : greatestPointDistance
        })

        return {
            x:this.data.x,
            y:this.data.y,
            radius: greatestPointDistance,
        }
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

    getIntersectionsWithPath(path: [Point, Point]) {
        return this.data.shape.intersectionWithPath.apply(this, [path]) as IntersectionInfo[]
    }

}


export { ThingWithShape, ThingWithShapeData }