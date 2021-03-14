import { Fluid, Force } from "../..";
import { _360deg, _90deg } from "../../geometry";
import { Thing } from "../../Thing";
import { World } from "../../World";


const ball = {
    size: 30,
    density: 1,
    elasticity: .75,
    color:"transparent",
}

const greenBall = new Thing(Object.assign({ 
    x: 10, y: 10, fillColor: 'green' 
}, ball))

const redBall = new Thing(Object.assign({ 
    x: 40, y: 150, fillColor: 'red' 
}, ball))

const blueBall = new Thing(Object.assign({ 
    x: 120, y: 130, fillColor: 'blue' 
}, ball))

const yellowBall = new Thing(Object.assign({ 
    x: 420, y: 230, fillColor: 'yellow' 
}, ball, {size:20, density: 50}))


const world = new World([
    greenBall, redBall, blueBall, yellowBall
], {
    width: 600,
    height: 400,
    airDensity: 1,
    gravitationalConstant: 0,
    hasHardEdges: true,
})

export { world }