import { World } from './World'
import { Thing } from './Thing'
import { Force } from './Force'

import * as Geometry from './geometry'

/**
 * Calculation the gravitational effect of one Thing on another
 * 
 * @param gravitationalConstant The gravitational constant of the world the things are in
 * @param affectedThing The Thing being pulled towards the gravity source
 * @param thing2 The gravity source
 * 
 * @return the Force exerted on the affectedThing
 */
function getGravitationalForce(gravitationalConstant: number, affectedThing: Thing, thing2: Thing) {
    if (affectedThing === thing2) { return new Force(0, 0) }

    const r = Geometry.getDistanceBetweenPoints(affectedThing.data, thing2.data);
    const magnitude = gravitationalConstant * ((affectedThing.mass * thing2.mass / Math.pow(r, 2)));
    const direction = Geometry.getHeadingFromPointToPoint(thing2.data, affectedThing.data)
    return new Force(magnitude, direction)
}

export { getGravitationalForce }