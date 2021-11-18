import Worker from 'web-worker';
import DrumMachine from './DrumMachine';
import MusicalScale from './musicalScale';
import * as Instr from './instruments'
/*
 * State of the main instance of application
 */
const state= {
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





function initializeState() {
  //TODO: put here the part of the dialog to input first information about user: mood seedwords
  state.melody.seedWord1= "coccodrillo";
  state.melody.seedWord2= "pera";
  state.scale = new MusicalScale('C','ionian');
  buildSequence(state.melody.seedWord1);
  buildSequence(state.melody.seedWord2);

  
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
    var length = calculateRandomTime(32-startTime,6)
    var noteToinsert = { pitch: pitch, startTime: startTime, endTime: startTime+length }
    console.log(noteToinsert)
    startTime=startTime+length
    melodyArray.push(noteToinsert)
    if(startTime>=32) end = true
    console.log("module:"+module+", char:"+seedWord.charAt(i)+", code:"+seedWord.charCodeAt(i))
  }

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
        qpm: 120
      }
    ],
    notes: notesArray
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

/*-----------------------Worker -------------------------------*/ 

window.mylog = function mylog() {
    console.log("Hello World!")
}

var workerURL = new URL("./worker.js", import.meta.url)
const myWorker = new Worker(workerURL/*, {type:'module'}*/ );

function talkToWorker() {
    //var topic = "ciao"
    someNoteSequence = "cazzi"
    myWorker.postMessage(someNoteSequence);
    //console.log("posted the message: "+topic+" to the worker")
}

myWorker.onmessage = (event) => {
    if (event.data.fyi) {
      console.log(event.data.fyi);
    } else {
      const sample = event.data.sample;
      console.log(sample)
      // Do something with this sample
    }
  };

/*
myWorker.onmessage = function(e) {
    result.textContent = e.data;
    console.log("Message received from worker: " + resul.textContent)
}
*/
const workieTalkie = document.getElementById("workieTalkie")
workieTalkie.onclick = talkToWorker


/*----------------------*/ 