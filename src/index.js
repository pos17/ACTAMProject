//importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/core.js");
//const core = require('@magenta/music/node/core');
import Worker from 'web-worker';
import DrumMachine from './DrumMachine';
import MusicalScale from './musicalScale';
import * as Instr from './instruments';
import {Note} from "tonal";
import * as Tone from "tone"
/*
 * State of the main instance of application
 */
//const player = new core.Player();

const state= {
  worker: undefined,
  key:"", //main key of the system
  mode:"",
  scale:undefined, //main mode of the system 
  melody:{
    seedWord1:"",
    seedWord2:"",
    
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
  }
}

initializeState()
/**
 *  Function to initialize the main settings of the player 
 */





async function   initializeState() {
  //TODO: put here the part of the dialog to input first information about user: mood seedwords
  state.melody.seedWord1= "ciao";
  state.melody.seedWord2= "bellissima";
  state.scale = new MusicalScale('D','ionian');
  var seq1 = buildSequence(state.melody.seedWord1);
  var seq2 = buildSequence(state.melody.seedWord2);
  var workerURL = await new URL("./worker.js", import.meta.url)
  state.worker = await new Worker(workerURL/*, {type:'module'}*/ );
  console.log("seq1")
  console.log(seq1)
  console.log("seq2")
  console.log(seq2)
  await interpolateMelodies(seq1,seq2);
  
  state.worker.onmessage = (event) => {
    if (event.data.fyi) {
      console.log(event.data.fyi);
    } else {
      const sample = event.data.sample;
      console.log("response message:"+ event.data.message)
      const synth = new Tone.Synth().toDestination();
      addPartToTransport(sample,synth)
    }
  };

  //console.log("notes belonging to C ionian the scale: "+scale.scaleNotes())

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
  maxLength = Math.round(Math.random()*((maxLength*2)));
  //maxLength = (maxLength*2)-1
  if((constraint*2)<(maxLength+1)) {
  toRet = Math.round(Math.random() * ((constraint*2)-1)) +1;
  } else {
    toRet = Math.round(Math.random() * maxLength) +1;
  }
  toRet = toRet/2
  return toRet
}

/*-----------------------Worker --------------------------------*/ 

window.mylog = function mylog() {
    console.log("Hello World!")
    Tone.start()
    Tone.Transport.start();

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



/**
 * response to worker
 */
  
/*
myWorker.onmessage = function(e) {
    result.textContent = e.data;
    console.log("Message received from worker: " + resul.textContent)
}
*/
const workieTalkie = document.getElementById("workieTalkie")
//workieTalkie.onclick = talkToWorker


/*----------------------*/ 

function addPartToTransport(noteSequence,instrument) {
  var qpm = noteSequence.tempos[0].qpm
  var numofnotes = noteSequence.notes.length
  var notesToTranscribe = noteSequence.notes
  var notes = []
  for(var i = 0;i<numofnotes;i++) {
    noteFromArray = notesToTranscribe[i]
    console.log(noteFromArray.startTime)
    var note = Note.fromMidi(noteFromArray.pitch)
    var velocity = 0.5;
    var measure = Math.floor(noteFromArray.startTime / 4)
    var quarter = Math.floor(noteFromArray.startTime%4)
    var sixteenth = Math.floor(noteFromArray.startTime*4)%16 -quarter*4;
    console.log(measure)
    var timeString = measure+":"+quarter+":"+sixteenth;
    var indexInput = {
      time:timeString,
      note: note,
      velocity:velocity
    }
    notes.push(indexInput)
  }
  console.log(notes)
  console.log(qpm)
  var i =0;
  const part = new Tone.Part(((time, value)=> {
      instrument.triggerAttackRelease(value.note, notesToTranscribe[i].endTime-notesToTranscribe[i].startTime,time,value.velocity )
      i++;
    }
  ),notes
  
  ).start(0)

}
