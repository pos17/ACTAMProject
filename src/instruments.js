import * as Tone from 'tone'

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
        verb.toDestination();

        this.pad = pad
        this.filter = filter
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
        //var volume = -15;
        var lead = new Tone.PolySynth(Tone.Synth);
        lead.set({envelope: {
            attack: '8n',
            decay: '16n',
            sustain: '0.1',
            release: '16n'
        },
        
        oscillator: {
            type: 'sine2'
        },

        volume: "-10"//volume.toString(),
        })
        /*
        var lead = new Tone.Synth({
            envelope: {
                attack: '4n',
                decay: '8n',
                sustain: '0.6',
                release: '4n'
            },
            
            oscillator: {
                type: 'sine2'
            },

            volume: volume.toString(),
        });
        */
        var filter = new Tone.Filter({
            frequency: '1500hz',
            type: 'lowpass',
            rolloff: '-24db'
        })

        //var dly = new Tone.PingPongDelay('4n', 0.2);

        var verb = new Tone.Reverb({
            decay: '4',
        })

        var amp = new Tone.Gain(0.8)

        lead.chain(filter);
        lead.chain(filter, /*dly,*/ verb, amp)
        filter.toDestination();
        amp.toDestination();
        // lead.chain(verb, amp).toDestination()

        this.lead = lead;
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.lead.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.lead.volume.value = volValue
    }
}

module.exports = {
    Kick: Kick,
    Snare: Snare,
    HiHatClosed: HiHatClosed,
    HiHatOpen: HiHatOpen,   
    Pad: Pad,
    Lead: Lead,
}