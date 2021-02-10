import { World } from '../World'
import { KillerThing, LinedThing, Thing } from '../Thing'
import { Force } from '../Force'


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

export { galaxy }