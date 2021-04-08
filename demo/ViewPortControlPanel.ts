import { World } from '../src/World'
import { ViewPort } from '../src/ViewPort'

interface ViewPortControlPanelConfig {
    worldOptions?: World[]
    viewPort: ViewPort
}

class ViewPortControlPanel {

    worldOptions: World[]
    reportElement: HTMLElement
    calcTimeElement: HTMLElement
    collisionTestCountElement: HTMLElement
    viewPort: ViewPort
    constructor(config: ViewPortControlPanelConfig) {

        this.viewPort = config.viewPort
        this.worldOptions = config.worldOptions || [this.viewPort.world]

        this.handleTickReport = this.handleTickReport.bind(this)
        if (this.viewPort.world) {
            this.viewPort.world.emitter.on('tick', this.handleTickReport)
        }
    }

    updateReport() {
        if (!this.reportElement) { return }
        this.reportElement.innerText = (this.viewPort.world.name || `World`) + ":  " + this.viewPort.world.report
    }

    handleTickReport(tickReport: typeof World.TickReport) {
        this.calcTimeElement.innerText = `calctime: ${tickReport.calculationTime}`
        this.collisionTestCountElement.innerText = `collisionTests: ${tickReport.collisionTestCount}`
    }

    changeWorld(world: World) {
        if (this.viewPort.world == world) { return }

        this.viewPort.world.stopTime()
        this.viewPort.world.emitter.off('tick', this.handleTickReport)

        this.viewPort.setWorld(world, true)
        this.viewPort.reset()
        this.updateReport()

        this.viewPort.world.emitter.on('tick', this.handleTickReport)
    }

    makeTimeSection() {
        const timeSection = document.createElement('section')
        timeSection.innerText = "time:"
        const startButton = document.createElement('button')
        startButton.innerText = "start"
        const stopButton = document.createElement('button')
        stopButton.innerText = "stop"
        const slowButton = document.createElement('button')
        slowButton.innerText = "slow"

        startButton.addEventListener('click', () => {
            this.viewPort.world.ticksPerSecond = 20
            this.updateReport()
        })

        slowButton.addEventListener('click', () => {
            this.viewPort.world.ticksPerSecond = 1
            this.updateReport()
        })

        stopButton.addEventListener('click', () => {
            this.viewPort.world.ticksPerSecond = 0
            this.updateReport()
        })

        timeSection.appendChild(startButton)
        timeSection.appendChild(stopButton)
        timeSection.appendChild(slowButton)

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
            this.viewPort.world.gravitationalConstant -= .1
            this.updateReport()
        })

        gravityUpButton.addEventListener('click', () => {
            this.viewPort.world.gravitationalConstant += .1
            this.updateReport()
        })


        return gravitySection
    }

    makeWorldPickerSection() {
        const section = document.createElement('section')
        section.innerText = "change world:"

        this.worldOptions.forEach((world, index) => {
            const button = document.createElement('button')
            button.innerText = world.name || `World #${index}`

            button.addEventListener('click', () => { this.changeWorld(world) })

            section.appendChild(button)
        })

        return section
    }

    makeTickReportSection() {
        const section = document.createElement('section')

        this.collisionTestCountElement = document.createElement('p')
        this.collisionTestCountElement.classList.add('collisionTestCount')
        
        this.calcTimeElement = document.createElement('p')
        this.calcTimeElement.classList.add('calcTime')
        
        section.appendChild(this.collisionTestCountElement)
        section.appendChild(this.calcTimeElement)
        return section
    }

    makeElement() {
        const container = document.createElement('article')

        const reportLine = document.createElement('p')
        reportLine.innerText = this.viewPort.world.report
        this.reportElement = reportLine
        this.updateReport()

        container.appendChild(reportLine)
        container.appendChild(this.makeTimeSection())
        container.appendChild(this.makeGravitySection())
        container.appendChild(this.makeTickReportSection())

        if (this.worldOptions.length > 1) {
            container.appendChild(this.makeWorldPickerSection())
        }

        container.style.position = 'fixed'
        container.style.maxWidth = '15rem'
        container.style.backgroundColor = 'rgba(250,100,100,.75)'
        container.style.right = '0'
        container.style.zIndex = '5'
        container.style.padding = ".5em"


        return container
    }
}

export { ViewPortControlPanel }