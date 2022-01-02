type SupportedAudioNode = AudioBufferSourceNode | OscillatorNode;
type SourceWithLoop = AudioBufferSourceNode | HTMLAudioElement;



class SoundControl {
    sourceNode: Readonly<SupportedAudioNode | HTMLAudioElement>
    gainNode?: Readonly<GainNode>
    whenEnded: Promise<SoundControl>

    constructor(sourceNode: SupportedAudioNode | HTMLAudioElement, gainNode?: GainNode) {
        this.sourceNode = sourceNode
        this.gainNode = gainNode

        this.whenEnded = new Promise(resolve => {
            this.sourceNode.addEventListener('ended', () => { resolve(this) })
        })
    }

    stop() {
        if (this.sourceNode instanceof HTMLAudioElement) {
            this.sourceNode.currentTime = 0
            return this.sourceNode.pause()
        }

        return (this.sourceNode as AudioBufferSourceNode | OscillatorNode).stop()
    }

    set volume(value: number) {
        if (this.sourceNode instanceof HTMLAudioElement) {
            this.sourceNode.volume = value;
            return
        }
        this.gainNode.gain.setValueAtTime(value, 0)
    }

    get volume(): number {
        if (this.sourceNode instanceof HTMLAudioElement) {
            return this.sourceNode.volume
        }
        return this.gainNode?.gain.value
    }

    set loop(value: boolean) {
        if (this.sourceNode instanceof OscillatorNode) { return }
        (this.sourceNode as SourceWithLoop).loop = value
    }

    get loop() {
        if (this.sourceNode instanceof OscillatorNode) { return undefined }
        return (this.sourceNode as SourceWithLoop).loop
    }
}

export { SoundControl }