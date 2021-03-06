import { Point } from "./geometry"
import { World } from "./World"

interface ViewPortConfig {
    world?: World
    x: number
    y: number
    width: number
    height: number
    magnify: number
    canvas: HTMLCanvasElement
}

class ViewPort {
    world?: World
    x: number
    y: number
    width: number
    height: number
    magnify: number
    canvas: HTMLCanvasElement

    constructor(config: ViewPortConfig) {
        this.x = config.x
        this.y = config.y
        this.width = config.width
        this.height = config.height
        this.magnify = config.magnify

        this.setCanvas(config.canvas)
        this.renderCanvas = this.renderCanvas.bind(this)

        if (config.world) { this.setWorld(config.world) }
    }


    setWorld(world: World) {
        if (this.world) { this.unsetWorld() }
        this.world = world
        this.world.emitter.on('tick', this.renderCanvas)
        this.renderCanvas()
    }

    unsetWorld() {
        this.world.emitter.off('tick', this.renderCanvas)
        this.world = null
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
        this.height = this.world.height
        this.width = this.world.width
        this.magnify = 1

        this.renderCanvas()
        return this
    }

    setCanvas(canvasElement: HTMLCanvasElement) {
        this.canvas = canvasElement
        this.renderCanvas()
    }

    renderCanvas() {
        const { world, canvas } = this

        if (!canvas) { return }
        canvas.setAttribute('height', this.height.toString());
        canvas.setAttribute('width', this.width.toString());

        if (!world) { return }
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = this.makeBackgroundGradient(ctx);
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "black";
        ctx.fillRect(...this.mapWorldCoords());

        world.fluids.forEach(fluid => {
            fluid.renderOnCanvas(ctx, this)
        })

        world.things.forEach(thing => {
            thing.renderOnCanvas(ctx, this)
        })
    }

    makeBackgroundGradient(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);

        let i;
        for (i = 0; i < 10; i++) {
            gradient.addColorStop(i * .1, 'red');
            gradient.addColorStop((i + .5) * .1, 'green');
        }

        return gradient
    }

    static full(world: World, canvas: HTMLCanvasElement, magnify: number = 1) {
        return new ViewPort({
            world,
            canvas,
            x: world.width / 2,
            y: world.height / 2,
            magnify,
            width: world.width * magnify,
            height: world.height * magnify,
        })
    }

    static fitToSize(world: World, canvas: HTMLCanvasElement, width: number, height: number) {
        return new ViewPort({
            world,
            canvas,
            height,
            width,
            x: world.width / 2,
            y: world.height / 2,
            magnify: Math.min(width / world.width, height / world.height),
        })
    }
}

export { ViewPort }