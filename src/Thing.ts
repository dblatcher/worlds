import { World } from './World'
import { Force } from './Force'
import { getVectorX, getVectorY, Point, _90deg } from './geometry'
import { getGravitationalForce, bounceOffWorldEdge, handleCollisionAccordingToShape } from './physics'
import { CollisionReport, getEdgeCollisionDetectionFunction, EdgeCollisionReport, getCollisionDetectionFunction } from './collisionDetection'
import { Shape, shapes, ShapeValues } from './Shape'
import { renderHeadingIndicator, renderPathAhead } from './renderFunctions'



interface ThingData {
    x: number
    y: number
    heading?: number
    size?: number
    headingFollowsDirection?: boolean
    shape?: Shape
    color?: string
    fillColor?: string
    density?: number
    elasticity?: number
    immobile?: boolean
    renderHeadingIndicator?: boolean
    renderPathAhead?: boolean
}


class Thing {
    world: World
    data: ThingData
    momentum: Force
    constructor(config: ThingData, momentum: Force = Force.none) {
        this.data = config
        this.data.heading = this.data.heading || 0
        this.data.density = typeof this.data.density === 'number' ? this.data.density : 1
        this.data.size = typeof this.data.size === 'number' ? this.data.size : 1
        this.data.shape = this.data.shape || shapes.circle
        this.data.headingFollowsDirection = config.headingFollowsDirection || false
        this.data.immobile = config.immobile || false
        this.data.renderHeadingIndicator = config.renderHeadingIndicator || false
        this.data.renderPathAhead = config.renderPathAhead || false
        this.data.elasticity = typeof this.data.elasticity === 'number' ? this.data.elasticity : 1
        this.momentum = momentum || Force.none
    }

    get typeId() { return 'Thing' }

    duplicate() {
        return new Thing(Object.assign({}, this.data), new Force(this.momentum.magnitude, this.momentum.direction))
    }

    // TO DO - delegate mass to Shape
    get mass() {
        const { size, density } = this.data
        return size * size * Math.PI * density
    }

    get polygonPoints() {
        return this.data.shape.getPolygonPoints.apply(this, []) as Point[]
    }

    get shapeValues() {
        return this.data.shape.getShapeValues.apply(this, []) as ShapeValues
    }

    get gravitationalForces() {
        if (!this.world) { return Force.none }
        const { globalGravityForce, gravitationalConstant, things, thingsExertGravity, minimumMassToExertGravity } = this.world

        let forces = []

        if (thingsExertGravity) {
            let otherThings = minimumMassToExertGravity
                ? things.filter(thing => thing !== this && thing.mass >= minimumMassToExertGravity)
                : things.filter(thing => thing !== this)

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
        if (this.data.immobile) {
            this.momentum = Force.none
            return
        }
        gravitationalForces.magnitude = gravitationalForces.magnitude / mass
        this.momentum = Force.combine([this.momentum, gravitationalForces])
    }

    move() {
        const copyOfThis = this.duplicate();
        const { top, bottom, radius, left, right } = copyOfThis.shapeValues

        if (!this.data.immobile) {
            copyOfThis.data.y += copyOfThis.momentum.vectorY
            copyOfThis.data.x += copyOfThis.momentum.vectorX
        }

        const immobileThings = this.world.things.filter(thing => thing.data.immobile && thing !== this)

        //undo any moves that would put this inside an immobile thing
        // problem - this won't undo moves made by the physics module to separate collising things or put a thing at its stop point

        let i = 0;
        for (i = 0; i < immobileThings.length; i++) {
            if (copyOfThis.isIntersectingWith(immobileThings[i])) {
                copyOfThis.data.x = this.data.x
                copyOfThis.data.y = this.data.y
            }
        }

        if (this.world.hasHardEdges && !this.data.immobile) {
            copyOfThis.data.y = top < 0 ? radius : copyOfThis.data.y
            copyOfThis.data.y = bottom > this.world.height ? this.world.height - radius : copyOfThis.data.y

            copyOfThis.data.x = left < 0 ? radius : copyOfThis.data.x
            copyOfThis.data.x = right > this.world.width ? this.world.width - radius : copyOfThis.data.x
        }

        if (this.data.headingFollowsDirection) {
            copyOfThis.data.heading = copyOfThis.momentum.direction
        }


        this.data.x = copyOfThis.data.x
        this.data.y = copyOfThis.data.y
        this.data.heading = copyOfThis.data.heading
    }

    detectCollisions(withMobileThings: boolean = true, withImmobileThings: boolean = true) {
        const otherThings = this.world.things.filter(otherThing =>
            otherThing !== this && (withMobileThings || otherThing.data.immobile) && (withImmobileThings || !otherThing.data.immobile)
        )


        const reports: CollisionReport[] = []

        otherThings.forEach(otherThing => {
            const collisionDetectionFunction = getCollisionDetectionFunction(this.data.shape, otherThing.data.shape)
            let report = collisionDetectionFunction(this, otherThing)
            reports.push(report)
        })

        return reports
    }

    handleCollision(report: CollisionReport) {
        if (report) {
            handleCollisionAccordingToShape(report)
        }
    }

    detectWorldEdgeCollisions() {
        if (!this.world) { return [] }
        const reports: EdgeCollisionReport[] = []
        const edgeCollisionDetectionFunction = getEdgeCollisionDetectionFunction(this.data.shape)
        reports.push(edgeCollisionDetectionFunction(this))
        return reports
    }

    handleWorldEdgeCollision(report: EdgeCollisionReport) {
        if (report) { bounceOffWorldEdge(report) }
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D) {
        if (this.data.renderPathAhead) {
            renderPathAhead.onCanvas(ctx, this);
        }

        this.data.shape.renderOnCanvas(ctx, this);

        if (this.data.renderHeadingIndicator) {
            renderHeadingIndicator.onCanvas(ctx, this)
        }
    }

    checkIfContainsPoint(point: { x: number, y: number }) {
        return this.data.shape.containsPoint.apply(this, [point]) as boolean
    }

    isIntersectingWith(otherThing: Thing) {
        return this.data.shape.intersectingWithShape.apply(this, [otherThing]) as boolean
    }
}


class LinedThing extends Thing {
    renderOnCanvas(ctx: CanvasRenderingContext2D) {
        this.data.shape.renderOnCanvas(ctx, this);
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