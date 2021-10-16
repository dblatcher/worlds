
import { ThingWithShape, ThingWithShapeData } from "./ThingWithShape"
import { World } from "./World"

interface AreaData extends ThingWithShapeData {
    density?: number
}

/**
 * An Area represents region of the World. They can influence the motion
 * of Bodies which pass through them owing the difference between thier density
 * and the World.airDensity.
 * 
 * Areas are not subject to Forces and are immobile by default.
 */
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