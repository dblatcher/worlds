import { rocksAndBallons } from './worlds/rocksAndBallons'
import { galaxy } from './worlds/galaxy'
import { balance } from './worlds/balance';
import { squareTestWorld } from './worlds/squareTest';
import { fluidTest } from './worlds/fluidTest';

import { ViewPortControlPanel } from './ViewPortControlPanel';
import { ViewPort } from '../ViewPort';

import './addStyleSheetAndFrame'


const canvasElement = document.createElement('canvas')
const canvasElement2 = document.createElement('canvas')

const panelWorlds = [fluidTest, squareTestWorld, balance, galaxy, rocksAndBallons]
const viewPort2World = rocksAndBallons

const viewPort = ViewPort.full(panelWorlds[0], canvasElement)
const panel = new ViewPortControlPanel({ viewPort, worldOptions: panelWorlds })


const viewPort2 = new ViewPort({
    canvas: canvasElement2,
    x: 0,
    y: 500,
    magnify: 3,
    height: viewPort2World.height,
    width: viewPort2World.width,
    world: viewPort2World
})

viewPort2World.ticksPerSecond = 10

const frame = document.querySelector('.frame')
document.body.prepend(panel.makeElement())
frame.appendChild(canvasElement2);
frame.appendChild(canvasElement);

(window as any).panel = panel;
(window as any).viewPort2 = viewPort2;