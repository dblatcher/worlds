import { Thing } from './Thing'

class World {
    gravity: number
    things: Thing[]
    timer: NodeJS.Timeout
    canvas? :HTMLCanvasElement
    constructor(gravity: number, things: Thing[]) {
        this.gravity = gravity
        this.things = things

        things.forEach(thing => {
            thing.world = this
        })
    }

    get report() {
        return `The local gravity is ${this.gravity}. There are ${this.things.length} things.`
    }

    tick() {
        this.things.forEach(thing => {
            thing.move()
        })
        this.renderOnCanvas()
    }

    startTime(speed: number) {
        const tick = this.tick.bind(this)
        this.timer = setInterval(tick, speed)
    }

    renderOnCanvas() {
        if (!this.canvas) {return false}
        const ctx = this.canvas.getContext("2d");

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.things.forEach(thing => {
            thing.renderOnCanvas(ctx)
        })

    }
}

export { World }