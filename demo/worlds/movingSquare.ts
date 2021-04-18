import { Point, _360deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/GradientFill'
import { World, Body, Force, shapes } from '../../src/index'


const bigWhiteSquare = new Body({
    heading: .7,
    x: 210, y: 250,
    size: 60, density: 1,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
    renderPathAhead:true,
    immobile: false,
}, new Force(10,_360deg * (82/360)))

const bigRedSquare = new Body({
    heading: _360deg*.2,
    x: 510, y: 600,
    size: 80, density: 1,
    color: 'crimson',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
    immobile: true,
}, new Force(20,3.11))


const redPlanet = new Body({
    x: 280,
    y: 500,
    size: 50,
    density: 1,
    immobile: true,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
})

const greenPlanet = new Body({
    x: 500,
    y: 300,
    size: 70,
    density: 1,
    immobile: true,
    color: 'green',
    elasticity: .5,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
})


const movingSquareTest = new World([
    bigWhiteSquare,
    bigRedSquare,
    // redPlanet,
    // greenPlanet,
], {
    height: 800,
    width: 800,
    airDensity: .1,
    gravitationalConstant: 0,
    bodiesExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasHardEdges: true,
    name: "movingSquareTest",
});


export { movingSquareTest }