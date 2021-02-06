import * as Geometry from './geometry'

class Force {
    magnitude: number
    direction: number
    constructor(magnitude: number, direction: number) {
        this.magnitude = magnitude
        this.direction = direction
    }

    get vectorX() { return Geometry.getVectorX(this.magnitude, this.direction) }
    get vectorY() { return Geometry.getVectorY(this.magnitude, this.direction) }

    static fromVector(x: number, y: number) {
        return new Force(Geometry.getDistance(x,y), Geometry.getDirection(x,y));
    }
}


export { Force }