import { World, shapes, Thing, Force, Fluid } from '../index'


function makeRock() {

    let x = 50 + Math.floor(Math.random() * 900)
    let y = 50 + Math.floor(Math.random() * 300)
    let size = 10 + Math.floor(Math.random() * 20)
    let density = 4
    let elasticity = .25
    let headingFollowsDirection = true
    let color = 'gray'
    let fillColor = 'lightgray'
    let direction = Math.random() > .25
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Thing({ x, y, size, density, color, fillColor, elasticity, headingFollowsDirection }, new Force(direction ? 4 : 0, direction))
}

function makeBallon() {

    let x = 50 + Math.floor(Math.random() * 900)
    let y = 50 + Math.floor(Math.random() * 400)
    let size = 50 + Math.floor(Math.random() * 20)
    let density = .9
    let elasticity = .75
    let headingFollowsDirection = true
    let color = 'red'
    let fillColor = 'crimson'
    let direction = Math.random() > .25
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Thing({ x, y, size, density, color, fillColor, elasticity, headingFollowsDirection }, new Force(direction ? 4 : 0, direction))
}

function makeRocksAndBallons(amount: number) {
    let things: Thing[] = []
    for (let i = 0; i < amount; i++) { things.push(makeRock()) }
    for (let i = 0; i < amount; i++) { things.push(makeBallon()) }
    return things
}

const ballonBelowSurface = makeBallon()
ballonBelowSurface.data.y = 1800

const water = new Fluid({
    volume: 800000,
    color: 'blue',
    density: 1
})

const oil = new Fluid({
    volume: 200000,
    color: 'yellow',
    density: .75
})

const mercury = new Fluid({
    volume: 200000,
    color: 'white',
    density: 5
})


const fluidTest = new World([
    water,
    mercury,
    oil,
    ...makeRocksAndBallons(3),
    ballonBelowSurface
], {
    globalGravityForce: new Force(1, 0),
    height: 2000,
    hasHardEdges: true,
    gravitationalConstant: 1,
    name: "fluidTest",
    airDensity: .1,
})

export { fluidTest }