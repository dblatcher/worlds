import { World } from './World'
import { Force } from './Force'
import { getVectorX, getVectorY,getDirection } from './geometry'


interface ThingData {
    x: number
    y: number
    heading?: number
    size?: number
    color?: string
}


class Thing {
    world: World
    data: ThingData
    momentum: Force
    constructor(config: ThingData, momentum: Force = null) {
        this.data = config
        this.data.heading = this.data.heading || 0
        this.momentum = momentum || new Force(0, 0)
    }

    move() {
        this.data.y += this.momentum.vectorY
        this.data.x += this.momentum.vectorX

        this.data.heading = this.momentum.direction
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D) {
        const { x, y, size = 1, color = 'white', heading } = this.data

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill();

        let frontPoint = {
            x: x + getVectorX(size, heading),
            y: y + getVectorY(size, heading)
        }

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(frontPoint.x, frontPoint.y)
        ctx.stroke()

    }
}

export { Thing, ThingData }