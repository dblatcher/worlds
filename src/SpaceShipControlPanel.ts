import { SpaceShip } from "./SpaceShip";

class SpaceShipControlPanel {
    spaceShip: SpaceShip
    thrustMeter?: HTMLElement

    constructor(spaceShip: SpaceShip) {
        this.spaceShip = spaceShip
    }

    updateMeter() {
        if (!this.thrustMeter) { return }
        const { thrust, maxThrust } = this.spaceShip.data
        this.thrustMeter.innerText = `${thrust} / ${maxThrust}`
    }

    throttleUp() {
        const { spaceShip } = this
        spaceShip.data.thrust += spaceShip.data.maxThrust / 10
        if (spaceShip.data.thrust > spaceShip.data.maxThrust) {
            spaceShip.data.thrust = spaceShip.data.maxThrust
        }
        this.updateMeter()
    }

    throttleDown() {
        const { spaceShip } = this
        spaceShip.data.thrust -= spaceShip.data.maxThrust / 10
        if (spaceShip.data.thrust < 0) {
            spaceShip.data.thrust = 0
        }
        this.updateMeter()
    }

    steer(amount: number) {
        const { spaceShip } = this
        spaceShip.data.heading += amount
        this.updateMeter()
    }

    create() {
        const { spaceShip } = this
        const element = document.createElement('article')

        const accelerator = document.createElement('button')
        accelerator.innerText = 'throttle'
        const brake = document.createElement('button')
        brake.innerText = 'brake'
        const leftButton = document.createElement('button')
        leftButton.innerText = '<'
        const rightButton = document.createElement('button')
        rightButton.innerText = '>'

        const thrustMeter = document.createElement('span')
        this.thrustMeter = thrustMeter
        this.updateMeter()

        accelerator.addEventListener('click', () => { this.throttleUp() })
        brake.addEventListener('click', () => { this.throttleDown() })
        leftButton.addEventListener('click', () => { this.steer(.3) })
        rightButton.addEventListener('click', () => { this.steer(-.3) })

        element.appendChild(accelerator)
        element.appendChild(brake)
        element.appendChild(leftButton)
        element.appendChild(rightButton)
        element.appendChild(thrustMeter)

        return element
    }
}

export { SpaceShipControlPanel }