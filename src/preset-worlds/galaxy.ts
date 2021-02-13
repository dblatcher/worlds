import { World } from '../World'
import { LinedThing, Thing } from '../Thing'
import { Force } from '../Force'


const redPlanet = new Thing({ x: 700, y: 100, size: 10, density: 5, color: 'red', elasticity: .8 })
const whiteStar = new LinedThing({ x: 500, y: 500, size: 70, density: 10, immobile:true })
const bluePlanet= new Thing({ x: 200, y: 730, size: 18, density: 2, color: 'blue', elasticity: .7 }, new Force(24, Math.PI * (0.5)))
const pinkPlanet = new Thing({ x: 700, y: 700, size: 15, density: 3, color: 'pink', elasticity: .25 }, new Force(8, Math.PI * (1)))


const galaxy = new World([
    whiteStar, 
    redPlanet,
    bluePlanet,
    pinkPlanet
], {
    gravitationalConstant: .2,
    thingsExertGravity: true,
    hasHardEdges: true,
    name: "Galaxy",
});

export { galaxy }