import { Point, _360deg } from '../../geometry'
import { LinearGradientFill } from '../../GradientFill'
import { World, Body, Force, shapes } from '../../index'


const bigWhiteSquare = new Body({
    heading: .7,
    x: 210, y: 200,
    size: 60, density: 1,
    immobile: false,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
}, new Force(10,0.11))

const bigRedSquare = new Body({
    heading: _360deg*.2,
    x: 510, y: 600,
    size: 80, density: 1,
    immobile: false,
    color: 'crimson',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
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
    name: "movingSquareTest",
});


export { movingSquareTest }