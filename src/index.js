import ("./spoonacular.js")


window.mylog = function mylog() {
    console.log("Hello World!")
}
const myWorker = new Worker(
  new URL("./worker.js", import.meta.url)
);

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