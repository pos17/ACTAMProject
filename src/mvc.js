// import * as Instr from './instruments';
const Instr = require('./instruments.js')
import * as Tone from "tone"
import MusicalScale from './musicalScale';

// const assets = JSON.parse(new URL("./assets.json", import.meta.url));
import assets from './assets.json';

console.log('assets:')
console.log(assets)

class Model {
    constructor() {
        this.ready = false
        this.key = "C",
        this.mode = "ionian",
        this.bpm = 60;
        this.scale = new MusicalScale(this.key,this.mode);
        this.harmony = {
            instrument: new Instr.Pad(),
            mute:false,
            melodyPart:undefined,
            noteSequence:undefined,
            chordProgression: ["Cm","Gb","Db","Gdim"],
            startTime: "0",
            possibleProgressions: [
              ["I","VI","II","V"],
            ]
          },
        this.melody= {
            instrument:new Instr.Lead(),
            mute:false,
            melodyPart:undefined,
            noteSequence:undefined,
            seedWord1:"ciao",
            seedWord2:"miao",
        }
        this.worker = undefined 

    }
    _setKey(aKey) {
        this.key = aKey;
    }
    _setMode(aMode) {
        this.mode = aMode;
    }
    setBPM(aBPM) {
        this.BPM = aBPM;
    }
    isReady() {
        return this.ready
    }
    _ready() {
        this.ready = true;
    }
    updateScale(key,mode) {
        this._setKey(key);
        this._setMode(mode)
        this.scale = MusicalScale(key,mode)
    }

    /**
     * initialization method for the main model 
     */
    async initialize() {
        try {
            var workerURL = await new URL("./worker.js", import.meta.url)
            this.worker = await new Worker(workerURL/*, {type:'module'}*/ );
        } catch(e) {
            console.error("worker initialization went wrong!")
            console.log(e)
        }
        this.worker.onmessage = (event)=> {this.workerResponse(event)}
        this._ready()
    }
    /*-----------------------------worker----------------------------- */
    
    
    /**
     * method that handles the response of the worker, whatever it is
     * @param {Event} event element that is returned by the worker 
     */
    workerResponse(event) {
        switch(event.data.message){
          case "fyi": {
            console.log(event.data.element);
          } break;
          case "interpolation": {
            const sample = event.data.element;
            console.log("response message:"+ event.data.message)
            state.worker.postMessage(
              {
                message:"continue",
                mel:sample,
                length:32,
                chordProgression:["Cm","Gb","Db","Gdim"]
              }
            )
          } break;
          case "continue": {
            const sample = event.data.element;
            console.log("response message:"+ event.data.message)
             state.melody.noteSequence = sample
            var notePart = generatePart(sample);
            state.melody.melodyPart = notePart;
          } break;
        }
      };
    
  }
  
  class View {
    constructor() {
      
    }
  }
  
  class Controller {
    constructor(model, view) {
      this.model = model
      this.view = view
    }
  }
  
  const app = new Controller(new Model(), new View())