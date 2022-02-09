import * as Tone from 'tone'
import { getSample} from "./firebase.js";

import { Freeverb } from 'tone';
buffer1 = new Tone.Buffer()
buffer2 = new Tone.Buffer()
buffer3 = new Tone.Buffer()
buffer4 = new Tone.Buffer()
class Kick {
    constructor () {
        var kick = new Tone.MembraneSynth({
            envelope: {
                attack: 0.01,
                decay: 0.01,
                sustain: 0.3,
                release: 0.2
            },
            frequency: 50,
        }).toDestination();
        this.kick = kick;
    }

    trigger(time, velocity) {
        this.kick.triggerAttackRelease("C1", "8n", time, velocity)
        // console.log("kicktime")
    }
}

class Snare {
    constructor () {
        var snare = new Tone.NoiseSynth({
            noise: {
                type: 'pink'
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.1,
                release: 0.1
            },
        })

        var filter = new Tone.Filter({
            frequency: 15000,
            type: "lowpass",
        }).toDestination()

        var gain = new Tone.Gain({
            gain: 3,
        });

        var freqEnv = new Tone.FrequencyEnvelope({
            attack: 0,
            decay: 0.01,
            sustain: 0.5,
            release: 0.2,
            baseFrequency: "10000hz",
            octaves: -2,
        }).connect(filter.frequency)

        snare.chain(gain, filter);        

        this.env = freqEnv;
        this.snare = snare;
    }

    trigger(time, velocity) {
        this.env.triggerAttackRelease("8n", time, velocity);
        this.snare.triggerAttackRelease("8n", time, velocity);
        // console.log("snaretime")
    }
}

class HiHatClosed { 
    constructor () {
        var hihat = new Tone.NoiseSynth({
            volume: -5,
            envelope: {
                attack: 0,
                decay: 0,
                sustain: 0.4,
                release:0.1
            },
        }
        );

        var filter =  new Tone.Filter({
            frequency: 5000,
            type: "highpass",
            rolloff: -24,
        }).toDestination();

        hihat.connect(filter);
        this.hihat = hihat;
    }

    trigger (time, velocity) {
        this.hihat.triggerAttackRelease(0.01, time, velocity)
    }
}

class HiHatOpen {
    constructor () {
        var hihat = new Tone.NoiseSynth({
            volume: -5,
            envelope: {
                attack: 0,
                decay: 0,
                sustain: 0.4,
                release:0.02
            },
        }
        );

        var filter =  new Tone.Filter({
            frequency: 3000,
            type: "highpass",
            rolloff: -24,
        }).toDestination();

        hihat.connect(filter);
        this.hihat = hihat;
    }

    trigger (time, velocity) {
        this.hihat.triggerAttackRelease(0.1 ,time, velocity)
    }
}

class Pad {
    constructor(){
        var pad = new Tone.PolySynth(Tone.Synth);
        pad.set({
            oscillator: {
                type: 'triangle',
            },

            volume: '-25',
            
            envelope: {
                attack: '4n',
                decay: '8n',
                sustain: '0.5',
                release:  '2n'
            }
        })

        var filter = new Tone.Filter({
            frequency: '1000Hz',
            type: 'lowpass',
            rolloff: '-24db'
        })

        var phaser = new Tone.Phaser({
            baseFrequency: 500,
            frequency: '0.2hz',
            octaves: '3',
        })

        var verb = new Tone.Reverb({
            decay: '3',
        })

        pad.chain(filter, phaser, verb);
        this.pad = pad
        this.filter = filter
        this.verb = verb 
    }

    connect(node) {
        this.verb.connect(node)
    }

    triggerAttackRelease(notes, duration, time, velocity) {
        this.pad.triggerAttackRelease(notes, duration, time, velocity)
    }
    setVolume(volValue) {
        this.pad.volume.value = volValue
    }

}

class Lead {
    constructor() {
        var instr = new Tone.PolySynth(Tone.Synth);
        instr.set({envelope: {
            attack: '8n',
            decay: '16n',
            sustain: '0.1',
            release: '16n'
        },
        
        oscillator: {
            type: 'sine2'
        },

        volume: "-10"
        })
        var filter = new Tone.Filter({
            frequency: '1500hz',
            type: 'lowpass',
            rolloff: '-24db'
        })

        var dly = new Tone.PingPongDelay('4n', 0.2);
        dly.wet.value = 0.7
        var verb = new Tone.Reverb({
            decay: '4'
        })
        verb.wet.value = 0.5
        var amp = new Tone.Gain(0.8)

        instr.chain(filter, dly, verb, amp)
        this.amp = amp
        this.instr = instr;
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.instr.triggerAttackRelease(note, duration, time, velocity)
    }

    connect(node) {
        this.amp.connect(node)
    }

    setVolume(volValue) {
        this.instr.volume.value = volValue
    }
}

class Synth {
    constructor() {
        var instr = new Tone.PolySynth(Tone.Synth);
        
        var amp = new Tone.Gain()
        instr.chain(amp)
        this.instr = instr;
        this.amp=amp
    }    
    connect(node) {
        this.instr.connect(node)
    }
    triggerAttackRelease(note, duration, time, velocity) {
        this.instr.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.instr.volume.value = volValue
    }
}

class Bell {
    constructor () {
        var synth = new Tone.DuoSynth()
        var dly = new Tone.FeedbackDelay()
        var verb = new Tone.Reverb()

        synth.set({
            voice0: {
                envelope: {
                    attack: 0,
                    attackCurve: 'linear',
                    decay: 1.241,
                    decayCurve: "exponential",
                    sustain: 0,
                    release: 1.89,
                },
            },
            voice1: {
                envelope: {
                    attack: 0,
                    attackCurve: 'linear',
                    decay: 1.241,
                    decayCurve: "exponential",
                    sustain: 0,
                    release: 1.89,
                },
            },
            harmonicity: 2,
            vibratoAmount: 0,
        });
        synth.voice0.oscillator.type = 'sine2'
        synth.voice1.oscillator.type = 'sine3'
        synth.voice1.volume.value = -20;
        synth.volume.value = -6 

        dly.set({
            delayTime: '4n.',
            feedback: 0.3,
            wet: 0.08,
            
        })

        verb.set({
            decay: 4,
            // preDelay: 0.67,
            wet: 0.2,
        })

        synth.chain(dly, verb, Tone.Destination)
    
        this.synth = synth;

    }

    triggerAttack(note, time, velocity) {
        this.synth.triggerAttackRelease(note, "8n", time, velocity)
    }

    setVolume(volValue) {
        this.synth.volume.value = volValue
    }

    connect(node) {
        this.synth.disconnect(Tone.Destination)
        this.synth.connect(node)
    }
}

class Sitar {
    constructor(aSitar) {
        this.sitar = aSitar
    }
    static async build() {
        await Tone.loaded()
        let C3 = await getSample("Sitar","C3.mp3");
        let G3 = await getSample("Sitar","G3.mp3");
        let C4 = await getSample("Sitar","C4.mp3");
        let G4 = await getSample("Sitar","G4.mp3");
        //await buffer1.load(C3)
        //await buffer1.load(G3)
        //await buffer1.load(C4)
        //await buffer1.load(G4)
        let sitar = new Tone.Sampler({
            urls: {
                C3: C3,
                G3: G3,
                C4: C4,
                G4: G4,
            },
            onload: () => {
                sitar.triggerAttackRelease(["C3", "E3", "G3", "B3"], 0.5);
            }
        }).toDestination();
        console.log("not yet loaded")
        await Tone.loaded()
        console.log("loaded")
        return new Sitar(sitar)
    }

    triggerAttack(note, time, velocity) {
        this.sitar.triggerAttack(note, time, velocity)
    }

    loaded(){
        return this.sitar.loaded
    }

}


class Marimba {
    constructor(){
        var synthTone = new Tone.DuoSynth()
        var synthPulse = new Tone.Synth()
        var dist = new Tone.Distortion({
            distortion: 0.5,
            wet: 0.5
        })
        var trim = new Tone.Volume(-10)
        var filterLP = new Tone.Filter({
            frequency: "25z00Hz",
            type: 'lowpass',
            rolloff: -24,
        })
        var filterHP = new Tone.Filter({
            frequency: '170Hz',
            type: 'highpass',
            rolloff: -48
        })
        var chorus = new Tone.Chorus({
            frequency: 0.2,
            delayTime: 20,
            depth: 1,
            wet: 1
        })
        var dly = new Tone.FeedbackDelay({
            delayTime: '8n.',
            feedback: 0.2,
            wet: 0.005
        })
        var volume = new Tone.Volume(0)
        var merge = new Tone.Merge()
        var mono = new Tone.Mono()

        synthTone.set({
            // low voice
            voice1: {
                envelope: {
                    attack: 0,
                    decay: 0.5,
                    sustain: 0,
                    release: 0.19,
                },
                oscillator: {
                    type: 'triangle',
                    volume: -7.82
                },
            },
            // high voice
            voice0: {
                envelope: {
                    attack: 0,
                    decay: 0.3,
                    sustain: 0,
                    release: 0.19,
                },
                oscillator: {
                    type: 'triangle3',
                    volume: -8.62
                },
                
            },
            harmonicity: 0.5,
            vibratoAmount: 0.1,
            vibratoRate: "0.5hz"
        })

        synthPulse.set({
            detune: 1200,
            envelope: {
                attack: 0,
                decay: 0.1,
                sustain: 0,
                release: 0
            },
            oscillator: {
                type: 'sine2',
            },
            volume: -18,
        });

        synthTone.chain(dist, trim, filterLP).connect(merge, 0, 0)
        synthPulse.connect(merge, 0, 1)
        merge.connect(mono)
        mono.chain(filterHP, chorus, dly, volume, Tone.Destination)

        this.volume = volume;
        this.lastNode = volume;
        this.synthTone = synthTone;
        this.synthPulse = synthPulse;

    };

    triggerAttack(note, time, velocity){
        this.synthPulse.triggerAttack(note, time, velocity);
        this.synthTone.triggerAttack(note, time, velocity);
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

}

class Guitar {
    constructor(){
        const string = new Tone.PluckSynth({
            dampening: 700,
            release: 1,
            resonance: 0.8,
        })
        const volume = new Tone.Volume(0)


        string.chain(volume, Tone.Destination)
        this.volume = volume
        this.lastNode = volume
        this.string = string
    }

    triggerAttack(note, time, velocity){
        this.string.triggerAttack(note, time, velocity);
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }
}

module.exports = {
    Kick: Kick,
    Snare: Snare,
    HiHatClosed: HiHatClosed,
    HiHatOpen: HiHatOpen,   
    Pad: Pad,
    Lead: Lead,
    Synth: Synth,
    Bell: Bell,
    Sitar: Sitar,
    Marimba: Marimba,
    Guitar: Guitar,
}