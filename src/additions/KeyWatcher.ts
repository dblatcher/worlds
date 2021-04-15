import { TinyEmitter } from 'tiny-emitter';



class KeyWatcher extends TinyEmitter {
    _target: HTMLElement
    keysPressed: string[]
    timer: NodeJS.Timeout

    constructor(target: HTMLElement) {
        super()
        this.emitKeyDown = this.emitKeyDown.bind(this)
        this.emitKeyUp = this.emitKeyUp.bind(this)
        this.reportKeys = this.reportKeys.bind(this)
        this._target = target
        this.keysPressed = []
        target.addEventListener('keydown', this.emitKeyDown)
        target.addEventListener('keyup', this.emitKeyUp)
    }

    startReportTimer(interval: number) {
        this.timer = setInterval(this.reportKeys, interval)
    }

    reportKeys() {
        this.emit('report', this.keysPressed)
    }

    emitKeyDown(event: KeyboardEvent) {
        if (!this.keysPressed.includes(event.code)) {
            this.keysPressed.push(event.code)
        }
        this.emit('keydown', event)
    }

    emitKeyUp(event: KeyboardEvent) {
        if (this.keysPressed.includes(event.code)) {
            this.keysPressed.splice(this.keysPressed.indexOf(event.code), 1)
        }
        this.emit('keyup', event)
    }
}

export { KeyWatcher }