import { World, LinedThing, Thing, Force } from '../../index'

const whiteStar1 = new LinedThing({ x: -250, y: 500, size: 500, density: 1, immobile:true, color: 'ghostwhite' })
const whiteStar2 = new LinedThing({ x: 1250, y: 500, size: 500, density: 1, immobile:true, color: 'antiquewhite' })

const redPlanet = new Thing({ 
    x: 500, y: 500, size: 10, density: 5, color: 'red', elasticity: .7 
}, new Force(0, Math.PI * 0.5))

const bluePlanet= new Thing({ 
    x: 400, y: 400, size: 10, density: 5, color: 'blue', elasticity: .7 
}, new Force(0, Math.PI * 0.5))

const pinkPlanet = new Thing({ 
    x: 400, y: 500, size: 15, density: 3, color: 'pink', elasticity: .7 
}, new Force(10, Math.PI * 0.5))


const balance = new World([
    whiteStar1, 
    whiteStar2, 
    redPlanet,
    bluePlanet,
    // pinkPlanet,
], {
    gravitationalConstant: .005,
    height:1200,
    thingsExertGravity: true,
    minimumMassToExertGravity: 100000,
    hasHardEdges: true,
    name: "balance",
});

console.log(balance.things.map(thing => thing.mass))

export { balance }