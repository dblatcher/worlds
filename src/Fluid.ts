import { Point } from "./geometry"
import { renderPolygon } from "./renderFunctions"
import { ViewPort, World } from "./World"

interface FluidData {
    volume: number
    density: number
    color: string
    drainRate?: number
}

class Fluid {
    data: FluidData
    world: World

    constructor(config: FluidData) {
        this.data = config
        this.data.drainRate = config.drainRate || 0
    }

    get isFluid() { return true }
    get isBody() { return false }
    get isArea() { return false }
    get typeId() { return 'Fluid' }


    get depth() {
        if (!this.world) { return 0 }
        return this.data.volume / this.world.width
    }

    get surfaceLevel() {
        if (!this.world) { return 0 }
        return this.bottomLevel - (this.depth)
        // to do - raise y volume of submerged bodies
    }

    get bottomLevel() {
        if (!this.world) { return 0 }
        const {fluids} = this.world

        // don't have fluids of same density..?
        const sortedFluidsBelowThis = fluids
        .filter(fluid => fluid !== this && fluid.data.density >= this.data.density)
        .sort((fluidA, fluidB) => fluidB.data.density - fluidA.data.density)


        const depthOfFluidsBelow = sortedFluidsBelowThis.reduce(
            (accumulator, fluid) => accumulator += fluid.depth,0
        )

        return this.world.height - depthOfFluidsBelow
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
            { x: 0, y: this.bottomLevel },
            { x: 0, y: this.surfaceLevel },
            { x: this.world.width, y: this.surfaceLevel },
            { x: this.world.width, y: this.bottomLevel },
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

    drain() {
        this.data.volume = this.data.volume - this.data.drainRate
        if (this.data.volume < 0 ) {this.data.volume = 0}
    }

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort:ViewPort) {
        renderPolygon.onCanvas(ctx, this.polygonPoints, { fillColor: this.data.color }, viewPort)
    }

}


export { Fluid, FluidData }