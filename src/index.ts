import { World } from './World'
import { KillerThing, LinedThing, Thing } from './Thing'
import { Force } from './Force'
import { WorldControlPanel } from './WorldControlPanel';


const canvasElement = document.createElement('canvas')
canvasElement.setAttribute('height', '1000');
canvasElement.setAttribute('width', '1000');


const redPlanet = new Thing({ x: 700, y: 100, size: 100, density: 1, color: 'red' })
const whitePlanet = new LinedThing({ x: 500, y: 500, size: 50, density: 5 })

const world = new World(0, [
    whitePlanet,
    new Thing({ x: 40, y: 380, size: 15, density: 2, color: 'blue' }, new Force(5, Math.PI * (.51))),
    new Thing({ x: 300, y: 600, size: 25, density: 2, color: 'blue' }, new Force(18, Math.PI * (0.5))),
    new Thing({ x: 700, y: 700, size: 15, density: 2, color: 'pink' }, new Force(8, Math.PI * (1))),
    new Thing({ x: 640, y: 120, size: 5, density: 1.5, color: 'red' }, new Force(2, -Math.PI/2)),
    // new KillerThing({ x: 60, y: 120, size: 10, color: 'green', heading: .6 }),
], {
    globalGravityForce: new Force(1, 0),
    thingsExertGravity: false,
    hasHardEdges: true,
});
world.canvas = canvasElement
world.renderOnCanvas()

// redPlanet.enterWorld(world)
// whitePlanet.leaveWorld()

const panel = new WorldControlPanel(world)

document.body.appendChild(panel.makeElement())
document.body.appendChild(canvasElement);
