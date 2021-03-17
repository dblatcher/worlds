import { Circle, getDistanceBetweenPoints, getPolygonLineSegments, getVectorX, getVectorY, Point, Vector } from "./geometry"
import { ViewPort } from "./ViewPort"


class AbstractGradientFill {
    makeCanvasFill: Function
    fallbackColor: string
    setFillStyleForCircle(circle: Circle, heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        ctx.fillStyle = this.fallbackColor
    }
    setFillStyleForPolygon(polygon: Point[], heading: number, ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        ctx.fillStyle = this.fallbackColor
    }
    setFillStyleForViewPort(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        ctx.fillStyle = this.fallbackColor
    }

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

class LinearGradientFill extends AbstractGradientFill {
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

class RadialGradientFill extends AbstractGradientFill {
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
            radius: Math.max(viewPort.width/2, viewPort.height/2)
        }
        ctx.fillStyle = this.makeCanvasFill(ctx, circle, 0);
    }

}

export { AbstractGradientFill, LinearGradientFill, RadialGradientFill }