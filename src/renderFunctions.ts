import { Thing } from "./Thing"
import { getVectorX, getVectorY, Point, _90deg, Circle } from './geometry'

interface CanvasRenderStyle {
    fillColor?: string
    strokeColor?: string
}

const renderCircle = {
    onCanvas: function (ctx: CanvasRenderingContext2D, circle: Circle, style: CanvasRenderStyle): void {
        const { fillColor, strokeColor } = style
        const { x, y, radius } = circle

        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;

        ctx.arc(x, y, radius, 0, Math.PI * 2)

        if (fillColor) { ctx.fill() }
        if (strokeColor) { ctx.stroke() }
    }
}


const renderPolygon = {
    onCanvas: function (ctx: CanvasRenderingContext2D, polygon: Point[], style: CanvasRenderStyle): void {
        const { fillColor, strokeColor } = style

        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;

        ctx.moveTo(polygon[0].x, polygon[0].y)
        for (let i = 1; i < polygon.length; i++) {
            ctx.lineTo(polygon[i].x, polygon[i].y)
        }
        ctx.lineTo(polygon[0].x, polygon[0].y)

        if (fillColor) { ctx.fill() }
        if (strokeColor) { ctx.stroke() }
    }

}

const renderPathAhead = {
    onCanvas: function (ctx: CanvasRenderingContext2D, body: Thing): void {
        const rightX = getVectorX(body.data.size, body.momentum.direction + _90deg)
        const rightY = getVectorY(body.data.size, body.momentum.direction + _90deg)

        const pathArea: Point[] = [
            { x: body.data.x + rightX, y: body.data.y + rightY },
            { x: body.data.x - rightX, y: body.data.y - rightY },
            { x: body.data.x + body.momentum.vectorX - rightX, y: body.data.y + body.momentum.vectorY - rightY },
            { x: body.data.x + body.momentum.vectorX + rightX, y: body.data.y + body.momentum.vectorY + rightY },
        ]

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
    onCanvas: function (ctx: CanvasRenderingContext2D, body: Thing): void {

        const { size, heading } = body.data
        const { x, y } = body.shapeValues

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
}


export {
    renderPathAhead, renderHeadingIndicator, renderCircle, renderPolygon
}