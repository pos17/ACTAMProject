importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.4.0/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/core.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/music_vae.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@1.17.0/es6/music_rnn.js");
//import music_vae from '@magenta/music/node/music_vae';
//const music_vae = require('@magenta/music/node/music_vae');
const mvae = new music_vae.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');
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
      interpolate(event.data.mel1,event.data.mel2)
      break;
    case "continueFirst":
      continueMelodyFirst(event.data.mel, event.data.length, event.data.chordProgression)
      break;
    case "continue":
      continueMelody(event.data.mel,event.data.length,event.data.chordProgression)
      break;
    case "initializeWorker":
      initializeWorker();
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
//TODO:add new features as choosable temp and so on 
async function interpolate(mel1, mel2) {
  if (!mvae.isInitialized()) {
    await mvae.initialize();
    post("fyi","mvaeInitialized")
    
  }
  mel1q = core.sequences.quantizeNoteSequence(mel1, 4)
  mel2q = core.sequences.quantizeNoteSequence(mel2, 4)
  melArray = [mel1q,mel2q]
  console.log("mel1")
  console.log(mel1)
  console.log("mel2")
  console.log(mel2)
  console.log("mel1q")
  console.log(mel1q)
  console.log("mel2q")
  console.log(mel2q)
  const output = await mvae.interpolate(inputSequences= melArray, numInterps= 6, temperature= 1.0)
  console.log("output of interpolation:")
  console.log(output)

  var concatenatedOut = core.sequences.concatenate(output)
  console.log("concatenatedOut")
  console.log(concatenatedOut)
  var concatenatedOut2 = core.sequences.unquantizeSequence(concatenatedOut,60)
  console.log("concatenatedOut2")
  console.log(concatenatedOut2)
  // Send main script the result.
  
  post("interpolation",concatenatedOut2);
}
async function continueMelody(mel, length,chordProgression) {
  if (!mrnn.isInitialized()) {
    await mrnn.initialize();
    post("fyi","mrnnInitialized")
  }
  melq = core.sequences.quantizeNoteSequence(mel, 1)
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
  
  post("continue", continueOut);
}
async function continueMelodyFirst(mel, length,chordProgression) {
  if (!mrnn.isInitialized()) {
    await mrnn.initialize();
    post("fyi","mrnnInitialized")
  }
  melq = core.sequences.quantizeNoteSequence(mel, 1)
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

function post(message,element="Nothing,sorry :(") {
  self.postMessage(
    {
      message:message,
      element:element
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