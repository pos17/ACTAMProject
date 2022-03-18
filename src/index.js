import { Scale, Note, Chord, Interval } from "@tonaljs/tonal";
import * as Tone from "tone"

import { MarkovMelody } from "./markov_melody.js"
import * as Canva from './canva.js'
import { createMenu, assignClick, updatePage } from "./menu.js";
import * as Instr from './instruments.js';
import * as effects from './effects.js';
import * as firebase from './firebase.js'
import * as MVC from "./modelViewController.js"


//var markovChain = require("./markov_nodes.json")
//var markov_music_elements = require("./markov_music_elements.json")
//console.log(markovChain)
//var mm = new MarkovMelody(tree = markovChain,nodes = markov_music_elements)
// console.log(mm.generateMelody(1))
//console.log(mm.generatePath(2))







initializeMyApp()

/**
 *  Function to initialize the main settings of the player 
 */
async function initializeMyApp() {

    //initialize the drawing values
    //state.isFirst = true
    Tone.context.lookAhead = 1;
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
    Tone.context.latencyHint = 'playback'
    console.log("i nodi")
    await MVC.generateNodes()
    console.log(MVC.generateMelody())
    let notePart = parseMelodyString("f+4 c+8 a8 e+4 c+8 a8\nd+8 e+8 cb8 d+8 db+8 bb8 g8 ab8\na4 f8 d8 g8 a8 f8 e8\neb16 g16 bb8 d+8 db+8 r8 f8 f16 g8 f16")
    console.log("notepart")
    console.log(notePart)
    addNotePartToTransport(notePart, MVC.getInstrument("Lead")) 
    //propagateStateChanges(state.isFirst)
    //MVC.updateState()
    //await Canva.initImages()
    //Canva.playableButton(true)
    //updatePage(1)
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

    //building instruments
    /* leads */
    // var bell = new Instr.Bell()
    // console.log("here I am 2")
    // bell.connect(melodyChannel)
    // console.log("Here I am 3")
    let bell =new Instr.Bell();
    let lead =new Instr.Lead();
    let sitar =new Instr.Sitar()
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
    let bass1 =new Instr.Bass1()
    let bass2 =new Instr.Bass2()
    let bass3 =new Instr.Bass3()
    let bass4 =new Instr.Bass4()
    
    bass1.connect(bassChannel)
    bass2.connect(bassChannel)
    bass3.connect(bassChannel)
    bass4.connect(bassChannel)
    

    MVC.setInstrument("Bass1", bass1)
    MVC.setInstrument("Bass2", bass2)
    MVC.setInstrument("Bass3", bass3)
    MVC.setInstrument("Bass4", bass4)


    /* pads */
    let synth1 =new Instr.Synth1()
    let synth2 =new Instr.Synth2()
    let synth3 =new Instr.Synth3()
    let synth4 =new Instr.Synth4()
    
    synth1.connect(harmonyChannel)
    synth2.connect(harmonyChannel)
    synth3.connect(harmonyChannel)
    synth4.connect(harmonyChannel)


    MVC.setInstrument("Synth1", synth1)
    MVC.setInstrument("Synth2", synth2)
    MVC.setInstrument("Synth3", synth3)
    MVC.setInstrument("Synth4", synth4)
}

async function concatenateMelodiesFromMatrix(positionsArray, matrixSideDim) {
    toConcatenate = []
    toConcatenate = state.melodiesMatrix
    console.log(toConcatenate)
    var waitingObj = state.emitter.waitForWorker()
    state.worker.postMessage({
        message: "concatenate",
        concatenationArray: toConcatenate,
        waitingIndex: waitingObj.waitingIndex
    })
    await waitingObj.promise
    console.log("qui ha fatto??")
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
            if(noteMap.note!="r") { 
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

            if(sixteenthIndex >= 4) {
                let carry = sixteenthIndex%4
                let value = Math.floor(sixteenthIndex/4)
                quarterIndex = quarterIndex + value;
                sixteenthIndex = carry;
            }
            if(quarterIndex >= 4) {
                let carry = quarterIndex%4
                let value = Math.floor(quarterIndex/4)
                barIndex = barIndex + value;
                quarterIndex = carry;
            }

            console.log(noteMap)
        }

    }
    console.log(barsArray)
    console.log(notesToRet)
    return notesToRet;
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
    if(midiNote != "r") {
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
        instrument.triggerAttack(value.note, time, 0.8)
        console.log("note: " + value.note+ " ,time: " + time + " duration: " + value.duration)
    }, notePart).start(0)
    return part
}

function playChordSequence(chordsString, key = "C", instrument, numOfRepetitions = 1) {

    console.log("chordsString in playChordSequence")
    console.log(chordsString)



    console.log(instrument)
    chordsPlayed = new Tone.Part(((time, value) => {
        console.log("value to be played")
        console.log(value)

        instrument.triggerAttackRelease(value.notes, value.length, time, 0.5)
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
        for (let chord of chordsBar) {
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
            chord = {
                value: chord,
                time: tTime,
                duration: dur
            }
            quarterCount = quarterCount + quarterAdd
            chordsToRet.push(chord)
        }
        barCount++;
    }
    console.log(chordsToRet)
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

