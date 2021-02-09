import { World } from '../World'
import { Thing } from '../Thing'

import { Force } from '../Force'
import { SpaceShip } from '../SpaceShip'
import { SpaceShipControlPanel } from '../SpaceShipControlPanel'


const myShip = new SpaceShip({
    size: 20,
    x: 200,
    y: 200,
    thrust: 0,
    density:1,
    maxThrust: 1000
})
const redPlanet = new Thing({ x: 500, y: 500, size: 50, density: 2, color: 'red' })

const testWorld = new World([
    myShip, redPlanet
], {
    gravitationalConstant: .1,
    hasHardEdges: true,
    thingsExertGravity: true
})

const panel = new SpaceShipControlPanel(myShip)

document.body.appendChild( panel.create())

export { testWorld }