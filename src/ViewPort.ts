import { Body, Geometry } from "."
import { CameraInstruction } from "./CameraInstruction"
import { Force } from "./Force"
import { getXYVector, Point, _90deg } from "./geometry"
import { AbstractFill } from "./AbstractFill"
import { renderPolygon } from "./renderFunctions"
import { World } from "./World"
import { ThingWithShape } from "./ThingWithShape"


interface TransformTestFunction { (subject: ThingWithShape): boolean }
interface TransformRenderFuncion { (subject: ThingWithShape, ctx: CanvasRenderingContext2D, viewPort: ViewPort): void }

/**
 * An instruction to a ViewPort to override the renderOnCanvas method of any
 * body which meets a test condition. 
 * 
 * Used to change the way a Body is rendered
 * on a partcular ViewPort - for example rendering a circle on a 'minimap' ViewPort
 * when rendering the 'true' shape of the Body at actual size would make it too small
 * to see.
 */
class RenderTransformationRule {
    /**
     * The test function to apply to a body - if true, the RenderTransformationRule.renderOnCanvas method is
     * used by the ViewPort instead of the Body.renderOnCanvas.
     */
    test: TransformTestFunction

    /**
     * The render function to use when rendering Bodies on the ViewPort that pass the test function.
     */
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
    framefill?: string | AbstractFill
    backGroundOverride?: string | AbstractFill
}


/**
 * A ViewPort renders a World (or part thereof) onto a canvas Element, updating the image every time the 
 * World.emitter emits a tick event.
 */
class ViewPort implements ViewPortConfig {
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
    framefill: string | AbstractFill
    backGroundOverride?: string | AbstractFill

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
        this.framefill = config.framefill || "transparent"
        this.backGroundOverride = config.backGroundOverride

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

    /**
     * Set which World the ViewPort renders.
     * 
     * @param world the World to render
     * @param renderAfterSetting whether to render the World immediately after setting
     */
    setWorld(world: World, renderAfterSetting: boolean = false):void {
        if (this.world) { this.unsetWorld() }
        this.world = world
        this.world.emitter.on('tick', this.renderCanvas)
        if (renderAfterSetting) { this.renderCanvas() }
    }

    /**
     * Unset the ViewPort's World.
     */
    unsetWorld():void {
        this.world.emitter.off('tick', this.renderCanvas)
        this.world = null
    }

    /**
     * Covert a point within the world to a point on the ViewPort's canvas.
     * 
     * @param point a Point in the co-ordinate system of the ViewPort's World
     * @param parallax the amount of parallax to apply in plotting the point on the ViewPort
     * @returns the Point relative the the co-ordinates of the ViewPort's canvas element
     */
    mapPoint(point: Point, parallax = 1): Point {
        const { x, y, magnify, width, height, rotate } = this
        const vectorFromCenter = Force.fromVector((magnify / parallax) * (x - point.x), (magnify / parallax) * (y - point.y))
        vectorFromCenter.direction += rotate
        return {
            x: (width / 2) - vectorFromCenter.vectorX,
            y: (height / 2) - vectorFromCenter.vectorY
        }
    }

    /**
     * Covert a point on the canvas to a point within the world.
     * 
     * @param pointOnViewport a Point relative the the co-ordinates of the ViewPort's canvas element
     * @param parallax the parallax level of the layer the pointOnViewport is treated as being at. Defaults to 1.
     * @returns the Point in the co-ordinate system of the ViewPort's World
     */
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
     * Locate the point in the world the user clicked on.
     * @param event a pointer event
     * @param locationClicksOutsideCanvas a whether to return a point if the user clicks outside
     * the content box of the canvas element 
     * @returns the world co-ordinates of the point clicked, or null
     * if the click is outside the content box of the canvas element 
     */
    locateClick(event: PointerEvent, allowClicksOutsideCanvasElement = false) {
        const { canvas } = this
        const rect = canvas.getBoundingClientRect()

        const elementX = event.clientX - rect.left - canvas.clientLeft
        const elementY = event.clientY - rect.top - canvas.clientTop
        const viewPortX = elementX * (this.width / canvas.clientWidth) 
        const viewPortY = elementY * (this.height / canvas.clientHeight) 

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

    /**
     * Center the ViewPort on a point within the World.
     * 
     * @param point the Point to ceter on.
     * @param staywithinWorldEdge whether to prevent to confine the ViewPort to the World's edges
     * @param magnify the level of maginfication to apply.
     * @returns the ViewPort
     */
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

    /**
     * Set the ViewPorts to be have the same dimensions as its World,
     * and center it at the World's center at magnification 1.
     * 
     * @returns the ViewPort
     */
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
        const { world, canvas, cameraInstruction, transformRules, worldCorners } = this

        if (!canvas) { return }
        canvas.setAttribute('height', this.height.toString());
        canvas.setAttribute('width', this.width.toString());

        if (!world) { return }
        if (cameraInstruction) { cameraInstruction.focusViewPort(this) }
        const ctx = canvas.getContext("2d");


        if (typeof this.framefill === 'string') { ctx.fillStyle = this.framefill }
        else { this.framefill.setFillStyleForViewPort(ctx, this) }
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        renderPolygon.onCanvas(ctx, worldCorners, { fillColor: this.backGroundOverride || world.fillColor }, this)

        if (!this.dontRenderBackground) {
            world.backGrounds.forEach(backGround => backGround.renderOnCanvas(ctx, this))
        }

        world.fluids.forEach(fluid => { fluid.renderOnCanvas(ctx, this) })
        world.areas.forEach(area => { 
            let applicableRule = transformRules.filter(rule => rule.test(area))[0]
            if (applicableRule) {
                applicableRule.renderOnCanvas(area, ctx, this)
            } else {
                area.renderOnCanvas(ctx, this)
            }
        })

        world.bodies.forEach(body => {
            let applicableRule = transformRules.filter(rule => rule.test(body))[0]
            if (applicableRule) {
                applicableRule.renderOnCanvas(body, ctx, this)
            } else {
                body.renderOnCanvas(ctx, this)
            }
        })

        if (!this.dontRenderEffects) {
            world.effects.forEach(effect => { effect.renderOnCanvas(ctx, this) })
        }

        // re - cover any area of the canvas outside the bounds of the world.
        if (typeof this.framefill === 'string') { ctx.fillStyle = this.framefill }
        else { this.framefill.setFillStyleForViewPort(ctx, this) }
        ctx.lineWidth = 0;
        ctx.strokeStyle = "transparent";
        const mappedEdges = Geometry.getPolygonLineSegments(worldCorners.map(point => this.mapPoint(point)))

        mappedEdges.forEach(edge => {
            const angle = Geometry.getHeadingFromPointToPoint(...edge);
            const extremeDistance = (this.width + this.height) * 2
            const v = getXYVector(extremeDistance, angle);
            const v2 = getXYVector(extremeDistance, angle - _90deg);

            ctx.beginPath()

            ctx.moveTo(edge[0].x + v.x, edge[0].y + v.y);
            ctx.lineTo(edge[1].x, edge[1].y);
            ctx.lineTo(edge[1].x + v2.x, edge[1].y + v2.y);
            ctx.lineTo(edge[0].x + v2.x + v.x, edge[0].y + v2.y + v.y);

            ctx.lineTo(edge[0].x + v.x, edge[0].y + v.y);
            ctx.stroke()
            ctx.fill()
        })
    }


    /**
     * Create a ViewPort rendering the whole of a World at a given magnification level.
     * 
     * @param world the World to render
     * @param canvas the HTML canvas element to render on
     * @param magnify The level of magnifcation to render the World at.
     * @returns A ViewPort, rendering the whole of the World on the Canvas at the required magnification level.
     */
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

    /**
     * Create a ViewPort rendering the whole of a World, scaled to fit within given dimensions.
     * 
     * @param world the World to render
     * @param canvas the HTML canvas element to render on
     * @param width the width of the ViewPort
     * @param height the height of the ViewPort
     * @returns A ViewPort, rendering the whole of the World on the Canvas, scaled to fit the height and width.
     */
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