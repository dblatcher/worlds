import { World, Body, Force } from '../../index'


const worldHeight = 10000
const worldWidth = 9000

const whiteStar = new Body({ x: worldWidth / 2, y: worldHeight / 2, fillColor:'ghostwhite', size: 400, density: 5, immobile: true })
const redPlanet = new Body({
    x: 300, y: 600, size: 50, density: 2, color: 'red', fillColor:'crimson', elasticity: .8
}, new Force(24, Math.PI * 0.5))

const bluePlanet = new Body({
    x: 200, y: 730, size: 50, density: 1, color: 'blue',fillColor:'blue', elasticity: .7
}, new Force(24, Math.PI * 0.5))

const pinkPlanet = new Body({
    x: 200, y: 800, size: 50, density: 1, color: 'pink', fillColor:'pink', elasticity: .25
}, new Force(10, Math.PI * 0.5))


const galaxy = new World([
    whiteStar,
    redPlanet,
    bluePlanet,
    pinkPlanet
], {
    gravitationalConstant: .5,
    width: worldWidth,
    height: worldHeight,
    bodiesExertGravity: true,
    hasHardEdges: true,
    name: "Galaxy",
});

export { galaxy }