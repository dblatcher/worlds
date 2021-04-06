import { Force } from './Force'
import { Body } from './Body'
import { Fluid } from './Fluid'
import { ViewPort } from './ViewPort'
import { Effect } from './Effect'
import { TinyEmitter } from 'tiny-emitter'
import { BackGround } from './BackGround'


class WorldTickReport {
    startTime: number
    bodyCount: number
    collisionCount: number
    collisionTestCount: number
    edgeCollisionTestCount: number
    calculationTime: number

    constructor(bodyCount: number) {
        this.startTime = Date.now()
        this.bodyCount = bodyCount
        this.collisionCount = 0
        this.collisionTestCount = 0
        this.edgeCollisionTestCount = 0
        this.calculationTime = 0
    }
}

class WorldConfig {
    name?: string
    width?: number
    height?: number
    gravitationalConstant?: number
    globalGravityForce?: Force
    bodiesExertGravity?: boolean
    minimumMassToExertGravity?: number
    airDensity?: number
    effects?: Effect[]
    backGrounds?: BackGround[]
    hasHardEdges?: boolean
    hasWrappingEdges?: boolean
    edges?: {
        top?: "HARD" | "WRAP" | "SOFT"
        left?: "HARD" | "WRAP" | "SOFT"
        bottom?: "HARD" | "WRAP" | "SOFT"
        right?: "HARD" | "WRAP" | "SOFT"
    }
}

class World extends WorldConfig {
    name: string
    width: number
    height: number
    gravitationalConstant: number
    globalGravityForce: Force
    bodiesExertGravity: boolean
    edges: {
        top: "HARD" | "WRAP" | "SOFT"
        left: "HARD" | "WRAP" | "SOFT"
        bottom: "HARD" | "WRAP" | "SOFT"
        right: "HARD" | "WRAP" | "SOFT"
    }
    minimumMassToExertGravity: number
    airDensity: number
    timerSpeed: number
    bodies: Body[]
    fluids: Fluid[]
    effects: Effect[]
    backGrounds: BackGround[]
    bodiesLeavingAtNextTick: Body[]
    timer: NodeJS.Timeout
    emitter: TinyEmitter

    constructor(contents: (Body | Fluid)[], config: WorldConfig = {}) {
        super()
        this.timerSpeed = 0

        this.name = config.name || ""
        this.width = config.width || 1000
        this.height = config.height || 1000

        this.gravitationalConstant = config.gravitationalConstant || 0
        this.minimumMassToExertGravity = config.minimumMassToExertGravity || 0
        this.airDensity = config.airDensity || 0
        this.globalGravityForce = config.globalGravityForce || null
        this.bodiesExertGravity = config.bodiesExertGravity || false

        this.edges = config.edges
            ? {
                top: config.edges.top || "SOFT",
                left: config.edges.left || "SOFT",
                bottom: config.edges.bottom || "SOFT",
                right: config.edges.right || "SOFT",
            }
            : config.hasHardEdges
                ? {
                    top: "HARD",
                    left: "HARD",
                    bottom: "HARD",
                    right: "HARD",
                }
                : config.hasWrappingEdges
                    ? {
                        top: "WRAP",
                        left: "WRAP",
                        bottom: "WRAP",
                        right: "WRAP",
                    } : {
                        top: "SOFT",
                        left: "SOFT",
                        bottom: "SOFT",
                        right: "SOFT",
                    }


        const bodies = contents.filter(content => content.isBody) as Body[]
        const fluids = contents.filter(content => content.isFluid) as Fluid[]

        this.bodies = []
        bodies.forEach(body => { body.enterWorld(this) })

        this.effects = []
        if (config.effects) {
            config.effects.forEach(effect => { effect.enterWorld(this) })
        }

        this.backGrounds = config.backGrounds || []

        this.fluids = []
        fluids.forEach(fluid => fluid.enterWorld(this))

        this.bodiesLeavingAtNextTick = []

        this.emitter = new TinyEmitter
    }

    get report() {
        return `The local gravity is ${this.gravitationalConstant.toFixed(2)}. Time runs at ${this.ticksPerSecond} hertz. There are ${this.bodies.length} bodies.`
    }

    tick() {

        const { fluids, effects, bodies } = this

        let tickReport = new WorldTickReport(this.bodies.length)

        this.bodiesLeavingAtNextTick.forEach(body => {
            if (this.bodies.indexOf(body) !== -1) {
                this.bodies.splice(this.bodies.indexOf(body), 1)
                body.world = null
            }
        })
        this.bodiesLeavingAtNextTick = []

        fluids.forEach(fluid => fluid.drain())

        const mobileBodies = bodies.filter(body => !body.data.immobile)

        // filter at each stage in case any Bodies have left the world during the previous stage
        // MAYBE nolonger necessary because body.leave now uses  bodiesLeavingAtNextTick 
        // best for safety - devs might remove bodies manually
        mobileBodies.forEach(body => { body.updateMomentum() })
        mobileBodies.filter(body => body.world == this).forEach(body => {
            const reports = body.detectCollisions(false, true)
            const nonNullReports = reports.filter(report => report !== null)
            nonNullReports.forEach(report => body.handleCollision(report))
            tickReport.collisionCount += nonNullReports.length
            tickReport.collisionTestCount += reports.length
        })
        mobileBodies.filter(body => body.world == this).forEach(body => {
            const reports = body.detectCollisions(true, false)
            const nonNullReports = reports.filter(report => report !== null)
            nonNullReports.forEach(report => body.handleCollision(report))
            tickReport.collisionCount += nonNullReports.length
            tickReport.collisionTestCount += reports.length
        })

        mobileBodies.filter(body => body.world == this).forEach(body => {
            const reports = body.detectWorldEdgeCollisions()
            const nonNullReports = reports.filter(report => report !== null)
            tickReport.edgeCollisionTestCount += reports.length
            nonNullReports.forEach(report => body.handleWorldEdgeCollision(report))
        })

        mobileBodies.filter(body => body.world == this).forEach(body => { body.move() })

        this.backGrounds.forEach(backGround => backGround.tick())
        effects.forEach(effect => effect.tick())

        tickReport.calculationTime = Date.now() - tickReport.startTime
        this.emitter.emit('tick', tickReport)
    }

    set ticksPerSecond(speed: number) {
        if (speed == 0) {
            clearInterval(this.timer)
            this.timerSpeed = 0
            return
        }

        if (this.timerSpeed !== 0) { clearInterval(this.timer) }
        const tick = this.tick.bind(this)
        this.timerSpeed = speed
        this.timer = setInterval(tick, 1000 / speed)
    }

    get ticksPerSecond() {
        return this.timerSpeed
    }

    stopTime() {
        clearInterval(this.timer)
        this.timerSpeed = 0
        return this
    }

    static get TickReport() { return WorldTickReport.prototype }
}

export { World, WorldConfig, ViewPort }