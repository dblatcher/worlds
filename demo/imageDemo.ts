
import { ViewPort } from '../src/ViewPort';
import { Force, Body, World, Geometry, shapes } from '../src';
import { _deg } from '../src/geometry';
import './addStyleSheetAndFrame'
import { ImageFill } from '../src/AbstractFill';

import { SoundDeck, ToneParams } from '../src/additions/SoundDeck';



console.log('image demo');

async function start() {

    const soilFill = ImageFill.fromSrc('./soil.jpg', 'brown', {
        rotate: 90,
        offset: { x: 10, y: 20 }
    });

    const bigSoilFill = ImageFill.fromSrc('./soil.jpg', 'brown', {
        scale: 2.5,
    });

    const body1 = new Body(
        {
            x: 90, y: 150, size: 75,
            fillColor: bigSoilFill,
            color: 'transparent',
            renderHeadingIndicator: true,
        },
        new Force(0, 0)
    )

    const body2 = new Body(
        {
            x: 250, y: 150, size: 50,
            fillColor: soilFill,
            shape: shapes.square,
            renderHeadingIndicator: true,
        },
        new Force(1, Geometry._deg * 45)
    )

    body2.tick = () => {
        // body2.data.heading += _deg;
    }

    body1.tick = () => {
        body1.data.heading -= _deg * 1;
    }

    const soundDeck = new SoundDeck();
    soundDeck.defineSampleBuffer('beep', './beep.mp3');

    const world = new World([
        body1, body2
    ], {
        width: 500, height: 500, hasHardEdges: true, soundDeck
    })


    const canvasElement = document.createElement('canvas')
    const viewPort = ViewPort.fitToSize(world, canvasElement, 300, 600)
    viewPort.framefill = soilFill
    world.ticksPerSecond = 100;

    const frame = document.querySelector('.frame')
    frame.appendChild(canvasElement);

    const myWindow: any = window;

    myWindow.world = world;
    myWindow.viewPort = viewPort;

    const hum: ToneParams = { frequency: 300, endFrequency: 350, type: 'square' };


    document.addEventListener('click', () => {
        console.log('click is a gesture')
        world.soundDeck.enable()
        world.soundDeck.masterVolume = .5
        world.soundDeck.playTone(hum)
    }, { once: true })
}

start()