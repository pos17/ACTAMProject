importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.4.0/dist/tf.min.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/core.js");
importScripts("https://cdn.jsdelivr.net/npm/@magenta/music@^1.12.0/es6/music_vae.js");
//import music_vae from '@magenta/music/node/music_vae';
//const music_vae = require('@magenta/music/node/music_vae');
const mvae = new music_vae.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small');

// Main script asks for work.
self.onmessage = async (event) => {
  taskType = event.data.message
  console.log("message received, type of work: "+taskType)
  switch(taskType) {
    case "interpolate":
      interpolate(event.data.mel1,event.data.mel2)
      break;
    case "continue":
      // code block
      break;
    default:
      console.error("no message to the, don't know what to do!")
  }
  
};
//TODO:add new features as choosable temp and so on 
async function interpolate(mel1, mel2) {
  if (!mvae.isInitialized()) {
    await mvae.initialize();
    postMessage({fyi: 'model initialized'});
  }
  mel1q = core.sequences.quantizeNoteSequence(mel1, 1)
  mel2q = core.sequences.quantizeNoteSequence(mel2, 1)
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
  
  self.postMessage({
    message:"interpolation",
    sample: concatenatedOut2
  });
}


/*
onmessage = function(e) {
    console.log("message received");
    var wokerResult = "Result: " + (e.data[0]);
    console.log("sending the message back")
    postMessage(wokerResult);
}
*/