import { Fluid } from "./Fluid"
import { areCircleAndPolygonIntersecting, areCirclesIntersecting, arePolygonsIntersecting, getDistanceBetweenPoints, getVectorX, getVectorY, isPointInsidePolygon, Point, _90deg } from "./geometry"
import { renderCircle, renderPolygon } from "./renderFunctions"
import { Body } from "./Body"
import { ViewPort } from "./World"
import { Area } from "./Area"



interface ContainsPointFunction {
    (point: Point): boolean
}

interface AreIntersectingFunction {
    (otherThingOrFluid: Body | Fluid): boolean
}

interface ShapeValuesFunction {
    (): ShapeValues
}

interface PolygonPointsFunction {
    (): Point[]
}

interface CanvasRenderFunction {
    (ctx: CanvasRenderingContext2D, thisThing: Body | Area, viewPort: ViewPort): void
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
        const thisThing = this as Body
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
        const thisThing = this as Body | Area
        return []
    },
    containsPoint(point) {
        const thisThing = this as Body | Area
        return getDistanceBetweenPoints(thisThing.data, point) <= thisThing.data.size
    },
    intersectingWithShape(otherThingOrFluid: Body | Fluid | Area) {
        const thisThing = this as Body

        if (otherThingOrFluid.isFluid) {
            return areCircleAndPolygonIntersecting(thisThing.shapeValues, otherThingOrFluid.polygonPoints)
        }

        if (otherThingOrFluid.isBody || otherThingOrFluid.isArea) {
            let equalYvalues = this.data.y == (otherThingOrFluid as Body | Area).data.y
            switch ((otherThingOrFluid as Body | Area).data.shape.id) {
                case 'circle':
                    return areCirclesIntersecting(thisThing.shapeValues, (otherThingOrFluid as Body | Area).shapeValues)
                case 'square':
                    return areCircleAndPolygonIntersecting(thisThing.shapeValues, (otherThingOrFluid as Body | Area).polygonPoints, equalYvalues)
                default:
                    return false
            }
        }
    },
    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: Body | Area, viewPort: ViewPort) {
        const { color = 'white', fillColor, heading } = thisThing.data
        renderCircle.onCanvas(ctx, thisThing.shapeValues, { strokeColor: color, fillColor, heading }, viewPort)
    }
})

const square = new Shape({
    id: "square",
    getShapeValues() {
        const thisThing = this as Body | Area
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
        const thisThing = this as Body

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
        const thisThing = this as Body
        return isPointInsidePolygon(point, thisThing.polygonPoints)
    },
    intersectingWithShape(otherThingOrFluid: Body | Fluid | Area) {
        const thisThing = this as Body

        if (otherThingOrFluid.isFluid) {
            return areCircleAndPolygonIntersecting(thisThing.shapeValues, otherThingOrFluid.polygonPoints)
        }

        if (otherThingOrFluid.isBody || otherThingOrFluid.isArea) {
            switch ((otherThingOrFluid as Body).data.shape.id) {
                case 'square':
                    arePolygonsIntersecting((otherThingOrFluid as Body).polygonPoints, thisThing.polygonPoints)
                case 'circle':
                    return areCircleAndPolygonIntersecting((otherThingOrFluid as Body).shapeValues, thisThing.polygonPoints)
                default:
                    return false
            }
        }
    },
    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: Body | Area, viewPort: ViewPort) {
        const { color = 'white', fillColor, heading = 0 } = thisThing.data
        const { polygonPoints } = thisThing
        renderPolygon.onCanvas(ctx, polygonPoints, { strokeColor: color, fillColor, heading }, viewPort)
    }
})

const shapes = { circle, square }

export { Shape, shapes, ShapeValues }