import { Area } from '../../src/Area'
import { Point, _360deg, _90deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/GradientFill'
import { World, Body, Force, shapes } from '../../src/index'


const redPlanet = new Body({
    x: 500,
    y: 500,
    size: 50,
    density: 15,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
    renderPathAhead: true,
}, new Force(200, _360deg * (-0 / 360)))

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


const roundArea = new Area({
    x: 500,
    y: 480,
    size: 100,
    shape: shapes.circle,
    fillColor: 'rgba(30,140,17,.5)',
    density: 30,
})

const squareArea = new Area({
    x: 500,
    y: 500,
    size: 150,
    heading: _360deg*(44/360),
    shape: shapes.square,
    fillColor: 'rgba(30,140,17,.5)',
    density: 100,
})

const areaDemo = new World([
    redPlanet,
    // greenPlanet,
    roundArea
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