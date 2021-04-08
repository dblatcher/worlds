import { world as world, greenStripes, redCircles } from './worlds/billiards'
import { ViewPort } from '../src/ViewPort';
import { CameraFollowInstruction } from '../src/CameraInstruction';
import { Force, RenderFunctions, RenderTransformationRule, Body } from '../src';
import { getDistanceBetweenPoints, getHeadingFromPointToPoint, Point, _90deg } from '../src/geometry';
import './addStyleSheetAndFrame'


let thingInFocus: Body = null

const maxPushForce = 30
const pushForceDistanceMultipler = 4 * 10 ** 4

let cursorPoint:Point = { x: 0, y: 0 }


function handleClick(event: PointerEvent) {
    const worldPoint = viewPort.locateClick(event, true)
    if (!worldPoint) { return }
    const clickedThing = world.bodies.find(body => body.checkIfContainsPoint(worldPoint)) || null


    if (thingInFocus && !clickedThing) {
        const distance = getDistanceBetweenPoints(thingInFocus.data, worldPoint) - thingInFocus.shapeValues.radius
        const magnitude = Math.min(maxPushForce, distance * pushForceDistanceMultipler / thingInFocus.mass)
        console.log({ distance, magnitude })
        thingInFocus.momentum = Force.combine([thingInFocus.momentum, new Force(
            magnitude,
            getHeadingFromPointToPoint(thingInFocus.shapeValues, worldPoint)
        )])
        thingInFocus = null
    } else {
        thingInFocus = clickedThing
    }

}

function handleHover(event:PointerEvent) {
    const worldPoint = viewPort.locateClick(event, true)
    if (!worldPoint) { return }
    cursorPoint = worldPoint
}

const canvasElement = document.createElement('canvas')
const viewPort = ViewPort.fitToSize(world, canvasElement, 700, 500)

viewPort.framefill = redCircles

viewPort.transformRules.push(
    new RenderTransformationRule(body => body === thingInFocus,
        (body, ctx, viewPort) => {
            body.renderOnCanvas(ctx, viewPort)

            const style = {
                strokeColor: "white",
                lineDash: [2, 3],
                heading: body.data.heading,
                lineWidth: 3,
            }

            RenderFunctions.renderCircle.onCanvas(ctx, {
                x: body.data.x,
                y: body.data.y,
                radius: body.data.size + 5
            }, style, viewPort)

            RenderFunctions.renderLine.onCanvas(ctx, [body.data, cursorPoint], style, viewPort)
        }
    )
)



const frame = document.querySelector('.frame')
frame.appendChild(canvasElement);

world.ticksPerSecond = 100;

document.body.addEventListener('click', handleClick);
document.body.addEventListener('mousemove', handleHover);


(window as any).world = world;
(window as any).viewPort = viewPort;