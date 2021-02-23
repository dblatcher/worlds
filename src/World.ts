import { Force } from './Force'
import { Thing } from './Thing'

class WorldConfig {
    name?: string
    width?: number
    height?:number
    gravitationalConstant?: number
    globalGravityForce?: Force
    thingsExertGravity?: boolean
    hasHardEdges?: boolean
    minimumMassToExertGravity?: number
}

class World extends WorldConfig {
    canvas?: HTMLCanvasElement
    timerSpeed: number
    things: Thing[]
    timer: NodeJS.Timeout

    constructor(things: Thing[], config: WorldConfig = {}) {
        super()
        this.timerSpeed = 0

        this.name = config.name || ""
        this.width = config.width || 1000
        this.height = config.height || 1000

        this.gravitationalConstant = config.gravitationalConstant || 0
        this.minimumMassToExertGravity = config.minimumMassToExertGravity || 0
        this.globalGravityForce = config.globalGravityForce || null
        this.thingsExertGravity = config.thingsExertGravity || false
        this.hasHardEdges = config.hasHardEdges || false

        this.things = []
        things.forEach(thing => { thing.enterWorld(this) })
    }

    get report() {
        return `The local gravity is ${this.gravitationalConstant.toFixed(2)}. Time runs at ${this.ticksPerSecond} hertz. There are ${this.things.length} things.`
    }

    tick() {
        const mobileThings = this.things.filter(thing => !thing.data.immobile)

        mobileThings.forEach(thing => { thing.updateMomentum() })
        mobileThings.forEach(thing => {
            const reports = thing.detectCollisions(true, false)
            reports.forEach(report => thing.handleCollision(report))
        })
        mobileThings.forEach(thing => {
            const reports = thing.detectCollisions(false, true)
            reports.forEach(report => thing.handleCollision(report))
        })
        if (this.hasHardEdges) {
            mobileThings.forEach(thing => {
                const reports = thing.detectWorldEdgeCollisions()
                reports.forEach(report => thing.handleWorldEdgeCollision(report))
            })
        }
        mobileThings.forEach(thing => { thing.move() })

        this.renderOnCanvas()
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

    setCanvas(canvasElement:HTMLCanvasElement) {
        this.canvas = canvasElement
        canvasElement.setAttribute('height', this.height.toString());
        canvasElement.setAttribute('width', this.width.toString());
        this.renderOnCanvas()
    }

    renderOnCanvas() {
        if (!this.canvas) { return false }
        const ctx = this.canvas.getContext("2d");

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.things.forEach(thing => {
            thing.renderOnCanvas(ctx)
        })

    }
}

export { World, WorldConfig }