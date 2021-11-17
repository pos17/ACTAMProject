import Worker from 'web-worker';

/*
 * State of the main instance of application
 */
const state= {

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