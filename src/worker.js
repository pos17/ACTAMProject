import { concatenate } from "@magenta/music/esm/core/sequences";

importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/es6/core.js");
//importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/dist/magentamusic.min.js")
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/es6/music_vae.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/es6/music_rnn.js");
//import music_vae from '@magenta/music/node/music_vae';
//const music_vae = require('@magenta/music/node/music_vae');
const mvae = new music_vae.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2');
const mrnn = new music_rnn.MusicRNN("https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv");
// Main script asks for work.
self.onmessage = async (event) => {
  taskType = event.data.message
  console.log("message received, type of work: "+taskType)
  switch(taskType) {
    case "hi":
      post("hi","Hello There!")
      break;
    case "interpolate":
      interpolate(event.data.seedMelodies,event.data.numOfInterpolations,event.data.waitingIndex)
      break;
    case "continueFirst":
      continueMelodyFirst(event.data.mel, event.data.length, event.data.chordProgression)
      break;
    case "continue":
      continueMelody(event.data.mel,event.data.length,event.data.chordProgression,event.data.index)
      break;
    case "initializeWorker":
      initializeWorker();
      break;
    case "concatenate": {
      console.log("qui ci sono ")
      console.log(event.data.concatenationArray)
      concatenateSeq(event.data.concatenationArray,event.data.waitingIndex);
    }
      break;
    default:
      console.error("no message to the, don't know what to do!")
  }
  
};

async function initializeWorker() {
  if (!mvae.isInitialized()) {
    await mvae.initialize();
    post("fyi","mvaeInitialized")
  }
  if (!mrnn.isInitialized()) {
    await mrnn.initialize();
    post("fyi","mrnnInitialized")
  }
  post("modelInitialized")
}

function concatenateSeq(melodyArray,waitingIndex) {
  console.log("concazzoinculo1")
  var concatenatedOut = core.sequences.concatenate(melodyArray)
  console.log("concazzoinculo")
  post("concatenate", concatenatedOut,waitingIndex);
}
//TODO:add new features as choosable temp and so on 
async function interpolate(seedMelodies,numOfInterpolations,waitingIndex) {
  if (!mvae.isInitialized()) {
    await mvae.initialize();
    post("fyi","mvaeInitialized")
    
  }
  console.log(seedMelodies)
  const output = await mvae.interpolate(inputSequences= seedMelodies, numInterps= numOfInterpolations, temperature= 1.0)
  console.log("output of interpolation:")
  console.log(output)
  const outputObj= {
    value:output,
  }
  //var concatenatedOut = core.sequences.concatenate(output)
  //console.log("concatenatedOut")
  //console.log(concatenatedOut)
  //var concatenatedOut2 = core.sequences.unquantizeSequence(concatenatedOut,60)
  //console.log("concatenatedOut2")
  //console.log(concatenatedOut2)
  // Send main script the result.
  
  post("interpolation",outputObj,waitingIndex);
}
async function continueMelody(mel, length,chordProgression) {
  if (!mrnn.isInitialized()) {
    await mrnn.initialize();
    post("fyi","mrnnInitialized")
  }
  //melq = core.sequences.quantizeNoteSequence(mel, 4)
  console.log("mel")
  console.log(mel)
  console.log("length")
  console.log(length)
  
  const result = await mrnn.continueSequence(
    sequence=mel,
    steps=length,
    temperature=1.0,
    chordProgression=chordProgression
  );
  console.log("result of continue:")
  console.log(result)
  //var continueOut = core.sequences.unquantizeSequence(result,60)
  //console.log("unquantizedContinue")
  //console.log(continueOut)
  // Send main script the result.
  
  post("continue", result);
}
async function continueMelodyFirst(mel, length,chordProgression) {
  if (!mrnn.isInitialized()) {
    await mrnn.initialize();
    post("fyi","mrnnInitialized")
  }
  //melq = core.sequences.quantizeNoteSequence(mel, 1)
  console.log("mel")
  console.log(mel)
  console.log("melq")
  console.log(melq)
  const result = await mrnn.continueSequence(
    sequence=melq,
    steps=length,
    temperature=0.9,
    chordProgression=chordProgression
  );
  console.log("result of continue:")
  console.log(result)
  var continueOut = core.sequences.unquantizeSequence(result,60)
  console.log("unquantizedContinue")
  console.log(continueOut)
  // Send main script the result.
  
  post("continueFirst", continueOut);
}

function post(message,element="Nothing,sorry :(",waitingIndex=-1) {
  self.postMessage(
    {
      message:message,
      element:element,
      waitingIndex:waitingIndex
    }
  )
}

/*
onmessage = function(e) {
    console.log("message received");
    var wokerResult = "Result: " + (e.data[0]);
    console.log("sending the message back")
    postMessage(wokerResult);
}
*/