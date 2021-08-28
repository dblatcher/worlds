import { world as world, greenBall } from './worlds/swiper'
import { ViewPort } from '../src/ViewPort';
import { Force, RenderFunctions, RenderTransformationRule, Body, Effect } from '../src';
import { getDistanceBetweenPoints, getHeadingFromPointToPoint, Point, _90deg } from '../src/geometry';
import './addStyleSheetAndFrame'



const maxPushForce = 30
const pushForceDistanceMultipler = .1

let cursorPoint: Point = { x: 0, y: 0 }


interface TouchRecord {
    body: Body
    startTime: number
    startPoint: Point
}

const touchMap = new Map<number, TouchRecord>();

function handlePointerStart(event: PointerEvent) {
    const startPoint = viewPort.locateClick(event, true)
    if (!startPoint) { return }
    const body = world.bodies.find(body => body.checkIfContainsPoint(startPoint)) || null

    if (body) {
        touchMap.set(event.pointerId, { body, startTime: Date.now(), startPoint })
    }

}

function handlePointerEnd(event: PointerEvent) {
    const touchRecord = touchMap.get(event.pointerId)

    if (touchRecord) {
        touchMap.delete(event.pointerId)
        const { body, startPoint } = touchRecord;
        const endPoint = viewPort.locateClick(event, true)
        if (!endPoint) { return }

        const push = Force.fromVector(
            (endPoint.x - startPoint.x) * pushForceDistanceMultipler,
            (endPoint.y - startPoint.y) * pushForceDistanceMultipler
        )
        push.magnitude = Math.min(maxPushForce, push.magnitude)
        body.momentum = push
    }
}



const canvasElement = document.createElement('canvas')
const viewPort = ViewPort.fitToSize(world, canvasElement, 700, 500)

world.ticksPerSecond = 500;

document.body.addEventListener('pointerdown', handlePointerStart);
document.body.addEventListener('pointerup', handlePointerEnd);
// document.body.addEventListener('mousemove', handleHover);

const frame = document.querySelector('.frame')
frame.appendChild(canvasElement);

(window as any).world = world;
(window as any).viewPort = viewPort;