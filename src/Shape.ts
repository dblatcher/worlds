import { areCirclesIntersecting, getDistanceBetweenPoints, getVectorX, getVectorY, Point, _90deg } from "./geometry"
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
            default:
                return false
        }
    },
    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: Thing) {
        const { x, y, size, color = 'white' } = thisThing.data

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill();

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
    containsPoint() {
        return false
    },
    intersectingWithShape(otherThing: Thing) {
        const thisThing = this as Thing
        switch (otherThing.data.shape.id) {

            case 'square':
            case 'circle':
            default:
                return false
        }
    },
    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: Thing) {
        const { color = 'white' } = thisThing.data
        const { polygonPoints } = thisThing

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y)
        for (let i = 1; i < polygonPoints.length; i++) {
            ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y)
        }
        ctx.lineTo(polygonPoints[0].x, polygonPoints[0].y)
        ctx.fill();

    }
})

const shapes = { circle, square }

export { Shape, shapes, ShapeValues }