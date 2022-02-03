import * as Tone from 'tone'
import { Freeverb } from 'tone';

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
        this.synth.connect(node)
    }
}

class Sitar {
    constructor() {
        var sitar = new Tone.Sampler().toDestination()
        
        sitar.set({
            // baseUrl: ,
            urls: {
                C3: 'C3.mp3',
                G3: 'G3.mp3',
                C4: 'C4.mp3',
                G4: 'G4.mp3',
            },
            onload: ()=>{
                console.log("L O A D E D")
            }
        });

        this.sitar = sitar;
    }

    triggerAttack(note, time, velocity) {
        this.sitar.triggerAttack(note, time, velocity)
    }

    loaded(){
        return this.sitar.loaded
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
}