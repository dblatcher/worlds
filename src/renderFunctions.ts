import { Thing } from "./Thing"
import { getVectorX, getVectorY, Point, _90deg, Circle } from './geometry'
import { ViewPort } from "./World"

interface CanvasRenderStyle {
    fillColor?: string
    strokeColor?: string
}

const renderCircle = {
    onCanvas: function (ctx: CanvasRenderingContext2D, circle: Circle, style: CanvasRenderStyle, viewPort:ViewPort): void {
        const { fillColor, strokeColor } = style
        const { x, y, radius } = circle

        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;

        const mappedCenter = viewPort.mapPoint(circle);

        ctx.arc(mappedCenter.x, mappedCenter.y, radius*viewPort.magnify, 0, Math.PI * 2)

        if (fillColor) { ctx.fill() }
        if (strokeColor) { ctx.stroke() }
    }
}


const renderPolygon = {
    onCanvas: function (ctx: CanvasRenderingContext2D, polygon: Point[], style: CanvasRenderStyle, viewPort:ViewPort): void {
        const { fillColor, strokeColor } = style

        ctx.beginPath();
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;

        let mappedPolygon = polygon.map(point => viewPort.mapPoint(point))

        ctx.moveTo(mappedPolygon[0].x, mappedPolygon[0].y)
        for (let i = 1; i < polygon.length; i++) {
            ctx.lineTo(mappedPolygon[i].x, mappedPolygon[i].y)
        }
        ctx.lineTo(mappedPolygon[0].x, mappedPolygon[0].y)

        if (fillColor) { ctx.fill() }
        if (strokeColor) { ctx.stroke() }
    }

}

const renderPathAhead = {
    onCanvas: function (ctx: CanvasRenderingContext2D, body: Thing, viewPort:ViewPort): void {
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
    onCanvas: function (ctx: CanvasRenderingContext2D, body: Thing, viewPort:ViewPort): void {

        const { size, heading } = body.data
        const { x, y } = body.shapeValues

        let centerPoint = viewPort.mapPoint(body.shapeValues)

        let frontPoint = viewPort.mapPoint({
            x: x + getVectorX(size, heading),
            y: y + getVectorY(size, heading)
        })

        ctx.beginPath()
        ctx.strokeStyle = 'black';
        ctx.moveTo(centerPoint.x, centerPoint.y)
        ctx.lineTo(frontPoint.x, frontPoint.y)
        ctx.stroke()

    }
}


export {
    renderPathAhead, renderHeadingIndicator, renderCircle, renderPolygon
}