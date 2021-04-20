
import { Vector } from "./geometry"
import { AbstractGradientFill } from "./GradientFill"
import { Shape } from "./Shape"
import { ThingWithShape } from "./ThingWithShape"
import { World } from "./World"

interface AreaData {
    x: number
    y: number
    size: number
    shape?: Shape
    density?: number
    heading?: number
    color?: string
    fillColor?: string | AbstractGradientFill
    corners?: Vector[]
}

class Area extends ThingWithShape {
    data: AreaData
    world: World

    constructor(config: AreaData) {
        super(config)

        this.data.density = config.density || 0
        this.data.heading = config.heading || 0

        this.data.fillColor = config.fillColor || "transparent"
        this.data.color = config.color || "transparent"
    }

    get isArea() { return true }
    get typeId() { return 'Area' }


    enterWorld(world: World) {
        if (this.world) { this.leaveWorld() }
        world.areas.push(this)
        this.world = world
    }

    leaveWorld() {
        if (!this.world) { return }
        if (this.world.areas.indexOf(this) !== -1) {
            this.world.areas.splice(this.world.areas.indexOf(this), 1)
        }
        this.world = null
    }

}


export { Area, AreaData }