import { World } from './World'
import { LinedThing, Thing } from './Thing'
import { Force } from './Force'
import { WorldControlPanel } from './WorldControlPanel';


const canvasElement = document.createElement('canvas')
canvasElement.setAttribute('height', '1000');
canvasElement.setAttribute('width', '1000');


const world = new World(0, [
    new LinedThing({ x: 500, y: 400, size: 50, density: 50 }),
    new Thing({ x: 40, y: 380, size: 15, density: 10, color: 'blue' }, new Force(5, Math.PI*(.51))),
    new Thing({ x: 30, y: 600, size: 15, density: 10, color: 'blue' }, new Force(5, Math.PI*(.71))),
    // new Thing({ x: 640, y: 120, size: 5, density: 1.5, color: 'red' }, new Force(2, -Math.PI/2)),
    new Thing({x:60, y:120, size:7, color:'green', heading: .6}),
],{
    // globalGravityForce: new Force(4,0),
});
world.canvas = canvasElement
world.renderOnCanvas()

const panel = new WorldControlPanel(world)

document.body.appendChild(panel.makeElement())
document.body.appendChild(canvasElement);
