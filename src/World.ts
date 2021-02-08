import { Force } from './Force'
import { Thing } from './Thing'

class WorldConfig {
    globalGravityForce?: Force
    thingsExertGravity?: boolean
    hasHardEdges?: boolean
}

class World {
    gravitationalConstant: number
    things: Thing[]
    timer: NodeJS.Timeout
    canvas?: HTMLCanvasElement
    timerSpeed: number
    globalGravityForce?: Force
    thingsExertGravity: boolean
    hasHardEdges: boolean

    constructor(gravity: number, things: Thing[], config: WorldConfig = {}) {

        this.gravitationalConstant = gravity

        this.timerSpeed = 0
        this.globalGravityForce = config.globalGravityForce || null
        this.thingsExertGravity = config.thingsExertGravity || false
        this.hasHardEdges = config.hasHardEdges || false

        this.things = []
        things.forEach(thing => { thing.enterWorld(this) })
    }

    get report() {
        return `The local gravity is ${this.gravitationalConstant}. Time runs at ${this.ticksPerSecond} hertz. There are ${this.things.length} things.`
    }

    get width() { return 1000}
    get height() { return 1000}

    tick() {
        this.things.forEach(thing => { thing.updateMomentum() })
        this.things.forEach(thing => {
            const reports = thing.detectCollisions()
            reports.forEach(report => thing.handleCollision(report))
        })

        if (this.hasHardEdges) {
            this.things.forEach(thing => {
                const reports = thing.detectWorldEdgeCollisions()
                reports.forEach(report => thing.handleWorldEdgeCollision(report))
            })
        }

        this.things.forEach(thing => { thing.move() })


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

export { World }