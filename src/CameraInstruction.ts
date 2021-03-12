import { Force } from "./Force"
import { normaliseHeading, _90deg } from "./geometry"
import { Thing } from "./Thing"
import { ViewPort } from "./ViewPort"

class CameraInstruction {
    constructor(config:{}){

    }

    focusViewPort(viewPort: ViewPort) {

    }
}

class CameraFollowInstruction extends CameraInstruction {
    thing: Thing
    followHeading: boolean
    magnify: number
    leadDistance: number


    constructor(config: {
        thing: Thing
        followHeading?: boolean
        magnify?: number
        leadDistance?: number
    }) {
        super (config)
        this.thing = config.thing
        this.followHeading = config.followHeading || true
        this.magnify = config.magnify || 1
        this.leadDistance = config.leadDistance || 0
    }

    focusViewPort(viewPort: ViewPort) {
        if (!viewPort.world.things.includes(this.thing)) { return }

        const targetPoint = { x: this.thing.data.x, y: this.thing.data.y }

        if (this.leadDistance) {
            const leadingVector = new Force((this.leadDistance/this.magnify), this.thing.data.heading)
            targetPoint.x += leadingVector.vectorX
            targetPoint.y += leadingVector.vectorY
        }

        if (this.followHeading) {
            viewPort.rotate = normaliseHeading( _90deg * 2 - this.thing.data.heading)
        }

        viewPort.focusOn(targetPoint, false, this.magnify)
    }

}


export {CameraInstruction, CameraFollowInstruction}