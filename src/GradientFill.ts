import { Circle, Point } from "./geometry"
import { ViewPort } from "./ViewPort"


class AbstractGradientFill {
    makeCanvasFill: Function
    fallbackColor: string
    setFillStyleForCircle(circle: Circle, ctx: CanvasRenderingContext2D, viewPort: ViewPort) {ctx.fillStyle = this.fallbackColor}
    setFillStyleForPolygon(polygon: Point[], ctx: CanvasRenderingContext2D, viewPort: ViewPort) {ctx.fillStyle = this.fallbackColor}
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


    setFillStyleForCircle(circle: Circle, ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        const line = [
            { x: circle.x - circle.radius, y: circle.y - circle.radius },
            { x: circle.x + circle.radius, y: circle.y + circle.radius }
        ].map(point => viewPort.mapPoint(point)) as [Point, Point]

        ctx.fillStyle = this.makeCanvasFill(ctx, line)
    }

}

export { AbstractGradientFill, LinearGradientFill }