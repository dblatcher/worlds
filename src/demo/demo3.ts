import { world as world } from './worlds/billiards'
import { ViewPort } from '../ViewPort';
import { CameraFollowInstruction } from '../CameraInstruction';
import { Force, RenderFunctions, RenderTransformationRule, Thing } from '..';
import { getDistanceBetweenPoints, getHeadingFromPointToPoint, _90deg } from '../geometry';
import './addStyleSheetAndFrame'


let thingInFocus: Thing = null

const maxPushForce = 15
const pushForceDistanceMultipler = 1.5 * 10**4

function handleClick(event: PointerEvent) {
    const worldPoint = viewPort.locateClick(event, true)
    if (!worldPoint) { return }
    const clickedThing = world.things.find(thing => thing.checkIfContainsPoint(worldPoint)) || null

    
    if (thingInFocus && !clickedThing) {
        const distance = getDistanceBetweenPoints(thingInFocus.data, worldPoint) - thingInFocus.shapeValues.radius
        const magnitude = Math.min(maxPushForce, distance * pushForceDistanceMultipler / thingInFocus.mass)
        console.log ({distance, magnitude})
        thingInFocus.momentum = Force.combine([thingInFocus.momentum, new Force(
            magnitude,
            getHeadingFromPointToPoint(thingInFocus.shapeValues, worldPoint)
        )])
    } else {
        thingInFocus = clickedThing
    }

}

const canvasElement = document.createElement('canvas')
const viewPort = ViewPort.fitToSize(world, canvasElement, 700, 500)

viewPort.transformRules.push(
    new RenderTransformationRule(thing => thing === thingInFocus,
        (thing, ctx, viewPort) => {
            thing.renderOnCanvas(ctx, viewPort)

            RenderFunctions.renderCircle.onCanvas(ctx, { 
                x: thing.data.x, 
                y: thing.data.y, 
                radius: thing.data.size + 5 
            }, { 
                strokeColor: "white", 
                lineDash:[2,3] 
            }, viewPort)
        }
    )
)

// viewPort.cameraInstruction = new CameraFollowInstruction({
//     thing: world.things[0],
//     magnify: .1
// })



const frame = document.querySelector('.frame')
frame.appendChild(canvasElement);

world.ticksPerSecond = 100;

document.body.addEventListener('click', handleClick);

(window as any).world = world;
(window as any).viewPort = viewPort;