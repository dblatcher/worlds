import { world as world } from './worlds/splashWorld'
import { ViewPort } from '../ViewPort';
import { CameraFollowInstruction } from '../CameraInstruction';
import { Force } from '..';
import { _90deg } from '../geometry';
import './addStyleSheetAndFrame'


function handleClick(event: PointerEvent) {
    const worldPoint = viewPort.locateClick(event)
    if (!worldPoint) { return }
    const clickedThing = world.things.find(thing => thing.checkIfContainsPoint(worldPoint))
    if (!clickedThing) { return }
    clickedThing.momentum = Force.combine([clickedThing.momentum, new Force(100, _90deg * 1.5)])
}

const canvasElement = document.createElement('canvas')
const viewPort = ViewPort.fitToSize(world, canvasElement, 700, 500)

viewPort.cameraInstruction = new CameraFollowInstruction({
    thing: world.things[0],
    magnify: .1
})

const frame = document.querySelector('.frame')
frame.appendChild(canvasElement);

world.ticksPerSecond = 100;

canvasElement.addEventListener('click', handleClick);

(window as any).world = world;
(window as any).viewPort = viewPort;