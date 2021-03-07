import { renderCircle } from "./renderFunctions"
import { ViewPort } from "./ViewPort"
import { World } from "./World"

interface EffectData {
    x: number
    y: number
    heading?: number
    frame?: number
    duration: number
}

class Effect {
    x: number
    y: number
    heading?: number
    frame: number
    duration: number
    world?: World

    constructor(config: EffectData) {
        this.x = config.x
        this.y = config.y
        this.heading = config.heading
        this.frame = config.frame || 0
        this.duration = config.duration || 100
    }

    enterWorld(world: World) {
        if (this.world) { this.leaveWorld() }
        world.effects.push(this)
        this.world = world
    }

    leaveWorld() {
        if (!this.world) { return }
        this.world.effects.splice(this.world.effects.indexOf(this), 1)
    }

    tick() {
        this.frame++
        if (this.frame >= this.duration) { this.leaveWorld() }
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        const { x, y } = this
        renderCircle.onCanvas(ctx, { x, y, radius: 10 }, { fillColor: 'red' }, viewPort)
    }
}


interface ExpandingRingData  {
    x: number
    y: number
    frame?: number
    duration: number
    size: number
    color?: string
}

class ExpandingRing extends Effect {
    size: number
    color: string

    constructor(config:ExpandingRingData) {
        super(config)
        this.size = config.size || 100
        this.color = config.color || 'red'
    }

    get radius() {
        return this.size * (this.frame / this.duration)
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort: ViewPort) {
        renderCircle.onCanvas(ctx, this, { strokeColor: this.color }, viewPort)
    }
}

export { Effect, EffectData, ExpandingRing }