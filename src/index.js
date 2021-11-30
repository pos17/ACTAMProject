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
// const canvas = document.getElementById('main-canvas');
// const canvasDiv  = document.getElementById('canvas-div')
// const sky = document.getElementById('sky')

/*
 * State of the main instance of application
 */
//const player = new core.Player();

export const state= {
  readyModel:false,
  readyToPlay: false,/* {
    value: false,
    get getReady () {
      return this.value;
    },
    set setReady(bool) {
      
      this.value = bool;
      this.listener(this.value);
    },
    listener: function (value){
      CanvaEnv.playableButton(value);
      console.log("READY MOTHERFUCKER")
    },
  },*/
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
    chordProgression: [{
      chord:"Dm7",
      length:"2m"
    },
    {
      chord:"G7",
      length:"2m"
    },
    {
      chord:"CMaj7",
      length:"4m"
    },
  ],
    startTime: "0",
    possibleProgressions: [
      [{
        position:"II",
        length:"1m"
      },
      {
        position:"V",
        length:"1m"
      },
      {
        position:"I",
        length:"2m"
      },
      ],
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
  var seq1 = buildSequence(state.melody.seedWord1,state.key,state.harmony.chordProgression,0,1);
  var seq2 = buildSequence(state.melody.seedWord2,state.key,state.harmony.chordProgression,0,1);
  interpolateMelodies(seq1,seq2);
  state.melody.instrument = new Tone.Synth().toDestination()//new Instr.Lead()
  state.melody.instrument.volume.value = -3//setVolume(-3);
  state.harmony.instrument = new Instr.Pad()
  state.harmony.instrument.setVolume(-1);
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
      var pitch = getRandomNote(chromas)+"4"
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
    //random
    /*
    var pitch = notesArray[module]+"4"; //fixed position on the keyboard
    var length = calculateRandomTime(32-startTime,4)
    var noteToinsert = { pitch: Note.midi(pitch), startTime: startTime, endTime: startTime+length }
    console.log(noteToinsert)
    startTime=startTime+length
    melodyArray.push(noteToinsert)
    if(startTime>=32) end = true
    console.log("module:"+module+", char:"+seedWord.charAt(i)+", code:"+seedWord.charCodeAt(i))
    */
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
    Tone.start()
    Tone.Transport.bpm.value = 60
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

/*-------------------------event handling--------------------- */
/*
function waitForEvent(emitter, event){
  return new Promise((resolve, reject) => {
      const success = (val) => {
          emitter.off("error", fail);
          resolve(val);
      };
      const fail = (err) => {
          emitter.off(event, success);
          reject(err);
      };
      emitter.once(event, success);
      emitter.once("error", fail);
  });
}
*/

/*---------------------------------------------*/

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
  state.harmony.instrument.triggerAttackRelease(value,"2m",time,0.5 )
  console.log("playi")
  console.log(value)
  
}
),[
  [0, ["D3","F3","A3","C4"]],//[0, "Eb2"],[0, "G2"], 
  ["2:0", ["G2","B2","E3","F3"]],//["2:0", "Bb3"],["2:0", "Db3"],
  ["4:0", ["C3","E3","G3","B3"]],
  ["6:0", ["C3","E3","G3","B3"]]//["4:0", "F2"],["4:0", "Ab2"],
  //,["6:0", "Bb2"],["6:0", "Eb2"],
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
  /*
  console.log("interval between:"+tonic+ "and reference: C, is: " +Interval.distance("C",tonic)+" ,in semitones: "+ shift)
  console.log("chroma of the scale:"+scArr)
  console.log("tonic of the scale:"+tonic)
  console.log("reference tonic:C")
  console.log("shift interval:"+shift)
  console.log("shift chr interval:"+shiftChr)
  console.log("chord chroma:"+chromaChr)
  */
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

//console.log(chromaValues("d dorian","dm7"));






