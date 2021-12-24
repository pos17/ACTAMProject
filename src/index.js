import Worker from 'web-worker';
import * as Instr from './instruments';
import {Scale, Note,Chord,Interval} from "@tonaljs/tonal";
import * as Tone from "tone"
import {Emitter} from "./eventEmitter.js"
import * as Canva from './canva.js'

export const state= {
    stateChanged:false,
    readyModel:false,
    readyToPlay: false,
    isPlaying:false,
    emitter: new Emitter(),
    key:"c", //main key of the system
    bpm:60,
    totalLength:"",
    drawing:undefined,
    possibleValues:require("./possible_elements.json")
  }

  initializeApp()

  /**
 *  Function to initialize the main settings of the player 
 */
async function initializeApp() {
  
    //initialize the drawing values
    state.drawing = require("./base_drawing.json")
    state.isFirst = true
    propagateStateChanges(state.isFirst)
    Canva.playableButton(true)
}

/**
 * 
 * @param {bool} isFirst values that states if the function is called during the initialization 
 */
 async function propagateStateChanges(isFirst) { 
  
    console.log("state before propagation")
    console.log(state)
    if(state.drawing.image.isChanged) {
      //TODO: adding function to reshape the image of the view 
      state.drawing.image.isChanged = false
    }
  
    if(state.drawing.chords.isChanged===true) {
      console.log()
      if(state.playingPartChords) {
        console.log("here I am")
        state.playingPartChords.cancel(0)
      } else {
        console.log("here I am not")
      }
      //FIXME: adding adapting loop
      Tone.Transport.loopEnd = state.drawing.loopLength;
      console.log(state.drawing.chords.instrument)
      state.playingPartChords = playChordSequence(state.drawing.chords.sequence, state.key, constructInstrument(state.drawing.chords.instrument)) 
      state.playingPartChords.loopEnd = state.drawing.chords.loopLength
      state.playingPartChords.loop = true;
      state.drawing.chords.isChanged = false
    }
  
    if(state.drawing.melody.isChanged===true) {
      if(!isFirst) {
        state.drawing.melody.playingPart.stop()
      }
      state.drawing.melody.playingPart =addNotePartToTransport(generatePart(state.drawing.melody.sequence),/*constructInstrument(state.drawing.melody.instrument)*/new Tone.Synth().toDestination(),0)    
      state.drawing.melody.isChanged =  false
    }
    console.log("state after propagation")
    console.log(state)
  }

export async function modifyState(idValue) {
    modifyingValue = state.possibleValues.find(element => element.id==idValue)
    console.log("modifying value")
    console.log(modifyingValue)
    switch(modifyingValue.elementType) {
        case("background"):{
            console.log("arrivo a background")
            state.drawing.melody.seedMelodies = modifyingValue.melodies
            waitingObj = state.emitter.waitForWorker()
            state.worker.postMessage({
                message:"interpolate",
                seedMelodies:state.drawing.melody.seedMelodies,
                numOfInterpolations:state.drawing.melody.numOfInterpolation,
                waitingIndex:waitingObj.waitingIndex
            })
            console.log("sto Interpolando ")
            console.log(waitingObj.waitingIndex)
            console.log(waitingObj.promise)
            await waitingObj.promise
            console.log("voglio morire")
            await concatenateMelodiesFromMatrix(state.drawing.melody.positionsArray,6)
            console.log(state.drawing.melody.sequence.totalQuantizedSteps)
            console.log(state.drawing.melody.sequence.tempos[0].qpm)
            state.drawing.loopLength = Tone.Time((state.drawing.melody.sequence.totalQuantizedSteps*60)/
                                                    (state.drawing.melody.sequence.tempos[0].qpm*
                                                    state.drawing.melody.sequence.quantizationInfo.stepsPerQuarter)).toBarsBeatsSixteenths()
            console.log("loopLength")
            console.log(state.drawing.loopLength)
            state.drawing.chords.sequence = modifyingValue.sequence
            state.drawing.chords.isChanged = true
            console.log(state)
            propagateStateChanges(false)
        } break;
        case("landscape"):{

        } break;
        case("building"):{
        state.drawing.image.building = modifyingState.image
        state.drawing.melody.instrument = modifyingValue.instrument
        } break;
        case("plant"):{

        } break;
        case("astrum"):{

        } break;

    }
    
}

  
function constructInstrument(constructorPath) {
    console.log(constructorPath.split('.'))
    return new Instr[constructorPath]
  }

async function concatenateMelodiesFromMatrix(positionsArray,matrixSideDim) {
toConcatenate = []
toConcatenate = state.melodiesMatrix
console.log(toConcatenate)
var waitingObj = state.emitter.waitForWorker()
state.worker.postMessage({
    message:"concatenate",
    concatenationArray:toConcatenate,
    waitingIndex:waitingObj.waitingIndex
})
await waitingObj.promise
console.log("qui ha fatto??")
}





export function startMusic() {
    Tone.Transport.loop=true;
    Tone.Transport.bpm.value = 60
    Tone.Transport.start("+0.1","0:0:0");
    
    state.isPlaying = true;
}

export function stopMusic() {
  Tone.Transport.stop();
  //Tone.Transport.cancel(0)
  state.isPlaying=false;
}


//FIXME some delay play/pause
function togglePlayPause() {
    if(state.isPlaying) {
      Tone.Transport.pause()
      state.isPlaying=false
      console.log(state.isPlaying)
    } else {
      Tone.Transport.start()
      state.isPlaying=true
      
    }
}

window.addEventListener("keydown", function(event) {
if(event.key=="MediaPlayPause") togglePlayPause()
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
    for(var i = 0;i<numofnotes;i++) {
        noteFromArray = notesToTranscribe[i]
        console.log(noteFromArray.quantizedStartStep)
        var note = Note.fromMidi(noteFromArray.pitch)
        var velocity = 0.5;
        var measure = Math.floor(noteFromArray.quantizedStartStep/(4*stepsPerQuarter))
        var quarter = Math.floor((noteFromArray.quantizedStartStep%(4*stepsPerQuarter))/4)
        var sixteenth = Math.floor(noteFromArray.quantizedStartStep) -quarter*4-measure*16;
        console.log(measure)
        var timeString = measure+":"+quarter+":"+sixteenth;
        var durationSteps = noteFromArray.quantizedEndStep-noteFromArray.quantizedStartStep
        var measureDur = Math.floor(durationSteps/(4*stepsPerQuarter))
        var quarterDur = Math.floor((durationSteps%(4*stepsPerQuarter))/4)
        var sixteenthDur = Math.floor(durationSteps)-quarterDur*4-measureDur*16;
        var durationString=measureDur+":"+quarterDur+":"+sixteenthDur;
        var indexInput = {
            time:timeString,
            note: note,
            velocity:velocity,
            duration:durationString
        }
        notes.push(indexInput)
    }
    console.log(notes) 
    return notes
  }


function addNotePartToTransport(notePart,instrument,startTime) {

const part = new Tone.Part(((time, value)=> {
        instrument.triggerAttackRelease(value.note, /*"4n"*/value.duration,time,value.velocity )
        console.log("note: "+value.note+" ,time: "+time+" duration: "+ value.duration)
    }),notePart).start(startTime)
    return part 
}

function playChordSequence(chordsSequence, key=undefined, instrument,numOfRepetitions=1) {
    if(key!=undefined) {
        var keyDistance = Interval.distance("C",key)
        console.log(keyDistance)
        chordsArray = []
        for(var i = 0; i < chordsSequence.length; i++) {
            console.log(chordsSequence[i].value)
            var transposed = Chord.transpose(chordsSequence[i].value,keyDistance)
            console.log(transposed)
            chordsSequence[i].value = transposed
            //FIXME: adding right length to the chord
            /*
            var numOfBars = (Tone.Time(chordsSequence[i].length)*Tone.Transport.bpm.value)/240
            console.log("numOfBars")
            console.log(numOfBars)
            for(j =0; j<numOfBars;j++) {
            chordsArray.push(chordsSequence[i].value)
            }
            */
            chordsSequence[i].notes = fromChordToNotes(chordsSequence[i].value) 
        }
    }
    console.log("chordsSequence in playChordSequence")
    console.log(chordsSequence)
    console.log(instrument)
    chordsPlayed =  new Tone.Part(((time, value)=> {
      console.log("value to be played")
      console.log(value)
      
      instrument.triggerAttackRelease(value.notes,value.length,time,0.5)  
    }
    ),chordsSequence).start(0) 
    //Tone.debug = true
    return chordsPlayed
  }

function fromChordToNotes(chordName) {
    var notesArray = Chord.get(chordName).notes
    var distanceFromC = Interval.distance("C",notesArray[notesArray.length-1])
    console.log("distance from C: "+distanceFromC)
    noteOctave = 3
    for(var j = notesArray.length-1; j>=0;j--) {
        if(Interval.semitones(Interval.distance("C",notesArray[j]))>Interval.semitones(distanceFromC)){
        noteOctave--;
        distanceFromC = Interval.distance("C",notesArray[j])
        }
        notesArray[j] = notesArray[j] + noteOctave

    }
    console.log(notesArray)
    return notesArray
}

Tone.Transport.schedule(()=>{
  console.log("sticazzi");
  console.log("state of chords")
  console.log(state.playingPartChords.state)
  },"0:0:0")

  