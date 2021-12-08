//importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/core.js");
//const core = require('@magenta/music/node/core');
import Worker from 'web-worker';
import DrumMachine from './DrumMachine';
import MusicalScale from './musicalScale';
import * as Instr from './instruments';
import {Note} from "tonal";
import * as Tone from "tone"
// import * as CanvaEnv from './canvaEnv.js'
import * as Canva from './canva.js'


// const canvas = document.getElementById('main-canvas');
// const canvasDiv  = document.getElementById('canvas-div')
// const sky = document.getElementById('sky')

/*
 * State of the main instance of application
 */
//const player = new core.Player();

const state= {
  readyToPlay: {
    value: false,
    get getReady () {
      return this.value;
    },
    set setReady(bool) {
      this.value = bool;
      this.listener(this.value);
    },
    listener: function (value){
      // CanvaEnv.playableButton(value);
      Canva.playableButton(value);
      console.log("READY MOTHERFUCKER")
    },
  },
  currentRepetition:0,
  worker: undefined,
  key:"", //main key of the system
  mode:"", //reference mode 
  scale:undefined, //scale 
  bpm:60,
  harmony:{
    instrument: new Tone.PolySynth().toDestination(),
    mute:false,
    chordProgression: ["Cm","Gb","Db","Gdim"],
    startTime: "0",
    possibleProgressions: [
      ["I","VI","II","V"],
    ]
  },
  melody:{
    instrument: new Tone.FMSynth({
      envelope: {
        attack: 0.1}
    }).toDestination(),
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
  var workerURL =  new URL("./worker.js", import.meta.url)
  state.worker = await new Worker(workerURL/*, {type:'module'}*/ );
  initializeWorker();
  state.worker.onmessage = (event)=> {workieTalkie(event)}
}

export function initializeMelody() {
  //TODO: put here the part of the dialog to input first information about user: mood seedwords
  //lines of code to be removed
  // state.melody.seedWord1= "ciao";
  // state.melody.seedWord2= "bella";
  state.scale = new MusicalScale('C','phrygian');
  var seq1 = buildSequence(state.melody.seedWord1);
  var seq2 = buildSequence(state.melody.seedWord2);
  interpolateMelodies(seq1,seq2);
  state.melody.instrument = new Instr.Lead()
  state.melody.instrument.setVolume(-3);
  state.harmony.instrument = new Instr.Pad()
  state.harmony.instrument.setVolume(-1);
}

/**
 * function that builds a sequence starting from a word 
 */
function buildSequence(seedWord) {
  var melodyArray = [];
  var totalLength = 0;
  var notesArray = state.scale.scaleNotes()
  //TODO: add conversion from string to NoteSequence here
  var startTime = 0;
  end = false
  for( var i = 0;(i<seedWord.length&&!end);i++) {
    var module = seedWord.charCodeAt(i)% 7
    var pitch = notesArray[module]+"4"; //fixed position on the keyboard
    var length = calculateRandomTime(32-startTime,4)
    var noteToinsert = { pitch: Note.midi(pitch), startTime: startTime, endTime: startTime+length }
    console.log(noteToinsert)
    startTime=startTime+length
    melodyArray.push(noteToinsert)
    if(startTime>=32) end = true
    console.log("module:"+module+", char:"+seedWord.charAt(i)+", code:"+seedWord.charCodeAt(i))
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
        qpm:  240
      }
    ],
    notes: melodyArray
  }

  //{ pitch: 'G4', startTime: 25.5, endTime: 28.5 }
  return sequence
}

/**
 * calculates a random note length from 1 to maxLength, with 0.5 as minimum length
 */
function calculateRandomTime(constraint,maxLength) {
  //maxLength = Math.round(Math.random()*((maxLength*2)));
  maxLength = (maxLength*2)-1
  if((constraint*2)<(maxLength+1)) {
  toRet = Math.floor(Math.random() * ((constraint*2)-1)) +1;
  } else {
    toRet = Math.round(Math.random() * maxLength) +1;
  }
  toRet = toRet/2
  return toRet
}



export function startMusic() {
    Tone.start()
    Tone.Transport.start();
    Tone.Transport.loopEnd = "8m";
    Tone.Transport.loop=true;
}
export function stopMusic() {
  Tone.start()
  Tone.Transport.stop();
}

/*-----------------------Worker --------------------------------*/ 
/**
 * function that handles the messages from the external worker, message used as routing for the switch case path
 * @param {Event} event object that wraps all the data to be 
 */
function workieTalkie(event) {
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
          chordProgression:["Cm","Gb","Db","Gdim"]
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
      state.readyToPlay.setReady = true
    } break;
    case "continue": {
      const sample = event.data.element;
      console.log("response message:"+ event.data.message)
      state.melody.playingPart.stop(0)
      state.melody.playingPart = addNotePartToTransport(state.melody.melodyPart, state.melody.instrument, 0)    
      state.melody.noteSequence = sample
      var notePart = generatePart(sample);
      state.melody.melodyPart = notePart;
    } break;
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
      console.log(value.note)
    }
  ),notePart
  
  ).start(startTime)
  //part.loopEnd="8m"
  //part.loop = false;
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

const partChord = new Tone.Part(((time, value)=> {
  state.harmony.instrument.triggerAttackRelease(value, "2m",time,0.5 )
  console.log("playi")
  console.log(value)
  
}
),[
  [0, ["C3","Eb3","G3"]],//[0, "Eb2"],[0, "G2"], 
  ["2:0", ["Gb2","Bb3","Db3"]],//["2:0", "Bb3"],["2:0", "Db3"],
  ["4:0", ["Db3","F3","Ab3"]],//["4:0", "F2"],["4:0", "Ab2"],
  ["6:0", ["G2","Bb3","Eb3"]]//,["6:0", "Bb2"],["6:0", "Eb2"],
]
).start(0)
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
      chordProgression: ["Cm", "Gb", "Db", "Gdim"]
    }
  )
  console.log("settima battuta loop "+ k++)
},"7:0:0")


export function setSeedWords(word1, word2) {
  state.melody.seedWord1= word1;
  state.melody.seedWord2= word2;
}