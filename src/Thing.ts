import { World } from './World'
import { Force } from './Force'
import { getVectorX, getVectorY } from './geometry'
import { getGravitationalForce, mutualRoundBounce, findFlatBounceVector } from './physics'
import { checkForCircleCollisions, CollisionReport, checkForEdgeCollisions } from './collisionDetection'
import { Shape, shapes } from './Shape'


interface ThingData {
    x: number
    y: number
    heading?: number
    size?: number
    color?: string
    density?: number
    shape?: Shape
    keepsHeading?: boolean
    elasticity?: number
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
        this.data.shape = this.data.shape || shapes.circle
        this.data.keepsHeading = config.keepsHeading || false
        this.data.elasticity = typeof this.data.elasticity === 'number' ? this.data.elasticity : 1
        this.momentum = momentum || new Force(0, 0)
    }

    get mass() {
        const { size, density } = this.data
        return size * size * Math.PI * density
    }

    get shapeValues() {
        return {
            radius: this.data.size,
            x: this.data.x,
            y: this.data.y,
            top: this.data.y - this.data.size,
            bottom: this.data.y + this.data.size,
            left: this.data.x - this.data.size,
            right: this.data.x + this.data.size,
        }
    }

    get gravitationalForces() {
        if (!this.world) { return new Force(0, 0) }
        const { globalGravityForce, gravitationalConstant, things, thingsExertGravity } = this.world

        let forces = []

        if (thingsExertGravity) {
            const otherThings = things.filter(thing => thing !== this)
            let forcesFromOtherThings = otherThings.map(otherthing => getGravitationalForce(gravitationalConstant, this, otherthing))
            forces.push(...forcesFromOtherThings)
        }

        if (globalGravityForce) {
            const effect = new Force(globalGravityForce.magnitude * gravitationalConstant * this.mass, globalGravityForce.direction)
            forces.push(effect)
        }

        return Force.combine(forces)
    }

    enterWorld(world: World) {
        if (this.world) { this.leaveWorld() }
        world.things.push(this)
        this.world = world
    }

    leaveWorld() {
        if (!this.world) { return }
        this.world.things.splice(this.world.things.indexOf(this), 1)
        this.world = null
    }

    updateMomentum() {
        const { gravitationalForces, mass } = this
        gravitationalForces.magnitude = gravitationalForces.magnitude / mass
        this.momentum = Force.combine([this.momentum, gravitationalForces])
    }

    move() {
        this.data.y += this.momentum.vectorY
        this.data.x += this.momentum.vectorX

        const { top, bottom, radius, left, right } = this.shapeValues

        if (this.world.hasHardEdges) {
            this.data.y = top < 0 ? radius : this.data.y
            this.data.y = bottom > this.world.height ? this.world.height - radius : this.data.y

            this.data.x = left < 0 ? radius : this.data.x
            this.data.x = right > this.world.width ? this.world.width - radius : this.data.x
        }

        if (!this.data.keepsHeading) {
            this.data.heading = this.momentum.direction
        }
    }

    detectCollisions() {
        const otherThings = this.world.things.filter(otherThing => otherThing !== this)
        const reports: CollisionReport[] = []

        otherThings.forEach(otherThing => {
            let report = checkForCircleCollisions(this, otherThing)
            reports.push(report)
        })

        return reports
    }

    handleCollision(report: CollisionReport) {
        if (report) { mutualRoundBounce(report) }
    }

    detectWorldEdgeCollisions() {
        const reports: CollisionReport[] = []
        reports.push(checkForEdgeCollisions(this))
        return reports
    }

    handleWorldEdgeCollision(report: CollisionReport) {
        if (report) { findFlatBounceVector(report) }
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
        ctx.strokeStyle = 'black';
        ctx.moveTo(x, y)
        ctx.lineTo(frontPoint.x, frontPoint.y)
        ctx.stroke()

    }

    checkIfContainsPoint(point: { x: number, y: number }) {
        return this.data.shape.containsPoint.apply(this, [point])
    }

    checkIfCollidingWith(otherThing: Thing) {
        return this.data.shape.intersectingWithShape.apply(this, [otherThing])
    }
}


class LinedThing extends Thing {
    renderOnCanvas(ctx: CanvasRenderingContext2D) {
        Thing.prototype.renderOnCanvas.apply(this, [ctx])
        const { x, y, size, heading } = this.data

        let midPoint = {
            x: x + getVectorX(size / 2, heading),
            y: y + getVectorY(size / 2, heading)
        }

        ctx.beginPath()
        ctx.moveTo(midPoint.x, midPoint.y)
        ctx.lineTo(midPoint.x, y)
        ctx.moveTo(midPoint.x, midPoint.y)
        ctx.lineTo(x, midPoint.y)
        ctx.stroke()
    }
}

class KillerThing extends LinedThing {
    handleCollision(report: CollisionReport) {
        if (report) {
            console.log('DIE!', report)
            if (report.item1 === this) { report.item2.leaveWorld() }
            else { report.item1.leaveWorld() }
        }
    }
}

export { Thing, ThingData, LinedThing, KillerThing }