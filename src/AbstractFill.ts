import { Circle, getDistanceBetweenPoints, getPolygonLineSegments, getVectorX, getVectorY, Point, Vector, _deg } from "./geometry"
import { originPoint } from "./geometry/definitions"
import { ViewPort } from "./ViewPort"


abstract class AbstractFill {
    makeCanvasFill: Function
    fallbackColor: string
    abstract setFillStyleForCircle(circle: Circle, heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort): void
    abstract setFillStyleForPolygon(polygon: Point[], heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort): void
    abstract setFillStyleForViewPort(ctx: CanvasRenderingContext2D, viewPort: ViewPort): void

    constructor(config: {
        fallbackColor: string,
        canvasFunction: Function
    }) {
        this.fallbackColor = config.fallbackColor
        this.makeCanvasFill = config.canvasFunction
    }
    get isFillColorObject() { return true }
}


interface CanvasLinearGradientFunction {
    (ctx: CanvasRenderingContext2D, line: [Point, Point]): CanvasGradient
}

class LinearGradientFill extends AbstractFill {
    makeCanvasFill: CanvasLinearGradientFunction

    setFillStyleForCircle(circle: Circle, heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        const toFront: Vector = {
            x: getVectorX(circle.radius, heading), y: getVectorY(circle.radius, heading)
        }

        const line = [
            { x: circle.x + toFront.x, y: circle.y + toFront.y },
            { x: circle.x - toFront.x, y: circle.y - toFront.y }
        ].map(point => viewPort.mapPoint(point)) as [Point, Point]

        ctx.fillStyle = this.makeCanvasFill(ctx, line)
    }

    setFillStyleForPolygon(polygon: Point[], heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        const edges = getPolygonLineSegments(polygon)
        const point1 = {
            x: (edges[0][0].x + edges[0][1].x) / 2,
            y: (edges[0][0].y + edges[0][1].y) / 2
        }

        const oppositeIndex = Math.floor(edges.length / 2)

        const point2 = {
            x: (edges[oppositeIndex][0].x + edges[oppositeIndex][1].x) / 2,
            y: (edges[oppositeIndex][0].y + edges[oppositeIndex][1].y) / 2
        }

        const line = [point1, point2]
            .map(point => viewPort.mapPoint(point)) as [Point, Point]
        ctx.fillStyle = this.makeCanvasFill(ctx, line)
    }

    setFillStyleForViewPort(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        ctx.fillStyle = this.makeCanvasFill(ctx, [
            { x: viewPort.width / 2, y: 0 },
            { x: viewPort.width / 2, y: viewPort.height }
        ]);
    }
}

interface CanvasRadialGradientFunction {
    (ctx: CanvasRenderingContext2D, circle: Circle, heading: number): CanvasGradient
}

class RadialGradientFill extends AbstractFill {
    makeCanvasFill: CanvasRadialGradientFunction

    setFillStyleForCircle(circle: Circle, heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        const mappedCircleCenter = viewPort.mapPoint(circle)
        const mappedCircle = {
            x: mappedCircleCenter.x,
            y: mappedCircleCenter.y,
            radius: circle.radius * viewPort.magnify
        }
        ctx.fillStyle = this.makeCanvasFill(ctx, mappedCircle, heading)
    }

    setFillStyleForPolygon(polygon: Point[], heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        const x = polygon.reduce((previousvalue, vertex) => vertex.x + previousvalue, 0) / polygon.length
        const y = polygon.reduce((previousvalue, vertex) => vertex.y + previousvalue, 0) / polygon.length
        const polygonCenter: Point = { x, y }

        const furtherestDistanceFromCenter = polygon
            .map(vertex => getDistanceBetweenPoints(vertex, polygonCenter))
            .sort().reverse()[0]

        const mappedCircleCenter = viewPort.mapPoint(polygonCenter)
        const mappedCircle = {
            x: mappedCircleCenter.x,
            y: mappedCircleCenter.y,
            radius: furtherestDistanceFromCenter * viewPort.magnify
        }
        ctx.fillStyle = this.makeCanvasFill(ctx, mappedCircle, heading)
    }

    setFillStyleForViewPort(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        const circle: Circle = {
            x: viewPort.width / 2,
            y: viewPort.height / 2,
            radius: Math.max(viewPort.width / 2, viewPort.height / 2)
        }
        ctx.fillStyle = this.makeCanvasFill(ctx, circle, 0);
    }

}


class ImageFill extends AbstractFill {
    image: CanvasImageSource

    constructor(config: {
        fallbackColor: string,
        canvasFunction: Function,
        image: CanvasImageSource
    }) {
        super(config)
        this.image = config.image
    }

    setFillStyleForCircle(circle: Circle, heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort): void {

        const pattern = ctx.createPattern(this.image, 'repeat')
        const viewPortCoords = viewPort.mapPoint(circle)

        const matrix = this.makeMatrix(viewPortCoords, heading)
        pattern.setTransform(matrix)

        ctx.fillStyle = pattern
    }
    setFillStyleForPolygon(polygon: Point[], heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort): void {
        const pattern = ctx.createPattern(this.image, 'repeat')
        const viewPortCoords = viewPort.mapPoint(polygon[0])

        const matrix = this.makeMatrix(viewPortCoords, heading)
        pattern.setTransform(matrix)

        ctx.fillStyle = pattern
    }
    setFillStyleForViewPort(ctx: CanvasRenderingContext2D, viewPort: ViewPort): void {
        const pattern = ctx.createPattern(this.image, 'repeat')
        const viewPortCoords = viewPort.mapPoint(originPoint)

        const matrix = this.makeMatrix(viewPortCoords, 0)
        pattern.setTransform(matrix)

        ctx.fillStyle = pattern
    }

    makeMatrix(point: Point, heading: number): DOMMatrix {
        const matrix = new DOMMatrix()
            .translateSelf(point.x, point.y)
            .rotateSelf(-heading / _deg);
        return matrix
    }
}

export { AbstractFill, LinearGradientFill, RadialGradientFill, ImageFill }