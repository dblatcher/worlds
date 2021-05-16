import { rocksAndBallons } from './worlds/rocksAndBallons'
import { galaxy } from './worlds/galaxy'
import { balance } from './worlds/balance';
import { squareTestWorld } from './worlds/squareTest';
import { fluidTest } from './worlds/fluidTest';
import { movingSquareTest } from './worlds/movingSquare';

import { ViewPortControlPanel } from './ViewPortControlPanel';
import { ViewPort } from '../src/ViewPort';
import { areaDemo } from './worlds/areaDemo';
import { passThrough } from './worlds/passThrough';

import './addStyleSheetAndFrame'


const canvasElement = document.createElement('canvas')

const panelWorlds = [passThrough, squareTestWorld, movingSquareTest, areaDemo ,fluidTest, balance, galaxy, rocksAndBallons]

const viewPort = ViewPort.full(panelWorlds[0], canvasElement)
const panel = new ViewPortControlPanel({ viewPort, worldOptions: panelWorlds })

viewPort.renderCanvas()

const frame = document.querySelector('.frame')
document.body.prepend(panel.makeElement())
frame.appendChild(canvasElement);

(window as any).panel = panel;