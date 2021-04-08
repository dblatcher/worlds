import { Point, _90deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/GradientFill'
import { World, Body, Force, shapes } from '../../src/index'


const bigWhiteSquare = new Body({
    heading: .7,
    x: 200, y: 200,
    size: 100, density: 1,
    immobile: true,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
})

const litteWhiteSquare = new Body({
    heading: _90deg/2,
    x: 500,
    y: 525,
    size: 50,
    density: .1,
    immobile: true,
    color: 'antiquewhite',
    fillColor: new LinearGradientFill({
        fallbackColor:'red',
        canvasFunction: (ctx: CanvasRenderingContext2D, line: [Point, Point]) => {
            const gradient = ctx.createLinearGradient(line[0].x, line[0].y, line[1].x, line[1].y);
            let i;
            for (i = 0; i < 10; i++) {
                gradient.addColorStop(i * .1, 'red');
                gradient.addColorStop((i + .5) * .1, 'blue');
            }
            return gradient
        }
    }),
    shape: shapes.square,
    headingFollowsDirection: true,
})

const redPlanet = new Body({
    x: 250,
    y: 525,
    size: 50,
    density: 1,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
    renderPathAhead:true,
}, new Force(45, _90deg))

const greenPlanet = new Body({
    x: 400,
    y: 300,
    size: 50,
    density: 1,
    color: 'green',
    elasticity: .5,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}, new Force(0, Math.PI * 1.5))

const blueMatter = {
    density: 1,
    color: 'blue',
    fillColor: 'purple',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}

const bluePlanets = [
    new Body(
        Object.assign({ x: 250, y: 210, size: 10, }, blueMatter),
        new Force(0, Math.PI * 1.5)
    ),
    new Body(
        Object.assign({ x: 250, y: 100, size: 30, }, blueMatter),
        new Force(0, Math.PI * 1.5)
    ),
    new Body(
        Object.assign({ x: 100, y: 260, size: 35, }, blueMatter),
        new Force(0, Math.PI * 1.5)
    ),
]

const squareTestWorld = new World([
    bigWhiteSquare,
    litteWhiteSquare,
    ...bluePlanets,
    redPlanet,
    greenPlanet,
], {
    height: 800,
    width: 800,
    airDensity: .5,
    gravitationalConstant: 0,
    bodiesExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasWrappingEdges: true,
    name: "squareTestWorld",
});


export { squareTestWorld }