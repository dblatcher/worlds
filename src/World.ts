import { Force } from './Force'
import { Body } from './Body'
import { Fluid } from './Fluid'
import { ViewPort } from './ViewPort'
import { Effect } from './Effect'
import { TinyEmitter } from 'tiny-emitter'
import { BackGround } from './BackGround'
import { Area } from './Area'
import { AbstractFill } from './AbstractFill'
import { ThingWithShape } from './ThingWithShape'


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

interface WorldConfig {
    name?: string
    width?: number
    height?: number
    /**
     * The gravitational constant in the world - a scalar value applied
     * as a multiplier in determining the magnitude of all gravitational
     * forces applied in the world.
     */
    gravitationalConstant?: number

    /**
     * A Force constantly applied to all Bodies in the world, representing
     * 'downward' gravity in a World approximating 'terrestrial' conditions
     * on the surface of a planet, where the planet itself is not represented
     * by a Body.
     * 
     * Can also be used to simulate the effect of a World representing a flat
     * plane being tilted at an angle.
     */
    globalGravityForce?: Force

    /**
     * Whether bodies will exhert any gravity on each other.
     */
    bodiesExertGravity?: boolean

    /**
     * The minimum mass a Body must be to exhert graviational force.
     * 
     * If set when bodiesExertGravity=true, bodies with a mass 
     * below the valuw will not exert any graviational force. 
     */
    minimumMassToExertGravity?: number

    /**
     * The amount of drag/friction applied to bodies moving through
     * 'empty space' within the World. Works in the same way as
     * Area.density.
     * 
     * To simulate a space-like enviornment, or a friction free flat
     * surface, airDensity should be 0.
     */
    airDensity?: number
    effects?: Effect[]
    fillColor?: string | AbstractFill
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

/**
 * A World represents an extended space within which objects representing
 * physical things will move and interact with each other, subject to the
 * physical laws defined by the World's configuration.
 * 
 * A World updates its internal state with the tick method, which 
 * simulates the passage of time and triggers
 * the behaviour of its contents - for example, making any Bodies move.
 * 
 * The timerSpeed property sets the the number of 'ticks' per second. 
 * It can be changed at runtime to change the speed of time in a World
 * or pause time by setting timerSpeed to zero.
 * 
 * Worlds do not have an inherent render method. The ViewPort class is
 * used to render a World (or a part of a World) to a canvas element,
 * re-rendering after every tick event of the World. Not that the same
 * World can be rendered by multiple ViewPorts.
 */
class World implements WorldConfig {
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

    /**
     * DO NOT SET DIRECTLY - use the ticksPerSecond property.
     */
    timerSpeed: number
    bodies: Body[]
    areas: Area[]
    fluids: Fluid[]
    effects: Effect[]
    fillColor?: string | AbstractFill
    backGrounds: BackGround[]
    bodiesLeavingAtNextTick: Body[]
    timer: NodeJS.Timeout
    emitter: TinyEmitter

    /**
     * Create a whole new world.
     * 
     * @param contents the ThingsWithShape and/or Fluids in the world
     * @param config the WorldConfig
     */
    constructor(contents: (ThingWithShape | Fluid)[], config: WorldConfig = {}) {
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
        const areas = contents.filter(content => content.isArea) as Area[]

        this.bodies = []
        bodies.forEach(body => { body.enterWorld(this) })

        this.areas = []
        areas.forEach(area => { area.enterWorld(this) })

        this.effects = []
        if (config.effects) {
            config.effects.forEach(effect => { effect.enterWorld(this) })
        }

        this.fillColor = config.fillColor || "black";
        this.backGrounds = config.backGrounds || []
        this.backGrounds.forEach(backGround => backGround.enterWorld(this))

        this.fluids = []
        fluids.forEach(fluid => fluid.enterWorld(this))

        this.bodiesLeavingAtNextTick = []

        this.emitter = new TinyEmitter
    }

    get report(): string {
        return `The local gravity is ${this.gravitationalConstant.toFixed(2)}. Time runs at ${this.ticksPerSecond} hertz. There are ${this.bodies.length} bodies.`
    }

    tick(): void {

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
            nonNullReports.forEach(report => report.item2.respondToImpact(report))
            tickReport.collisionCount += nonNullReports.length
            tickReport.collisionTestCount += reports.length
        })
        mobileBodies.filter(body => body.world == this).forEach(body => {
            const reports = body.detectCollisions(true, false)
            const nonNullReports = reports.filter(report => report !== null)
            nonNullReports.forEach(report => body.handleCollision(report))
            nonNullReports.forEach(report => report.item2.respondToImpact(report))
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

        bodies.filter(body => body.world == this).forEach(body => { body.tick() })

        this.backGrounds.forEach(backGround => backGround.tick())
        effects.forEach(effect => effect.tick())

        tickReport.calculationTime = Date.now() - tickReport.startTime
        this.emitter.emit('tick', tickReport)
    }

    /**
     * Set the World's timerSpeed in hertz (events per second) and either 
     * restart the timer at the new rate or clear the time is the timerSpeed
     * is zero.
     */
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

    /**
     * Set the timerSpeed to zero.
     * 
     * @returns the World instance
     */
    stopTime(): World {
        clearInterval(this.timer)
        this.timerSpeed = 0
        return this
    }

    static get TickReport() { return WorldTickReport.prototype }
}

export { World, WorldConfig, ViewPort }