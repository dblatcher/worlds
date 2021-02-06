import { World } from './World'
import { Thing } from './Thing'
import { Force } from './Force'

const divElement = document.createElement('div')
document.body.appendChild(divElement);

const canvasElement = document.createElement('canvas')
canvasElement.setAttribute('height', '1000');
canvasElement.setAttribute('width', '1000');
document.body.appendChild(canvasElement);

const world = new World(.01, [
    new Thing({ x: 500, y: 400, size: 60, density: 20 }),
    new Thing({ x: 40, y: 120, size: 15, density: 10, color: 'blue' }, new Force(1, .5)),
    new Thing({ x: 640, y: 120, size: 5, density: 1.5, color: 'red' }, new Force(2, -Math.PI/2)),
    // new Thing({x:60, y:120, size:7, color:'blue', heading: .6}),
]);


world.canvas = canvasElement
world.ticksPerSecond = 50
divElement.innerText = world.report
globalThis.world = world