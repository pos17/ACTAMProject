//importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/core.js");
//const core = require('@magenta/music/node/core');
import Worker from 'web-worker';
import DrumMachine from './DrumMachine';
import MusicalScale from './musicalScale';
import * as Instr from './instruments';
import {Scale, Note,Chord,Interval} from "@tonaljs/tonal";
import * as Tone from "tone"
import * as CanvaEnv from './canvaEnv.js'
import {Emitter} from "./eventEmitter.js"

let landScape = require("./landscape.json")
let harmonies = require("./possibleSchedules.json")

export const state= {
  readyModel:false,
  readyToPlay: false,
  isPlaying:false,
  currentRepetition:0,
  worker: undefined,
  emitter: new Emitter(),
  key:"c", //main key of the system
  major: true,
  mode:"", //reference mode 
  scale:undefined, //scale 
  bpm:60,
  harmony:{
    instrument: new Tone.PolySynth().toDestination(),
    mute:false,
    chordParts: []
  },
  melody:{
    instrument: new Instr.Pad(),
    mute:false,
    seedWord1:"",
    seedWord2:"",
    melodyPart:undefined,
    playingPart:undefined,
    noteSequence:undefined
  },
  sequence:{},
  drums: {
    mute:false,
    drumMachine:  new DrumMachine(
      [
          {name: "kick", note: "C2", obj: new Instr.Kick()},
          {name: "snare", note: "C#2", obj: new Instr.Snare()},
          {name: "hihatC", note: "D2", obj: new Instr.HiHatClosed()},
          {name: "hihatO", note: "D#2", obj: new Instr.HiHatOpen()}
      ]
    ),
    drumSeq:[]
  },
  assets: {},
  canvas: {}
}

initializeState()


/**
 *  Function to initialize the main settings of the player 
 */
async function initializeState() {
  Tone.start()
  Tone.Transport.bpm.value = 60
  var workerURL =  new URL("./worker.js", import.meta.url)
  state.worker = await new Worker(workerURL/*, {type:'module'}*/ );
  initializeWorker();
  state.worker.onmessage = (event)=> {workieTalkie(event)}
  state.melody.instrument = new Instr.Lead()//new Tone.Synth().toDestination()//
  state.melody.instrument.setVolume(-6);
  state.harmony.instrument = new Instr.Pad()
  state.harmony.instrument.setVolume(-5);
  buildLandScape()
  await initializeMelody()
  await CanvaEnv.playableButton()
}


async function initializeMelody() {
  //TODO: put here the part of the dialog to input first information about user: mood seedwords
  //lines of code to be removed
  await state.emitter.isReadyModel()
  console.log("Done?!?")
  state.melody.seedWord1= "ciao";
  state.melody.seedWord2= "bella";
  state.scale = new MusicalScale('C','major');
  var seq1 = buildSequence(state.melody.seedWord1,state.key,state.harmony.chordProgression,1,6);
  var seq2 = buildSequence(state.melody.seedWord2,state.key,state.harmony.chordProgression,1,6);
  interpolateMelodies(seq1,seq2);
  
}


/**
 * function that builds a sequence starting from a word 
 */
function buildSequence(seedWord, key, chordsArray,botLength,topLength) {
  var melodyArray = [];
  var totalLength = 0;
  //var notesArray = state.scale.scaleNotes()
  //TODO: add conversion from string to NoteSequence here
  var startTime = 0;
  end = false
  //
  for( var i = 0;(i<chordsArray.length);i++) {
    var chordLength = (Tone.Transport.bpm.value/60)*Tone.Time(chordsArray[i].length)
    var chromas = chromaValues(key+" major",chordsArray[i].chord)
    var j = 0
    for(startTimeChord = 0 ; startTimeChord< chordLength;){
      var pitch = getRandomNote(chromas)+"3"
      var length = calculateTime(seedWord.charCodeAt(j%seedWord.length),botLength,topLength)
      console.log("length: "+length)
      if(length>chordLength-startTimeChord) {
        length = chordLength-startTimeChord
      }
      var noteToinsert = { pitch: Note.midi(pitch), startTime: startTime +startTimeChord, endTime: startTime +startTimeChord+length }
      startTimeChord = startTimeChord + length
      console.log(noteToinsert)
      melodyArray.push(noteToinsert)
      j++
    }
    //module gives duration to the note
    startTime = startTime+startTimeChord
  }
  totalLength = startTime
  
  
  const sequence = {
    ticksPerQuarter: 220,
    totalTime: totalLength,
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
    notes: melodyArray
  }

  //{ pitch: 'G4', startTime: 25.5, endTime: 28.5 }
  return sequence
}

function getRandomNote(chromas) {
  var totalweight = chromas.reduce(function (accumulator, current) {
    return accumulator + current;
  });
  console.log("totalWeight="+totalweight)
  console.log("totalWeight="+totalweight)
  var chosenValue = Math.round(Math.random()*totalweight)
  var compValue= 0
  for(var i=0; i<chromas.length;i++) {
    var compValue= compValue+ chromas[i]
    if(chosenValue <= compValue) {
      return Scale.get("C chromatic").notes[i]
    }
  }
  console.log("compValue="+compValue)
  console.log("chosenValue="+chosenValue)
  console.error("Oh No something went really wrong sorry")
}


/**
 * calculates a random note length from 1 to maxLength, with 0.5 as minimum length
 */
function calculateTime(value,botLength,topLength) {
  possibleValue = ((topLength-botLength)*2)-1
  toRet = Math.round(value%possibleValue) +1;
  toRet = (toRet/2)+botLength
  return toRet
}



export function startMusic() {
    
    Tone.Transport.start();
    Tone.Transport.loopEnd = "8m";
    Tone.Transport.loop=true;
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
      const sample = event.data.element;
      console.log("response message:"+ event.data.message)
      state.worker.postMessage(
        {
          message:"continueFirst",
          mel:sample,
          length:32,
          chordProgression:["Dm7","G7","Cmaj7","Cmaj7"]
        }
      )

    } break;
    case "continueFirst": {
      const sample = event.data.element;
      console.log("response message:"+ event.data.message)
      state.melody.noteSequence = sample
      var notePart = generatePart(sample);
      state.melody.melodyPart = notePart;
      state.melody.playingPart = addNotePartToTransport(state.melody.melodyPart, state.melody.instrument, 0)
      state.emitter.updateReadyToPlay()
    } break;
    case "continue": {
      const sample = event.data.element;
      console.log("response message:"+ event.data.message)
      state.melody.playingPart.stop(0)
      state.melody.playingPart = addNotePartToTransport(state.melody.melodyPart, state.melody.instrument, 0)    
      state.melody.noteSequence = sample
      var notePart = generatePart(sample);
      state.melody.melodyPart = notePart;
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

function generatePart(noteSequence) {
  var qpm = noteSequence.tempos[0].qpm
  var numofnotes = noteSequence.notes.length
  var notesToTranscribe = noteSequence.notes
  var notes = []
  for(var i = 0;i<numofnotes;i++) {
    noteFromArray = notesToTranscribe[i]
    console.log(noteFromArray.startTime)
    var note = Note.fromMidi(noteFromArray.pitch)
    var velocity = 0.5;
    var measure = Math.floor(noteFromArray.startTime/4)
    var quarter = Math.floor(noteFromArray.startTime%4)
    var sixteenth = Math.floor(noteFromArray.startTime*4)%16 -quarter*4;
    console.log(measure)
    var timeString = measure+":"+quarter+":"+sixteenth;
    var durationTime = noteFromArray.endTime-noteFromArray.startTime
    var measureDur = Math.floor(durationTime/4)
    var quarterDur = Math.floor(durationTime%4)
    var sixteenthDur = Math.floor(durationTime*4)%16 -quarterDur*4;
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
  console.log(qpm)
  
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
  for (var i =0; i<seqToRet.length; i++)
    {
      //console.log(seqToRet)
    seqToRet[i]= seqToRet[i] +scArr[(12+i-shift)%seqToRet.length];
    seqToRet[i]=seqToRet[i] +(chromaChr[(12+i-shiftChr)%seqToRet.length]);
    }
    console.log(seqToRet)
    return seqToRet
  }

function buildLandScape() {
  //for cycle to build landscape and to schedule animations
  var whenTostart = 0
  for(var i = 0; i < landScape.sequence.length; i++) {
    var harmonyToParse= harmonies[landScape.sequence[i].harmonyId]
    
    var transposedChords = transposeHarmony(harmonyToParse.gradeSequence,state.key,landScape.sequence[i].key)
    state.harmony.chordParts.push(transposedChords)
    var chordsNotePart = fromChordsToNotes(transposedChords)
    console.log(chordsNotePart);
    for(var j = 0; j<landScape.sequence[i].repetitions;j++) {
      new Tone.Part(((time, value)=> {
        state.harmony.instrument.triggerAttackRelease(value.notes,value.length,time,0.5)
        console.log("playi")
        console.log(value)
      }
      ),chordsNotePart).start(whenTostart)
      console.log("whenToStart"+whenTostart)
      whenTostart = Tone.Time(Tone.Time(whenTostart).toSeconds() + Tone.Time(harmonyToParse.totalLength).toSeconds()).toBarsBeatsSixteenths()
    }
    console.log("harmonyToParse")
    console.log(harmonyToParse)
    
  }
}

function fromChordsToNotes(chordsObjectArray) {
  for(var i = 0; i<chordsObjectArray.length; i++) {
    var notesArray = Chord.get(chordsObjectArray[i].value).notes
    for(var j = 0; j<notesArray.length;j++) {
      //FIXME: assigning the correct octave to the note to play
      notesArray[j] = notesArray[j] + "3"
    }
    chordsObjectArray[i].notes = notesArray
  }
  //{value:["C","E","G"],length:"2m"}
  return chordsObjectArray
}


//TODO: generate transposition if sequence different from this one 
function transposeHarmony(harmonyToParse, generalkey,sectionBaseKey) {
  /*
  if(key=="C" || key =="c") return harmonyToParse
  harmonyToParse
  */
 return harmonyToParse
}

