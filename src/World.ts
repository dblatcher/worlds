import { Force } from './Force'
import { Thing } from './Thing'
import { Fluid } from './Fluid'
import { TinyEmitter } from 'tiny-emitter'
import { ViewPort } from './ViewPort'



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
    viewPort?: ViewPort
}

class World extends WorldConfig {
    canvas?: HTMLCanvasElement
    timerSpeed: number
    things: Thing[]
    fluids: Fluid[]
    thingsLeavingAtNextTick: Thing[]
    timer: NodeJS.Timeout
    emitter: TinyEmitter
    viewPort: ViewPort

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

        this.fluids = []
        fluids.forEach(fluid => fluid.enterWorld(this))

        this.thingsLeavingAtNextTick = []

        this.viewPort = config.viewPort || ViewPort.full(this)
        this.viewPort.world = this
        this.emitter = new TinyEmitter
    }

    get report() {
        return `The local gravity is ${this.gravitationalConstant.toFixed(2)}. Time runs at ${this.ticksPerSecond} hertz. There are ${this.things.length} things.`
    }

    tick() {
        this.thingsLeavingAtNextTick.forEach(thing => {
            if (this.things.indexOf(thing) !== -1) {
                this.things.splice(this.things.indexOf(thing), 1)
                thing.world = null
            }
        })
        this.thingsLeavingAtNextTick = []

        this.fluids.forEach(fluid => fluid.drain())

        const mobileThings = this.things.filter(thing => !thing.data.immobile)

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

        this.renderOnCanvas()
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

    setCanvas(canvasElement: HTMLCanvasElement) {
        this.canvas = canvasElement
        console.log()
        canvasElement.setAttribute('height', this.viewPort.height.toString());
        canvasElement.setAttribute('width', this.viewPort.width.toString());
        this.renderOnCanvas()
    }

    renderOnCanvas() {
        if (!this.canvas) { return false }
        const ctx = this.canvas.getContext("2d");

        ctx.fillStyle = this.makeBackgroundGradient(ctx);
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "black";
        ctx.fillRect(...this.viewPort.mapWorldCoords());

        this.fluids.forEach(fluid => {
            fluid.renderOnCanvas(ctx, this.viewPort)
        })

        this.things.forEach(thing => {
            thing.renderOnCanvas(ctx, this.viewPort)
        })

    }

    makeBackgroundGradient(ctx: CanvasRenderingContext2D) {

        const gradient = ctx.createLinearGradient(0, 0, 0, this.viewPort.height);

        let i;
        for (i = 0; i < 10; i++) {
            gradient.addColorStop(i * .1, 'red');
            gradient.addColorStop((i + .5) * .1, 'green');
        }

        return gradient
    }
}

export { World, WorldConfig, ViewPort }