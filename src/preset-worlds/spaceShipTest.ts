import { World, Thing, Force } from '../index'
import { SpaceShip } from '../spaceship/SpaceShip'

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

export { testWorld, myShip }