import { rocksAndBallons } from './rocksAndBallons'
import { galaxy } from './galaxy'
import { balance } from './balance';
import { squareTestWorld } from './squareTest';
import { fluidTest } from './fluidTest';

import { ViewPortControlPanel } from './ViewPortControlPanel';
import { ViewPort } from '../ViewPort';


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
const canvasElement2 = document.createElement('canvas')

const panelWorlds = [fluidTest, squareTestWorld, balance, galaxy, rocksAndBallons]
const viewPort2World = rocksAndBallons

const viewPort = ViewPort.full(panelWorlds[0], canvasElement)
const panel = new ViewPortControlPanel({ viewPort, worldOptions: panelWorlds })


const viewPort2 = new ViewPort({
    canvas: canvasElement2,
    x: 0,
    y: 500,
    magnify: 3,
    height: viewPort2World.height,
    width: viewPort2World.width,
    world: viewPort2World
})

viewPort2World.ticksPerSecond = 10

document.head.appendChild(styleSheet)
document.body.appendChild(panel.makeElement())

const frame = document.createElement('div')
frame.classList.add('frame')
frame.appendChild(canvasElement2);
frame.appendChild(canvasElement);
document.body.appendChild(frame);

(window as any).panel = panel;
(window as any).viewPort2 = viewPort2;