import { Fluid } from "./Fluid"
import {
    areCircleAndPolygonIntersecting, areCirclesIntersecting, arePolygonsIntersecting,
    getDistanceBetweenPoints, getPolygonLineSegments,
    getSortedIntersectionInfoWithEdges, getSortedIntersectionInfoWithCircle,
    getVectorX, getVectorY, IntersectionInfo, isPointInsidePolygon, Point, _90deg
} from "./geometry"
import { renderCircle, renderPolygon } from "./renderFunctions"
import { ViewPort } from "./World"
import { ThingWithShape } from "./ThingWithShape"
import { Force } from "./Force"


interface ContainsPointFunction {
    (point: Point): boolean
}

interface AreIntersectingFunction {
    (otherThingOrFluid: Fluid | ThingWithShape): boolean
}

interface ShapeValuesFunction {
    (): ShapeValues
}

interface PolygonPointsFunction {
    (): Point[]
}

interface PathIntersectionFunction {
    (path: [Point, Point]): IntersectionInfo[]
}

interface CanvasRenderFunction {
    (ctx: CanvasRenderingContext2D, thisThing: ThingWithShape, viewPort: ViewPort): void
}

class ShapeConfig {
    id: "circle" | "square" | "polygon"
    getShapeValues: ShapeValuesFunction
    containsPoint: ContainsPointFunction
    intersectingWithShape: AreIntersectingFunction
    renderOnCanvas: CanvasRenderFunction
    getPolygonPoints: PolygonPointsFunction
    intersectionWithPath: PathIntersectionFunction
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
        this.intersectionWithPath = config.intersectionWithPath
    }
}

const circle = new Shape({
    id: 'circle',
    getShapeValues() {
        const thisThing = this as ThingWithShape
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
        const thisThing = this as ThingWithShape
        return []
    },
    containsPoint(point) {
        const thisThing = this as ThingWithShape
        return getDistanceBetweenPoints(thisThing.data, point) <= thisThing.data.size
    },
    intersectingWithShape(otherThingOrFluid: ThingWithShape | Fluid) {
        const thisThing = this as ThingWithShape

        if (otherThingOrFluid.isFluid) {
            return areCircleAndPolygonIntersecting(thisThing.shapeValues, otherThingOrFluid.polygonPoints)
        }

        if (otherThingOrFluid.isBody || otherThingOrFluid.isArea) {
            let equalYvalues = this.data.y == (otherThingOrFluid as ThingWithShape).data.y
            switch ((otherThingOrFluid as ThingWithShape).data.shape.id) {
                case 'circle':
                    return areCirclesIntersecting(thisThing.shapeValues, (otherThingOrFluid as ThingWithShape).shapeValues)
                case 'polygon':
                case 'square':
                    return areCircleAndPolygonIntersecting(thisThing.shapeValues, (otherThingOrFluid as ThingWithShape).polygonPoints, equalYvalues)
                default:
                    return false
            }
        }
    },

    intersectionWithPath(path: [Point, Point]) {
        const thisThing = this as ThingWithShape
        return (getSortedIntersectionInfoWithCircle(path, thisThing.shapeValues));
    },

    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: ThingWithShape, viewPort: ViewPort) {
        const { color = 'white', fillColor, heading } = thisThing.data
        renderCircle.onCanvas(ctx, thisThing.shapeValues, { strokeColor: color, fillColor, heading }, viewPort)
    }
})

const square = new Shape({
    id: "square",
    getShapeValues() {
        const thisThing = this as ThingWithShape
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
        const thisThing = this as ThingWithShape

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
        const thisThing = this as ThingWithShape
        return isPointInsidePolygon(point, thisThing.polygonPoints)
    },
    intersectingWithShape(otherThingOrFluid: ThingWithShape | Fluid) {
        const thisThing = this as ThingWithShape

        if (otherThingOrFluid.isFluid) {
            return areCircleAndPolygonIntersecting(thisThing.shapeValues, otherThingOrFluid.polygonPoints)
        }

        if (otherThingOrFluid.isBody || otherThingOrFluid.isArea) {
            const otherThing = otherThingOrFluid as ThingWithShape;
            switch (otherThing.data.shape.id) {
                case 'polygon':
                case 'square':
                    return arePolygonsIntersecting(otherThing.polygonPoints, thisThing.polygonPoints)
                case 'circle':
                    return areCircleAndPolygonIntersecting(otherThing.shapeValues, thisThing.polygonPoints)
                default:
                    return false
            }
        }
    },
    intersectionWithPath(path: [Point, Point]) {
        const thisThing = this as ThingWithShape
        const edges = getPolygonLineSegments(thisThing.polygonPoints);
        return (getSortedIntersectionInfoWithEdges(path, edges));
    },
    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: ThingWithShape, viewPort: ViewPort) {
        const { color = 'white', fillColor, heading = 0 } = thisThing.data
        const { polygonPoints } = thisThing
        renderPolygon.onCanvas(ctx, polygonPoints, { strokeColor: color, fillColor, heading }, viewPort)
    }
})

const polygon = new Shape({
    id: 'polygon',
    getShapeValues() {
        const thisThing = this as ThingWithShape
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
        const thisThing = this as ThingWithShape
        const { x, y, size, heading } = thisThing.data;

        return thisThing.data.corners.map(corner => {
            const cornerPlacement = Force.fromVector(corner.x, corner.y)
            cornerPlacement.direction += heading
            cornerPlacement.magnitude *= size
            return {
                x: Math.round(x + cornerPlacement.vectorX),
                y: Math.round(y + cornerPlacement.vectorY)
            }
        })
    },
    containsPoint(point: Point) {
        const thisThing = this as ThingWithShape
        return isPointInsidePolygon(point, thisThing.polygonPoints)
    },
    intersectingWithShape(otherThingOrFluid: ThingWithShape | Fluid) {
        const thisThing = this as ThingWithShape

        if (otherThingOrFluid.isFluid) {
            return areCircleAndPolygonIntersecting(thisThing.shapeValues, otherThingOrFluid.polygonPoints)
        }

        if (otherThingOrFluid.isBody || otherThingOrFluid.isArea) {
            const otherThing = otherThingOrFluid as ThingWithShape;
            switch (otherThing.data.shape.id) {
                case 'polygon':
                case 'square':
                    return arePolygonsIntersecting(otherThing.polygonPoints, thisThing.polygonPoints)
                case 'circle':
                    return areCircleAndPolygonIntersecting(otherThing.shapeValues, thisThing.polygonPoints)
                default:
                    return false
            }
        }
    },
    intersectionWithPath(path: [Point, Point]) {
        const thisThing = this as ThingWithShape
        const edges = getPolygonLineSegments(thisThing.polygonPoints);
        return (getSortedIntersectionInfoWithEdges(path, edges));
    },
    renderOnCanvas(ctx: CanvasRenderingContext2D, thisThing: ThingWithShape, viewPort: ViewPort) {
        const { color = 'white', fillColor, heading = 0 } = thisThing.data
        const { polygonPoints } = thisThing
        renderPolygon.onCanvas(ctx, polygonPoints, { strokeColor: color, fillColor, heading }, viewPort)
    }
})

const shapes = { circle, square, polygon }

export { Shape, shapes, ShapeValues }