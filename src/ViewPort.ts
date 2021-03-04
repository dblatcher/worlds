import { Point } from "./geometry"
import { World } from "./World"

interface ViewPortConfig {
    world?: World
    x: number
    y: number
    width: number
    height: number
    magnify: number
}

class ViewPort {
    world?: World
    x: number
    y: number
    width: number
    height: number
    magnify: number

    constructor(config: ViewPortConfig,) {
        this.x = config.x
        this.y = config.y
        this.width = config.width
        this.height = config.height
        this.magnify = config.magnify
        this.world = config.world || null
    }


    mapPoint(point: Point): Point {
        const { x, y, magnify, width, height } = this

        return {
            x: (width / 2) - magnify * (x - point.x),
            y: (height / 2) - magnify * (y - point.y)
        }
    }

    mapWorldCoords(): [number, number, number, number] {
        const topLeft = this.mapPoint({ x: 0, y: 0 })
        const bottomRight = this.mapPoint({ x: this.world.width, y: this.world.height })

        return [
            topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y
        ]
    }

    focusOn(point: Point, magnify?: number) {
        this.x = point.x
        this.y = point.y
        if (magnify) { this.magnify = magnify }
        return this
    }

    reset() {
        if (!this.world) { return }
        this.x = this.world.width / 2
        this.y = this.world.height / 2
        this.magnify = Math.min(
            1,
            this.width / this.world.width,
            this.height / this.world.height,
        )
        return this
    }

    static full(world: World) {
        return new ViewPort({
            world,
            x: world.width / 2,
            y: world.height / 2,
            magnify: 1,
            width: world.width,
            height: world.height,
        })
    }
}

export { ViewPort }