import { Area } from '../../src/Area'
import { Point, _360deg, _90deg, _deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/AbstractFill'
import { World, Body, Force, shapes } from '../../src/index'


const redPlanet = new Body({
    x: 450,
    y: 650,
    size: 50,
    density: 5,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
    renderPathAhead: true,
}, new Force(100, _360deg * (180 / 360)))

const greenPlanet = new Body({
    x: 150,
    y: 425,
    size: 25,
    density: 1,
    color: 'green',
    elasticity: .5,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}, new Force(3, -_90deg))

const bigWhiteSquare = new Body({
    heading: _deg * 120,
    x: 210, y: 630,
    size: 60, density: 5,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: false,
    renderHeadingIndicator: true,
    renderPathAhead:true,
    immobile: false,
}, new Force(40,80 * _deg))

const roundArea = new Area({
    x: 500,
    y: 480,
    size: 100,
    shape: shapes.circle,
    fillColor: 'rgba(30,140,17,.5)',
    density: 80,
})

const squareArea = new Area({
    x: 200,
    y: 300,
    size: 100,
    heading: _360deg*(44/360),
    shape: shapes.square,
    fillColor: 'rgba(30,140,17,.5)',
    density: 100,
})

const areaDemo = new World([
    redPlanet,
    bigWhiteSquare,
    roundArea,
    squareArea,
], {
    height: 800,
    width: 800,
    airDensity: 0,
    gravitationalConstant: 0,
    bodiesExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasWrappingEdges: true,
    name: "areaDemo",
});


export { areaDemo }