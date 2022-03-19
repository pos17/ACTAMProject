import { Note, Chord, Interval} from "@tonaljs/tonal";
import * as Tone from "tone"

import * as Instr from './instruments.js';
import * as MVC from "./modelViewController.js"
import { getAsset, getDocumentElement } from "./firebase.js";


initializeMyApp()

/**
 *  Function to initialize the main settings of the player 
 */
async function initializeMyApp() {

    //initialize the drawing values
    //state.isFirst = true
    // prioritize sustained playback
    //const context = new Tone.Context({ latencyHint: "playback" });
    // set this context as the global Context
    //Tone.setContext(context);
    Tone.context.lookAhead = 5;
    MVC.setNow()
    MVC.setMasterChain()
    console.log("master chain set")
    console.log(MVC.getMasterChain())
    Tone.Destination.chain(MVC.getMasterChain().compressor, MVC.getMasterChain().hiddenGain, MVC.getMasterChain().mainGain)
    console.log("master chain get")
    MVC.setLimit(40)
    MVC.increase();
    await MVC.initiateState()
    buildInstruments()
    //console.log(state.instruments)
    MVC.setLimit(90)
    MVC.orderElements()
    await createMenu()
    assignClick()
    updatePage(0)
    MVC.setLimit(100)
    //Tone.context.latencyHint = 'playback'
    console.log("i nodi")
    /*
    await MVC.generateNodes()
    console.log(MVC.generateMelody())
    let notePart = parseMelodyString("f+4 c+8 a8 e+4 c+8 a8\nd+8 e+8 cb8 d+8 db+8 bb8 g8 ab8\na4 f8 d8 g8 a8 f8 e8\neb16 g16 bb8 d+8 db+8 r8 f8 f16 g8 f16")
    console.log("notepart")
    console.log(notePart)
    addNotePartToTransport(notePart, MVC.getInstrument("Marimba")) 
    */

}

// {
//   "__idEnvStructure": "1x -> mountain, 2x -> desert, 3x -> city, 4x -> seaside, 5x -> skyelement",
//   "__idElemStructure": "x1 -> background, x2 -> landscape, x3 -> floor, x4 -> building, x5 -> shrub"
// },
/**
 * 
 * @param {bool} isFirst values that states if the function is called during the initialization 
 */
export async function propagateStateChanges(isFirst) {

    console.log("state before propagation")
    console.log(state)
    if (state.drawing.image.isChanged) {
        //TODO: adding function to reshape the image of the view 
        state.drawing.image.isChanged = false
    }

    if (state.drawing.chords.isChanged === true) {
        console.log()
        if (state.playingPartChords) {
            console.log("here I am")
            state.playingPartChords.cancel(0)
        } else {
            console.log("here I am not")
        }
        //FIXME: adding adapting loop
        Tone.Transport.loopEnd = state.drawing.loopLength;
        //console.log(state.drawing.chords.instrument)
        Object.keys(state.effects.harmony).forEach(key => {
            console.log(state.effects.harmony[key])
            state.effects.harmony[key].wet.value = 0;
        });
        for (i = 0; i < state.drawing.chords.effects.length; i++) {
            console.log(state.drawing.chords.effects[i].effect)
            console.log(state.effects.harmony)

            state.effects.harmony[state.drawing.chords.effects[i].effect].set(state.drawing.chords.effects[i].setup)
        }
        state.playingPartChords = playChordSequence(state.drawing.chords.sequence, state.key, state.instruments[state.drawing.chords.instrument], 1)
        state.playingPartChords.loopEnd = state.drawing.chords.loopLength
        state.playingPartChords.loop = true;
        state.drawing.chords.isChanged = false
    }

    if (state.drawing.melody.isChanged === true) {
        if (!isFirst) {
            state.drawing.melody.playingPart.stop()
        }
        Object.keys(state.effects.melody).forEach(key => {
            state.effects.melody[key].wet.value = 0;
        });
        for (i = 0; i < state.drawing.melody.effects.length; i++) {
            state.effects.melody[state.drawing.melody.effects[i].effect].set(state.drawing.melody.effects[i].setup)
        }

        state.drawing.melody.playingPart = addNotePartToTransport(generatePart(state.drawing.melody.sequence), state.instruments[state.drawing.melody.instrument], 0)
        state.drawing.melody.isChanged = false
    }
    console.log("state after propagation")
    console.log(state)
}



function buildInstruments() {

    //building audio channels
    bassChannel = new Tone.Channel()
    harmonyChannel = new Tone.Channel()
    melodyChannel = new Tone.Channel()
    drumChannel = new Tone.Channel()

    console.log("here I am")
    /* //build modulation effects
    state.effects.harmony.chorus = new Tone.Chorus()
    state.effects.melody.chorus = new Tone.Chorus()
    state.effects.harmony.chorus.wet.value = 0
    state.effects.melody.chorus.wet.value = 0 */


    //build time effects
    /*
   state.effects.harmony.reverb = new Tone.Reverb()
   state.effects.harmony.reverb.wet.value = 0
   state.effects.melody.reverb = await new Tone.Reverb()
   state.effects.melody.reverb.wet.value = 0
       //TODO: set correct time for delay
   state.effects.melody.delay = new Tone.PingPongDelay()
   state.effects.harmony.delay = new Tone.PingPongDelay()
   state.effects.melody.delay.wet.value = 0
   state.effects.harmony.delay.wet.value = 0
   console.log(state.effects.harmony.delay.get())
       //creating effects chain
   */
    harmonyChannel.chain(
        Tone.Destination
    )
    bassChannel.chain(
        Tone.Destination
    )
    melodyChannel.chain(
        Tone.Destination
    )
    drumChannel.chain(
        Tone.Destination
    )

    /*      building instruments         */

    /* leads */
    let bell = new Instr.Bell();
    let lead = new Instr.Lead();
    let sitar = new Instr.Sitar()
    let marimba = new Instr.Marimba();

    bell.connect(melodyChannel)
    lead.connect(melodyChannel)
    sitar.connect(melodyChannel)
    marimba.connect(melodyChannel)

    MVC.setInstrument("Bell", bell)
    MVC.setInstrument("Lead", lead)
    MVC.setInstrument("Sitar", sitar)
    MVC.setInstrument("Marimba", marimba)


    /* bass */
    let bass1 = new Instr.Bass1()
    let bass2 = new Instr.Bass2()
    let bass3 = new Instr.Bass3()
    let bass4 = new Instr.Bass4()

    bass1.connect(bassChannel)
    bass2.connect(bassChannel)
    bass3.connect(bassChannel)
    bass4.connect(bassChannel)


    MVC.setInstrument("Bass1", bass1)
    MVC.setInstrument("Bass2", bass2)
    MVC.setInstrument("Bass3", bass3)
    MVC.setInstrument("Bass4", bass4)


    /* pads */
    let synth1 = new Instr.Synth1()
    let synth2 = new Instr.Synth2()
    let synth3 = new Instr.Synth3()
    let synth4 = new Instr.Synth4()

    synth1.connect(harmonyChannel)
    synth2.connect(harmonyChannel)
    synth3.connect(harmonyChannel)
    synth4.connect(harmonyChannel)


    MVC.setInstrument("Synth1", synth1)
    MVC.setInstrument("Synth2", synth2)
    MVC.setInstrument("Synth3", synth3)
    MVC.setInstrument("Synth4", synth4)
}

export function startMusic() {
    //Tone.Transport.loop = true;
    Tone.Transport.bpm.value = 60
    Tone.Transport.start("+0.1", "0:0:0");

    MVC.setPlaying(true);
}

export function stopMusic() {
    Tone.Transport.stop();
    //Tone.Transport.cancel(0)
    MVC.setPlaying(false);
}


//FIXME some delay play/pause
function togglePlayPause() {
    if (state.isPlaying) {
        Tone.Transport.pause()
        state.isPlaying = false
        console.log(state.isPlaying)
    } else {
        Tone.Transport.start()
        state.isPlaying = true

    }
}

window.addEventListener("keydown", function (event) {
    if (event.key == "MediaPlayPause") togglePlayPause()
}, true);


/**
 * 
 * @param {*} noteSequence quantized noteSequence generated by magenta models
 * @returns 
 */
function generatePart(noteSequence) {
    console.log(noteSequence)
    //var qpm = 
    var numofnotes = noteSequence.notes.length
    var notesToTranscribe = noteSequence.notes
    var notes = []
    var stepsPerQuarter = noteSequence.quantizationInfo.stepsPerQuarter;
    for (var i = 0; i < numofnotes; i++) {
        noteFromArray = notesToTranscribe[i]
        console.log(noteFromArray.quantizedStartStep)
        var note = Note.fromMidi(noteFromArray.pitch)
        var velocity = 0.5;
        var measure = Math.floor(noteFromArray.quantizedStartStep / (4 * stepsPerQuarter))
        var quarter = Math.floor((noteFromArray.quantizedStartStep % (4 * stepsPerQuarter)) / 4)
        var sixteenth = Math.floor(noteFromArray.quantizedStartStep) - quarter * 4 - measure * 16;
        console.log(measure)
        var timeString = measure + ":" + quarter + ":" + sixteenth;
        var durationSteps = noteFromArray.quantizedEndStep - noteFromArray.quantizedStartStep
        var measureDur = Math.floor(durationSteps / (4 * stepsPerQuarter))
        var quarterDur = Math.floor((durationSteps % (4 * stepsPerQuarter)) / 4)
        var sixteenthDur = Math.floor(durationSteps) - quarterDur * 4 - measureDur * 16;
        var durationString = measureDur + ":" + quarterDur + ":" + sixteenthDur;
        var indexInput = {
            time: timeString,
            note: note,
            velocity: velocity,
            duration: durationString
        }
        notes.push(indexInput)
    }
    console.log(notes)
    return notes
}
/**
 * 
 * @param {*} melodyString 
 * @returns format {midiNote,duration,time}
 */
function parseMelodyString(melodyString) {
    let notesToRet = [];
    let barsArray = melodyString.split("\n")
    let barsNum = barsArray.length
    let barIndex = 0;
    let quarterIndex = 0;
    let sixteenthIndex = 0;
    for (let bar of barsArray) {
        notesArray = bar.split(" ")
        console.log(notesArray)
        for (let note of notesArray) {
            let noteMap = buildNoteFromString(note)
            let timeSig = barIndex + ":" + quarterIndex + ":" + sixteenthIndex
            noteMap["time"] = timeSig
            if (noteMap.note != "r") {
                notesToRet.push(noteMap)
            }
            switch (noteMap.duration) {
                case "1m":
                    barIndex = barIndex + 1;
                    break;
                case "1m.":
                    barIndex = barIndex + 1;
                    quarterIndex = quarterIndex + 2
                    break;
                case "2n":
                    quarterIndex = quarterIndex + 2;
                    break;
                case "2n.":
                    quarterIndex = quarterIndex + 3;
                    break;
                case "4n":
                    quarterIndex = quarterIndex + 1;
                    break;
                case "4n.":
                    quarterIndex = quarterIndex + 1;
                    sixteenthIndex = sixteenthIndex + 2;
                    break;
                case "8n":
                    sixteenthIndex = sixteenthIndex + 2;
                    break;
                case "8n.":
                    sixteenthIndex = sixteenthIndex + 3;
                    break;
                case "16n":
                    sixteenthIndex = sixteenthIndex + 1;
                    break;
            }

            if (sixteenthIndex >= 4) {
                let carry = sixteenthIndex % 4
                let value = Math.floor(sixteenthIndex / 4)
                quarterIndex = quarterIndex + value;
                sixteenthIndex = carry;
            }
            if (quarterIndex >= 4) {
                let carry = quarterIndex % 4
                let value = Math.floor(quarterIndex / 4)
                barIndex = barIndex + value;
                quarterIndex = carry;
            }

            console.log(noteMap)
        }

    }

    let loopValue = barIndex + ":" + quarterIndex + ":" + sixteenthIndex;
    console.log(barsArray)
    console.log(notesToRet)
    return {
        notesArray: notesToRet,
        loopValue: loopValue
    };
}

function buildNoteFromString(noteString) {
    let midiNote;
    let duration;
    let noteStr;
    let durNum;
    //find the char starting duration
    var num = /\d/;
    var firstNum = noteString.match(num);
    var numPos = noteString.indexOf(firstNum);

    //midiNote value calculation from string
    midiNote = noteString.charAt(0);
    if (midiNote != "r") {
        if (noteString.charAt(1) == "b" || noteString.charAt(1) == "#") midiNote = midiNote + noteString.charAt(1);
        let octave = 3 + (count(noteString, "+")) - (count(noteString, "-"))
        midiNote = midiNote + octave;
    } else {
        midiNote = "r"
    }
    let points = count(noteString, ".");
    let mystr = noteString.substring(numPos, noteString.length - points);
    console.log(mystr)

    switch (mystr) {
        case "1": duration = "1m"
            break;
        case "2": duration = "2n"
            break;
        case "4": duration = "4n"
            break;
        case "8": duration = "8n"
            break;
        case "16": duration = "16n"
            break;
    }

    for (let i = 0; i < points; i++) {
        duration = duration + "."
    }
    noteToRet = {
        note: midiNote,
        duration: duration
    }
    console.log(noteToRet)
    return noteToRet;
}

/**
 * counts the occurences of a character in a certain string
 * @param {} str 
 * @param {*} find 
 * @returns 
 */
function count(str, find) {
    return (str.split(find)).length - 1;
}

console.log("melody parsing")
parseMelodyString("F+4 C+8 a8 e+4 c+8 a8\nd+8 e+8 cb8 d+8 db+8 bb8 g8 ab8\na4 f8 d8 g8 a8 f8 e8\neb16 g16 bb8 d+8 db+8 r8 f8 f16 g8 f16")


/**
 * 
 * @param {*} notePart 
 * @param {*} instrument 
 * @param {*} startTime 
 * @returns 
 */

function addNotePartToTransport(notePart, instrument) {
    console.log("notePart2")
    console.log(notePart)
    const part = new Tone.Part((time, value) => {
        instrument.triggerAttack(value.note, time, 0.5)
        console.log("note: " + value.note + " ,time: " + time + " duration: " + value.duration)
    }, notePart).start(0)
    return part
}

function playChordSequence(chordsSequence, instrument) {
    console.log(instrument)
    chordsPlayed = new Tone.Part(((time, value) => {
        console.log("value to be played")
        console.log(value)

        instrument.triggerAttackRelease(value.notes, value.duration, time, 0.5)
    }), chordsSequence).start(0)
    //Tone.debug = true
    return chordsPlayed
}

function parseChordsString(chordsString) {
    chordsToRet = []
    barsArray = []
    barsArray = chordsString.split("|")
    barsArray.shift()
    barsArray.pop()

    //cleaned array
    numOfBars = barsArray.length
    console.log(barsArray)
    console.log(numOfBars)
    let barCount = 0;
    let quarterCount = 0;
    let sixteenthCount = 0;
    for (let bar of barsArray) {
        chordsBar = bar.split(" ");
        console.log(chordsBar)
        chordsBar.shift()
        chordsBar.pop()
        console.log(chordsBar)
        quarterCount = 0;
        sixteenthCount = 0;
        quarterAdd = 4 / chordsBar.length;
        console.log(quarterAdd)
        for (let aChord of chordsBar) {
            var dur;
            switch (quarterAdd) {
                case 4: dur = "1m";
                    break;
                case 2: dur = "2n";
                    break;
                case 1: dur = "4n";
                    break;
            }
            var tTime = barCount + ":" + quarterCount + ":" + sixteenthCount
            let notesArray = fromChordToNotes(aChord)
            chord = {
                notes: notesArray,
                time: tTime,
                duration: dur
            }
            quarterCount = quarterCount + quarterAdd

            chordsToRet.push(chord)
        }
        if (quarterCount >= 4) {
            quarterCount = quarterCount % 4
        }
        barCount++;
    }
    console.log(chordsToRet)
    let barLoop = barCount + ":" + quarterCount + ":" + sixteenthCount
    return {
        chordsList: chordsToRet,
        barLoop: barLoop
    }
}

console.log("testParsing")
parseChordsString("| F6 | Em7 A7 | Dm7 | Cm7 F7 |")

function fromChordToNotes(chordName) {
    var notesArray = Chord.get(chordName).notes
    var distanceFromC = Interval.distance("C", notesArray[notesArray.length - 1])
    console.log("distance from C: " + distanceFromC)
    noteOctave = 3
    for (var j = notesArray.length - 1; j >= 0; j--) {
        if (Interval.semitones(Interval.distance("C", notesArray[j])) > Interval.semitones(distanceFromC)) {
            noteOctave--;
            distanceFromC = Interval.distance("C", notesArray[j])
        }
        notesArray[j] = notesArray[j] + noteOctave

    }
    console.log(notesArray)
    return notesArray
}
/*
Tone.Transport.schedule(()=>{
  console.log("sticazzi");
  console.log("state of chords")
  console.log(state.playingPartChords.state)
  },"0:0:0")
*/

export function initMusic() {
    Tone.Transport.cancel()
    let computedMelody = parseMelodyString(MVC.getMelodyString())
    let computeChords = parseChordsString(MVC.getChordString())
    console.log(computedMelody)
    if (computeChords.barLoop != computedMelody.loopValue) {
        console.error("loop bars no consistent, melodyLoop: " + computedMelody.loopValue + ", chordsloop: " + computeChords.barLoop)
    }
    addNotePartToTransport(computedMelody.notesArray, MVC.getPlayingInstrument("melody"))
    playChordSequence(computeChords.chordsList, MVC.getPlayingInstrument("chords"))
    Tone.Transport.loopEnd = computedMelody.loopValue;
    Tone.Transport.loop = true;

}





//canvas handling



const canvasDiv = document.getElementById('canvas-div');

var factor = 4;

var canvas = document.getElementById("main-canvas")
canvas.className = "canvases";

canvas.width = 256 * factor;
canvas.height = 128 * factor;
canvasDiv.appendChild(canvas);

var ctx = canvas.getContext('2d');

//fintanto che non capisco come gira il discorso background, il bg è notturno, si cambia poi in caso 


var time0 = new Date();
var omega = 0; /* canvas angular speed */
var moonRadius = canvas.width / 1.1;

var t = Tone.Time('16m').toMilliseconds()

export async function initImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    console.log(MVC.getImageToDraw("astrumDay"))
    console.log(MVC.getImageToDraw("astrumNight"))

    console.log("passato")
    MVC.setFrameReq(window.requestAnimationFrame(countFPS))
}

function countFPS() {
    if (MVC.isPlaying()) {
        if (Date.now() - MVC.getAnimationSnap() > 1000 / MVC.getFPS()) {
            //console.log("print")
            MVC.setAnimationSnap(Date.now())
            MVC.setFrameReq(window.requestAnimationFrame(createEnvironment));
            //console.log(Model.state.framereq)
        } else {

            MVC.setFrameReq(window.requestAnimationFrame(countFPS));
            //console.log(Model.state.framereq)
        }
    }
}



function createEnvironment() {

    //const values to modify canvas elements 
    const NIGHT_START = 0.5
    const SUNRISE_START = 3.05
    const SUNRISE_END = 3.30
    const DAY_START = 4.0
    const SUNSET_START = 6.10
    const SUNSET_END = 0
    let lightOn = false
    const ALPHASTART = Math.PI * 3 / 2

    let alphaNight = 0
    let alphaSunrise = 0
    let alphaDay = 0
    let alphaSunset = 0
    let sunToDraw = 0

    var time = Date.now()

    var h = canvas.height;
    var w = canvas.width;

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false;
    var a = 5//0.5
    omega = a / t;
    let hAstra = h - MVC.getImageToDraw("floor").getNHeight() * factor - 25 * factor;
    let wAstra = w / 2 - ((MVC.getImageToDraw("astrumNight").getNWidth()) / 2 * factor)
    var angle = (ALPHASTART + omega * (time - time0.getTime()))

    let angleD = angle % (2 * Math.PI)
    let transAngle = angle % (w)
    // BACKGROUND IMAGE
    if (angleD < NIGHT_START) {
        alphaNight = 1//(1 / (NIGHT_START - SUNSET_END)) * (angleD - SUNSET_END)
        alphaSunrise = 0
        alphaSunset = 1 - (1 / (NIGHT_START - SUNSET_END)) * (angleD - SUNSET_END)
        alphaDay = 0
        lightOn = true
        sunToDraw = 1
    }
    else if (angleD < SUNRISE_START) {
        alphaNight = 1
        alphaSunrise = 0
        alphaSunset = 0
        alphaDay = 0
        lightOn = true
    } else if (angleD < SUNRISE_END) {
        alphaNight = 1 //- (1 / (SUNRISE_END - SUNRISE_START)) * (angleD - SUNRISE_START)
        alphaSunrise = (1 / (SUNRISE_END - SUNRISE_START)) * (angleD - SUNRISE_START)
        alphaSunset = 0
        alphaDay = 0
        lightOn = true
    } else if (angleD < DAY_START) {
        alphaNight = 0
        alphaSunrise = 1 //- (1 / (DAY_START - SUNRISE_END)) * (angleD - SUNRISE_END)
        alphaSunset = 0
        alphaDay = (1 / (DAY_START - SUNRISE_END)) * (angleD - SUNRISE_END)
        lightOn = false
    } else if (angleD < SUNSET_START) {
        alphaNight = 0
        alphaSunrise = 0
        alphaSunset = 0
        alphaDay = 1
        lightOn = false
    } else {
        alphaNight = 0
        alphaSunrise = 0
        alphaSunset = 1//(1 / (2 * Math.PI - SUNSET_START)) * (angleD - SUNSET_START)
        alphaDay = 1 - (1 / (2 * Math.PI - SUNSET_START)) * (angleD - SUNSET_START)
        lightOn = false
        sunToDraw = (1 / (2 * Math.PI - SUNSET_START)) * (angleD - SUNSET_START)
    }
    let background = MVC.getImageToDraw("background");
    background.drawThisImage(0, alphaNight, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(1, alphaSunrise, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(2, alphaSunset, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(3, alphaDay, lightOn, canvas.height, canvas.width, ctx, factor)


    /*
    state.assets.stars.forEach((star)=>{
        drawThisImage(star.img, star.left, star.bottom)
    })
    */
    //console.log("HereWeAre")

    // ANIMATED IMAGES
    //var s = moonRadius - Math.sqrt(Math.pow(moonRadius,2)-(Math.pow(canvas.width,2)/4))
    //var a = 2 * Math.acos(1-(s/moonRadius))

    //console.log("HereWeAre1")
    ctx.save();
    ctx.translate(Math.round(w / 2), Math.round(hAstra - 15 * factor))
    // var angle = ((a/60)*time.getSeconds()+(a/60000)*time.getMilliseconds());
    // var angle = ((2*Math.PI/6000)*time.getSeconds()) + ((2*Math.PI/100000)*time.getMilliseconds());

    //ctx.rotate(angle);

    // if(angle%(2*Math.PI) < 0.1) {
    //     Model.state.queueDay = 3
    // } else if ((angle%(2*Math.PI) > 3.11 )&&(angle%(2*Math.PI) <3.13)) {
    //     Model.state.queueDay = 1
    // }

    ctx.save()

    let moon = MVC.getImageToDraw("astrumNight")
    ctx.translate(Math.round(-wAstra * (Math.cos(angle))), Math.round(hAstra * (Math.sin(-angle))))
    ctx.translate(Math.round(-(moon.getNWidth() * factor) / 2), Math.round((moon.getNHeight() * factor) / 2))
    moon.drawThisImage(0, 1, lightOn, 0, 0, ctx, factor)
    ctx.restore()

    ctx.save()

    let sun = MVC.getImageToDraw("astrumDay")
    ctx.translate(Math.round(wAstra * (Math.cos(angle - 0.1))), Math.round(hAstra * (Math.sin(angle - 0.1))))
    ctx.translate(Math.round(-(sun.getNWidth() * factor) / 2), Math.round((sun.getNHeight() * factor) / 2))
    sun.drawThisImage(0, 1, lightOn, 0, 0, ctx, factor)
    sun.drawThisImage(1, sunToDraw, lightOn, 0, 0, ctx, factor)


    ctx.restore()
    ctx.restore()

    ctx.save()
    let flyObjs = MVC.getImageToDraw("flyingObject")
    if (flyObjs.length != 0) {
        console.log("num of objs")
        console.log(flyObjs.length)
        // console.log(flyObjs)
        for (let flyObj of flyObjs) {
            ctx.save()
            ctx.translate((-w) + (((2*flyObj.getProperty().shift*2*w) + ((flyObj.getProperty().velocity * angle) * w)) % (2 * w)), flyObj.getProperty().shift * (h / 2)/*(h / 10)*/)
            flyObj.drawThisImage(0,  alphaNight, lightOn, canvas.height, canvas.width, ctx, factor)
            flyObj.drawThisImage(1, alphaSunrise, lightOn, canvas.height, canvas.width, ctx, factor)
            flyObj.drawThisImage(2, alphaSunset, lightOn, canvas.height, canvas.width, ctx, factor)
            flyObj.drawThisImage(3, alphaDay, lightOn, canvas.height, canvas.width, ctx, factor)
            ctx.restore()
        }
    }
    ctx.restore()
    // STATIC ELEMENTS
    MVC.getImageToDraw("landscape").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    MVC.getImageToDraw("floor").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    MVC.getImageToDraw("building").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    MVC.getImageToDraw("tree").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)

    MVC.setFrameReq(window.requestAnimationFrame(countFPS));
}




/*
function blendBG() {
    var opaSunSet = parseFloat(skySunSet.style.opacity.split()[0])
    var opaDay = parseFloat(skyDay.style.opacity.split()[0])

    if (opaSunSet<=1){
        var opac = opaSunSet + 0.0005;
        skySunSet.style.opacity = `${opac}`
    } else {
        if (opaDay<=1){
            var opac = opaDay + 0.0005;
            skyDay.style.opacity = `${opac}`
        }
    }
}
*/
// initImages(state.environment);  
//initImages(
//);  


/* CREATING MENU' */
/*
export  async function initJSON() {
    for(let datum of Model.state.possibleValues.data) {
        datum.image = new_assets[datum.imageName]
    }
}
*/
/*
function drawThisImage (img, left, bottom,alpha=1,hasLight=false,lightOn) {
    var h = img.naturalHeight*factor;
    var w = img.naturalWidth*factor;
    var x = left * canvas.width;
    var y = (1-bottom) * canvas.height;
    ctx.globalAlpha = alpha
    console.log("here6")
    if(hasLight) {
        if(lightOn) {
            ctx.drawImage(img.lightOn, x, y-h, w, h)
        } else {
            ctx.drawImage(img.lightOff, x, y-h, w, h)
        }
    } else {
        ctx.drawImage(img, x, y-h, w, h)    
    }
    ctx.drawImage(img, x, y-h, w, h)
    ctx.globalAlpha = 1
}
*/

/**
 * types of images:
 * 0: standard only one behaviour and one type of image
 * 1: hasLights 
 * 2: sun or moon 
 * 3: background 
 * 4: flyingObjec
 */










var generateButton = document.createElement('button')
var helpButton = document.createElement('button')
var menuPanel = document.createElement('div')
menuPanel.className = 'menu-panel'

var btn_left = document.getElementById('btn-sx')
var btn_center = document.getElementById('btn-ct')
var btn_right = document.getElementById('btn-dx')



export async function createMenu() {
    console.log("menu Creation")
    var btnContainer = document.getElementById("tokenGrid")// document.createElement('div')
    btnContainer.className = 'token-btn-container'
    console.log(MVC.getStateElements())
    for (let datum of MVC.getStateElements()) {
        console.log('datum: ')
        console.log(datum)
        console.log(datum.image.previewUrl)
        var aNewSrc = await getAsset(datum.image.previewUrl)
        var img = document.createElement('img')
        img.src = aNewSrc
        img.className = 'token-image'
        var btnDiv = document.createElement('div')
        var btn = document.createElement('button')
        btn.id = datum.id
        btn.className = 'nes-btn'
        btn.classList.add('token-btn')
        btn.classList.add(datum.elementType)
        btn.classList.add(datum.environment)

        btn.style.margin = '7px'
        btn.style.marginLeft = 'auto'
        btn.style.marginRight = 'auto'
        btn.appendChild(img)
        btnDiv.classList.add("token-div")
        if (datum.elementType == "flyingObject") {
            var tokenAdd = document.createElement('div')
            tokenAdd.id = "tAdd" + btn.id
            tokenAdd.classList.add("token-add");
            tokenAdd.append("0")
            btnDiv.appendChild(btn)
            btnDiv.appendChild(tokenAdd)
            btnContainer.appendChild(btnDiv)

            console.log("ciao nuvoletta")

        } else {
            btnDiv.appendChild(btn)
            btnContainer.appendChild(btnDiv)
        }
    }
}

export function assignClick() {
    document.querySelectorAll('.token-btn').forEach((btn) => {

        btn.addEventListener('click', () => {
            var id = btn.id
            var env = btn.classList[3]
            var el = btn.classList[2]
            console.log("elements")
            console.log(env)
            console.log(el)
            //console.log(Model.state.drawing)
            //Model.state.drawing.
            //document.querySelectorAll('.'+ el).forEach((elem)=>{elem.classList.remove('selected-btn')})
            MVC.modifyIdList(id)

            visualizeSelectedTokens()

        })
    })
}


function visualizeSelectedTokens() {
    document.querySelectorAll('.token-btn').forEach((btn) => {
        btn.classList.remove('selected-btn')
    });
    document.querySelectorAll('.token-btn').forEach((btn) => {
        var elPos = Object.values(MVC.getIdList()).indexOf(parseInt(btn.id))
        var counter = 0;
        while (elPos > -1) {
            counter = counter + 1;
            elPos = Object.values(MVC.getIdList()).indexOf(parseInt(btn.id), elPos + 1)
        }
        if (btn.classList.contains("flyingObject")) {
            var tAdd = document.getElementById("tAdd" + btn.id)
            tAdd.removeChild(tAdd.firstChild)
            tAdd.append(counter)
        }
        if (counter > 0) {
            btn.classList.add('selected-btn')
        }
    });
}


/*
export async function createMenu () {
    console.log("menu Creation")
    var btnContainer = document.getElementById("tokenGrid")// document.createElement('div')
    btnContainer.className = 'token-btn-container'

    //if the menu isn't initialized a new element is created
    if(Model.state.elementTypes==undefined || Model.state.environments==undefined) {
        let data  = await getMenuTypes()
        Model.state.elementTypes = data.primaryTypes
        Model.state.environments = data.environments
    }
    
    console.log(Model.state.elementTypes)
    for (let elType of Model.state.elementTypes) {
        console.log(elType)
        var btnDiv = document.createElement('div')
        btnDiv.className = 'token-btn-div'    
        
        let toPutIn = []
        if(Model.state.possibleValues == 0) {
            toPutIn = await getElementsByType(elType)
            for(let datum of toPutIn) {
                Model.state.possibleValues.push(datum)
            }
        } else {
            for(let datum of Model.state.possibleValues) {
                if(datum.elementType === elType) {
                    toPutIn.push(datum)
                }
            }
        }   
        console.log("toPutIn:")
        console.log(toPutIn)
        if(toPutIn.length == 0) {
            toPutIn = await getElementsByType(elType)
            for(let datum of toPutIn) {
                Model.state.possibleValues.push(datum)
            }
        }

        toPutIn = toPutIn.sort((a,b) => {
            return Model.state.environments.indexOf(a.environment) - Model.state.environments.indexOf(b.environment)

        })
        console.log("toPutIn$")
        console.log(toPutIn)
        for (let datum of toPutIn) {
            console.log('datum: ')
            console.log(datum)
            console.log(datum.image.previewUrl)
            var aNewSrc =await getAsset(datum.image.previewUrl) 
            var img = document.createElement('img')
            img.src = aNewSrc
            img.className = 'token-image'

            var btn = document.createElement('button')
            btn.id = datum.id
            btn.className = 'nes-btn'
            btn.classList.add('token-btn')
            btn.classList.add(datum.elementType)
            btn.classList.add(datum.environment)
            btn.type = "button"
            btn.style.margin = '7px'
            btn.style.marginLeft = 'auto'
            btn.style.marginRight = 'auto'

            btn.appendChild(img)
            btnDiv.appendChild(btn)
        }
        btnContainer.appendChild(btnDiv)
    }

    menuPanel.appendChild(btnContainer)

    generateButton.className = 'nes-btn is-success'
    generateButton.innerText = 'GENERATE'
    generateButton.style.display = 'block'
    generateButton.style.margin = 'auto'
    generateButton.style.marginTop = '20px'
    generateButton.style.verticalAlign = 'middle'

    helpButton.className = 'nes-btn is-warning'
    helpButton.innerText = '?'
    helpButton.style.display = 'block'
    helpButton.style.margin = 'auto' 
    helpButton.style.marginTop = '20px'
    helpButton.style.verticalAlign = 'middle'

    var btnDiv = document.createElement('div')
        btnDiv.style.display = 'block'
        btnDiv.style.height = 'max-content'
        btnDiv.style.marginTop = '10%'
        btnDiv.style.textAlign = 'center'

    var title = document.createElement('p')
        title.innerText = 'MENU'
        title.style.backgroundColor = 'rgb(245, 247, 99)'
        title.style.padding = '10px'
        title.style.borderRadius = '5px'
        title.style.marginTop = '40%'
        title.style.fontSize = 'x-large'
    

    btnDiv.appendChild(helpButton)
    btnDiv.appendChild(generateButton)
    btnDiv.appendChild(title)

    menuPanel.appendChild(btnDiv)

    container.appendChild(menuPanel)

    console.log('envToGen: ')
    visualizeSelectedTokens()
}
*/



/* -------------------------------------------------------- */

// export function playableButton (ready) {
//     if (ready) {
//         playButton.classList.replace('is-disabled', 'is-success');
//     }
// }

function showInitPanel() {
    document.getElementById("panel-container").hidden = !document.getElementById("panel-container").hidden
    document.getElementById('front-panel').hidden = false
    document.getElementById('start-panel').hidden = true;
}
/*
var okButton = document.getElementById('ok-button');
okButton.onclick = () => {
    var word1 = document.getElementById('name-field1').value
    var word2 = document.getElementById('name-field2').value
    // Model.setSeedWords(word1, word2);
    if ((word1 != "")&&(word2 != "")) {
        document.getElementById('front-panel').hidden = true;
        document.getElementById('start-panel').hidden = false;
        Model.state.emitter.updateReadyToPlay()
        Tone.start()
        Tone.context.latencyHint = "playback"
    }    
}*/

// var playButton = document.getElementById('play-button');
// playButton.onclick = ()=> {
//     if (playButton.classList.contains('is-success')){
//         showInitPanel();
//         Model.startMusic(); 

//         }
// }
/*
btn_right.onclick = async () => {
    //console.log(Model.state)
    await MVC.updateState()
    await initImages()
    document.getElementById("canva-container").hidden = false;
    document.getElementById("menu-container").hidden = true;
    //document.getElementById("container").hidden = true; 
    console.log("Hey there")
    //menuPanel.style.display = 'none'
    Tone.start()
    //Model.propagateStateChanges(false)
    //Model.startMusic()
    //updatePage(0)
    //console.log(Model.state)

}
*/
/*
document.getElementById('menu').onclick = () => {
    //Model.stopMusic()
    console.log("merda")
    menuPanel.style.display = 'inline-flex  '
}
*/
/**
 * 
 * @param {*} aPage 0 selecting tokens
 *                  1 player page 
 */
export async function updatePage(aPage) {
    MVC.setNavPage(aPage)
    console.log("page")
    console.log(aPage)

    switch (aPage) {
        case 0:
            await menuPage()
            break;

        case 1:
            await playerPage()
            break;
        default:
            break;
    }
}


async function playerPage() {
    await MVC.updateState()
    await initImages()
    initMusic()
    Tone.start()
    document.getElementById("btn-vol").onclick = volumeButton
    let volSlider = document.getElementById("volume-slider")
    volumeUpdate(70)
    volSlider.addEventListener('input', function () { volumeUpdate(volSlider.value) }, false);
    document.getElementById("btn-dx1").onclick = () => { openFullscreen("main-canvas") }
    document.getElementById("btn-stop").onclick = () => { updatePage(0);  stopMusic()}
    document.getElementById("player-navbar").hidden = false;
    document.getElementById("canva-container").hidden = false;
    document.getElementById("menu-container").hidden = true;
    document.getElementById("menu-navbar").hidden = true;
    document.getElementById("upbar").hidden = true;
    startMusic()
}

async function menuPage() {
    //await createMenu()
    visualizeSelectedTokens()
    //document.getElementById("main-fs-button").onclick = () => { openFullscreen("main-body") }
    document.getElementById("btn-dx").onclick = () => { updatePage(1);}
    document.getElementById("player-navbar").hidden = true;
    document.getElementById("canva-container").hidden = true;
    document.getElementById("menu-container").hidden = false;
    document.getElementById("menu-navbar").hidden = false;
    document.getElementById("upbar").hidden = false;

}



/**
 * fullscreen handling part 
 */
function openFullscreen(element) {
    elem = document.getElementById(element)
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}
/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}



window.addEventListener("keydown", function (event) {
    if (event.key == "Escape") closeFullscreen()
}, true);




var prevScrollpos = window.pageYOffset;
window.onscroll = function () {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("upbar").style.top = "0";
    } else {
        document.getElementById("upbar").style.top = "-100px";
    }
    prevScrollpos = currentScrollPos;
}

/**
 * 
 * @param {*} valueToSet index from 0 to 100
 */
function volumeUpdate(valueToSet) {
    //0-100
    if (valueToSet <= 0) {
        document.getElementById("vol-no").style.display = "block"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 40) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "block"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 75) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "block"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 101) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "block"
    }
    document.getElementById("volume-slider").value = valueToSet;
    let vts = valueToSet / 100
    MVC.setMasterVolume(vts)
    console.log(MVC.getMasterVolume())
}

function volumeButton() {
    console.log("accazzo")
    let testValue = MVC.getMasterVolume() * 100
    console.log(testValue)
    if (testValue > 0) {
        volumeUpdate(0)
    } else {
        console.log("savedVolume")
        console.log(MVC.getSavedVolume() * 100)
        volumeUpdate(MVC.getSavedVolume() * 100)
    }
}