
import { rocksAndBallons } from './preset-worlds/rocksAndBallons'
import { galaxy } from './preset-worlds/galaxy'
import { balance } from './preset-worlds/balance';
import { squareTestWorld } from './preset-worlds/squareTest';

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

const panel = new WorldControlPanel(squareTestWorld, { worldOptions: [squareTestWorld,balance, galaxy, rocksAndBallons] })

panel.world.setCanvas(canvasElement)

document.head.appendChild(styleSheet)
document.body.appendChild(panel.makeElement())

const frame = document.createElement('div')
frame.classList.add('frame')

frame.appendChild(canvasElement);
document.body.appendChild(frame);
