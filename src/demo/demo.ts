
import { rocksAndBallons } from './rocksAndBallons'
import { galaxy } from './galaxy'
import { balance } from './balance';
import { squareTestWorld } from './squareTest';
import { fluidTest } from './fluidTest';

import { WorldControlPanel } from './WorldControlPanel';



console.log("DEMO FILE")

const canvasElement = document.createElement('canvas')
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

const panel = new WorldControlPanel(fluidTest, { worldOptions: [fluidTest,squareTestWorld,balance, galaxy, rocksAndBallons] })

panel.world.viewPort.setCanvas(canvasElement)

document.head.appendChild(styleSheet)
document.body.appendChild(panel.makeElement())

const frame = document.createElement('div')
frame.classList.add('frame')

frame.appendChild(canvasElement);
document.body.appendChild(frame);

window.panel = panel