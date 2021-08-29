import { Body, Force, World } from "../../src"
import { Point } from "../../src/geometry"

const ball = {
    size: 30,
    density: 1,
    elasticity: .75,
    color: "transparent",
}
const greenBall = new Body(Object.assign({
    x: 100, y: 100, fillColor: 'green',
}, ball))

const whiteBall = new Body(Object.assign({
    x: 200, y: 100, fillColor: 'white',
}, ball))
 

function randomPoint(): Point {
    return {
        x: Math.floor(Math.random() * 600),
        y: Math.floor(Math.random() * 400),
    }
}

const redBalls: Body[] = [
    new Body(Object.assign({ ...randomPoint(), fillColor: 'red' }, ball, { size: 20 })),
    new Body(Object.assign({ ...randomPoint(), fillColor: 'red' }, ball, { size: 20 })),
    new Body(Object.assign({ ...randomPoint(), fillColor: 'red' }, ball, { size: 20 })),
    new Body(Object.assign({ ...randomPoint(), fillColor: 'red' }, ball, { size: 20 })),
]




const world = new World([
    greenBall, whiteBall, ...redBalls
], {
    width: 800,
    height: 500,
    airDensity: .5,
    gravitationalConstant: 0.05,
    globalGravityForce: new Force(0, 0),
    hasHardEdges: true,
})

export { world, greenBall, whiteBall }