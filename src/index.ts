import { World } from './World'
import { Thing } from './Thing'

const world = new World(7.1, [new Thing(), new Thing()]);

const element = document.createElement('div')
element.innerText = world.report

document.body.appendChild(element);