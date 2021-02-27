import { areCircleAndPolygonIntersecting, areCirclesIntersecting, arePolygonsIntersecting, getDistanceBetweenPoints, getVectorX, getVectorY, isPointInsidePolygon, Point, _90deg } from "./geometry"
import { renderCircle, renderPolygon } from "./renderFunctions"
import { Thing } from "./Thing"



interface ContainsPointFunction {
    (point: Point): boolean
}

interface AreIntersectingFunction {
    (otherThing: Thing): boolean
}

interface ShapeValuesFunction {
    (): ShapeValues
}

interface PolygonPointsFunction {
    (): Point[]
}

interface CanvasRenderFunction {
    (ctx: CanvasRenderingContext2D, thisThing: Thing): void
}

class ShapeConfig {
    id: "circle" | "square"
    getShapeValues: ShapeValuesFunction
    containsPoint: ContainsPointFunction
    intersectingWithShape: AreIntersectingFunction
    renderOnCanvas: CanvasRenderFunction
    getPolygonPoints: PolygonPointsFunction
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

class Shape extends ShapeConfig {
    constructor(config: ShapeConfig) {
        super()
        this.id = config.id
        this.getShapeValues = config.getShapeValues
        this.getPolygonPoints = config.getPolygonPoints
        this.containsPoint = config.containsPoint
        this.intersectingWithShape = config.intersectingWithShape
        this.renderOnCanvas = config.renderOnCanvas
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
    getPolygonPoints() {
        const thisThing = this as Thing
        return []
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
            case 'square':
                return areCircleAndPolygonIntersecting(thisThing.shapeValues, otherThing.polygonPoints)
            default:
                return false
        }
    },
    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: Thing) {
        const { color = 'white', fillColor } = thisThing.data
        renderCircle.onCanvas(ctx, thisThing.shapeValues, {strokeColor: color, fillColor})
    }
})

const square = new Shape({
    id: "square",
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
    getPolygonPoints() {
        const thisThing = this as Thing

        const { size, heading } = thisThing.data
        const { x, y } = thisThing.shapeValues

        const frontLeft: Point = {
            x: x + getVectorX(size, heading) + getVectorX(size, heading + _90deg),
            y: y + getVectorY(size, heading) + getVectorY(size, heading + _90deg)
        }
        const frontRight: Point = {
            x: x + getVectorX(size, heading) + getVectorX(size, heading - _90deg),
            y: y + getVectorY(size, heading) + getVectorY(size, heading - _90deg)
        }
        const backLeft: Point = {
            x: x - getVectorX(size, heading) + getVectorX(size, heading + _90deg),
            y: y - getVectorY(size, heading) + getVectorY(size, heading + _90deg)
        }
        const backRight: Point = {
            x: x - getVectorX(size, heading) + getVectorX(size, heading - _90deg),
            y: y - getVectorY(size, heading) + getVectorY(size, heading - _90deg)
        }

        return [frontLeft, frontRight, backRight, backLeft]
    },
    containsPoint(point: Point) {
        const thisThing = this as Thing
        return isPointInsidePolygon(point, thisThing.polygonPoints)
    },
    intersectingWithShape(otherThing: Thing) {
        const thisThing = this as Thing
        switch (otherThing.data.shape.id) {
            case 'square':
                arePolygonsIntersecting(otherThing.polygonPoints, thisThing.polygonPoints)
            case 'circle':
                return areCircleAndPolygonIntersecting(otherThing.shapeValues, thisThing.polygonPoints)
            default:
                return false
        }
    },
    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: Thing) {
        const { color = 'white', fillColor } = thisThing.data
        const { polygonPoints } = thisThing
        renderPolygon.onCanvas(ctx, polygonPoints, {strokeColor: color, fillColor})
    }
})

const shapes = { circle, square }

export { Shape, shapes, ShapeValues }