import { WorldControlPanel } from './WorldControlPanel';
import { SpaceShipControlPanel } from './SpaceShipControlPanel'
import { testWorld, myShip } from './preset-worlds/spaceShipTest'
import { rocksAndBallons } from './preset-worlds/rocksAndBallons'
import { galaxy } from './preset-worlds/galaxy'
import { balance } from './preset-worlds/balance';

const canvasElement = document.createElement('canvas')
canvasElement.setAttribute('height', '1000');
canvasElement.setAttribute('width', '1000');




const panel = new WorldControlPanel(balance, { worldOptions: [balance, galaxy, rocksAndBallons, testWorld] })
const shipPanel = new SpaceShipControlPanel(myShip)

panel.world.canvas = canvasElement
panel.world.renderOnCanvas()

document.body.appendChild(shipPanel.makeElement())
document.body.appendChild(panel.makeElement())
document.body.appendChild(canvasElement);
