import { WorldControlPanel } from './WorldControlPanel';
import { galaxy, ground } from './presetWorlds';


const canvasElement = document.createElement('canvas')
canvasElement.setAttribute('height', '1000');
canvasElement.setAttribute('width', '1000');


const world = galaxy
world.canvas = canvasElement
world.renderOnCanvas()

const panel = new WorldControlPanel(world)

document.body.appendChild(panel.makeElement())
document.body.appendChild(canvasElement);
