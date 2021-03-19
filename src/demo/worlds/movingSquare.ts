import { Point } from '../../geometry'
import { LinearGradientFill } from '../../GradientFill'
import { World, Body, Force, shapes } from '../../index'


const bigWhiteSquare = new Body({
    heading: .7,
    x: 200, y: 200,
    size: 100, density: 1,
    immobile: false,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}, new Force(10,0))


const redPlanet = new Body({
    x: 280,
    y: 500,
    size: 50,
    density: 1,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
})

const greenPlanet = new Body({
    x: 500,
    y: 300,
    size: 50,
    density: 1,
    color: 'green',
    elasticity: .5,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
})


const movingSquareTest = new World([
    bigWhiteSquare,
    redPlanet,
    greenPlanet,
], {
    height: 800,
    width: 800,
    airDensity: .5,
    gravitationalConstant: 0,
    bodiesExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasHardEdges: true,
    name: "movingSquareTest",
});


export { movingSquareTest }