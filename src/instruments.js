import * as Tone from 'tone'
import { getSample} from "./firebase.js";

import { Freeverb, LFO } from 'tone';
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

class Marimba {
    constructor(){
        var synthTone = new Tone.DuoSynth()
        var synthPulse = new Tone.Synth()
        var dist = new Tone.Distortion(0.63)
        var trim = new Tone.Volume(-10)
        var filterLP = new Tone.Filter({
            frequency: "4437Hz",
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
            delayTime: 0.013,
            depth: 1
        })
        var dly = new Tone.FeedbackDelay({
            delayTime: '8n.',
            feedback: 0.1,
            wet: 0.05
        })

        synthTone.set({
            voice1: {
                envelope: {
                    attack: 0,
                    decay: 0.5,
                    sustain: 0,
                    release: 0.19,
                },
                oscillator: {
                    type: 'sine3',
                    volume: -3.82
                },
            
            },
            voice0: {
                envelope: {
                    attack: 0,
                    decay: 0.5,
                    sustain: 0,
                    release: 0.19,
                },
                oscillator: {
                    type: 'triangle',
                    volume: -4.62
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
                decay: 0.01,
                sustain: 0,
                release: 0
            },
            oscillator: {
                type: 'sine2',
                volume: -10,
            }
        });

        synthTone.chain(dist, trim, filterLP, filterHP, chorus, dly, Tone.Destination)
        synthPulse.chain(filterHP, chorus, dly, Tone.Destination)


        this.dly = dly
        this.synthTone = synthTone;
        this.synthPulse = synthPulse;

    };

    triggerAttack(note, time, velocity){
        this.synthPulse.triggerAttack(note, time, velocity);
        this.synthTone.triggerAttack(note, time, velocity);
    }

    setVolume(volValue) {
        this.synthPulse.volume.value = volValue
        this.synthTone.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

}

class Sitar {
    constructor(){
        const string = new Tone.PluckSynth({
            attackNoise: 5,
            dampening: 1000,
            release: 1.5,
            resonance: 0.98,
            volume: 0
        })
        
        const toneSynth = new Tone.PolySynth(Tone.Synth)
        toneSynth.set({
            volume: -40,
            envelope: {
                attack: 0.05,
                decay: 1,
                decayCurve: 'linear',
                sustain: 0,
                release: 1.5
            },
            detune: 1220,
            oscillator: {
                type: 'sine',
                partialCount: 5,
                partials: [0, 0.2, 1, 0, 1]
            }
        })

        const filterLP = new Tone.Filter({
            frequency: '700Hz',
            type: 'lowpass',
            rolloff: -24,
        })
        const chorus = new Tone.Chorus({
            frequency: 0.2,
            delayTime: 20,
            depth: 1,
            wet: 1
        })
        const merge = new Tone.Merge()
        const mono = new Tone.Mono()
        const vibr = new Tone.Vibrato({
            frequency: '0.6Hz',
            depth: 1,
            wet: 0.4
        })
        const dly = new Tone.PingPongDelay({
            delayTime: '8n.',
            feedback: 0.1,
            wet: 0.1,
        })
        const verb = new Tone.Reverb({
            decay: 2.5,
            wet: 0.2,

        })
        const volume = new Tone.Volume(+5)

        string.connect(merge, 0, 0)
        toneSynth.connect(filterLP).connect(merge, 0, 1)

        merge.chain(mono, vibr, chorus, dly, verb, volume, Tone.Destination)

        this.volume = volume
        this.lastNode = volume
        this.string = string
        this.toneSynth = toneSynth
    }

    triggerAttack(note, time, velocity){
        this.string.triggerAttack(note, time, velocity);
        this.toneSynth.triggerAttackRelease(note, '8n', time, velocity);
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }
}

class Bass1 {
    constructor(){
        const bass = new Tone.DuoSynth({
            voice0: {
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.0012,
                    decay: 0.136,
                    sustain: 0.5,
                    release: 0.557
                }
            },
            voice1: {
                oscillator: {
                    type: 'sine',
                    volume: -6
                },
                envelope: {
                    attack: 0.0012,
                    decay: 0.136,
                    sustain: 0.5,
                    release: 0.557
                }
            },
            harmonicity: 2,
            vibratoAmount: 0
        })

        const volume= new Tone.Volume()

        bass.chain(volume, Tone.Destination)

        this.synth = bass
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    } 

}

class Bass2 {
    constructor(){
        const bass = new Tone.DuoSynth({
            //high voice
            voice0: {
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            // low voice
            voice1: {
                oscillator: {
                    type: 'sawtooth',
                    volume: -18
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            harmonicity: 0.5,
            vibratoAmount: 0
        })

        const filter =  new Tone.Filter({
            frequency: '2000hz',
            rolloff: -12,
            type: 'lowpass'
        })

        const volume= new Tone.Volume()

        bass.chain(filter, volume, Tone.Destination)

        this.synth = bass
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    } 

}

class Bass3 {
    constructor(){
        const bass = new Tone.DuoSynth({
            //high voice
            voice0: {
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            // low voice
            voice1: {
                oscillator: {
                    type: 'square',
                    volume: -18
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            harmonicity: 1,
            vibratoAmount: 0
        })

        const bass2 = new Tone.DuoSynth({
            harmonicity: 0.5,
            //voice high
            voice0: {
                oscillator: {
                    type: 'sawtooth',
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            //voice low
            voice1: {
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            volume: -15,
        })

        const filter =  new Tone.Filter({
            frequency: '2000hz',
            rolloff: -12,
            type: 'lowpass'
        })

        const tremolo = new Tone.Tremolo({
            frequency: '16n',
            depth: 1,
            type: 'square'
        })

        const merge = new Tone.Merge()
        const mono = new Tone.Mono()
        const volume= new Tone.Volume()

        bass.connect(merge, 0, 0)
        bass2.connect(merge, 0, 1)
        merge.chain(mono, tremolo, filter, volume, Tone.Destination)

        this.synth1 = bass
        this.synth2 = bass2
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
        this.synth2.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    } 

}

class Bass4 {
    constructor(){
        const bass = new Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.003,
                decay: 0.5,
                sustain: 0.1,
                release: 0.65
            }
        })

        const volume= new Tone.Volume()

        bass.chain(volume, Tone.Destination)

        this.synth = bass
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth.triggerAttackRelease(note, duration, time, velocity)
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
    Bass1: Bass1, // mountain
    Bass2: Bass2, // city
    Bass3: Bass3, // desert
    Bass4: Bass4, // sea
}