import { Thing } from "./Thing"
import { getVectorX, getVectorY, Point, _90deg, Circle } from './geometry'
import { ViewPort } from "./World"
import { AbstractGradientFill } from "./GradientFill"

interface CanvasRenderStyle {
    fillColor?: string | AbstractGradientFill
    strokeColor?: string
    parallax?: number
    lineDash?: number[]
}

function beginPathAndStyle(ctx: CanvasRenderingContext2D, style: CanvasRenderStyle) {
    const { fillColor, strokeColor, lineDash = [] } = style

    const fillStyle = typeof fillColor === 'object'
        ? (fillColor as AbstractGradientFill).fallbackColor
        : fillColor

    ctx.beginPath();
    ctx.setLineDash(lineDash);
    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeColor;
}

const renderCircle = {
    onCanvas: function (ctx: CanvasRenderingContext2D, circle: Circle, style: CanvasRenderStyle, viewPort: ViewPort): void {
        beginPathAndStyle(ctx, style);
        if (typeof style.fillColor == 'object') {
            (style.fillColor as AbstractGradientFill).setFillStyleForCircle(circle, ctx, viewPort)
        }
        const { parallax = 1 } = style
        const { radius } = circle

        const mappedCenter = viewPort.mapPoint(circle, parallax);
        ctx.arc(mappedCenter.x, mappedCenter.y, (radius * viewPort.magnify / parallax), 0, Math.PI * 2)

        if (style.fillColor) { ctx.fill() }
        if (style.strokeColor) { ctx.stroke() }
    }
}

const renderPoint = {
    onCanvas: function (ctx: CanvasRenderingContext2D, point: Point, style: CanvasRenderStyle, viewPort: ViewPort): void {
        beginPathAndStyle(ctx, style);

        const mappedCenter = viewPort.mapPoint(point, style.parallax);
        ctx.arc(mappedCenter.x, mappedCenter.y, Math.round(viewPort.pointRadius / 2), 0, Math.PI * 2)

        if (style.fillColor) { ctx.fill() }
        if (style.strokeColor) { ctx.stroke() }
    }
}

const renderLine = {
    onCanvas: function (ctx: CanvasRenderingContext2D, line: [Point, Point], style: CanvasRenderStyle, viewPort: ViewPort): void {
        beginPathAndStyle(ctx, style);
        const { parallax = 1 } = style

        let mappedLine = line.map(point => viewPort.mapPoint(point, parallax))
        ctx.moveTo(mappedLine[0].x, mappedLine[0].y)
        ctx.lineTo(mappedLine[1].x, mappedLine[1].y)

        if (style.strokeColor) { ctx.stroke() }
    }
}


const renderPolygon = {
    onCanvas: function (ctx: CanvasRenderingContext2D, polygon: Point[], style: CanvasRenderStyle, viewPort: ViewPort): void {
        beginPathAndStyle(ctx, style);
        if (typeof style.fillColor == 'object') {
            (style.fillColor as AbstractGradientFill).setFillStyleForPolygon(polygon, ctx, viewPort)
        }
        const { parallax = 1 } = style

        let mappedPolygon = polygon.map(point => viewPort.mapPoint(point, parallax))
        ctx.moveTo(mappedPolygon[0].x, mappedPolygon[0].y)
        for (let i = 1; i < polygon.length; i++) {
            ctx.lineTo(mappedPolygon[i].x, mappedPolygon[i].y)
        }
        ctx.lineTo(mappedPolygon[0].x, mappedPolygon[0].y)

        if (style.fillColor) { ctx.fill() }
        if (style.strokeColor) { ctx.stroke() }
    }
}

const renderPathAhead = {
    onCanvas: function (ctx: CanvasRenderingContext2D, body: Thing, viewPort: ViewPort): void {
        const rightX = getVectorX(body.data.size, body.momentum.direction + _90deg)
        const rightY = getVectorY(body.data.size, body.momentum.direction + _90deg)

        const pathArea: Point[] = [
            { x: body.data.x + rightX, y: body.data.y + rightY },
            { x: body.data.x - rightX, y: body.data.y - rightY },
            { x: body.data.x + body.momentum.vectorX - rightX, y: body.data.y + body.momentum.vectorY - rightY },
            { x: body.data.x + body.momentum.vectorX + rightX, y: body.data.y + body.momentum.vectorY + rightY },
        ].map(point => viewPort.mapPoint(point))

        ctx.beginPath();
        ctx.fillStyle = 'yellow';
        ctx.moveTo(pathArea[0].x, pathArea[0].y)
        for (let i = 1; i < pathArea.length; i++) {
            ctx.lineTo(pathArea[i].x, pathArea[i].y)
        }
        ctx.lineTo(pathArea[0].x, pathArea[0].y)
        ctx.fill();
    }
}

const renderHeadingIndicator = {
    onCanvas: function (ctx: CanvasRenderingContext2D, body: Thing, viewPort: ViewPort): void {

        const { size, heading } = body.data
        const { x, y } = body.shapeValues

        let centerPoint = viewPort.mapPoint(body.shapeValues)

        let frontPoint = viewPort.mapPoint({
            x: x + getVectorX(size, heading),
            y: y + getVectorY(size, heading)
        })

        ctx.beginPath()
        ctx.lineWidth = viewPort.visibleLineWidth
        ctx.strokeStyle = 'yellow';
        ctx.moveTo(centerPoint.x, centerPoint.y)
        ctx.lineTo(frontPoint.x, frontPoint.y)
        ctx.stroke()
        ctx.lineWidth = 1

    }
}


export {
    renderPathAhead, renderHeadingIndicator, renderCircle, renderPolygon, renderPoint, renderLine
}