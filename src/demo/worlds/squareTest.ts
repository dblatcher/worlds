import { Point } from '../../geometry'
import { LinearGradientFill } from '../../GradientFill'
import { World, Thing, Force, shapes } from '../../index'


const bigWhiteSquare = new Thing({
    heading: .7,
    x: 200, y: 200,
    size: 100, density: 1,
    immobile: true,
    color: 'antiquewhite',
    shape: shapes.square,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
})

const litteWhiteSquare = new Thing({
    heading: 1,
    x: 500,
    y: 525,
    size: 20,
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

const redPlanet = new Thing({
    x: 280,
    y: 500,
    size: 50,
    density: 1,
    color: 'red',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}, new Force(15, Math.PI * 1))

const greenPlanet = new Thing({
    x: 400,
    y: 300,
    size: 50,
    density: 1,
    color: 'green',
    elasticity: .5,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}, new Force(1, Math.PI * 1.5))

const blueMatter = {
    density: 1,
    color: 'blue',
    fillColor: 'purple',
    elasticity: 1,
    headingFollowsDirection: true,
    renderHeadingIndicator: true,
}

const bluePlanets = [
    new Thing(
        Object.assign({ x: 250, y: 210, size: 10, }, blueMatter),
        new Force(0, Math.PI * 1.5)
    ),
    new Thing(
        Object.assign({ x: 250, y: 100, size: 30, }, blueMatter),
        new Force(0, Math.PI * 1.5)
    ),
    new Thing(
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
    thingsExertGravity: true,
    minimumMassToExertGravity: 1000,
    hasHardEdges: true,
    name: "squareTestWorld",
});

console.log({ bigWhiteSquare, redPlanet, bluePlanets, litteWhiteSquare })

export { squareTestWorld }