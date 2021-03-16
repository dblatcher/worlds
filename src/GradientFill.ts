import { Circle, getPolygonLineSegments, getVectorX, getVectorY, Point, Vector } from "./geometry"
import { ViewPort } from "./ViewPort"


class AbstractGradientFill {
    makeCanvasFill: Function
    fallbackColor: string
    setFillStyleForCircle(circle: Circle, heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort) { ctx.fillStyle = this.fallbackColor }
    setFillStyleForPolygon(polygon: Point[], ctx: CanvasRenderingContext2D, viewPort: ViewPort) { ctx.fillStyle = this.fallbackColor }
}


interface CanvasLinearGradientFunction {
    (ctx: CanvasRenderingContext2D, line: [Point, Point]): CanvasGradient
}

class LinearGradientFill extends AbstractGradientFill {
    makeCanvasFill: CanvasLinearGradientFunction
    fallbackColor: string
    constructor(config: {
        fallbackColor: string,
        canvasFunction: CanvasLinearGradientFunction
    }) {
        super()
        this.fallbackColor = config.fallbackColor
        this.makeCanvasFill = config.canvasFunction
    }

    get isFillColorObject() { return true }


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

    setFillStyleForPolygon(polygon: Point[], ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
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

}

export { AbstractGradientFill, LinearGradientFill }