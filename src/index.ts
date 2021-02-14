import { WorldControlPanel } from './WorldControlPanel';
import { SpaceShipControlPanel } from './SpaceShipControlPanel'
import { testWorld, myShip } from './preset-worlds/spaceShipTest'
import { rocksAndBallons } from './preset-worlds/rocksAndBallons'
import { galaxy } from './preset-worlds/galaxy'
import { balance } from './preset-worlds/balance';

const canvasElement = document.createElement('canvas')


const styleSheet = document.createElement('style')
styleSheet.textContent = `
canvas {
    max-width: 100%;
    height: auto;
    border: 20px outset gray;
    box-sizing: border-box;
}
`

const panel = new WorldControlPanel(balance, { worldOptions: [balance, galaxy, rocksAndBallons, testWorld] })
const shipPanel = new SpaceShipControlPanel(myShip)

panel.world.setCanvas (canvasElement)

document.head.appendChild(styleSheet)
document.body.appendChild(shipPanel.makeElement())
document.body.appendChild(panel.makeElement())
document.body.appendChild(canvasElement);
