import { world as world } from './worlds/swiper'
import { ViewPort } from '../src/ViewPort';
import { Force, Body } from '../src';
import { Point } from '../src/geometry';
import './addStyleSheetAndFrame'



const maxPushForce = 30
const pushForceDistanceMultipler = .05


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
const viewPort = ViewPort.full(world, canvasElement)

world.ticksPerSecond = 500;

canvasElement.addEventListener('pointerdown', handlePointerStart);
canvasElement.addEventListener('pointerup', handlePointerEnd);

const frame = document.querySelector('.frame')
frame.appendChild(canvasElement);

(window as any).world = world;
(window as any).viewPort = viewPort;