import { Force } from './Force'
import { Thing } from './Thing'
import { Fluid } from './Fluid'
import { ViewPort } from './ViewPort'
import { Effect } from './Effect'
import { TinyEmitter } from 'tiny-emitter'



class WorldConfig {
    name?: string
    width?: number
    height?: number
    gravitationalConstant?: number
    globalGravityForce?: Force
    thingsExertGravity?: boolean
    hasHardEdges?: boolean
    minimumMassToExertGravity?: number
    airDensity?: number
    effects?: Effect[]
}

class World extends WorldConfig {
    name: string
    width: number
    height: number
    gravitationalConstant: number
    globalGravityForce: Force
    thingsExertGravity: boolean
    hasHardEdges: boolean
    minimumMassToExertGravity: number
    airDensity: number
    timerSpeed: number
    things: Thing[]
    fluids: Fluid[]
    effects: Effect[]
    thingsLeavingAtNextTick: Thing[]
    timer: NodeJS.Timeout
    emitter: TinyEmitter

    constructor(contents: (Thing | Fluid)[], config: WorldConfig = {}) {
        super()
        this.timerSpeed = 0

        this.name = config.name || ""
        this.width = config.width || 1000
        this.height = config.height || 1000

        this.gravitationalConstant = config.gravitationalConstant || 0
        this.minimumMassToExertGravity = config.minimumMassToExertGravity || 0
        this.airDensity = config.airDensity || 0
        this.globalGravityForce = config.globalGravityForce || null
        this.thingsExertGravity = config.thingsExertGravity || false
        this.hasHardEdges = config.hasHardEdges || false

        const things = contents.filter(content => content.isThing) as Thing[]
        const fluids = contents.filter(content => content.isFluid) as Fluid[]

        this.things = []
        things.forEach(thing => { thing.enterWorld(this) })

        this.effects = []
        if (config.effects) {
            config.effects.forEach(effect => { effect.enterWorld(this) })
        }

        this.fluids = []
        fluids.forEach(fluid => fluid.enterWorld(this))

        this.thingsLeavingAtNextTick = []

        this.emitter = new TinyEmitter
    }

    get report() {
        return `The local gravity is ${this.gravitationalConstant.toFixed(2)}. Time runs at ${this.ticksPerSecond} hertz. There are ${this.things.length} things.`
    }

    tick() {

        const {fluids, effects, things} =this
 
        this.thingsLeavingAtNextTick.forEach(thing => {
            if (this.things.indexOf(thing) !== -1) {
                this.things.splice(this.things.indexOf(thing), 1)
                thing.world = null
            }
        })
        this.thingsLeavingAtNextTick = []

        fluids.forEach(fluid => fluid.drain())

        const mobileThings = things.filter(thing => !thing.data.immobile)

        // filter at each stage in case any Things have left the world during the previous stage
        mobileThings.forEach(thing => { thing.updateMomentum() })
        mobileThings.filter(thing => thing.world == this).forEach(thing => {
            const reports = thing.detectCollisions(false, true)
            reports.forEach(report => thing.handleCollision(report))
        })
        mobileThings.filter(thing => thing.world == this).forEach(thing => {
            const reports = thing.detectCollisions(true, false)
            reports.forEach(report => thing.handleCollision(report))
        })
        if (this.hasHardEdges) {
            mobileThings.filter(thing => thing.world == this).forEach(thing => {
                const reports = thing.detectWorldEdgeCollisions()
                reports.forEach(report => thing.handleWorldEdgeCollision(report))
            })
        }
        mobileThings.filter(thing => thing.world == this).forEach(thing => { thing.move() })


        this.effects.forEach(effect => effect.tick())

        this.emitter.emit('tick')
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
}

export { World, WorldConfig, ViewPort }