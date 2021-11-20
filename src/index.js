import Worker from 'web-worker';
import DrumMachine from './DrumMachine';
import * as Instr from './instruments'


// const canvas = document.getElementById('main-canvas');
// const canvasDiv  = document.getElementById('canvas-div')
// const sky = document.getElementById('sky')

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
  },
  assets: {},
  canvas: {}
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

/* ----   ASSETS LOADING   ---- */

const assets = {
    TreeUrls: ['./assets/TREES/Tree Alt.png', './assets/TREES/Tree Maj.png', './assets/TREES/Tree Min.png', './assets/TREES/Trees.png'],
    StarUrls: ['./assets/Big Star.png', './assets/Small Star.png'],
    HouseUrls: ['./assets/HOUSE/Home.png'],
    MoonUrls: ['./assets/MOON/Moon.png']
};


function addImage () {
  /* assets.sky = addImageToCanvasDiv(new URL('../assets/BG/Background.png', import.meta.url), {
    // class: 'large-on-hover',
    width: '80%',
    left: '10%',
    // top: '10%',
    zIndex: '-2'
  }); */

  assets.mountain = addImageToCanvasDiv(new URL('../assets/BG/Mountains.png', import.meta.url), {
    // class: 'large-on-hover',
    width: '80%',
    left: '10%',
    top: '53%',
    zIndex: '0'
  });

  assets.grass = addImageToCanvasDiv(new URL('../assets/BG/Grass.png', import.meta.url), {
    // class: 'large-on-hover',
    width: '80%',
    left: '10%',
    top: '72%',
    zIndex: '1'
  });

  console.log(assets)
}

// addImage()
// initCanvas()

/* function addImageToCanvasDiv(src, params) {
  let img = new Image();
  img.src = src;  

  console.log('group'+params.group)
  if (params.group) {
    const div = document.createElement('DIV');
    div.style.position = 'absolute';

    img.style.width = '100%';
    img.style.top = '0';
    img.style.left = '0';
    img.style.margin = '0';
    div.appendChild(img);
    img = div;
  } else {
    img.style.position = 'absolute';
  }

  if (params.class) {
    if (params.class.includes(' ')) {
      img.classList.add(...params.class.split(' '));
    } else {
      img.classList.add(params.class);
    }
  }
  // img.style.position = 'relative'; 
  img.style.position = 'absolute';

  if (params.display) {
    img.style.display = params.display;
  } else {
    img.style.display = 'block';
  }

  if (!params.height) {
    img.style.width = params.width ? params.width : '25%';
    img.style.height = 'auto';
  } else {
    img.style.height = params.height;
    img.style.width = 'auto';
  }

  if (!params.right) {
    img.style.left = params.left ? params.left : '5%';
  } else {
    img.style.right = params.right;
  }

  if (!params.top) {
    img.style.bottom = params.bottom ? params.bottom : '5%';
  } else {
    img.style.top = params.top;
  }

  if (!params.display) {
    img.style.display = 'block';
  } else {
    img.style.display = params.display;
  }

  img.style.zIndex = params.zIndex ? params.zIndex : '0';

  canvasDiv.appendChild(img);
  console.log(params.class)
  console.log(state)
  return img;
} */



// /*-----------------------Worker -------------------------------*/ 

// window.mylog = function mylog() {
//     console.log("Hello World!")
// }

// var workerURL = new URL("./worker.js", import.meta.url)
// const myWorker = new Worker(workerURL, {type:'module'} );

// function talkToWorker() {
//     //var topic = "ciao"
//     someNoteSequence = "cazzi"
//     myWorker.postMessage(someNoteSequence);
//     //console.log("posted the message: "+topic+" to the worker")
// }

// myWorker.onmessage = (event) => {
//     if (event.data.fyi) {
//       console.log(event.data.fyi);
//     } else {
//       const sample = event.data.sample;
//       console.log(sample)
//       // Do something with this sample
//     }
//   };

// /*
// myWorker.onmessage = function(e) {
//     result.textContent = e.data;
//     console.log("Message received from worker: " + resul.textContent)
// }
// */
// const workieTalkie = document.getElementById("workieTalkie")
// workieTalkie.onclick = talkToWorker


/*----------------------*/ 