
import { RenderFunctions } from '../src';
import { CameraFollowInstruction } from '../src/CameraInstruction';
import { Force } from '../src/Force';
import { _360deg, _90deg } from '../src/geometry';
import { RenderTransformationRule, ViewPort } from '../src/ViewPort';
import { bigWorld, redPlanet } from './worlds/bigWorld';


import './addStyleSheetAndFrame'

const canvasElement1 = document.createElement('canvas')
const canvasElement2 = document.createElement('canvas')


const demoWorld = bigWorld

const viewPort1 = ViewPort.fitToSize(demoWorld, canvasElement1, 150, 150)
viewPort1.dontRenderBackground = true

viewPort1.backGroundOverride= 'yellowgreen';

viewPort1.transformRules.push(new RenderTransformationRule(
    body => body === redPlanet,
    (body, ctx, viewPort) => {
        let circle1 = body.shapeValues
        let circle2 = body.shapeValues
        circle2.radius = circle2.radius * 2
        RenderFunctions.renderCircle.onCanvas(ctx, circle2, { fillColor: 'blue', heading: body.data.heading }, viewPort)
        RenderFunctions.renderCircle.onCanvas(ctx, circle1, { fillColor: 'yellow', heading: body.data.heading }, viewPort)
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
    framefill:'white',
})

viewPort2.cameraInstruction = new CameraFollowInstruction({
    body: redPlanet,
    followHeading: false,
    magnify: .5,
    leadDistance: 0
})

demoWorld.emitter.on('tick', () => {
    redPlanet.data.heading += _360deg * (1 / 500)
})

redPlanet.momentum = new Force(50, 2)

demoWorld.ticksPerSecond = 5

const frame = document.querySelector('.frame')
frame.appendChild(canvasElement1);
frame.appendChild(canvasElement2);



(window as any).viewPort1 = viewPort1;
(window as any).viewPort2 = viewPort2;