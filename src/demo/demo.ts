
import { rocksAndBallons } from './rocksAndBallons'
import { galaxy } from './galaxy'
import { balance } from './balance';
import { squareTestWorld } from './squareTest';
import { fluidTest } from './fluidTest';

import { ViewPortControlPanel } from './ViewPortControlPanel';
import { ViewPort } from '../ViewPort';



console.log("DEMO FILE")


const styleSheet = document.createElement('style')
styleSheet.textContent = `
.frame {
    width: 100%;
    height: 100%;
    max-height: 95vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: -1;
}

canvas {
    border: 20px outset gray;
    box-sizing: border-box;
    max-height: inherit;
}
`

const canvasElement = document.createElement('canvas')
const viewPort = ViewPort.full(squareTestWorld, canvasElement)
viewPort.setWorld(squareTestWorld)
const panel = new ViewPortControlPanel({viewPort, worldOptions: [fluidTest,squareTestWorld,balance, galaxy]} )


const canvasElement2 = document.createElement('canvas')
const viewPort2 = new ViewPort ({
    canvas:canvasElement2,
    x:0,
    y:500,
    magnify:.5,
    height: rocksAndBallons.height,
    width: rocksAndBallons.width,
    world: rocksAndBallons
})

rocksAndBallons.ticksPerSecond = 10

document.head.appendChild(styleSheet)
document.body.appendChild(panel.makeElement())

const frame = document.createElement('div')
frame.classList.add('frame')
frame.appendChild(canvasElement);
document.body.appendChild(frame);

const frame2 = document.createElement('div')
frame2.classList.add('frame')
frame.appendChild(canvasElement2);
document.body.appendChild(frame2);

(window as any).panel = panel;
(window as any).viewPort2 = viewPort2;