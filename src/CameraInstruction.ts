import { Force } from "./Force"
import { normaliseHeading, _90deg } from "./geometry"
import { Body } from "./Body"
import { ViewPort } from "./ViewPort"

class CameraInstruction {
    constructor(config:{}){

    }

    focusViewPort(viewPort: ViewPort) {

    }
}

class CameraFollowInstruction extends CameraInstruction {
    body: Body
    followHeading: boolean
    magnify: number
    leadDistance: number


    constructor(config: {
        body: Body
        followHeading?: boolean
        magnify?: number
        leadDistance?: number
    }) {
        super (config)
        this.body = config.body
        this.followHeading = config.followHeading || false
        this.magnify = config.magnify || 1
        this.leadDistance = config.leadDistance || 0
    }

    focusViewPort(viewPort: ViewPort) {
        if (!viewPort.world.bodies.includes(this.body)) { return }

        const targetPoint = { x: this.body.data.x, y: this.body.data.y }

        if (this.leadDistance) {
            const leadingVector = new Force((this.leadDistance/this.magnify), this.body.data.heading)
            targetPoint.x += leadingVector.vectorX
            targetPoint.y += leadingVector.vectorY
        }

        if (this.followHeading) {
            viewPort.rotate = normaliseHeading( _90deg * 2 - this.body.data.heading)
        }

        viewPort.focusOn(targetPoint, false, this.magnify)
    }

}


export {CameraInstruction, CameraFollowInstruction}