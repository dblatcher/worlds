import { Thing } from "./Thing"
import { getVectorX, getVectorY, Point, _90deg } from './geometry'

const renderPathAhead = {
    onCanvas: function (ctx: CanvasRenderingContext2D, body:Thing):void {
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
    onCanvas: function (ctx: CanvasRenderingContext2D, body:Thing):void {

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
    renderPathAhead, renderHeadingIndicator
}