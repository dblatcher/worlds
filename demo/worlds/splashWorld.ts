import { Fluid, Force } from "../../src";
import { _360deg, _90deg } from "../../src/geometry";
import { Body } from "../../src/Body";
import { World } from "../../src/World";



const water = new Fluid({
    volume: 12000000,
    color: 'rgba(0,50,250,.5)',
    density: 1,
})

const thingInAir = new Body({
    size: 300,
    x: 10, y: 50,
    density: 5,
    elasticity: .5,
}, new Force(100, _90deg))

const thingInWater = thingInAir.duplicate()
thingInWater.data.y = 3500

const world = new World([
    water,
    thingInAir,
    thingInWater,
], {
    width: 6000,
    height: 5000,
    airDensity: .1,
    gravitationalConstant: 1,
    globalGravityForce: new Force(1, 0),
    hasHardEdges: true,
})

export { world }