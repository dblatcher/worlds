import { WorldControlPanel } from './WorldControlPanel';
import { SpaceShipControlPanel } from './SpaceShipControlPanel'
import { testWorld, myShip } from './preset-worlds/spaceShipTest'
import { rocksAndBallons } from './preset-worlds/rocksAndBallons'
import { galaxy } from './preset-worlds/galaxy'
import { balance } from './preset-worlds/balance';
import { squareTestWorld } from './preset-worlds/squareTest';


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

const panel = new WorldControlPanel(squareTestWorld, { worldOptions: [squareTestWorld,balance, galaxy, rocksAndBallons, testWorld] })
const shipPanel = new SpaceShipControlPanel(myShip)

panel.world.setCanvas(canvasElement)

document.head.appendChild(styleSheet)
document.body.appendChild(shipPanel.makeElement())
document.body.appendChild(panel.makeElement())

const frame = document.createElement('div')
frame.classList.add('frame')

frame.appendChild(canvasElement);
document.body.appendChild(frame);
