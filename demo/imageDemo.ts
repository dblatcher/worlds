
import { ViewPort } from '../src/ViewPort';
import { Force, Body, World, Geometry, shapes } from '../src';
import { Point, _deg } from '../src/geometry';
import './addStyleSheetAndFrame'
import { ImageFill } from '../src/AbstractFill';


console.log('image demo');

async function start() {

    const soilFill = ImageFill.fromSrc ('./soil.jpg','brown');

    const stoneImage = new Image();
    stoneImage.src = './stone.jpg';

    const stoneFill = new ImageFill({
        fallbackColor: 'red',
        image: stoneImage,
    });



    const body1 = new Body(
        {
            x: 90, y: 150, size: 75,
            fillColor: soilFill,
            color:'transparent',
            renderHeadingIndicator:true,
        },
        new Force(0, 0)
    )

    const body2 = new Body(
        {
            x: 250, y: 150, size: 50,
            fillColor: soilFill,
            shape:shapes.square,
            renderHeadingIndicator:true,
        },
        new Force(1, Geometry._deg * 45)
    )

    body2.tick = () => {
        body2.data.heading += _deg;
    }

    body1.tick = () => {
        body1.data.heading -= _deg*1;
    }

    const world = new World([
        body1, body2
    ], {
        width: 500, height: 500, hasHardEdges: true
    })


    const canvasElement = document.createElement('canvas')
    const viewPort = ViewPort.fitToSize(world, canvasElement,300,600)
    viewPort.framefill = stoneFill
    world.ticksPerSecond = 100;

    const frame = document.querySelector('.frame')
    frame.appendChild(canvasElement);
    (window as any).world = world;
    (window as any).viewPort = viewPort;
}

start()