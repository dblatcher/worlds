import { Area } from '../../src/Area'
import { Point, _90deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/GradientFill'
import { World, Body, Force, shapes } from '../../src/index'


const redPlanet = new Body({
    x: 250,
    y: 525,
    size: 50,
    density: 1,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
    renderPathAhead: true,
}, new Force(10, _90deg * (11 / 10)))

const greenPlanet = new Body({
    x: 150,
    y: 425,
    size: 25,
    density: 1,
    color: 'green',
    elasticity: .5,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}, new Force(3, _90deg))


const roundArea = new Area({
    x: 650,
    y: 400,
    size: 100,
    shape: shapes.circle,
    fillColor: 'rgba(30,140,17,.5)',
    density: 2,
})

const squareArea = new Area({
    x: 650,
    y: 400,
    size: 100,
    shape: shapes.square,
    fillColor: 'rgba(30,140,17,.5)',
    density: 2,
})

const areaDemo = new World([
    redPlanet,
    greenPlanet,
    squareArea
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