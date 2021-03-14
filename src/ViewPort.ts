import { Thing } from "."
import { BackGround } from "./BackGround"
import { CameraInstruction } from "./CameraInstruction"
import { Force } from "./Force"
import { Point, _90deg } from "./geometry"
import { renderPolygon } from "./renderFunctions"
import { World } from "./World"


interface TransformTestFunction { (thing: Thing): boolean }
interface TransformRenderFuncion { (thing: Thing, ctx: CanvasRenderingContext2D, viewPort: ViewPort): void }

class RenderTransformationRule {
    test: TransformTestFunction
    renderOnCanvas: TransformRenderFuncion
    constructor(test: TransformTestFunction, renderOnCanvas: TransformRenderFuncion) {
        this.test = test
        this.renderOnCanvas = renderOnCanvas
    }
}

interface ViewPortConfig {
    world?: World
    x: number
    y: number
    width: number
    height: number
    magnify?: number
    rotate?: number
    canvas: HTMLCanvasElement

    dontRenderBackground?: boolean
    dontRenderEffects?: boolean
    transformRules?: RenderTransformationRule[]
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
    cameraInstruction?: CameraInstruction

    dontRenderBackground: boolean
    dontRenderEffects: boolean
    transformRules: RenderTransformationRule[]


    constructor(config: ViewPortConfig) {
        this.x = config.x
        this.y = config.y
        this.width = config.width
        this.height = config.height
        this.magnify = config.magnify || 1
        this.rotate = config.rotate || 0

        this.dontRenderBackground = config.dontRenderBackground || false
        this.dontRenderEffects = config.dontRenderEffects || false
        this.transformRules = config.transformRules || []

        this.canvas = config.canvas
        this.renderCanvas = this.renderCanvas.bind(this)

        if (config.world) { this.setWorld(config.world) }
    }

    get visibleLineWidth() {
        return this.pointRadius * 3;
    }

    get pointRadius() {
        return Math.ceil(this.canvas.width / this.canvas.offsetWidth)
    }

    setWorld(world: World, renderAfterSetting: boolean = false) {
        if (this.world) { this.unsetWorld() }
        this.world = world
        this.world.emitter.on('tick', this.renderCanvas)
        if (renderAfterSetting) { this.renderCanvas() }
    }

    unsetWorld() {
        this.world.emitter.off('tick', this.renderCanvas)
        this.world = null
    }

    mapPoint(point: Point, parallax = 1): Point {
        const { x, y, magnify, width, height, rotate } = this
        const vectorFromCenter = Force.fromVector((magnify / parallax) * (x - point.x), (magnify / parallax) * (y - point.y))
        vectorFromCenter.direction += rotate
        return {
            x: (width / 2) - vectorFromCenter.vectorX,
            y: (height / 2) - vectorFromCenter.vectorY
        }
    }

    unMapPoint(pointOnViewport: Point, parallax = 1): Point {
        const { x, y, magnify, width, height, rotate } = this
        const vectorFromCenter = Force.fromVector((width / 2) - pointOnViewport.x, (height / 2) - pointOnViewport.y)
        vectorFromCenter.direction -= rotate
        return {
            x: x - (vectorFromCenter.vectorX / (magnify / parallax)),
            y: y - (vectorFromCenter.vectorY / (magnify / parallax))
        }
    }

    /**
     * Locate the point int the world the user clicked on.
     * @param event a pointer event
     * @param locationClicksOutsideCanvas a whether to return a point if the user clicks outside
     * the content box of the canvas element 
     * @returns the world co-ordinates of the point clicked, or null
     * if the click is outside the content box of the canvas element 
     */
    locateClick(event: PointerEvent, allowClicksOutsideCanvasElement=false) {
        const { canvas } = this
        const rect = canvas.getBoundingClientRect()

        const elementX = event.clientX - rect.left - canvas.clientLeft
        const elementY = event.clientY - rect.top - canvas.clientTop
        const viewPortX = elementX * (this.width / canvas.width)
        const viewPortY = elementY * (this.height / canvas.height)

        if (!allowClicksOutsideCanvasElement && (viewPortX < 0 || viewPortY < 0 || viewPortX > this.width || viewPortY > this.height)) { return null }
        
        return this.unMapPoint({ x: viewPortX, y: viewPortY })
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

    renderCanvas() {
        const { world, canvas, cameraInstruction, transformRules } = this

        if (!canvas) { return }
        canvas.setAttribute('height', this.height.toString());
        canvas.setAttribute('width', this.width.toString());

        if (!world) { return }

        if (cameraInstruction) { cameraInstruction.focusViewPort(this) }

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = this.makeBackgroundGradient(ctx);
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        renderPolygon.onCanvas(ctx, this.worldCorners, { fillColor: 'black' }, this)

        if (!this.dontRenderBackground) {
            world.backGrounds.forEach(backGround => backGround.renderOnCanvas(ctx, this))
        }

        world.fluids.forEach(fluid => { fluid.renderOnCanvas(ctx, this) })

        world.things.forEach(thing => {
            let applicableRule = transformRules.filter(rule => rule.test(thing))[0]
            if (applicableRule) {
                applicableRule.renderOnCanvas(thing, ctx, this)
            } else {
                thing.renderOnCanvas(ctx, this)
            }
        })

        if (!this.dontRenderEffects) {
            world.effects.forEach(effect => { effect.renderOnCanvas(ctx, this) })
        }
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

export { ViewPort, RenderTransformationRule }