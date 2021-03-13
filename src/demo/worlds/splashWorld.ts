import { Fluid, Force } from "../..";
import { _360deg, _90deg } from "../../geometry";
import { Thing } from "../../Thing";
import { World } from "../../World";



const water = new Fluid({
    volume: 12000000,
    color: 'rgba(0,50,250,.5)',
    density: 1,
})

const thing = new Thing({
    size: 300,
    x: 10, y: 50,
    density: 2,
    elasticity: .5,
}, new Force(15, _90deg))

const world = new World([
    water,
    thing,
], {
    width: 6000,
    height: 5000,
    airDensity: .1,
    gravitationalConstant: 1,
    globalGravityForce: new Force(1, 0),
    hasHardEdges: true,
})

export { world }