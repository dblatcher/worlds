import { renderCircle } from "./renderFunctions"
import { ViewPort } from "./ViewPort"
import { World } from "./World"

interface EffectData {
    x: number
    y: number
    heading?: number
    color?: string
    frame?: number
    duration: number
    size?: number
}

/**
 * An Effect represents something which has a position (and possibly an physical
 * extension) and is visible in a World, but which has no mass and 
 * is not subject to physics.
 * 
 * Effects last for a defined duration (in ticks) before it removes itself from the
 * World. The Effect class is an abstract intended to be subClassed to create animated
 * visual effects in the world.
 * 
 * By default, the are purely visual and do not have affect other entities in the
 * World, however instances and subClasses of Effect can be created that will do so by
 * changeing the Effect's default tick method.
 */
class Effect implements EffectData {
    x: number
    y: number
    heading?: number
    color?: string
    frame: number
    duration: number
    world?: World
    size?: number

    constructor(config: EffectData) {
        this.x = config.x
        this.y = config.y
        this.heading = config.heading
        this.color = config.color
        this.frame = config.frame || 0
        this.size = config.size || 10
        this.duration = config.duration || 100
    }

    get typeId() { return "Effect" }

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
        const { x, y, color = 'red', size = 10 } = this
        renderCircle.onCanvas(ctx, { x, y, radius: size }, { fillColor: color }, viewPort)
    }
}


interface ExpandingRingData extends EffectData {
}

/**
 * Creates an Effect rendered as a ring which starts from zero radius
 * and expands to the defined size over the defined duration.
 */
class ExpandingRing extends Effect {
    size: number
    color: string

    get typeId() { return "ExpandingRing" }

    constructor(config: ExpandingRingData) {
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

export { Effect, EffectData, ExpandingRing, ExpandingRingData }