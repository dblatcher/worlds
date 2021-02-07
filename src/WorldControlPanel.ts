import { World } from './World'

class WorldControlPanel {
    world: World
    reportElement: HTMLElement
    constructor(world: World) {
        this.world = world
    }

    updateReport() {
        if (!this.reportElement) {return}
        this.reportElement.innerText = this.world.report
    }

    makeTimeSection() {
        const timeSection = document.createElement('section')
        timeSection.innerText = "time:"
        const startButton = document.createElement('button')
        startButton.innerText = "start"
        const stopButton = document.createElement('button')
        stopButton.innerText = "stop"

        startButton.addEventListener('click', () => {
            this.world.ticksPerSecond = 20
            this.updateReport()
        })

        stopButton.addEventListener('click', () => {
            this.world.ticksPerSecond = 0
            this.updateReport()
        })

        timeSection.appendChild(startButton)
        timeSection.appendChild(stopButton)

        return timeSection
    }

    makeGravitySection() {
        const gravitySection = document.createElement('section')
        gravitySection.innerText = "gravity:"
        const gravityUpButton = document.createElement('button')
        gravityUpButton.innerText = "up"
        const gravityDownButton = document.createElement('button')
        gravityDownButton.innerText = "down"

        gravitySection.appendChild(gravityDownButton)
        gravitySection.appendChild(gravityUpButton)

        gravityDownButton.addEventListener('click', () => {
            this.world.gravitationalConstant -= .1
            this.updateReport()
        })

        gravityUpButton.addEventListener('click', () => {
            this.world.gravitationalConstant += .1
            this.updateReport()
        })


        return gravitySection
    }

    makeElement() {
        const container = document.createElement('article')

        const reportLine = document.createElement('p')
        reportLine.innerText = this.world.report
        container.appendChild(reportLine)
        this.reportElement = reportLine

        container.appendChild(this.makeTimeSection())
        container.appendChild(this.makeGravitySection())

        container.style.position = 'fixed'
        container.style.backgroundColor = 'red'

        return container
    }
}

export { WorldControlPanel }