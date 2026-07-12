import { Body, Force, Geometry, shapes, ViewPort, World } from "../src";


const body1 = new Body(
    {
        x: 90, y: 150, size: 75,
        fillColor: 'red',
        color: 'transparent',
        renderHeadingIndicator: true,
        shape: shapes.circle,
    },
    new Force(1, .1)
)

const body2 = new Body(
    {
        x: 250, y: 150, size: 50,
        fillColor: 'blue',
        shape: shapes.square,
        renderHeadingIndicator: true,
        elasticity:.5
    },
    new Force(3, Geometry._deg * 45)
)

const world = new World([
    body1, body2
], {
    width: 500, 
    height: 500, 
    hasHardEdges: true,
})
const canvasElement = document.createElement('canvas')
const viewPort = ViewPort.full(world, canvasElement)
viewPort.renderCanvas()
world.ticksPerSecond=100

document.body.appendChild(canvasElement)