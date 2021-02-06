import { World } from './World'
import { Force } from './Force'
import { getVectorX, getVectorY, getDirection, getDistanceBetweenPoints, getHeadingFromPointToPoint } from './geometry'
import { getGravitationalForce } from './physics'


interface ThingData {
    x: number
    y: number
    heading?: number
    size?: number
    color?: string
    density?: number
}


class Thing {
    world: World
    data: ThingData
    momentum: Force
    constructor(config: ThingData, momentum: Force = null) {
        this.data = config
        this.data.heading = this.data.heading || 0
        this.data.density = typeof this.data.density === 'number' ? this.data.density : 1
        this.data.size = typeof this.data.size === 'number' ? this.data.size : 1
        this.momentum = momentum || new Force(0, 0)
    }

    get mass() {
        const { size, density } = this.data
        return size * size * Math.PI * density
    }

    get gravitationalForces() {
        if (!this.world) { return new Force(0, 0) }
        const { globalGravityForce, gravitationalConstant,things } = this.world

        const otherThings = things.filter(thing => thing !== this)
        let forces = otherThings.map(otherthing => getGravitationalForce(gravitationalConstant, this, otherthing))

        if (globalGravityForce) {
            const effect = new Force(globalGravityForce.magnitude * gravitationalConstant * this.mass, globalGravityForce.direction) 
            console.log(effect)
            forces.push(effect)
        }

        return Force.combine(forces)
    }

    move() {
        const { gravitationalForces, mass } = this
        gravitationalForces.magnitude = gravitationalForces.magnitude / mass

        this.momentum = Force.combine([this.momentum, gravitationalForces])

        this.data.y += this.momentum.vectorY
        this.data.x += this.momentum.vectorX

        this.data.heading = this.momentum.direction
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D) {
        const { x, y, size, color = 'white', heading } = this.data

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


class LinedThing extends Thing {
    renderOnCanvas(ctx: CanvasRenderingContext2D) {
        const { x, y, size, color = 'white', heading } = this.data

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

        ctx.beginPath()
        ctx.moveTo(frontPoint.x, frontPoint.y)
        ctx.lineTo(frontPoint.x, y)
        ctx.moveTo(frontPoint.x, frontPoint.y)
        ctx.lineTo(x, frontPoint.y)
        ctx.stroke()

    }
}

export { Thing, ThingData, LinedThing }