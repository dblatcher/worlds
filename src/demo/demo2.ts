
import { RenderFunctions } from '..';
import { CameraFollowInstruction } from '../CameraInstruction';
import { Force } from '../Force';
import { _360deg, _90deg } from '../geometry';
import { RenderTransformationRule, ViewPort } from '../ViewPort';
import { bigWorld, redPlanet } from './worlds/bigWorld';


import './addStyleSheetAndFrame'

const canvasElement1 = document.createElement('canvas')
const canvasElement2 = document.createElement('canvas')


const demoWorld = bigWorld

const viewPort1 = ViewPort.fitToSize(demoWorld, canvasElement1, 150, 150)
viewPort1.dontRenderBackground = true
viewPort1.transformRules.push(new RenderTransformationRule(
    thing => thing === redPlanet,
    (thing, ctx, viewPort) => {
        let circle1 = thing.shapeValues
        let circle2 = thing.shapeValues
        circle2.radius = circle2.radius * 2
        RenderFunctions.renderCircle.onCanvas(ctx, circle2, { fillColor: 'blue', heading: thing.data.heading }, viewPort)
        RenderFunctions.renderCircle.onCanvas(ctx, circle1, { fillColor: 'yellow', heading: thing.data.heading }, viewPort)
    }
))

const viewPort2 = new ViewPort({
    canvas: canvasElement2,
    x: 0,
    y: 500,
    magnify: 2,
    height: demoWorld.height,
    width: demoWorld.width,
    world: demoWorld,
    rotate: 3,
})

viewPort2.cameraInstruction = new CameraFollowInstruction({
    thing: redPlanet,
    followHeading: false,
    magnify: 1.5,
    leadDistance: 0
})

demoWorld.emitter.on('tick', () => {
    redPlanet.data.heading += _360deg * (1 / 500)
})

redPlanet.momentum = new Force(50, 2)

demoWorld.ticksPerSecond = 20

const frame = document.querySelector('.frame')
frame.appendChild(canvasElement1);
frame.appendChild(canvasElement2);



(window as any).viewPort1 = viewPort1;
(window as any).viewPort2 = viewPort2;