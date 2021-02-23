import { World } from '../World'
import { LinedThing, Thing } from '../Thing'
import { Force } from '../Force'
import { shapes } from '../Shape'



const bigWhiteSquare = new LinedThing({ 
    heading: .7, 
    x: 200, y: 200, 
    size: 100, density: 1, 
    immobile: true, 
    color: 'antiquewhite', 
    shape: shapes.square,
    keepsHeading: true, 
})

const litteWhiteSquare = new Thing({ 
    heading: 1, 
    x: 500, 
    y: 525, 
    size: 20, 
    density: .1, 
    immobile: true, 
    color: 'antiquewhite', 
    shape: shapes.square,
    keepsHeading: true,  
})

const redPlanet = new Thing({
    x: 280, y: 500, size: 50, density: 1, color: 'red', elasticity: 1
}, new Force(15, Math.PI * 1))

const bluePlanet = new Thing({
    x: 250, y: 210, size: 10, density: 1, color: 'blue', elasticity: 1
}, new Force(0, Math.PI * 1.5))


const squareTestWorld = new World([
    bigWhiteSquare,
    litteWhiteSquare, 
    bluePlanet,
    redPlanet,
], {
    height: 800,
    width:800,

    gravitationalConstant: 0,
    thingsExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasHardEdges: true,
    name: "squareTestWorld",
});

console.log({ bigWhiteSquare, redPlanet, bluePlanet, litteWhiteSquare })

export { squareTestWorld }