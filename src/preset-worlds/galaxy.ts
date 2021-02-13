import { World } from '../World'
import { LinedThing, Thing } from '../Thing'
import { Force } from '../Force'


const whiteStar = new LinedThing({ x: 500, y: 500, size: 10, density: 150, immobile:true })
const redPlanet = new Thing({ 
    x: 300, y: 600, size: 10, density: 5, color: 'red', elasticity: .8 
}, new Force(24, Math.PI * 0.5))

const bluePlanet= new Thing({ 
    x: 200, y: 730, size: 18, density: 2, color: 'blue', elasticity: .7 
}, new Force(24, Math.PI * 0.5))

const pinkPlanet = new Thing({ 
    x: 200, y: 800, size: 15, density: 3, color: 'pink', elasticity: .25 
}, new Force(10, Math.PI * 0.5))


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