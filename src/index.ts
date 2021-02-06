import { World } from './World'
import { Thing } from './Thing'
import { Force } from './Force'

const world = new World(7.1, [
    new Thing({x:100, y:50, size:10}, new Force(2,2.1)), 
    new Thing({x:40, y:120, size:5, color:'blue'}, new Force(1.2, .5)),
    new Thing({x:60, y:120, size:7, color:'blue', heading: .6}),
]);

const divElement = document.createElement('div')
divElement.innerText = world.report
document.body.appendChild(divElement);

const canvasElement = document.createElement('canvas')
canvasElement.setAttribute('height', '1000');


document.body.appendChild(canvasElement);

world.canvas = canvasElement
world.startTime(50)