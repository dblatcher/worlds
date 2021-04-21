import { Point, _360deg, _deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/GradientFill'
import { World, Body, Force, shapes } from '../../src/index'


const bigWhiteSquare = new Body({
    heading: _deg * 120,
    x: 210, y: 330,
    size: 60, density: 1,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
    renderPathAhead:true,
    immobile: false,
}, new Force(40,45 * _deg))

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
    x: 280,
    y: 500,
    size: 50,
    density: 1,
    immobile: false,
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

const triangle = new Body({
    x: 280,
    y: 600,
    size: 50,
    density: 1,
    immobile: false,
    shape: shapes.polygon,
    corners:[
        {x:0, y:1},
        {x:-1, y:-1},
        {x:1, y:-1},
    ],
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
})


const star = new Body({
    x: 580,
    y: 500,
    size: 50,
    density: 1,
    immobile: false,
    shape: shapes.polygon,
    corners:[
        {x:0, y:1},
        {x:1, y:.4},
        {x:.5, y:0},
        {x:1, y:-1},
        {x:0, y:-.5},
        {x:-1, y:-1},
        {x:-.5, y:0},
        {x:-1, y:.4},
        
    ],
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
})


const movingSquareTest = new World([
    bigWhiteSquare,
    // bigRedSquare,
    // redPlanet,
    // greenPlanet,
    triangle,
    star
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