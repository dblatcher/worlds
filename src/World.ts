import { Thing } from './Thing'

class World {
    gravity: number
    things: Thing[]
    timer: NodeJS.Timeout
    canvas?: HTMLCanvasElement
    timerSpeed: number
    constructor(gravity: number, things: Thing[]) {
        this.gravity = gravity
        this.things = things
        this.timerSpeed = 0

        things.forEach(thing => {
            thing.world = this
        })
    }

    get report() {
        return `The local gravity is ${this.gravity}. Time runs at ${this.ticksPerSecond} hertz. There are ${this.things.length} things.`
    }

    tick() {
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