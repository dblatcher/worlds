
import { Point } from "./geometry"
import { AbstractGradientFill } from "./GradientFill"
import { renderPolygon } from "./renderFunctions"
import { Shape, shapes, ShapeValues } from "./Shape"
import { ViewPort, World } from "./World"

interface AreaData {
    x: number
    y: number
    size: number
    shape?: Shape
    density?: number
    heading?: number
    color?: string
    fillColor?: string | AbstractGradientFill

}

class Area {
    data: AreaData
    world: World

    constructor(config: AreaData) {
        this.data = config

        this.data.shape = config.shape || shapes.circle
        this.data.density = config.density || 0
        this.data.heading = config.heading || 0
        
        this.data.fillColor = config.fillColor || "transparent"
        this.data.color = config.color || "transparent"
    }

    get isFluid() { return false }
    get isArea() { return true }
    get isBody() { return false }
    get typeId() { return 'Area' }



    get polygonPoints() {
        return this.data.shape.getPolygonPoints.apply(this, []) as Point[]
    }

    get shapeValues() {
        return this.data.shape.getShapeValues.apply(this, []) as ShapeValues
    }

    duplicate() {
        const myPrototype = Object.getPrototypeOf(this)
        return new myPrototype.constructor(Object.assign({}, this.data))
    }

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

    renderOnCanvas(ctx: CanvasRenderingContext2D, viewPort:ViewPort) {
        this.data.shape.renderOnCanvas(ctx, this, viewPort);
    }

}


export { Area, AreaData }