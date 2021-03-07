import { Force } from "./Force"
import { Point } from "./geometry"
import { renderPolygon } from "./renderFunctions"
import { Thing } from "./Thing"
import { World } from "./World"

interface ViewPortConfig {
    world?: World
    x: number
    y: number
    width: number
    height: number
    magnify?: number
    rotate?: number
    canvas: HTMLCanvasElement
}

class ViewPort {
    world?: World
    x: number
    y: number
    width: number
    height: number
    magnify: number
    rotate: number
    canvas: HTMLCanvasElement
    focus?: Thing

    constructor(config: ViewPortConfig) {
        this.x = config.x
        this.y = config.y
        this.width = config.width
        this.height = config.height
        this.magnify = config.magnify || 1
        this.rotate = config.rotate || 0

        this.setCanvas(config.canvas)
        this.renderCanvas = this.renderCanvas.bind(this)

        if (config.world) { this.setWorld(config.world) }
    }

    get visibleLineWidth() {
        return Math.max(1, this.width / 100)
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
        const { x, y, magnify, width, height, rotate } = this
        const vectorFromCenter = Force.fromVector(magnify * (x - point.x), magnify * (y - point.y))
        vectorFromCenter.direction += rotate
        return {
            x: (width / 2) - vectorFromCenter.vectorX,
            y: (height / 2) - vectorFromCenter.vectorY
        }
    }

    get worldCorners(): [Point, Point, Point, Point] {
        const topLeft = { x: 0, y: 0 }
        const topRight = { x: this.world.width, y: 0 }
        const bottomRight = { x: this.world.width, y: this.world.height }
        const bottomleft = { x: 0, y: this.world.height }
        return [topLeft, topRight, bottomRight, bottomleft]
    }

    focusOn(point: Point, staywithinWorldEdge: boolean = false, magnify?: number) {
        if (magnify) { this.magnify = magnify }

        this.x = point.x
        this.y = point.y
        if (staywithinWorldEdge) {
            const verticalSpace = this.height / (this.magnify * 2)
            const horizontalSpace = this.width / (this.magnify * 2)
            this.y = Math.max(Math.min(point.y, this.world.height - verticalSpace), verticalSpace)
            this.x = Math.max(Math.min(point.x, this.world.width - horizontalSpace), horizontalSpace)
        }
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
        const { world, canvas, focus } = this


        if (!canvas) { return }
        canvas.setAttribute('height', this.height.toString());
        canvas.setAttribute('width', this.width.toString());

        if (!world) { return }

        if (focus && this.world.things.includes(this.focus)) { this.focusOn(focus.data, false) }

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = this.makeBackgroundGradient(ctx);
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        renderPolygon.onCanvas(ctx,this.worldCorners,{fillColor:'black'}, this)

        world.fluids.forEach(fluid => {
            fluid.renderOnCanvas(ctx, this)
        })

        world.things.forEach(thing => {
            thing.renderOnCanvas(ctx, this)
        })

        world.effects.forEach(effect => {
            effect.renderOnCanvas(ctx, this)
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