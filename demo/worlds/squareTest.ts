import { Point, _90deg, _deg } from '../../src/geometry'
import { LinearGradientFill } from '../../src/AbstractFill'
import { World, Body, Force, shapes } from '../../src/index'



const bigWhiteSquare = new Body({
    heading: .7,
    x: 200, y: 200,
    size: 100, density: 5,
    immobile: false,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: false,
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


const blueMatter = {
    density: 1,
    color: 'blue',
    fillColor: 'rgba(10,10,150,.4)',
    elasticity: .8,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
    renderPathAhead:true,
}


const redPlanet = new Body({
    x: 615,
    y: 225,
    size: 50,
    density: 1,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
    renderPathAhead:true,
}, new Force(100, _deg*1))

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



const bluePlanets = [
    new Body(
        Object.assign({ x: 400, y: 550, size: 40, }, blueMatter),
        new Force(0, 180 * _deg)
    ),
    new Body(
        Object.assign({ x: 150, y: 550, size: 30, }, blueMatter),
        new Force(20, 90 * _deg)
    ),
    new Body(
        Object.assign({ x: 650, y: 550, size: 30, }, blueMatter),
        new Force(10, 270 * _deg)
    ),
]

bluePlanets[0].tick = function() {

    let totalEnergyInSystem = 0;
    (this as Body).world.bodies.forEach(body => {
        totalEnergyInSystem += body.momentum.magnitude
    })

    console.log({totalEnergyInSystem})
}

const squareTestWorld = new World([
    ...bluePlanets,
    bigWhiteSquare,
    litteWhiteSquare,
    redPlanet,
    greenPlanet,
], {
    height: 800,
    width: 800,
    airDensity: 0,
    gravitationalConstant: 0,
    bodiesExertGravity: false,
    minimumMassToExertGravity: 1000,
    hasWrappingEdges: true,
    name: "squareTestWorld",
});


export { squareTestWorld }