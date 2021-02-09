import { World } from './World'
import { KillerThing, LinedThing, Thing } from './Thing'
import { Force } from './Force'
import { testWorld } from './preset-worlds/spaceShipTest'



const redPlanet = new Thing({ x: 700, y: 100, size: 10, density: 1, color: 'red' })
const whitePlanet = new LinedThing({ x: 500, y: 500, size: 50, density: 100 })

const galaxy = new World([
    whitePlanet, redPlanet,
    new Thing({ x: 40, y: 380, size: 15, density: 2, color: 'blue' }, new Force(5, Math.PI * (.51))),
    new Thing({ x: 300, y: 600, size: 25, density: 2, color: 'blue' }, new Force(18, Math.PI * (0.5))),
    new Thing({ x: 700, y: 700, size: 15, density: 2, color: 'pink' }, new Force(8, Math.PI * (1))),
    new Thing({ x: 640, y: 120, size: 5, density: 1.5, color: 'red' }, new Force(2, -Math.PI / 2)),
    // new KillerThing({ x: 60, y: 120, size: 10, color: 'green', heading: .6 }),
], {
    gravitationalConstant: .2,
    thingsExertGravity: true,
    hasHardEdges: true,
    name: "Galaxy",
});

function makeRock() {

    let x = 50 + Math.floor(Math.random() * 900)
    let y = 50 + Math.floor(Math.random() * 300)
    let size = 10 + Math.floor(Math.random() * 20)
    let density = 4
    let color = 'gray'
    let direction = Math.random() > .25
        ? Math.random() > .5
            ? .25
            : 1.75
        : 0

    return new Thing({ x, y, size, density, color }, new Force(4, Math.PI * direction))
}

function makeRocks(amount: number) {
    let rocks: Thing[] = []
    for (let i = 0; i < amount; i++) { rocks.push(makeRock()) }
    return rocks
}

const ground = new World([
    ...makeRocks(25),
], {
    globalGravityForce: new Force(1, 0),
    hasHardEdges: true,
    gravitationalConstant: 1,
    name: "falling rocks",
})

export { galaxy, ground, testWorld }