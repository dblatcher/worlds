import { areCirclesIntersecting, getDistanceBetweenPoints, getVectorX, getVectorY, Point } from "./geometry"
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

interface CanvasRenderFunction {
    (ctx: CanvasRenderingContext2D, thisThing: Thing): void
}

class ShapeConfig {
    id: "circle" | "square"
    getShapeValues: ShapeValuesFunction
    containsPoint: ContainsPointFunction
    intersectingWithShape: AreIntersectingFunction
    renderOnCanvas: CanvasRenderFunction
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
        const { x, y, size, color = 'white', heading } = thisThing.data

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill();

        let frontPoint = {
            x: x + getVectorX(size, heading),
            y: y + getVectorY(size, heading)
        }

        ctx.beginPath()
        ctx.strokeStyle = 'black';
        ctx.moveTo(x, y)
        ctx.lineTo(frontPoint.x, frontPoint.y)
        ctx.stroke()

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
        const { size, color = 'white', heading } = thisThing.data
        const { x, y } = thisThing.shapeValues

        const _90deg = Math.PI * .5

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


        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(frontLeft.x, frontLeft.y)
        ctx.lineTo(frontRight.x, frontRight.y)
        ctx.lineTo(backRight.x, backRight.y)
        ctx.lineTo(backLeft.x, backLeft.y)
        ctx.lineTo(frontLeft.x, frontLeft.y)
        ctx.fill();


        let frontPoint = {
            x: x + getVectorX(size, heading),
            y: y + getVectorY(size, heading)
        }

        ctx.beginPath()
        ctx.strokeStyle = 'black';
        ctx.moveTo(x, y)
        ctx.lineTo(frontPoint.x, frontPoint.y)
        ctx.stroke()
    }
})

const shapes = { circle, square }

export { Shape, shapes, ShapeValues }