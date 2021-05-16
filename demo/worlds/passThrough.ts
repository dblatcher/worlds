import { Point, _360deg, _deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/GradientFill'
import { World, Body, Force, shapes } from '../../src/index'


const bigWhiteSquare = new Body({
    heading: _deg * 120,
    x: 210, y: 330,
    size: 20, density: 1,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
    renderPathAhead:true,
    immobile: false,
}, new Force(100,48 * _deg))


const wall = new Body({
    heading: _deg * -30,
    x:500, y:500,
    size:100,
    shape:shapes.polygon,
    corners: [
        {x:-.01,y:-1},
        {x:.01,y:-1},
        {x:.01,y:1},
        {x:-.01,y:1},
    ],
    immobile:true,
})

const wall2 = new Body({
    heading: _deg * -130,
    x:100, y:500,
    size:100,
    shape:shapes.polygon,
    corners: [
        {x:-.01,y:-1},
        {x:.01,y:-1},
        {x:.01,y:1},
        {x:-.01,y:1},
    ],
    immobile:true,
})

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
    x: 270,
    y: 370,
    size: 10,
    density: 1,
    immobile: false,
    color: 'green',
    elasticity: .5,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
})



const passThrough = new World([
    bigWhiteSquare,
    wall, 
    wall2,
    // bigRedSquare,
    // redPlanet,
    greenPlanet,

], {
    height: 800,
    width: 800,
    airDensity: 0,
    gravitationalConstant: 0,
    bodiesExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasHardEdges: true,
    name: "passThrough",
});


export { passThrough }