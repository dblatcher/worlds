import { Fluid, Force } from "../..";
import { _360deg, _90deg } from "../../geometry";
import { Thing } from "../../Thing";
import { World } from "../../World";



const water = new Fluid({
    volume: 12000000,
    color: 'rgba(0,50,250,.5)',
    density: 1,
})

const thingInAir = new Thing({
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