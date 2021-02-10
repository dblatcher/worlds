import { WorldControlPanel } from './WorldControlPanel';
import { SpaceShipControlPanel } from './SpaceShipControlPanel'
import { testWorld, myShip } from './preset-worlds/spaceShipTest'
import { rocksAndBallons } from './preset-worlds/rocksAndBallons'
import { galaxy } from './preset-worlds/galaxy'

const canvasElement = document.createElement('canvas')
canvasElement.setAttribute('height', '1000');
canvasElement.setAttribute('width', '1000');


const world = testWorld
world.canvas = canvasElement
world.renderOnCanvas()

const panel = new WorldControlPanel(world, { worldOptions: [galaxy, rocksAndBallons, testWorld] })
const shipPanel = new SpaceShipControlPanel(myShip)

document.body.appendChild(shipPanel.makeElement())
document.body.appendChild(panel.makeElement())
document.body.appendChild(canvasElement);
