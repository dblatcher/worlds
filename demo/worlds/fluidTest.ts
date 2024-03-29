import { World, shapes, Body, Force, Fluid, ViewPort } from '../../src/index'

const worldHeight = 3000
const worldWidth = 4000

function makeRock() {

    let x = 50 + Math.floor(Math.random() * worldWidth/2)
    let y = 50 + Math.floor(Math.random() * 500)
    let size = 10 + Math.floor(Math.random() * 20)
    let density = 5
    let elasticity = .25
    let headingFollowsDirection = true
    let color = 'gray'
    let fillColor = 'lightgray'
    let direction = Math.random() > .25
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Body({ x, y, size, density, color, fillColor, elasticity, headingFollowsDirection }, new Force(direction ? 10 : 0, direction))
}

function makeBallon() {

    let x = 50 + Math.floor(Math.random() * worldWidth/2)
    let y = 50 + Math.floor(Math.random() * 500)
    let size = 50 + Math.floor(Math.random() * 20)
    let density = .5
    let elasticity = .75
    let headingFollowsDirection = true
    let color = 'red'
    let fillColor = 'crimson'
    let direction = Math.random() > .1
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Body({ x, y, size, density, color, fillColor, elasticity, headingFollowsDirection }, new Force(direction ? 20 : 0, direction))
}

function makeRocksAndBallons(amount: number) {
    let bodies: Body[] = []
    for (let i = 0; i < amount; i++) { bodies.push(makeRock()) }
    for (let i = 0; i < amount; i++) { bodies.push(makeBallon()) }
    return bodies
}

const ballonBelowSurface = makeBallon()
ballonBelowSurface.data.y = 1800

const water = new Fluid({
    volume: 4000000,
    color: 'rgba(0,50,250,.5)',
    density: 1,
    drainRate: 0,
})

const oil = new Fluid({
    volume: 50000,
    color: 'yellow',
    density: .9
})

const mercury = new Fluid({
    volume: 200000,
    color: 'white',
    density: 13.5,
    drainRate: -100,
})


const fluidTest = new World([
    water,
    // mercury,
    // oil,
    ...makeRocksAndBallons(3),
    ballonBelowSurface
], {
    globalGravityForce: new Force(1, 0),
    width: worldWidth,
    height: worldHeight,
    hasHardEdges: true,
    gravitationalConstant: 1,
    name: "fluidTest",
    airDensity: 1,
})

export { fluidTest }