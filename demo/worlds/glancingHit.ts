import { Point, _360deg, _deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/GradientFill'
import { World, Body, Force, shapes } from '../../src/index'


const bigWhiteSquare = new Body({
    heading: _deg * 120,
    x: 210, y: 330,
    size: 140, density: 1,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
    renderPathAhead:true,
    immobile: true,
}, new Force(40,48 * _deg))

const bigRedSquare = new Body({
    heading: _360deg*.2,
    x: 510, y: 600,
    size: 80, density: 1,
    color: 'crimson',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
    immobile: false,
}, new Force(1,0))


const redPlanet = new Body({
    x: 675,
    y: 450,
    size: 90,
    density: 1,
    immobile: false,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
    renderPathAhead:true
}, new Force(11,_deg*-90))

const greenPlanet = new Body({
    x: 500,
    y: 100,
    size: 70,
    density: 1,
    immobile: false,
    color: 'green',
    elasticity: .5,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
})



const glancingHit = new World([
    bigWhiteSquare,
    // bigRedSquare,
    redPlanet,
    greenPlanet,

], {
    height: 800,
    width: 800,
    airDensity: .1,
    gravitationalConstant: 0,
    bodiesExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasHardEdges: true,
    name: "glancingHit",
});


export { glancingHit }