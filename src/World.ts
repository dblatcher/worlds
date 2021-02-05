import { Thing } from './Thing'

class World {
    gravity: number
    things: Thing[]
    constructor(gravity: number, things: Thing[]) {
        this.gravity = gravity
        this.things = things

        things.forEach(thing => {
            thing.world = this
        })
    }

    get report() {
        return `The local gravity is ${this.gravity}. There are ${this.things.length} things.`
    }
}

export { World }