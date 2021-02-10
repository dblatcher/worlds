import { Force } from './Force'
import { getVectorX, getVectorY, reverseHeading } from './geometry'
import { Shape } from './Shape'
import { Thing, ThingData } from './Thing'


class SpaceShipData implements ThingData {
    x: number
    y: number
    heading?: number
    size?: number
    color?: string
    density?: number
    shape?: Shape

    keepsHeading?: true
    fillColor?: string
    thrust?: number
    maxThrust?: number
}

class SpaceShip extends Thing {
    data: SpaceShipData
    constructor(config: SpaceShipData, momentum: Force = null) {
        super(config, momentum);
        this.data.keepsHeading = true
        this.data.color = config.color || 'red'
        this.data.fillColor = config.fillColor || 'white'
        this.data.thrust = config.thrust || 0
        this.data.maxThrust = config.maxThrust || 100
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D) {

        const { x, y, size, heading, color, fillColor, thrust, maxThrust } = this.data

        let frontPoint = {
            x: x + getVectorX(size, heading),
            y: y + getVectorY(size, heading)
        }

        const backSideAngle = Math.PI * .75

        let backLeftPoint = {
            x: x + getVectorX(size, heading - backSideAngle),
            y: y + getVectorY(size, heading - backSideAngle)
        }
        let backRightPoint = {
            x: x + getVectorX(size, heading + backSideAngle),
            y: y + getVectorY(size, heading + backSideAngle)
        }

        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.fillStyle = fillColor
        ctx.moveTo(frontPoint.x, frontPoint.y)
        ctx.lineTo(backLeftPoint.x, backLeftPoint.y)
        ctx.lineTo(backRightPoint.x, backRightPoint.y)
        ctx.lineTo(frontPoint.x, frontPoint.y)
        ctx.stroke()
        ctx.fill()


        if (thrust > 0) {
            let backPoint = {
                x: x - getVectorX(size, heading),
                y: y - getVectorY(size, heading)
            }

            let flicker = (Math.random() - .5) * .5
            let flameEndPoint = {
                x: backPoint.x + getVectorX(size * (thrust / maxThrust) * 2, reverseHeading(heading + flicker)),
                y: backPoint.y + getVectorY(size * (thrust / maxThrust) * 2, reverseHeading(heading + flicker))
            }

            ctx.beginPath()
            ctx.strokeStyle = 'blue'
            ctx.fillStyle = 'green'
            ctx.moveTo(backLeftPoint.x, backLeftPoint.y)
            ctx.lineTo(flameEndPoint.x, flameEndPoint.y)
            ctx.lineTo(backRightPoint.x, backRightPoint.y)

            ctx.stroke()
            ctx.fill()
        }
    }

    changeThrottle(change:number) {
        let newAmount = this.data.thrust + change
        if (newAmount < 0) {newAmount = 0}
        if (newAmount > this.data.maxThrust) {newAmount = this.data.maxThrust}
        this.data.thrust = newAmount
    }

    updateMomentum() {
        Thing.prototype.updateMomentum.apply(this, [])
        const { thrust, heading } = this.data
        const thrustForce = new Force(thrust / this.mass, heading)
        this.momentum = Force.combine([this.momentum, thrustForce])
    }

}

export { SpaceShip }