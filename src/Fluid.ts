import { Point } from "./geometry"
import { renderPolygon } from "./renderFunctions"
import { World } from "./World"

interface FluidData {
    volume: number
    density: number
    color: string
}

class Fluid {
    data: FluidData
    world: World

    constructor(config: FluidData) {
        this.data = config
    }

    get isFluid() { return true }
    get isThing() { return false }
    get typeId() { return 'Fluid' }

    get baselevel() {
        if (!this.world) { return 0 }
        return this.world.height - (this.data.volume / this.world.width)
    }

    get level() {
        // to do - raise y volume of submerged things
        return this.baselevel
    }

    /**
     * assumes: 
     * global gravity always points down,
     * fluid has already settled,
     * not more than 1 fluid in the world,
     * the fluid spreads evenly accross the world,
     */
    get polygonPoints() {
        if (!this.world) { return [] }

        const points: Point[] = [
            { x: 0, y: this.world.height },
            { x: 0, y: this.level },
            { x: this.world.width, y: this.level },
            { x: this.world.width, y: this.world.height },
        ]
        return points
    }

    enterWorld(world: World) {
        if (this.world) { this.leaveWorld() }
        world.fluids.push(this)
        this.world = world
    }

    leaveWorld() {
        if (!this.world) { return }
        if (this.world.fluids.indexOf(this) !== -1) {
            this.world.fluids.splice(this.world.fluids.indexOf(this), 1)
        }
        this.world = null
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D) {
        renderPolygon.onCanvas(ctx, this.polygonPoints, { fillColor: this.data.color })
    }

}


export { Fluid, FluidData }