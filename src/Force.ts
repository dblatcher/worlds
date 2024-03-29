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

    get vector() { return { x: this.vectorX, y: this.vectorY } }

    static fromVector(x: number, y: number) {
        return new Force(Geometry.getMagnitude(x, y), Geometry.getDirection(x, y));
    }

    static combine(forces: Force[]) {
        let totalX = 0, totalY = 0;
        forces.forEach(force => {
            totalX += force.vectorX
            totalY += force.vectorY
        })
        return new Force(Geometry.getMagnitude(totalX, totalY), Geometry.getDirection(totalX, totalY))
    }

    static get none() {
        return new Force(0,0);
    }
}


export { Force }