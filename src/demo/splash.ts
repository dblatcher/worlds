import { world as world} from './worlds/splashWorld'
import { ViewPort } from '../ViewPort';


import './addStyleSheetAndFrame'

const canvasElement = document.createElement('canvas')
const viewPort = ViewPort.fitToSize(world, canvasElement, 800,500)

const frame = document.querySelector('.frame')
frame.appendChild(canvasElement);

world.ticksPerSecond = 100;

(window as any).world = world;
(window as any).viewPort = viewPort;