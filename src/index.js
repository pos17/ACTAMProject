import Worker from 'web-worker';
import DrumMachine from './DrumMachine';
import * as Instr from './instruments'
/*
 * State of the main instance of application
 */
const state= {
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
    state.melody.seedWord1= "melone";
    state.melody.seedWord2= "pera";
    buildSequence(state.melody.seedWord1);
    buildSequence(state.melody.seedWord2);
  //


}

/**
 * function that builds a sequence starting from a word 
 */
function buildSequence(seedWord) {
  var notesArray = [];
  var totalLength = 0;

  //TODO: add conversion from string to NoteSequence here
  for( var i = 0;i<seedWord.length;i++) {
    var module = seedWord.charCodeAt(i)% 7
    
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

/*-----------------------Worker -------------------------------*/ 

window.mylog = function mylog() {
    console.log("Hello World!")
}

var workerURL = new URL("./worker.js", import.meta.url)
const myWorker = new Worker(workerURL, {type:'module'} );

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