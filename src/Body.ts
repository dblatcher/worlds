import { World, ViewPort } from './World'
import { Force } from './Force'
import { _90deg } from './geometry'
import { getGravitationalForce, bounceOffWorldEdge, handleCollisionAccordingToShape, getUpthrustForce, calculateDragForce } from './physics'
import { CollisionReport, getEdgeCollisionDetectionFunction, EdgeCollisionReport, getCollisionDetectionFunction } from './collision-detection/collisionDetection'
import { Shape } from './Shape'
import { renderHeadingIndicator, renderPathAhead } from './renderFunctions'
import { AbstractGradientFill } from './GradientFill'
import { ThingWithShape } from './ThingWithShape'



interface BodyData {
    x: number
    y: number
    heading?: number
    size?: number
    headingFollowsDirection?: boolean
    shape?: Shape
    color?: string
    fillColor?: string | AbstractGradientFill
    density?: number
    elasticity?: number
    immobile?: boolean
    renderHeadingIndicator?: boolean
    renderPathAhead?: boolean
}


class Body extends ThingWithShape {
    world: World
    data: BodyData
    momentum: Force
    constructor(config: BodyData, momentum: Force = Force.none) {
        super(config)
        this.data.heading = this.data.heading || 0
        this.data.density = typeof this.data.density === 'number' ? this.data.density : 1
        this.data.size = typeof this.data.size === 'number' ? this.data.size : 1
        this.data.headingFollowsDirection = config.headingFollowsDirection || false
        this.data.immobile = config.immobile || false
        this.data.renderHeadingIndicator = config.renderHeadingIndicator || false
        this.data.renderPathAhead = config.renderPathAhead || false
        this.data.elasticity = typeof this.data.elasticity === 'number' ? this.data.elasticity : 1
        this.momentum = momentum || Force.none
    }

    get isBody() { return true }
    get typeId() { return 'Body' }

    get description() { return `${this.data.immobile ? 'immobile ' : ''}${this.data.color} ${this.data.shape.id} ${this.typeId}` }

    duplicate() {
        const myPrototype = Object.getPrototypeOf(this)
        return new myPrototype.constructor(Object.assign({}, this.data), new Force(this.momentum.magnitude, this.momentum.direction))
    }

    // TO DO - delegate mass + volume to Shape
    get volume() {
        const { size } = this.data
        return (4 / 3) * size ** 3 * Math.PI
    }

    get mass() {
        const { density } = this.data
        const { volume } = this
        return volume * density
    }

    get gravitationalForces(): Force {
        if (!this.world) { return Force.none }
        const { globalGravityForce, gravitationalConstant, bodies, bodiesExertGravity, minimumMassToExertGravity } = this.world

        let forces = []

        if (bodiesExertGravity) {
            let otherBodies = minimumMassToExertGravity
                ? bodies.filter(body => body !== this && body.mass >= minimumMassToExertGravity)
                : bodies.filter(body => body !== this)

            let forcesFromOtherBodies = otherBodies.map(otherBody => getGravitationalForce(gravitationalConstant, this, otherBody))
            forces.push(...forcesFromOtherBodies)
        }

        if (globalGravityForce) {
            const effect = new Force(globalGravityForce.magnitude * gravitationalConstant * this.mass, globalGravityForce.direction)
            forces.push(effect)
        }

        return Force.combine(forces)
    }

    get upthrustForces(): Force {
        if (!this.world) { return Force.none }
        const { gravitationalConstant, fluids, globalGravityForce } = this.world
        let forces: Force[] = []

        fluids.forEach(fluid => {
            if (this.isIntersectingWith(fluid)) {
                forces.push(getUpthrustForce(gravitationalConstant, globalGravityForce, this, fluid))
            }
        })

        return Force.combine(forces)
    }

    enterWorld(world: World) {
        if (this.world) { this.leaveWorld() }
        world.bodies.push(this)
        this.world = world
    }

    leaveWorld() {
        if (!this.world) { return }
        this.world.bodiesLeavingAtNextTick.push(this)
    }

    updateMomentum() {
        const { gravitationalForces, mass, upthrustForces } = this
        if (this.data.immobile) {
            this.momentum = Force.none
            return
        }
        gravitationalForces.magnitude = gravitationalForces.magnitude / mass
        upthrustForces.magnitude = upthrustForces.magnitude / mass

        // console.log(`gravity: ${gravitationalForces.magnitude} : upthrust: ${upthrustForces.magnitude} = ${upthrustForces.magnitude-gravitationalForces.magnitude}`)

        const drag = calculateDragForce(this, Force.combine([this.momentum, gravitationalForces, upthrustForces]))

        this.momentum = Force.combine([this.momentum, gravitationalForces, upthrustForces, drag])
    }

    move(timeRemaining = 1) {
        const copyOfThis = this.duplicate();
        const { top, bottom, radius, left, right } = copyOfThis.shapeValues

        if (!this.data.immobile) {
            copyOfThis.data.y += copyOfThis.momentum.vectorY * timeRemaining
            copyOfThis.data.x += copyOfThis.momentum.vectorX * timeRemaining
        }

        const immobileBodies = this.world.bodies.filter(body => body.data.immobile && body !== this)

        //undo any moves that would put this inside an immobile body
        // problem - this won't undo moves made by the physics module to separate collising bodies or put a body at its stop point


        let i = 0;
        for (i = 0; i < immobileBodies.length; i++) {
            if (copyOfThis.isIntersectingWith(immobileBodies[i])) {
                copyOfThis.data.x = this.data.x
                copyOfThis.data.y = this.data.y
            }
        }

        // problem - BODIES GET STUCK - need to 'shake loose' by moving them to radius +1 or  h|w - (radius +1) ?
        if (!this.data.immobile) {

            if (this.world.edges.top === 'HARD') {
                copyOfThis.data.y = top < 0 ? radius : copyOfThis.data.y
            }

            if (this.world.edges.bottom === 'HARD') {
                copyOfThis.data.y = bottom > this.world.height ? this.world.height - radius : copyOfThis.data.y
            }

            if (this.world.edges.left === 'HARD') {
                copyOfThis.data.x = left < 0 ? radius : copyOfThis.data.x
            }

            if (this.world.edges.right === 'HARD') {
                copyOfThis.data.x = right > this.world.width ? this.world.width - radius : copyOfThis.data.x
            }

            if (this.world.edges.top === 'WRAP') {
                copyOfThis.data.y = copyOfThis.data.y < 0 ? copyOfThis.data.y + this.world.height : copyOfThis.data.y
            }

            if (this.world.edges.bottom === 'WRAP') {
                copyOfThis.data.y = copyOfThis.data.y > this.world.height ? copyOfThis.data.y - this.world.height : copyOfThis.data.y
            }

            if (this.world.edges.left === 'WRAP') {
                copyOfThis.data.x = copyOfThis.data.x < 0 ? copyOfThis.data.x + this.world.width : copyOfThis.data.x
            }

            if (this.world.edges.right === 'WRAP') {
                copyOfThis.data.x = copyOfThis.data.x > this.world.width ? copyOfThis.data.x - this.world.width : copyOfThis.data.x
            }
        }

        if (this.data.headingFollowsDirection) {
            copyOfThis.data.heading = copyOfThis.momentum.direction
        }


        this.data.x = copyOfThis.data.x
        this.data.y = copyOfThis.data.y
        this.data.heading = copyOfThis.data.heading
    }

    detectCollisions(withMobileBodies: boolean = true, withImmobileBodies: boolean = true) {
        const otherBodies = this.world.bodies.filter(otherBody =>
            otherBody !== this &&
            (withMobileBodies || otherBody.data.immobile) &&
            (withImmobileBodies || !otherBody.data.immobile)
        )

        const { vectorX, vectorY } = this.momentum
        const { x, y } = this.data

        const lazyYRange = (this.data.size * 1.5) + 2 * Math.abs(vectorY)
        const lazyXRange = (this.data.size * 1.5) + 2 * Math.abs(vectorX)

        const otherBodiesInRange = otherBodies.filter(otherBody => {
            return (
                Math.abs(otherBody.data.y - y) < (lazyYRange + otherBody.data.size * 1.5) &&
                Math.abs(otherBody.data.x - x) < (lazyXRange + otherBody.data.size * 1.5)
            )
        })

        const reports: CollisionReport[] = []

        otherBodiesInRange.forEach(otherBody => {
            const collisionDetectionFunction = getCollisionDetectionFunction(this.data.shape, otherBody.data.shape)
            let report = collisionDetectionFunction(this, otherBody)
            reports.push(report)
        })

        return reports
    }

    handleCollision(report: CollisionReport) {
        handleCollisionAccordingToShape(report)
    }

    detectWorldEdgeCollisions() {
        if (!this.world) { return [] }
        const reports: EdgeCollisionReport[] = []
        const edgeCollisionDetectionFunction = getEdgeCollisionDetectionFunction(this.data.shape)
        reports.push(edgeCollisionDetectionFunction(this))
        return reports
    }

    handleWorldEdgeCollision(report: EdgeCollisionReport) {
        bounceOffWorldEdge(report)
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        if (this.data.renderPathAhead) {
            renderPathAhead.onCanvas(ctx, this, viewPort);
        }

        this.data.shape.renderOnCanvas(ctx, this, viewPort);

        if (this.data.renderHeadingIndicator) {
            renderHeadingIndicator.onCanvas(ctx, this, viewPort)
        }
    }


}



export { Body, BodyData }