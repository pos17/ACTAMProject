//importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/core.js");
//const core = require('@magenta/music/node/core');
import Worker from 'web-worker';
import * as Instr from './instruments';
import {Scale, Note,Chord,Interval} from "@tonaljs/tonal";
import * as Tone from "tone"
import {Emitter} from "./eventEmitter.js"
import * as Canva from './canva.js'
import { concatenate } from '@magenta/music/esm/core/sequences';

let landScape = require("./landscape.json")
let harmonies = require("./possibleSchedules.json")

export const state= {
  stateChanged:false,
  readyModel:false,
  readyToPlay: false,
  isPlaying:false,
  worker: undefined,
  emitter: new Emitter(),
  key:"c", //main key of the system
  bpm:60,
  totalLength:"",
  drawing:undefined,
  possibleValues:require("./possible_elements.json")
}

/**
 * function call to start the whole system
 */
initializeApp()


/**
 *  Function to initialize the main settings of the player 
 */
async function initializeApp() {
  
  var workerURL =  new URL("./worker.js", import.meta.url)
  state.worker = await new Worker(workerURL/*, {type:'module'}*/ );
  initializeWorker();
  state.worker.onmessage = (event)=> {workieTalkie(event)}
  //initialize the drawing values
  state.drawing = require("./base_drawing.json")
  state.isFirst = true
  propagateStateChanges(state.isFirst)

  //await state.emitter.isReadyModel()
  //initializeMelody()
  //await state.emitter.isReadyToPlay()
  Canva.playableButton(true)
  //var isFirst = true
  //Tone.Transport.schedule((time)=>{
    //console.log(isFirst)
    //if(isFirst==false) {
    //  state.melody.playingPart.stop(0)
    //}
  
  
  /*
    state.worker.postMessage(
      {
        message:"continue",
        mel:state.melody.noteSequence,
        length:((Tone.Time(landScape.length).toSeconds()*(Tone.Transport.bpm.value))/15),
        chordProgression:landScape.chordsArray//["Dm7","G7","Cmaj7","Cmaj7"]
      }
    );
    isFirst = false
  },"0:0:0")
  */
  
  
}
/**
 * 
 * @param {bool} isFirst values that states if the function is called during the initialization 
 */
function propagateStateChanges(isFirst) { 
  if(state.drawing.image.isChanged) {
    //TODO: adding function to reshape the image of the view 
  }

  if(state.drawing.chords.isChanged) {
    if(!isFirst) {
      state.drawing.chords.playingPart.stop()
    }
    else {
      Tone.Transport.loop=true;  
    }
    Tone.Transport.loopEnd = state.drawing.chords.loopLength;
    state.drawing.chords.playingPart =playChordSequence(state.drawing.chords.sequence, state.key, constructInstrument(state.drawing.chords.instrument))    
    //
    if(!isFirst) {
      Tone.Transport.stop()
      Tone.Transport.start("+0.1");
    }
  }

  if(state.drawing.melody.isChanged) {
    if(!isFirst) {
      state.drawing.melody.playingPart.stop()
    }
    state.drawing.melody.playingPart =addNotePartToTransport(generatePart(state.drawing.melody.sequence),constructInstrument(state.drawing.melody.instrument),0)    
  }

}

/**
 * 
 */
export async function modifyState(idValue) {
  modifyingValue = state.possibleValues.find(element => element.id==idValue)
  console.log("modifying value")
  console.log(modifyingValue)
  switch(modifyingValue.elementType) {
    case("background"):{
      
      state.drawing.melody.seedMelodies = modifyingValue.melodies
      waitingObj = state.emitter.waitForWorker()
      state.worker.postMessage({
        message:"interpolate",
        seedMelodies:state.drawing.melody.seedMelodies,
        numOfInterpolations:state.drawing.melody.numOfInterpolation,
        waitingIndex:waitingObj.waitingIndex
      })
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
  //var constructorFunc = constructorPath.split('.')
  //  .reduce((prev, next) => prev[next],Instr)
  //console.log(constructorFunc)
  return new Instr[constructorPath]//constructorFunc()
}

async function concatenateMelodiesFromMatrix(positionsArray,matrixSideDim) {
  toConcatenate = []
  for(var i = 0; i <positionsArray.length;i++) {
    var index = positionsArray[i].x*matrixSideDim + positionsArray[i].y
    toConcatenate.push(state.melodiesMatrix[index])
  }
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

function initializeMelody() {
  //TODO: put here the part of the dialog to input first information about user: mood seedwords
  //lines of code to be removed
  
  console.log("Done?!?")
  state.melody.seedWord1= "ciao";
  state.melody.seedWord2= "bella";
  //FIXME: sequences built in steps, lengths need to be adapted to that 
  
  //var seq1 = buildSequence(state.melody.seedWord1,state.key,state.parts[0].chords,4,24);
  //var seq2 = buildSequence(state.melody.seedWord2,state.key,state.parts[0].chords,4,24);
  //console.log("seq1")
  //console.log(seq1)
  //console.log("seq2")
  //console.log(seq2)
  //interpolateMelodies(seq1,seq2);
  console.log(landScape.length)
  console.log((Tone.Time(landScape.length).toSeconds()*(Tone.Transport.bpm.value))/15)
  state.melody.noteSequence = simpleMelody
  state.worker.postMessage(
    {
      message:"continue",
      mel:state.melody.noteSequence,
      length:((Tone.Time(landScape.length).toSeconds()*(Tone.Transport.bpm.value))/15),
      chordProgression:landScape.chordsArray//["Dm7","G7","Cmaj7","Cmaj7"]
    }
  )
  
}


/**
 * function that builds a sequence starting from a word 
 */
function buildSequence(seedWord, key, chords,botLength,topLength) {
  var melodyArray = [];
  var totalLength = 0;
  var chordStartTime = 0;
  end = false
  //chordsArray
  //four steps per quarter 
  for( var i = 0;(i<chords.length);i++) {
    var chordLength = (Tone.Transport.bpm.value/60)*Tone.Time(chords[i].length) * 4 
    
    //FIXME: adapt the chroma values to the specific scale considered 
    var chromas = chromaValues(key+" major",chords[i].value)
    var j = 0
    for(var startStepInChord = 0 ; startStepInChord< chordLength;){
      var pitch = getRandomNote(chromas)+"3"
      var length = calculateTime(seedWord.charCodeAt(j%seedWord.length),botLength,topLength)
      //console.log("length: "+length)
      if(length>chordLength-startStepInChord) {
        length = chordLength-startStepInChord
      }
      //{ pitch: 60, quantizedStartStep: 0, quantizedEndStep: 2 },
      var noteToinsert = { pitch: Note.midi(pitch), quantizedStartStep: chordStartTime + startStepInChord, quantizedEndStep: chordStartTime + startStepInChord+length }
      startStepInChord = startStepInChord + length
      //console.log(noteToinsert)
      melodyArray.push(noteToinsert)
      j++
    }
    //module gives duration to the note
    chordStartTime = chordStartTime+startStepInChord
  }
  totalLength = chordStartTime
  console.log("totalLength in qua: ")
  console.log(totalLength)
  
  const sequence = {
    totalQuantizedSteps: totalLength,
    timeSignatures: [
      {
        time: 0,
        numerator: 4,
        denominator: 4
      }
    ],
    tempos: [
      {
        time: 0,
        qpm:  60
      }
    ],
    quantizationInfo: { stepsPerQuarter: 4 },
    notes: melodyArray
  }

  //{ pitch: 'G4', startTime: 25.5, endTime: 28.5 }
  return sequence
}

function getRandomNote(chromas) {
  var totalweight = chromas.reduce(function (accumulator, current) {
    return accumulator + current;
  });
  //console.log("totalWeight="+totalweight);
  //console.log("totalWeight="+totalweight);
  var chosenValue = Math.round(Math.random()*totalweight)
  var compValue= 0
  for(var i=0; i<chromas.length;i++) {
    var compValue= compValue+ chromas[i]
    if(chosenValue <= compValue) {
      return Scale.get("C chromatic").notes[i]
    }
  }
  //console.log("compValue="+compValue)
  //console.log("chosenValue="+chosenValue)
  //console.error("Oh No something went really wrong sorry")
}


/**
 * calculates a random note length from 1 to maxLength, with 0.5 as minimum length
 */
function calculateTime(value,botLength,topLength) {
  possibleValue = ((topLength-botLength))-1
  toRet = Math.round(value%possibleValue) +1;
  toRet = toRet+botLength
  return toRet
}



export function startMusic() {
    
    //Tone.start()
    //Tone.Transport.bpm.value = 150
    Tone.Transport.bpm.value = 60
    Tone.Transport.start("+0.1");
    
    state.isPlaying = true;
}

export function stopMusic() {
  Tone.Transport.stop();
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

/*-----------------------Worker --------------------------------*/ 
/**
 * function that handles the messages from the external worker, message used as routing for the switch case path
 * @param {Event} event object that wraps all the data to be 
 */
async function workieTalkie(event) {
  switch(event.data.message){
    case "fyi": {
      console.log(event.data.element);
    } break;
    case "interpolation": {
      const sample = event.data.element.value;
      const waitingIndex = event.data.waitingIndex;
      console.log(waitingIndex)
      console.log("response message in interpolation:"+ event.data.message)
      state.melodiesMatrix = sample
      console.log(sample)
      state.emitter.waitingResolved(waitingIndex);
    } break;
    case "continue": {
      const sample = event.data.element;
      console.log("response message:"+ event.data.message)
      //const index = event.data.index;
      //state.melody.playingPart.stop(0)
      //state.melody.playingPart = addNotePartToTransport(state.melody.melodyPart, state.melody.instrument, 0)    
      state.melody.noteSequence = sample
      //var notePart = generatePart(sample);
      //state.melody.playingPart = addNotePartToTransport(notePart, state.melody.instrument, 0)
      state.emitter.updateReadyToPlay();
      //state.emitter.melodyScheduled(index);
      //state.melody.melodyPart = notePart;

      //state.parts[index].melodyNoteSequence = sample;
      //state.parts[index].melodyPlayingPart = addNotePartToTransport(generatePart(sample),state.melody.instrument,state.parts[0].startTime);
      
      //if(index == 0) {
      //state.emitter.updateReadyToPlay();
      //}
    }
    break;
    case "concatenate": {
      console.log("here done")
      console.log(event.data)
      state.drawing.melody.sequence= event.data.element;
      state.drawing.melody.isChanged = true;
      const waitingIndex = event.data.waitingIndex;
      state.emitter.waitingResolved(waitingIndex)
      console.log(state)
    }
    break;
    case "modelInitialized": {
      state.emitter.updateReadyModel()
      console.log("model initialized")
    }
    break;
  }
};

function initializeWorker() {
  toSend={
    message:"initializeWorker",
  }
  state.worker.postMessage(toSend)
}

function interpolateMelodies(mel1ToSend,mel2ToSend) {
  toSend={
    message:"interpolate",
    mel1:mel1ToSend,
    mel2:mel2ToSend
  }
  _talkToWorker(toSend)
  console.log("interpolation message sent")
  
}

/**
 * general function to talk to the worker
 * @param {object} toSend data be sent to the worker 
 */
function _talkToWorker(toSend) {
    state.worker.postMessage(toSend);
}
/*----------------------*/ 
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
    }
  ),notePart
  
  ).start(startTime)
  return part 
}

//addPartToTransport(state.melody.melodyPart,synth)
/*
Tone.Transport.schedule((time) => {
	//console.log(Tone.Transport.now())
  //console.log("calling scheduled function")
  //state.currentRepetition+=8;
  //var repStr = state.currentRepetition+"m"
  if(state.melody.playingPart!=undefined) {
  state.melody.playingPart.stop().then(()=>{
      state.melody.playingPart = addPartToTransport(state.melody.melodyPart, state.melody.instrument, 0)
    });
  }
  //console.log("time next sub:" +Tone.Transport.nextSubdivision("8m"))
  console.log("measure 16!");
  state.worker.postMessage(
    {
      message: "continue",
      mel: state.melody.noteSequence,
      length: 32,
      chordProgression: ["Cm", "Gb", "Db", "Gdim"]
    }
  )
}, "1:0:0");
*/


/*
var j = 0;
Tone.Transport.scheduleRepeat((time) => {
  console.log("measure num:" + j++)
},interval="8m",startTime="0:0:0");
*/
/*
state.melody.instrument = new Tone.FMSynth({
  envelope: {
    attack: 0.1}
}).toDestination();
state.harmony.instrument.volume.value = -6;

state.harmony.instrument =  new Tone.PolySynth({
  envelope: {
    attack: 1,
    decay: 0.6,
    sustain: 0.6,
    release: 0.8,}
}).toDestination();
state.harmony.instrument.volume.value = -6;
*/
/*
const partChord = new Tone.Part(((time, value)=> {
  state.harmony.instrument.triggerAttackRelease(value.notes,value.dur,time,0.5 )
  console.log("playi")
  console.log(value)
  
}
),[
    {time:0, notes: ["D3","F3","A3","C4"], dur:"2m"},//[0, "Eb2"],[0, "G2"], 
  {time:"2:0", notes: ["G2","B2","D3","F3"], dur:"2m"},//["2:0", "Bb3"],["2:0", "Db3"],
  {time:"4:0", notes: ["C3","E3","G3","B3"], dur:"4m"}
]
).start(0)
*/
/*
partChord.loopEnd = "8m";
partChord.loop = true;
*/
var k = 0
/*
Tone.Transport.schedule((time) => {
  state.worker.postMessage(
    {
      message: "continue",
      mel: state.melody.noteSequence,
      length: 32,
      chordProgression: ["Dm7", "G7", "Cmaj7", "Cmaj7"]
    }
  )
  console.log("settima battuta loop "+ k++)
},"7:0:0")
*/
/**
 * 
 * @param {string} scale definition of the scale 
 * @returns array of 12 chromatic notes 
 */
function chromaValues (scale, chord) {
  console.log("chord value"+chord)
  chromaChr = Chord.get(chord).chroma.split("").map((num)=>{
    return Number(num)
  })
  console.log(chromaChr)
  var tonicChr= Chord.get(chord).tonic;
  var shiftChr=Interval.semitones( Interval.distance("C",tonicChr));
  //scale chroma
  
  scArr=Scale.get(scale).chroma.split("").map((num)=>{
    return Number(num)
  })
  console.log(scArr)
  var seqToRet = [0,0,0,0,0,0,0,0,0,0,0,0];

  var tonic= Scale.get(scale).tonic;
  var shift=Interval.semitones( Interval.distance("C",tonic));
  var counter=0;
  var countChord = 5
  for(var i = 0; i <chromaChr.length; i++) {
    chromaChr[i] = chromaChr[i]*countChord;
    if(chromaChr[i]!=0) countChord--;
  }
  for (var i =0; i<seqToRet.length; i++) {
      //console.log(seqToRet)
    seqToRet[i]= seqToRet[i] +scArr[(12+i-shift)%seqToRet.length];
    seqToRet[i]=seqToRet[i] +(chromaChr[(12+i-shiftChr)%seqToRet.length]);
  }
  console.log(seqToRet)
  return seqToRet
}

function buildLandScape() {
  //for cycle to build landscape and to schedule animations
  //var whenTostart = 0
  for(var i = 0; i < landScape.sequence.length; i++) {
    var harmonyToParse= harmonies[landScape.sequence[i].harmonyId]
    
    var transposedChords = transposeHarmony(harmonyToParse.gradeSequence,state.key,landScape.sequence[i].key)
    
    var chordsNotePart = fromChordsToNotes(transposedChords)
    console.log(chordsNotePart);
    for(var j = 0; j<landScape.sequence[i].repetitions;j++) {
      
      chordsPlayed =  new Tone.Part(((time, value)=> {
        state.harmony.instrument.triggerAttackRelease(value.notes,value.length,time,0.5)
        console.log("value to be played")
        console.log(value)
      }
      ),chordsNotePart).start(whenTostart)
      console.log("whenToStart"+whenTostart)
      
      var chordsArray=[];
      for(var k = 0; k<transposedChords.length;k++) {
        chordsArray.push(transposedChords[k].value)
      }
      state.parts.push({
        chords:transposedChords,
        chordsPartPlayed:chordsPlayed,
        chordsArray:chordsArray,
        length:harmonyToParse.totalLength,
        startTime:whenTostart
      })
      whenTostart = Tone.Time(Tone.Time(whenTostart).toSeconds() + Tone.Time(harmonyToParse.totalLength).toSeconds()).toBarsBeatsSixteenths()
    }
    console.log("harmonyToParse")
    console.log(harmonyToParse)
  }
  console.log("state.parts")
  console.log(state.parts)
  state.totalLength=whenTostart;
  console.log("state.parts:")
  console.log(state.parts)
}

function playChordSequence(chordsSequence, key, instrument,numOfRepetitions=1) {
  var keyDistance = Interval.distance("C",key)
  console.log(keyDistance)
  chordsArray = []
    for(var i = 0; i < chordsSequence.length; i++) {
      console.log(chordsSequence[i].value)
      var transposed = Chord.transpose(chordsSequence[i].value,keyDistance)
      console.log(transposed)
      chordsSequence[i].value = transposed
      //FIXME: adding right length to the chord
      var numOfBars = (Tone.Time(chordsSequence[i].length)*Tone.Transport.bpm.value)/240
      console.log("numOfBars")
      console.log(numOfBars)
      for(j =0; j<numOfBars;j++) {
      chordsArray.push(chordsSequence[i].value)
      }
      chordsSequence[i].notes = fromChordToNotes(chordsSequence[i].value) 
    }
    console.log(chordsSequence)
    chordsPlayed =  new Tone.Part(((time, value)=> {
      console.log("value to be played")
      console.log(value)
      instrument.triggerAttackRelease(value.notes,value.length,time,0.5)
      
    }
    ),chordsSequence).start(0)
    chordsPlayed.loop = numOfRepetitions
  landScape.chordsArray = chordsArray
  console.log(landScape)
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




var simpleMelody = {
  totalQuantizedSteps: 64,
  timeSignatures: [
    {
      time: 0,
      numerator: 4,
      denominator: 4
    }
  ],
  tempos: [
    {
      time: 0,
      qpm:  60
    }
  ],
  quantizationInfo: { stepsPerQuarter: 4 },
  notes:[ {pitch: Note.midi("B3"), quantizedStartStep: 0, quantizedEndStep: 4 },
          {pitch: Note.midi("A3"), quantizedStartStep: 4, quantizedEndStep: 8 },
          {pitch: Note.midi("G3"), quantizedStartStep: 8, quantizedEndStep: 12 },
          {pitch: Note.midi("A3"), quantizedStartStep: 12, quantizedEndStep: 16 },
          {pitch: Note.midi("B3"), quantizedStartStep: 16, quantizedEndStep: 20 },
          {pitch: Note.midi("B3"), quantizedStartStep: 20, quantizedEndStep: 24 },
          {pitch: Note.midi("B3"), quantizedStartStep: 24, quantizedEndStep: 32 },
          {pitch: Note.midi("A3"), quantizedStartStep: 32, quantizedEndStep: 36 },
          {pitch: Note.midi("A3"), quantizedStartStep: 36, quantizedEndStep: 40 },
          {pitch: Note.midi("A3"), quantizedStartStep: 40, quantizedEndStep: 48 },
          {pitch: Note.midi("B3"), quantizedStartStep: 48, quantizedEndStep: 52 },
          {pitch: Note.midi("B3"), quantizedStartStep: 52, quantizedEndStep: 56 },
          {pitch: Note.midi("B3"), quantizedStartStep: 56, quantizedEndStep: 64 }
  ]
}

var simpleMelody1 = {
  totalQuantizedSteps: 64,
  timeSignatures: [
    {
      time: 0,
      numerator: 4,
      denominator: 4
    }
  ],
  tempos: [
    {
      time: 0,
      qpm:  60
    }
  ],
  quantizationInfo: { stepsPerQuarter: 4 },
  notes:[ {pitch: Note.midi("B4"), quantizedStartStep: 0, quantizedEndStep: 2 },
          {pitch: Note.midi("A4"), quantizedStartStep: 2, quantizedEndStep: 4 },
          {pitch: Note.midi("G4"), quantizedStartStep: 4, quantizedEndStep: 6 },
          {pitch: Note.midi("A4"), quantizedStartStep: 6, quantizedEndStep: 8 },
          {pitch: Note.midi("B4"), quantizedStartStep: 8, quantizedEndStep: 10 },
          {pitch: Note.midi("B4"), quantizedStartStep: 10, quantizedEndStep: 12 },
          {pitch: Note.midi("B4"), quantizedStartStep: 12, quantizedEndStep: 16 },
          {pitch: Note.midi("A4"), quantizedStartStep: 16, quantizedEndStep: 18 },
          {pitch: Note.midi("A4"), quantizedStartStep: 18, quantizedEndStep: 20 },
          {pitch: Note.midi("A4"), quantizedStartStep: 20, quantizedEndStep: 24 },
          {pitch: Note.midi("B4"), quantizedStartStep: 24, quantizedEndStep: 26 },
          {pitch: Note.midi("B4"), quantizedStartStep: 26, quantizedEndStep: 28 },
          {pitch: Note.midi("B4"), quantizedStartStep: 28, quantizedEndStep: 32 }
  ]
}

var simpleMelody2 = {
  totalQuantizedSteps: 16,
  timeSignatures: [
    {
      time: 0,
      numerator: 4,
      denominator: 4
    }
  ],
  tempos: [
    {
      time: 0,
      qpm:  60
    }
  ],
  quantizationInfo: { stepsPerQuarter: 4 },
  notes:[ {pitch: Note.midi("B4"), quantizedStartStep: 0, quantizedEndStep: 1 },
          {pitch: Note.midi("A4"), quantizedStartStep: 1, quantizedEndStep: 2 },
          {pitch: Note.midi("G4"), quantizedStartStep: 2, quantizedEndStep: 3 },
          {pitch: Note.midi("A4"), quantizedStartStep: 3, quantizedEndStep: 4 },
          {pitch: Note.midi("B4"), quantizedStartStep: 4, quantizedEndStep: 5 },
          {pitch: Note.midi("B4"), quantizedStartStep: 5, quantizedEndStep: 6 },
          {pitch: Note.midi("B4"), quantizedStartStep: 6, quantizedEndStep: 8 },
          {pitch: Note.midi("A4"), quantizedStartStep: 9, quantizedEndStep: 9 },
          {pitch: Note.midi("A4"), quantizedStartStep: 9, quantizedEndStep: 11 },
          {pitch: Note.midi("A4"), quantizedStartStep: 10, quantizedEndStep: 12 },
          {pitch: Note.midi("B4"), quantizedStartStep: 12, quantizedEndStep: 13 },
          {pitch: Note.midi("B4"), quantizedStartStep: 13, quantizedEndStep: 14 },
          {pitch: Note.midi("B4"), quantizedStartStep: 14, quantizedEndStep: 16 }
  ]
}
var simpleMelody3 = {
  totalQuantizedSteps: 256,
  timeSignatures: [
    {
      time: 0,
      numerator: 4,
      denominator: 4
    }
  ],
  tempos: [
    {
      time: 0,
      qpm:  60
    }
  ],
  quantizationInfo: { stepsPerQuarter: 4 },
  notes:[ {pitch: Note.midi("B4"), quantizedStartStep: 0, quantizedEndStep: 16 },
          {pitch: Note.midi("A4"), quantizedStartStep: 16, quantizedEndStep: 32 },
          {pitch: Note.midi("G4"), quantizedStartStep: 32, quantizedEndStep: 48 },
          {pitch: Note.midi("A4"), quantizedStartStep: 48, quantizedEndStep: 64 },
          {pitch: Note.midi("B4"), quantizedStartStep: 64, quantizedEndStep: 80 },
          {pitch: Note.midi("B4"), quantizedStartStep: 80, quantizedEndStep: 96 },
          {pitch: Note.midi("B4"), quantizedStartStep: 96, quantizedEndStep: 128 },
          {pitch: Note.midi("A4"), quantizedStartStep: 128, quantizedEndStep: 154 },
          {pitch: Note.midi("A4"), quantizedStartStep: 154, quantizedEndStep: 160 },
          {pitch: Note.midi("A4"), quantizedStartStep: 160, quantizedEndStep: 192 },
          {pitch: Note.midi("B4"), quantizedStartStep: 192, quantizedEndStep: 208 },
          {pitch: Note.midi("B4"), quantizedStartStep: 208, quantizedEndStep: 224 },
          {pitch: Note.midi("B4"), quantizedStartStep: 224, quantizedEndStep: 256 }
  ]
}
export function setSeedWords(word1, word2) {
  state.melody.seedWord1= word1;
  state.melody.seedWord2= word2;
}