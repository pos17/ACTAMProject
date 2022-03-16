import * as Tone from 'tone'
import { getSample} from "./firebase.js";

import { DuoSynth, Freeverb, LFO } from 'tone';
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

class Synth1 {
    constructor (){

        const synth = new Tone.PolySynth(Tone.DuoSynth)
        synth.set({
            voice0: {
                envelope: {
                    attack: 1,
                    decay: 1,
                    sustain: 0.4,
                    release: 0.500
                },
                oscillator: {
                    type: 'sine',
                    volume: -10
                }
            },
            voice1: {
                envelope: {
                    attack: 1,
                    decay: 1,
                    sustain: 0.4,
                    release: 0.500
                },
                oscillator: {
                    type: 'sine',
                    volume: 0
                }
            },
            harmonicity: 2,
            vibratoAmount: 0.4,
            vibratoRate: "8n"
        })
        const saw = new Tone.PolySynth(Tone.Synth)
        saw.set({
            envelope: {
                attack: 1,
                decay: 1,
                sustain: 0.4,
                release: 0.500
            },
            oscillator: {
                type: 'sawtooth'
            },
            volume: -20,
        })
        const merge = new Tone.Merge()
        const mono = new Tone.Mono()
        const phaser = new Tone.Phaser({
            frequency: '0.1Hz',
            octaves: 1,
            baseFrequency: '440Hz',
            wet: 1
        })
        const filter = new Tone.Filter({
            type: 'lowpass',
            frequency: '350Hz',
            rolloff: -48
        })
        const lfo = new Tone.LFO({
            min: 320,
            max: 380,
            frequency: '4n',
        })
        const dly = new Tone.FeedbackDelay({
            delayTime: '8n',
            feedback: 0.1,
            wet: 0.2
        })
        const tremolo = new Tone.Tremolo({
            type: 'sine',
            frequency: '8n',
            depth: 0.45,
            wet: 1,
        })
        const volume = new Tone.Volume()

        synth.connect(merge, 0, 0)
        saw.connect(merge, 0, 1)

        merge.chain(mono, phaser, filter, dly, tremolo, volume, Tone.Destination)

        lfo.connect(filter.frequency)

        this.synth1 = synth
        this.synth2 = saw
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

class Synth2 {
    constructor() {
        const synth1 = new Tone.PolySynth(Tone.DuoSynth)
        synth1.set({
            voice0: {
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                },
                oscillator: {
                    type: 'sawtooth',
                    volume: -30
                }
            },
            voice1: {
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                },
                oscillator: {
                    type: 'triangle',
                    volume: 0
                }
            },
            harmonicity: 1,
            vibratoAmount: 0
        })
        const dly = new Tone.FeedbackDelay({
            delayTime: '16n.',
            feedback: 0.2,
            wet: 0.06
        })
        const tremolo = new Tone.Tremolo({
            type: 'sine',
            frequency: '16n',
            depth: 1,
            wet: 0.5,
        })
        const volume = new Tone.Volume()

        synth1.chain(tremolo, dly, volume, Tone.Destination)

        this.synth1 = synth1
        this.volume = volume
        this.lastNode = volume

    }
    //FIXME: too much latency on load
    triggerAttackRelease(chord, duration, time, velocity) {
        var playrate = 3
        var arpNoteDuration = (4*Math.pow(2, (playrate-1))).toString() + 'n'
        console.log(arpNoteDuration);
        
        const pattern = new Tone.Pattern((aTime, note)=>{
            this.synth1.triggerAttackRelease(note, arpNoteDuration, aTime, velocity)
        }, chord, 'upDown').start(time)

        console.log(pattern.state);
        pattern.playbackRate = playrate
        
        pattern.stop(time+duration)
        console.log(pattern.state);
        // pattern.dispose()
    }

    culo(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

    get() {
        console.log(this.synth1.get())
    }
}

class Synth3 {
    constructor (){

        const synth1 = new Tone.PolySynth(Tone.DuoSynth)
        synth1.set({
            voice0: {
                envelope: {
                    attack: 1.479,
                    decay: 0.001,
                    sustain: 0,
                    release: 0
                },
                oscillator: {
                    type: 'sine',
                    volume: -0
                }
            },
            voice1: {
                envelope: {
                    attack: 1.479,
                    decay: 0.001,
                    sustain: 0,
                    release: 0
                },
                oscillator: {
                    type: 'fatsquare',
                    volume: -20
                },
            },
            volume: -8,
            harmonicity: 1,
            vibratoAmount: 0,
        })

        const synth2 = new Tone.PolySynth(Tone.DuoSynth)
        synth2.set({
            voice0: {
                envelope: {
                    attack: 0,
                    decay: 0.099,
                    sustain: 0,
                    release: 0
                },
                oscillator: {
                    type: 'sine',
                    volume: 0
                },
            },
            voice1: {
                envelope: {
                    attack: 0,
                    decay: 0.099,
                    sustain: 0,
                    release: 0
                },
                oscillator: {
                    type: 'sine',
                    volume: -10
                }
            },
            harmonicity: 2, 
            detune: 1200,
            volume: -10
        })

        const merge = new Tone.Merge()
        const mono = new Tone.Mono()
        
        const env = new Tone.FrequencyEnvelope({
            attack: 1.479,
            decay: 0.001,
            sustain: 0,
            release: 0,
            baseFrequency: '1700hz',
            octaves: 3,

        })

        const dly = new Tone.FeedbackDelay({
            delayTime: '8n.',
            feedback: 0.2,
            wet: 0.3
        })

        const chorus = new Tone.Chorus({
            frequency: '0.2Hz',
            delayTime: 13.25,
            depth: 1,
            wet: 1
        })

        const filter1 = new Tone.Filter({
            type: 'lowpass',
            frequency: '1700Hz',
            rolloff: -12
        })

        const filter2 = new Tone.Filter({
            type: 'highpass',
            frequency: '200Hz',
            rolloff: -12
        })
        
        const volume = new Tone.Volume()

        env.connect(filter1.frequency)

        synth1.connect(merge, 0, 0)
        synth2.connect(merge, 0, 1)

        merge.chain(mono, dly, chorus, filter1, filter2, volume, Tone.Destination)

        this.synth1 = synth1
        this.synth2 = synth2
        this.env = env
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
        this.synth2.triggerAttackRelease(note, duration, time, velocity)
        this.env.triggerAttackRelease(duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    } 
}

class Synth4 {
    constructor() {
        const synth = new Tone.PolySynth()
        synth.set({
            envelope: {
                attack: 0,
                decay: 0.367,
                sustain: 0,
                release: 0.008
            },
            oscillator: {
                type: 'sine'
            },  
            volume: -18,
        })
        const dly = new Tone.FeedbackDelay({
            delayTime: '8n.',
            feedback: 0.2,
            wet: 0.35
        })
        const phaser = new Tone.Phaser({
            frequency: '1n.',
            baseFrequency: '1100hz',
            stages: 6,
            octaves: 1,
            wet: 0.23
        })
        const volume = new Tone.Volume()

        synth.chain(dly, phaser, volume, Tone.Destination)

        this.synth1 = synth
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
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
    // Pad: Pad,
    
    // Synth: Synth,
    
    /* LEADS */
    Bell: Bell,   // mountain
    Lead: Lead,   // city   
    Sitar: Sitar, // desert
    Marimba: Marimba, // sea

    /* BASS */
    Bass1: Bass1, // mountain
    Bass2: Bass2, // city
    Bass3: Bass3, // desert
    Bass4: Bass4, // sea

    /* PADS */
    Synth1: Synth1, //mountain
    Synth2: Synth2, // city
    Synth3: Synth3, // desert
    Synth4: Synth4, // sea
}