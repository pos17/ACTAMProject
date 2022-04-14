//import { Note, Chord, Interval} from "@tonaljs/tonal";
//import * as Tone from "tone"

//import * as Instr from './instruments.js';
//import * as MVC from "./modelViewController.js"
//import { getAsset, getDocumentElement } from "./firebase.js";
let app;
let db;
let storage;
let ctx;
let canvas;
const state = {
    loadingPage: {
        value: 0,
        limit: 0,
        lastUpdate: undefined,
    },
    imagesToDraw: {},
    environments: undefined,
    elementTypes: undefined,
    elements: [],
    queueCounter: 0,
    queueDay: 0, //0 night, 1 night to day, 2 day, 3 day to night
    now1: 0,
    canvasFactor: 8,
    framereq: undefined,
    fps: 15,
    instruments: {},
    stateChanged: false,
    readyModel: false,
    readyToPlay: false,
    isPlaying: true,
    key: "c", //main key of the system
    bpm: 60,
    totalLength: "",
    navigationPage: 0,
    startingId: 0,
    master: {},
    playingPart: [],
    drawing: {
        idList: {
            astrumDay: 21,
            astrumNight: 20,
            landscape: 0,
            floor: 8,
            building: 12,
            tree: 16,
            background: 1,
            flyingObject: []
        },
        image: {
            flyingObject: []
        },
        audio: {
            chords: "| F6 | Em7 A7 | Dm7 | Cm7 F7 |",
            melody: "f+4 c+8 a8 e+4 c+8 a8\nd+8 e+8 cb8 d+8 db+8 bb8 g8 ab8\na4 f8 d8 g8 a8 f8 e8\neb8 g16 bb16 d+8 db+8 r8 f8 f16 g8 f16",
            instruments: {},
        }
    },
}



/**
 *  Function to initialize the main settings of the player 
 */
async function initializeMyApp() {

    //initialize the drawing values
    //state.isFirst = true
    // prioritize sustained playback
    //const context = new Tone.Context({ latencyHint: "playback" });
    // set this context as the global Context
    //Tone.setContext(context);
    initializeFirebase();
    Tone.context.lookAhead = 5;
    setNow()
    setMasterChain()
    console.log("master chain set")
    console.log(getMasterChain())
    Tone.Destination.chain(getMasterChain().compressor, getMasterChain().hiddenGain, getMasterChain().mainGain)
    console.log("master chain get")
    setLimit(40)
    increase();
    await initiateState()
    buildInstruments()
    //console.log(state.instruments)
    setLimit(90)
    orderElements()
    await createMenu()
    assignClick()
    updatePage(0)
    setLimit(100)
    //Tone.context.latencyHint = 'playback'
    console.log("i nodi")
    prepareCanvas();
    /*
    await generateNodes()
    console.log(generateMelody())
    let notePart = parseMelodyString("f+4 c+8 a8 e+4 c+8 a8\nd+8 e+8 cb8 d+8 db+8 bb8 g8 ab8\na4 f8 d8 g8 a8 f8 e8\neb16 g16 bb8 d+8 db+8 r8 f8 f16 g8 f16")
    console.log("notepart")
    console.log(notePart)
    addNotePartToTransport(notePart, getInstrument("Marimba")) 
    */

}


initializeMyApp()

/***
 * 
 * 
 * MVC
 * 
 * 
 */



async function initiateState() {
    let data = await getMenuTypes()
    console.log("got?")
    state.elementTypes = data.primaryTypes
    state.environments = data.environments
    let elements = await getElements()
    state.elements = elements
}

function getSelectedIdList() {
    return state.drawing.idList;
}

function getStateElements() {
    return state.elements;
}

function getImage() {
    return state.drawing.image
}


function setNow() {
    state.loadingPage.lastUpdate = Date.now()
}
function getMasterChain() {
    return state.master
}
function setMasterChain() {
    state.master = {
        compressor: new Tone.Compressor({
            threshold: -15,
            ratio: 7,
        }),
        hiddenGain: new Tone.Gain(0.3),
        mainGain: new Tone.Gain(1),
        mainVolumeSave: 1
    }
}

function setMasterVolume(value) {
    if (value > 0) state.master.mainVolumeSave = value
    state.master.mainGain.gain.value = value
}
function getSavedVolume() {
    return state.master.mainVolumeSave
}

function getMasterVolume() {
    return state.master.mainGain.gain.value
}



/**
 * loading bar improvement using requestAnimationFrame
 */
function setLimit(toValue) {
    state.loadingPage.limit = toValue
}

function increase() {
    let element = document.getElementById("loadingId");
    let fromValue = state.loadingPage.value;
    let limit = state.loadingPage.limit;
    if ((Date.now() - state.loadingPage.lastUpdate) > (1000 / 30)) {
        if (fromValue < limit) {
            state.loadingPage.value = fromValue + 1;
            element.value = state.loadingPage.value;
        }
        if (fromValue >= 100) {
            document.getElementById("container").hidden = false
            document.getElementById("initialLoadingPanel").style.visibility = 'hidden'

        }
        window.requestAnimationFrame(increase)
        state.loadingPage.lastUpdate = Date.now()
    } else {
        window.requestAnimationFrame(increase)
    }
}




/**
 * id of the element to load to change the actual drawing state
 * @param {int} idValue 
 */
function modifyIdList(idValue) {
    console.log(idValue)
    //console.log(state.possibleValues)
    let modifyingValue = state.elements.find(element => element.id == idValue)
    console.log("modifying value")
    console.log(modifyingValue)
    switch (modifyingValue.elementType) {
        case ("floor"): {
            state.drawing.idList[modifyingValue.elementType] = modifyingValue.id
        } break;
        case ("background"): {
            state.drawing.idList[modifyingValue.elementType] = modifyingValue.id
        } break;
        case ("landscape"): {
            state.drawing.idList[modifyingValue.elementType] = modifyingValue.id
            //state.drawing.chords.instrument = modifyingValue.instrument
            //state.drawing.chords.effect = modifyingValue.effect
        } break;
        case ("building"): {
            state.drawing.idList[modifyingValue.elementType] = modifyingValue.id
        } break;
        case ("tree"): {
            state.drawing.idList[modifyingValue.elementType] = modifyingValue.id
        } break;
        case ("astrumDay"): {
            state.drawing.idList[modifyingValue.elementType] = modifyingValue.id
        } break;
        case ("astrumNight"): {
            state.drawing.idList[modifyingValue.elementType] = modifyingValue.id
        } break;
        case ("flyingObject"): {
            const count = {};
            for (const element of state.drawing.idList[modifyingValue.elementType]) {
                if (count[element]) {
                    count[element] += 1;
                } else {
                    count[element] = 1;
                }
            }
            //console.log("in?1")
            if (count[modifyingValue.id] > 2) {
                while (state.drawing.idList[modifyingValue.elementType].indexOf(modifyingValue.id) != -1) {
                    let index = state.drawing.idList[modifyingValue.elementType].indexOf(modifyingValue.id)
                    state.drawing.idList[modifyingValue.elementType].splice(index, 1)
                }
            } else {
                //console.log("in?2")
                state.drawing.idList[modifyingValue.elementType].push(modifyingValue.id)
            }
        } break;

    }
    console.log(state.drawing)
}

async function updateState() {
    let ids = getIdList()
    let flyObjsArr = []
    state.imagesToDraw["flyingObject"] = flyObjsArr


    for (let id of ids) {
        let modifyingValue = state.elements.find(element => element.id == id)
        console.log("modifyingValue")
        console.log(modifyingValue)
        switch (modifyingValue.elementType) {
            case ("floor"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])
                console.log("ch")
                console.log(state.drawing.audio.instruments["chords"])
                state.drawing.audio.instruments["chords"] = modifyingValue.audio.instrument

            } break;
            case ("background"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])

            } break;
            case ("landscape"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])
            } break;
            case ("building"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])
                console.log("mel")
                console.log(state.drawing.audio.instruments["melody"])
                state.drawing.audio.instruments["melody"] = modifyingValue.audio.instrument
            } break;
            case ("tree"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])
                console.log("bass")
                console.log(state.drawing.audio.instruments["bass"])
                state.drawing.audio.instruments["bass"] = modifyingValue.audio.instrument
            } break;
            case ("astrumDay"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])
            } break;
            case ("astrumNight"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])
            } break;
            case ("flyingObject"): {
                state.drawing.image[modifyingValue.elementType].push(modifyingValue.image)
                state.imagesToDraw[modifyingValue.elementType] = [];
                let i = 0
                for (let img of state.drawing.image[modifyingValue.elementType]) {
                    console.log("Im here to check images to draw ")
                    console.log(state.imagesToDraw)
                    console.log(img)
                    if (state.drawing.image[modifyingValue.elementType].indexOf(img) < i) {
                        var elToCopy = state.imagesToDraw[modifyingValue.elementType][state.drawing.image[modifyingValue.elementType].indexOf(img)]
                        console.log(elToCopy)
                        var newEl = elToCopy.clone()
                        console.log(newEl)
                        newEl.changeRandomParams()
                        console.log(newEl)
                        state.imagesToDraw[modifyingValue.elementType].push(newEl);
                        console.log("pushing a recycled element")
                    } else {
                        state.imagesToDraw[modifyingValue.elementType].push(await DrawableImage.build(img))
                        console.log("pushing a recycled element")
                    }
                    i++
                }
            } break;

        }
    }
}

function getIdList() {
    let arToRet = []
    for (const [key, value] of Object.entries(state.drawing.idList)) {
        switch (key) {
            case ("floor"): {
                arToRet.push(value)
            } break;
            case ("background"): {
                arToRet.push(value)
            } break;
            case ("landscape"): {
                arToRet.push(value)
            } break;
            case ("building"): {
                arToRet.push(value)
            } break;
            case ("tree"): {
                arToRet.push(value)
            } break;
            case ("astrumDay"): {
                arToRet.push(value)
            } break;
            case ("astrumNight"): {
                arToRet.push(value)
            } break;
            case ("flyingObject"): {
                for (let el of value) {
                    arToRet.push(el)
                }
            } break;

        }
    }

    return arToRet
}

function orderElements() {
    let orderedEl = []
    let elements = state.elements
    let elementTypes = state.elementTypes
    let environments = state.environments
    for (let elType of elementTypes) {
        for (let env of environments) {
            let el = elements.find(element => ((element.elementType == elType) && (element.environment == env)))
            let index = elements.indexOf(el)
            elements.splice(index, 1)
            orderedEl.push(el)
        }
    }
    let el1;
    while ((el1 = elements.find(element => ((element.elementType == "flyingObject")))) != undefined) {
        let index = elements.indexOf(el1)
        elements.splice(index, 1)
        orderedEl.push(el1)
    }
    while (elements.length > 0) {
        let el = elements.pop()
        orderedEl.push(el)
    }
    state.elements = orderedEl;

}


function getImageToDraw(key) {
    return state.imagesToDraw[key]
}
function getFrameReq() {
    return state.framereq
}
function setFrameReq(value) {
    state.framereq = value
}

/**
 * work on play pause elements
 */

function setPlaying(value) {
    state.isPlaying = value
}

function isPlaying() {
    return state.isPlaying
}
function getAnimationSnap() {
    return state.now1
}
function setAnimationSnap(value) {
    state.now1 = value
}
function getFPS() {
    return state.fps
}

function getNavPage() {
    return state.navigationPage
}

function setNavPage(aPage) {
    state.navigationPage = aPage
}

function setInstrument(instrName, instrInstance) {

    state.instruments[instrName] = instrInstance;
}

function getInstrument(instrName) {
    return state.instruments[instrName];
}

function getInstrumentList() {
    return state.drawing.audio.instruments;
}

function getPlayingInstrument(instrUse) {
    let instr = getInstrument(state.drawing.audio.instruments[instrUse])
    return instr;
}

/*
    Nodes handling
*/

async function generateNodes() {
    var nodeList = await getNodes()
    var mMelody = new MarkovMelody(nodeList)
    state.melodyNodes = mMelody
}

function generateMelody(startId) {
    return state.melodyNodes.generateMelody(startId)
}

function getMelodyString() {
    return state.drawing.audio.melody;
}

function getChordString() {
    return state.drawing.audio.chords;
}

function getStartingNode() {
    return state.startingId;
}

function addPlayingPart(playingPart) {
    state.playingPart.push(playingPart)
}
function getPlayingPartLength() {
    return state.playingPart.length
}
function getPlayingPart() {
    return state.playingPart
}


// {
//   "__idEnvStructure": "1x -> mountain, 2x -> desert, 3x -> city, 4x -> seaside, 5x -> skyelement",
//   "__idElemStructure": "x1 -> background, x2 -> landscape, x3 -> floor, x4 -> building, x5 -> shrub"
// },
/**
 * 
 * @param {bool} isFirst values that states if the function is called during the initialization 
 */
async function propagateStateChanges(isFirst) {

    console.log("state before propagation")
    console.log(state)
    if (state.drawing.image.isChanged) {
        //TODO: adding function to reshape the image of the view 
        state.drawing.image.isChanged = false
    }

    if (state.drawing.chords.isChanged === true) {
        console.log()
        if (state.playingPartChords) {
            console.log("here I am")
            state.playingPartChords.cancel(0)
        } else {
            console.log("here I am not")
        }
        //FIXME: adding adapting loop
        Tone.Transport.loopEnd = state.drawing.loopLength;
        //console.log(state.drawing.chords.instrument)
        Object.keys(state.effects.harmony).forEach(key => {
            console.log(state.effects.harmony[key])
            state.effects.harmony[key].wet.value = 0;
        });
        for (i = 0; i < state.drawing.chords.effects.length; i++) {
            console.log(state.drawing.chords.effects[i].effect)
            console.log(state.effects.harmony)

            state.effects.harmony[state.drawing.chords.effects[i].effect].set(state.drawing.chords.effects[i].setup)
        }
        state.playingPartChords = playChordSequence(state.drawing.chords.sequence, state.key, state.instruments[state.drawing.chords.instrument], 1)
        state.playingPartChords.loopEnd = state.drawing.chords.loopLength
        state.playingPartChords.loop = true;
        state.drawing.chords.isChanged = false
    }

    if (state.drawing.melody.isChanged === true) {
        if (!isFirst) {
            state.drawing.melody.playingPart.stop()
        }
        Object.keys(state.effects.melody).forEach(key => {
            state.effects.melody[key].wet.value = 0;
        });
        for (i = 0; i < state.drawing.melody.effects.length; i++) {
            state.effects.melody[state.drawing.melody.effects[i].effect].set(state.drawing.melody.effects[i].setup)
        }

        state.drawing.melody.playingPart = addNotePartToTransport(generatePart(state.drawing.melody.sequence), state.instruments[state.drawing.melody.instrument], 0)
        state.drawing.melody.isChanged = false
    }
    console.log("state after propagation")
    console.log(state)
}



function buildInstruments() {

    //building audio channels
    let bassChannel = new Tone.Channel()
    let harmonyChannel = new Tone.Channel()
    let melodyChannel = new Tone.Channel()
    let drumChannel = new Tone.Channel()

    console.log("here I am")
    /* //build modulation effects
    state.effects.harmony.chorus = new Tone.Chorus()
    state.effects.melody.chorus = new Tone.Chorus()
    state.effects.harmony.chorus.wet.value = 0
    state.effects.melody.chorus.wet.value = 0 */


    //build time effects
    /*
   state.effects.harmony.reverb = new Tone.Reverb()
   state.effects.harmony.reverb.wet.value = 0
   state.effects.melody.reverb = await new Tone.Reverb()
   state.effects.melody.reverb.wet.value = 0
       //TODO: set correct time for delay
   state.effects.melody.delay = new Tone.PingPongDelay()
   state.effects.harmony.delay = new Tone.PingPongDelay()
   state.effects.melody.delay.wet.value = 0
   state.effects.harmony.delay.wet.value = 0
   console.log(state.effects.harmony.delay.get())
       //creating effects chain
   */
    harmonyChannel.chain(
        Tone.Destination
    )
    bassChannel.chain(
        Tone.Destination
    )
    melodyChannel.chain(
        Tone.Destination
    )
    drumChannel.chain(
        Tone.Destination
    )

    /*      building instruments         */

    /* leads */
    let bell = new Bell();
    let lead = new Lead();
    let sitar = new Sitar()
    let marimba = new Marimba();

    bell.connect(melodyChannel)
    lead.connect(melodyChannel)
    sitar.connect(melodyChannel)
    marimba.connect(melodyChannel)

    setInstrument("Bell", bell)
    setInstrument("Lead", lead)
    setInstrument("Sitar", sitar)
    setInstrument("Marimba", marimba)


    /* bass */
    let bass1 = new Bass1()
    let bass2 = new Bass2()
    let bass3 = new Bass3()
    let bass4 = new Bass4()

    bass1.connect(bassChannel)
    bass2.connect(bassChannel)
    bass3.connect(bassChannel)
    bass4.connect(bassChannel)


    setInstrument("Bass1", bass1)
    setInstrument("Bass2", bass2)
    setInstrument("Bass3", bass3)
    setInstrument("Bass4", bass4)


    /* pads */
    let synth1 = new Synth1()
    let synth2 = new Synth2()
    let synth3 = new Synth3()
    let synth4 = new Synth4()

    synth1.connect(harmonyChannel)
    synth2.connect(harmonyChannel)
    synth3.connect(harmonyChannel)
    synth4.connect(harmonyChannel)


    setInstrument("Synth1", synth1)
    setInstrument("Synth2", synth2)
    setInstrument("Synth3", synth3)
    setInstrument("Synth4", synth4)
}

function startMusic() {
    //Tone.Transport.loop = true;
    Tone.Transport.bpm.value = 60
    Tone.Transport.start("+0.1", "0:0:0");

    setPlaying(true);
}

function stopMusic() {
    Tone.Transport.stop();
    //Tone.Transport.cancel(0)
    setPlaying(false);
}


//FIXME some delay play/pause
function togglePlayPause() {
    if (state.isPlaying) {
        Tone.Transport.pause()
        state.isPlaying = false
        console.log(state.isPlaying)
    } else {
        Tone.Transport.start()
        state.isPlaying = true

    }
}

window.addEventListener("keydown", function (event) {
    if (event.key == "MediaPlayPause") togglePlayPause()
}, true);


/**
 * 
 * @param {*} noteSequence quantized noteSequence generated by magenta models
 * @returns 
 */
function generatePart(noteSequence) {
    console.log(noteSequence)
    //var qpm = 
    var numofnotes = noteSequence.notes.length
    var notesToTranscribe = noteSequence.notes
    var notes = []
    var stepsPerQuarter = noteSequence.quantizationInfo.stepsPerQuarter;
    for (var i = 0; i < numofnotes; i++) {
        noteFromArray = notesToTranscribe[i]
        console.log(noteFromArray.quantizedStartStep)
        var note = Note.fromMidi(noteFromArray.pitch)
        var velocity = 0.5;
        var measure = Math.floor(noteFromArray.quantizedStartStep / (4 * stepsPerQuarter))
        var quarter = Math.floor((noteFromArray.quantizedStartStep % (4 * stepsPerQuarter)) / 4)
        var sixteenth = Math.floor(noteFromArray.quantizedStartStep) - quarter * 4 - measure * 16;
        console.log(measure)
        var timeString = measure + ":" + quarter + ":" + sixteenth;
        var durationSteps = noteFromArray.quantizedEndStep - noteFromArray.quantizedStartStep
        var measureDur = Math.floor(durationSteps / (4 * stepsPerQuarter))
        var quarterDur = Math.floor((durationSteps % (4 * stepsPerQuarter)) / 4)
        var sixteenthDur = Math.floor(durationSteps) - quarterDur * 4 - measureDur * 16;
        var durationString = measureDur + ":" + quarterDur + ":" + sixteenthDur;
        var indexInput = {
            time: timeString,
            note: note,
            velocity: velocity,
            duration: durationString
        }
        notes.push(indexInput)
    }
    console.log(notes)
    return notes
}
/**
 * 
 * @param {*} melodyString 
 * @returns format {midiNote,duration,time}
 */
function parseMelodyString(melodyString) {
    let notesToRet = [];
    let barsArray = melodyString.split("\n")
    let barsNum = barsArray.length
    let barIndex = 0;
    let quarterIndex = 0;
    let sixteenthIndex = 0;
    for (let bar of barsArray) {
        let notesArray = bar.split(" ")
        console.log(notesArray)
        for (let note of notesArray) {
            let noteMap = buildNoteFromString(note)
            let timeSig = barIndex + ":" + quarterIndex + ":" + sixteenthIndex
            noteMap["time"] = timeSig
            if (noteMap.note != "r") {
                notesToRet.push(noteMap)
            }
            switch (noteMap.duration) {
                case "1m":
                    barIndex = barIndex + 1;
                    break;
                case "1m.":
                    barIndex = barIndex + 1;
                    quarterIndex = quarterIndex + 2
                    break;
                case "2n":
                    quarterIndex = quarterIndex + 2;
                    break;
                case "2n.":
                    quarterIndex = quarterIndex + 3;
                    break;
                case "4n":
                    quarterIndex = quarterIndex + 1;
                    break;
                case "4n.":
                    quarterIndex = quarterIndex + 1;
                    sixteenthIndex = sixteenthIndex + 2;
                    break;
                case "8n":
                    sixteenthIndex = sixteenthIndex + 2;
                    break;
                case "8n.":
                    sixteenthIndex = sixteenthIndex + 3;
                    break;
                case "16n":
                    sixteenthIndex = sixteenthIndex + 1;
                    break;
            }

            if (sixteenthIndex >= 4) {
                let carry = sixteenthIndex % 4
                let value = Math.floor(sixteenthIndex / 4)
                quarterIndex = quarterIndex + value;
                sixteenthIndex = carry;
            }
            if (quarterIndex >= 4) {
                let carry = quarterIndex % 4
                let value = Math.floor(quarterIndex / 4)
                barIndex = barIndex + value;
                quarterIndex = carry;
            }

            console.log(noteMap)
        }

    }

    let loopValue = barIndex + ":" + quarterIndex + ":" + sixteenthIndex;
    console.log(barsArray)
    console.log(notesToRet)
    return {
        notesArray: notesToRet,
        loopValue: loopValue
    };
}

function buildNoteFromString(noteString) {
    let midiNote;
    let duration;
    let noteStr;
    let durNum;
    //find the char starting duration
    var num = /\d/;
    var firstNum = noteString.match(num);
    var numPos = noteString.indexOf(firstNum);

    //midiNote value calculation from string
    midiNote = noteString.charAt(0);
    if (midiNote != "r") {
        if (noteString.charAt(1) == "b" || noteString.charAt(1) == "#") midiNote = midiNote + noteString.charAt(1);
        let octave = 3 + (count(noteString, "+")) - (count(noteString, "-"))
        midiNote = midiNote + octave;
    } else {
        midiNote = "r"
    }
    let points = count(noteString, ".");
    let mystr = noteString.substring(numPos, noteString.length - points);
    console.log(mystr)

    switch (mystr) {
        case "1": duration = "1m"
            break;
        case "2": duration = "2n"
            break;
        case "4": duration = "4n"
            break;
        case "8": duration = "8n"
            break;
        case "16": duration = "16n"
            break;
    }

    for (let i = 0; i < points; i++) {
        duration = duration + "."
    }
    let noteToRet = {
        note: midiNote,
        duration: duration
    }
    console.log(noteToRet)
    return noteToRet;
}

/**
 * counts the occurences of a character in a certain string
 * @param {} str 
 * @param {*} find 
 * @returns 
 */
function count(str, find) {
    return (str.split(find)).length - 1;
}

console.log("melody parsing")
parseMelodyString("F+4 C+8 a8 e+4 c+8 a8\nd+8 e+8 cb8 d+8 db+8 bb8 g8 ab8\na4 f8 d8 g8 a8 f8 e8\neb16 g16 bb8 d+8 db+8 r8 f8 f16 g8 f16")


/**
 * 
 * @param {*} notePart 
 * @param {*} instrument 
 * @param {*} startTime 
 * @returns 
 */

function addNotePartToTransport(notePart, instrument) {
    //console.log("notePart2")
    //console.log(notePart)
    const part = new Tone.Part((time, value) => {
        instrument.triggerAttack(value.note, time, 0.5)
        //console.log("note: " + value.note + " ,time: " + time + " duration: " + value.duration)
    }, notePart).start(0)
    return part
}

function playChordSequence(chordsSequence, instrument) {
    //console.log(instrument)
    let chordsPlayed = new Tone.Part(((time, value) => {
        //console.log("value to be played")
        //console.log(value)

        instrument.triggerAttackRelease(value.notes, value.duration, time, 0.5)
    }), chordsSequence).start(0)
    //Tone.debug = true
    return chordsPlayed
}

function parseChordsString(chordsString) {
    let chordsToRet = []
    let barsArray = []
    barsArray = chordsString.split("|")
    barsArray.shift()
    barsArray.pop()

    //cleaned array
    let numOfBars = barsArray.length
    console.log(barsArray)
    console.log(numOfBars)
    let barCount = 0;
    let quarterCount = 0;
    let sixteenthCount = 0;
    for (let bar of barsArray) {
        let chordsBar = bar.split(" ");
        console.log(chordsBar)
        chordsBar.shift()
        chordsBar.pop()
        console.log(chordsBar)
        quarterCount = 0;
        sixteenthCount = 0;
        let quarterAdd = 4 / chordsBar.length;
        console.log(quarterAdd)
        for (let aChord of chordsBar) {
            var dur;
            switch (quarterAdd) {
                case 4: dur = "1m";
                    break;
                case 2: dur = "2n";
                    break;
                case 1: dur = "4n";
                    break;
            }
            var tTime = barCount + ":" + quarterCount + ":" + sixteenthCount
            let notesArray = fromChordToNotes(aChord)
            let chord = {
                notes: notesArray,
                time: tTime,
                duration: dur
            }
            quarterCount = quarterCount + quarterAdd

            chordsToRet.push(chord)
        }
        if (quarterCount >= 4) {
            quarterCount = quarterCount % 4
        }
        barCount++;
    }
    console.log(chordsToRet)
    let barLoop = barCount + ":" + quarterCount + ":" + sixteenthCount
    return {
        chordsList: chordsToRet,
        barLoop: barLoop
    }
}

console.log("testParsing")
parseChordsString("| F6 | Em7 A7 | Dm7 | Cm7 F7 |")

function fromChordToNotes(chordName) {
    var notesArray = Tonal.Chord.get(chordName).notes
    var distanceFromC = Tonal.Interval.distance("C", notesArray[notesArray.length - 1])
    console.log("distance from C: " + distanceFromC)
    let noteOctave = 3
    for (var j = notesArray.length - 1; j >= 0; j--) {
        if (Tonal.Interval.semitones(Tonal.Interval.distance("C", notesArray[j])) > Tonal.Interval.semitones(distanceFromC)) {
            noteOctave--;
            distanceFromC = Tonal.Interval.distance("C", notesArray[j])
        }
        notesArray[j] = notesArray[j] + noteOctave

    }
    console.log(notesArray)
    return notesArray
}
/*
Tone.Transport.schedule(()=>{
  console.log("sticazzi");
  console.log("state of chords")
  console.log(state.playingPartChords.state)
  },"0:0:0")
*/

function initMusic() {
    Tone.Transport.cancel()
    let computedMelody = parseMelodyString(getMelodyString())
    let computeChords = parseChordsString(getChordString())
    console.log(computedMelody)
    if (computeChords.barLoop != computedMelody.loopValue) {
        console.error("loop bars no consistent, melodyLoop: " + computedMelody.loopValue + ", chordsloop: " + computeChords.barLoop)
    }
    addNotePartToTransport(computedMelody.notesArray, getPlayingInstrument("melody"))
    playChordSequence(computeChords.chordsList, getPlayingInstrument("chords"))
    Tone.Transport.loopEnd = computedMelody.loopValue;
    Tone.Transport.loop = true;

}





//canvas handling


function prepareCanvas() {
    const canvasDiv = document.getElementById('canvas-div');

    var factor = 4;

    canvas = document.getElementById("main-canvas")
    canvas.className = "canvases";

    canvas.width = 256 * factor;
    canvas.height = 128 * factor;
    canvasDiv.appendChild(canvas);

    ctx = canvas.getContext('2d');

    //fintanto che non capisco come gira il discorso background, il bg è notturno, si cambia poi in caso 


    var time0 = new Date();
    var omega = 0; /* canvas angular speed */
    var moonRadius = canvas.width / 1.1;

    var t = Tone.Time('16m').toMilliseconds()
}
async function initImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    console.log(getImageToDraw("astrumDay"))
    console.log(getImageToDraw("astrumNight"))

    console.log("passato")
    setFrameReq(window.requestAnimationFrame(countFPS))
}

function countFPS() {
    if (isPlaying()) {
        if (Date.now() - getAnimationSnap() > 1000 / getFPS()) {
            //console.log("print")
            setAnimationSnap(Date.now())
            setFrameReq(window.requestAnimationFrame(createEnvironment));
            //console.log(Model.state.framereq)
        } else {

            setFrameReq(window.requestAnimationFrame(countFPS));
            //console.log(Model.state.framereq)
        }
    }
}



function createEnvironment() {

    //const values to modify canvas elements 
    const NIGHT_START = 0.5
    const SUNRISE_START = 3.05
    const SUNRISE_END = 3.30
    const DAY_START = 4.0
    const SUNSET_START = 6.10
    const SUNSET_END = 0
    let lightOn = false
    const ALPHASTART = Math.PI * 3 / 2

    let alphaNight = 0
    let alphaSunrise = 0
    let alphaDay = 0
    let alphaSunset = 0
    let sunToDraw = 0

    var time = Date.now()

    var h = canvas.height;
    var w = canvas.width;

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false;
    var a = 5//0.5
    omega = a / t;
    let hAstra = h - getImageToDraw("floor").getNHeight() * factor - 25 * factor;
    let wAstra = w / 2 - ((getImageToDraw("astrumNight").getNWidth()) / 2 * factor)
    var angle = (ALPHASTART + omega * (time - time0.getTime()))

    let angleD = angle % (2 * Math.PI)
    let transAngle = angle % (w)
    // BACKGROUND IMAGE
    if (angleD < NIGHT_START) {
        alphaNight = 1//(1 / (NIGHT_START - SUNSET_END)) * (angleD - SUNSET_END)
        alphaSunrise = 0
        alphaSunset = 1 - (1 / (NIGHT_START - SUNSET_END)) * (angleD - SUNSET_END)
        alphaDay = 0
        lightOn = true
        sunToDraw = 1
    }
    else if (angleD < SUNRISE_START) {
        alphaNight = 1
        alphaSunrise = 0
        alphaSunset = 0
        alphaDay = 0
        lightOn = true
    } else if (angleD < SUNRISE_END) {
        alphaNight = 1 //- (1 / (SUNRISE_END - SUNRISE_START)) * (angleD - SUNRISE_START)
        alphaSunrise = (1 / (SUNRISE_END - SUNRISE_START)) * (angleD - SUNRISE_START)
        alphaSunset = 0
        alphaDay = 0
        lightOn = true
    } else if (angleD < DAY_START) {
        alphaNight = 0
        alphaSunrise = 1 //- (1 / (DAY_START - SUNRISE_END)) * (angleD - SUNRISE_END)
        alphaSunset = 0
        alphaDay = (1 / (DAY_START - SUNRISE_END)) * (angleD - SUNRISE_END)
        lightOn = false
    } else if (angleD < SUNSET_START) {
        alphaNight = 0
        alphaSunrise = 0
        alphaSunset = 0
        alphaDay = 1
        lightOn = false
    } else {
        alphaNight = 0
        alphaSunrise = 0
        alphaSunset = 1//(1 / (2 * Math.PI - SUNSET_START)) * (angleD - SUNSET_START)
        alphaDay = 1 - (1 / (2 * Math.PI - SUNSET_START)) * (angleD - SUNSET_START)
        lightOn = false
        sunToDraw = (1 / (2 * Math.PI - SUNSET_START)) * (angleD - SUNSET_START)
    }
    let background = getImageToDraw("background");
    background.drawThisImage(0, alphaNight, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(1, alphaSunrise, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(2, alphaSunset, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(3, alphaDay, lightOn, canvas.height, canvas.width, ctx, factor)


    /*
    state.assets.stars.forEach((star)=>{
        drawThisImage(star.img, star.left, star.bottom)
    })
    */
    //console.log("HereWeAre")

    // ANIMATED IMAGES
    //var s = moonRadius - Math.sqrt(Math.pow(moonRadius,2)-(Math.pow(canvas.width,2)/4))
    //var a = 2 * Math.acos(1-(s/moonRadius))

    //console.log("HereWeAre1")
    ctx.save();
    ctx.translate(Math.round(w / 2), Math.round(hAstra - 15 * factor))
    // var angle = ((a/60)*time.getSeconds()+(a/60000)*time.getMilliseconds());
    // var angle = ((2*Math.PI/6000)*time.getSeconds()) + ((2*Math.PI/100000)*time.getMilliseconds());

    //ctx.rotate(angle);

    // if(angle%(2*Math.PI) < 0.1) {
    //     Model.state.queueDay = 3
    // } else if ((angle%(2*Math.PI) > 3.11 )&&(angle%(2*Math.PI) <3.13)) {
    //     Model.state.queueDay = 1
    // }

    ctx.save()

    let moon = getImageToDraw("astrumNight")
    ctx.translate(Math.round(-wAstra * (Math.cos(angle))), Math.round(hAstra * (Math.sin(-angle))))
    ctx.translate(Math.round(-(moon.getNWidth() * factor) / 2), Math.round((moon.getNHeight() * factor) / 2))
    moon.drawThisImage(0, 1, lightOn, 0, 0, ctx, factor)
    ctx.restore()

    ctx.save()

    let sun = getImageToDraw("astrumDay")
    ctx.translate(Math.round(wAstra * (Math.cos(angle - 0.1))), Math.round(hAstra * (Math.sin(angle - 0.1))))
    ctx.translate(Math.round(-(sun.getNWidth() * factor) / 2), Math.round((sun.getNHeight() * factor) / 2))
    sun.drawThisImage(0, 1, lightOn, 0, 0, ctx, factor)
    sun.drawThisImage(1, sunToDraw, lightOn, 0, 0, ctx, factor)


    ctx.restore()
    ctx.restore()

    ctx.save()
    let flyObjs = getImageToDraw("flyingObject")
    if (flyObjs.length != 0) {
        console.log("num of objs")
        console.log(flyObjs.length)
        // console.log(flyObjs)
        for (let flyObj of flyObjs) {
            ctx.save()
            ctx.translate((-w) + (((2 * flyObj.getProperty().shift * 2 * w) + ((flyObj.getProperty().velocity * angle) * w)) % (2 * w)), flyObj.getProperty().shift * (h / 2)/*(h / 10)*/)
            flyObj.drawThisImage(0, alphaNight, lightOn, canvas.height, canvas.width, ctx, factor)
            flyObj.drawThisImage(1, alphaSunrise, lightOn, canvas.height, canvas.width, ctx, factor)
            flyObj.drawThisImage(2, alphaSunset, lightOn, canvas.height, canvas.width, ctx, factor)
            flyObj.drawThisImage(3, alphaDay, lightOn, canvas.height, canvas.width, ctx, factor)
            ctx.restore()
        }
    }
    ctx.restore()
    // STATIC ELEMENTS
    getImageToDraw("landscape").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    getImageToDraw("floor").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    getImageToDraw("building").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    getImageToDraw("tree").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)

    setFrameReq(window.requestAnimationFrame(countFPS));
}




/*
function blendBG() {
    var opaSunSet = parseFloat(skySunSet.style.opacity.split()[0])
    var opaDay = parseFloat(skyDay.style.opacity.split()[0])

    if (opaSunSet<=1){
        var opac = opaSunSet + 0.0005;
        skySunSet.style.opacity = `${opac}`
    } else {
        if (opaDay<=1){
            var opac = opaDay + 0.0005;
            skyDay.style.opacity = `${opac}`
        }
    }
}
*/
// initImages(state.environment);  
//initImages(
//);  


/* CREATING MENU' */
/*
  async function initJSON() {
    for(let datum of Model.state.possibleValues.data) {
        datum.image = new_assets[datum.imageName]
    }
}
*/
/*
function drawThisImage (img, left, bottom,alpha=1,hasLight=false,lightOn) {
    var h = img.naturalHeight*factor;
    var w = img.naturalWidth*factor;
    var x = left * canvas.width;
    var y = (1-bottom) * canvas.height;
    ctx.globalAlpha = alpha
    console.log("here6")
    if(hasLight) {
        if(lightOn) {
            ctx.drawImage(img.lightOn, x, y-h, w, h)
        } else {
            ctx.drawImage(img.lightOff, x, y-h, w, h)
        }
    } else {
        ctx.drawImage(img, x, y-h, w, h)    
    }
    ctx.drawImage(img, x, y-h, w, h)
    ctx.globalAlpha = 1
}
*/

/**
 * types of images:
 * 0: standard only one behaviour and one type of image
 * 1: hasLights 
 * 2: sun or moon 
 * 3: background 
 * 4: flyingObjec
 */










var generateButton = document.createElement('button')
var helpButton = document.createElement('button')
var menuPanel = document.createElement('div')
menuPanel.className = 'menu-panel'

var btn_left = document.getElementById('btn-sx')
var btn_center = document.getElementById('btn-ct')
var btn_right = document.getElementById('btn-dx')



async function createMenu() {
    console.log("menu Creation")
    var btnContainer = document.getElementById("tokenGrid")// document.createElement('div')
    btnContainer.className = 'token-btn-container'
    console.log(getStateElements())
    for (let datum of getStateElements()) {
        console.log('datum: ')
        console.log(datum)
        console.log(datum.image.previewUrl)
        var aNewSrc = await getAsset(datum.image.previewUrl)
        var img = document.createElement('img')
        img.src = aNewSrc
        img.className = 'token-image'
        var btnDiv = document.createElement('div')
        var btn = document.createElement('button')
        btn.id = datum.id
        btn.className = 'nes-btn'
        btn.classList.add('token-btn')
        btn.classList.add(datum.elementType)
        btn.classList.add(datum.environment)

        btn.style.margin = '7px'
        btn.style.marginLeft = 'auto'
        btn.style.marginRight = 'auto'
        btn.appendChild(img)
        btnDiv.classList.add("token-div")
        if (datum.elementType == "flyingObject") {
            var tokenAdd = document.createElement('div')
            tokenAdd.id = "tAdd" + btn.id
            tokenAdd.classList.add("token-add");
            tokenAdd.append("0")
            btnDiv.appendChild(btn)
            btnDiv.appendChild(tokenAdd)
            btnContainer.appendChild(btnDiv)

            console.log("ciao nuvoletta")

        } else {
            btnDiv.appendChild(btn)
            btnContainer.appendChild(btnDiv)
        }
    }
}

function assignClick() {
    document.querySelectorAll('.token-btn').forEach((btn) => {

        btn.addEventListener('click', () => {
            var id = btn.id
            var env = btn.classList[3]
            var el = btn.classList[2]
            console.log("elements")
            console.log(env)
            console.log(el)
            //console.log(Model.state.drawing)
            //Model.state.drawing.
            //document.querySelectorAll('.'+ el).forEach((elem)=>{elem.classList.remove('selected-btn')})
            modifyIdList(id)

            visualizeSelectedTokens()

        })
    })
}


function visualizeSelectedTokens() {
    document.querySelectorAll('.token-btn').forEach((btn) => {
        btn.classList.remove('selected-btn')
    });
    document.querySelectorAll('.token-btn').forEach((btn) => {
        var elPos = Object.values(getIdList()).indexOf(parseInt(btn.id))
        var counter = 0;
        while (elPos > -1) {
            counter = counter + 1;
            elPos = Object.values(getIdList()).indexOf(parseInt(btn.id), elPos + 1)
        }
        if (btn.classList.contains("flyingObject")) {
            var tAdd = document.getElementById("tAdd" + btn.id)
            tAdd.removeChild(tAdd.firstChild)
            tAdd.append(counter)
        }
        if (counter > 0) {
            btn.classList.add('selected-btn')
        }
    });
}


/*
 async function createMenu () {
    console.log("menu Creation")
    var btnContainer = document.getElementById("tokenGrid")// document.createElement('div')
    btnContainer.className = 'token-btn-container'

    //if the menu isn't initialized a new element is created
    if(Model.state.elementTypes==undefined || Model.state.environments==undefined) {
        let data  = await getMenuTypes()
        Model.state.elementTypes = data.primaryTypes
        Model.state.environments = data.environments
    }
    
    console.log(Model.state.elementTypes)
    for (let elType of Model.state.elementTypes) {
        console.log(elType)
        var btnDiv = document.createElement('div')
        btnDiv.className = 'token-btn-div'    
        
        let toPutIn = []
        if(Model.state.possibleValues == 0) {
            toPutIn = await getElementsByType(elType)
            for(let datum of toPutIn) {
                Model.state.possibleValues.push(datum)
            }
        } else {
            for(let datum of Model.state.possibleValues) {
                if(datum.elementType === elType) {
                    toPutIn.push(datum)
                }
            }
        }   
        console.log("toPutIn:")
        console.log(toPutIn)
        if(toPutIn.length == 0) {
            toPutIn = await getElementsByType(elType)
            for(let datum of toPutIn) {
                Model.state.possibleValues.push(datum)
            }
        }

        toPutIn = toPutIn.sort((a,b) => {
            return Model.state.environments.indexOf(a.environment) - Model.state.environments.indexOf(b.environment)

        })
        console.log("toPutIn$")
        console.log(toPutIn)
        for (let datum of toPutIn) {
            console.log('datum: ')
            console.log(datum)
            console.log(datum.image.previewUrl)
            var aNewSrc =await getAsset(datum.image.previewUrl) 
            var img = document.createElement('img')
            img.src = aNewSrc
            img.className = 'token-image'

            var btn = document.createElement('button')
            btn.id = datum.id
            btn.className = 'nes-btn'
            btn.classList.add('token-btn')
            btn.classList.add(datum.elementType)
            btn.classList.add(datum.environment)
            btn.type = "button"
            btn.style.margin = '7px'
            btn.style.marginLeft = 'auto'
            btn.style.marginRight = 'auto'

            btn.appendChild(img)
            btnDiv.appendChild(btn)
        }
        btnContainer.appendChild(btnDiv)
    }

    menuPanel.appendChild(btnContainer)

    generateButton.className = 'nes-btn is-success'
    generateButton.innerText = 'GENERATE'
    generateButton.style.display = 'block'
    generateButton.style.margin = 'auto'
    generateButton.style.marginTop = '20px'
    generateButton.style.verticalAlign = 'middle'

    helpButton.className = 'nes-btn is-warning'
    helpButton.innerText = '?'
    helpButton.style.display = 'block'
    helpButton.style.margin = 'auto' 
    helpButton.style.marginTop = '20px'
    helpButton.style.verticalAlign = 'middle'

    var btnDiv = document.createElement('div')
        btnDiv.style.display = 'block'
        btnDiv.style.height = 'max-content'
        btnDiv.style.marginTop = '10%'
        btnDiv.style.textAlign = 'center'

    var title = document.createElement('p')
        title.innerText = 'MENU'
        title.style.backgroundColor = 'rgb(245, 247, 99)'
        title.style.padding = '10px'
        title.style.borderRadius = '5px'
        title.style.marginTop = '40%'
        title.style.fontSize = 'x-large'
    

    btnDiv.appendChild(helpButton)
    btnDiv.appendChild(generateButton)
    btnDiv.appendChild(title)

    menuPanel.appendChild(btnDiv)

    container.appendChild(menuPanel)

    console.log('envToGen: ')
    visualizeSelectedTokens()
}
*/



/* -------------------------------------------------------- */

//  function playableButton (ready) {
//     if (ready) {
//         playButton.classList.replace('is-disabled', 'is-success');
//     }
// }

function showInitPanel() {
    document.getElementById("panel-container").hidden = !document.getElementById("panel-container").hidden
    document.getElementById('front-panel').hidden = false
    document.getElementById('start-panel').hidden = true;
}
/*
var okButton = document.getElementById('ok-button');
okButton.onclick = () => {
    var word1 = document.getElementById('name-field1').value
    var word2 = document.getElementById('name-field2').value
    // Model.setSeedWords(word1, word2);
    if ((word1 != "")&&(word2 != "")) {
        document.getElementById('front-panel').hidden = true;
        document.getElementById('start-panel').hidden = false;
        Model.state.emitter.updateReadyToPlay()
        Tone.start()
        Tone.context.latencyHint = "playback"
    }    
}*/

// var playButton = document.getElementById('play-button');
// playButton.onclick = ()=> {
//     if (playButton.classList.contains('is-success')){
//         showInitPanel();
//         Model.startMusic(); 

//         }
// }
/*
btn_right.onclick = async () => {
    //console.log(Model.state)
    await updateState()
    await initImages()
    document.getElementById("canva-container").hidden = false;
    document.getElementById("menu-container").hidden = true;
    //document.getElementById("container").hidden = true; 
    console.log("Hey there")
    //menuPanel.style.display = 'none'
    Tone.start()
    //Model.propagateStateChanges(false)
    //Model.startMusic()
    //updatePage(0)
    //console.log(Model.state)

}
*/
/*
document.getElementById('menu').onclick = () => {
    //Model.stopMusic()
    console.log("merda")
    menuPanel.style.display = 'inline-flex  '
}
*/
/**
 * 
 * @param {*} aPage 0 selecting tokens
 *                  1 player page 
 */
async function updatePage(aPage) {
    setNavPage(aPage)
    console.log("page")
    console.log(aPage)

    switch (aPage) {
        case 0:
            await menuPage()
            break;

        case 1:
            await playerPage()
            break;
        default:
            break;
    }
}


async function playerPage() {
    await updateState()
    await initImages()
    initMusic()
    Tone.start()
    document.getElementById("btn-vol").onclick = volumeButton
    let volSlider = document.getElementById("volume-slider")
    volumeUpdate(70)
    volSlider.addEventListener('input', function () { volumeUpdate(volSlider.value) }, false);
    document.getElementById("btn-dx1").onclick = () => { openFullscreen("main-canvas") }
    document.getElementById("btn-stop").onclick = () => { updatePage(0); stopMusic() }
    document.getElementById("player-navbar").hidden = false;
    document.getElementById("canva-container").hidden = false;
    document.getElementById("menu-container").hidden = true;
    document.getElementById("menu-navbar").hidden = true;
    document.getElementById("upbar").hidden = true;
    startMusic()
}

async function menuPage() {
    //await createMenu()
    visualizeSelectedTokens()
    //document.getElementById("main-fs-button").onclick = () => { openFullscreen("main-body") }
    document.getElementById("btn-dx").onclick = () => { updatePage(1); }
    document.getElementById("player-navbar").hidden = true;
    document.getElementById("canva-container").hidden = true;
    document.getElementById("menu-container").hidden = false;
    document.getElementById("menu-navbar").hidden = false;
    document.getElementById("upbar").hidden = false;

}



/**
 * fullscreen handling part 
 */
function openFullscreen(element) {
    elem = document.getElementById(element)
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}
/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}



window.addEventListener("keydown", function (event) {
    if (event.key == "Escape") closeFullscreen()
}, true);




var prevScrollpos = window.pageYOffset;
window.onscroll = function () {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("upbar").style.top = "0";
    } else {
        document.getElementById("upbar").style.top = "-100px";
    }
    prevScrollpos = currentScrollPos;
}

/**
 * 
 * @param {*} valueToSet index from 0 to 100
 */
function volumeUpdate(valueToSet) {
    //0-100
    if (valueToSet <= 0) {
        document.getElementById("vol-no").style.display = "block"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 40) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "block"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 75) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "block"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 101) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "block"
    }
    document.getElementById("volume-slider").value = valueToSet;
    let vts = valueToSet / 100
    setMasterVolume(vts)
    console.log(getMasterVolume())
}

function volumeButton() {
    console.log("accazzo")
    let testValue = getMasterVolume() * 100
    console.log(testValue)
    if (testValue > 0) {
        volumeUpdate(0)
    } else {
        console.log("savedVolume")
        console.log(getSavedVolume() * 100)
        volumeUpdate(getSavedVolume() * 100)
    }
}








class DrawableImage {
    constructor(anImageArray, left, bottom, anImageType, property) {
        this.imageType = anImageType;
        this.imageArray = anImageArray;
        this.left = left;
        this.bottom = bottom;
        this.property = property
    }

    static async build(image) {
        //hasLight,urlLightOff,urlLightOn,left,bottom
        let imageArray = []
        for (let url of image.imageArray) {
            let anImage = new Image()
            anImage.src = await getAsset(url)
            imageArray.push(anImage)
        }
        let property = {}
        switch (image.imageType) {
            case (4):
                property.velocity = image.velocity;
                property.shift = Math.random();
                break;
        }
        if (image.imageType == 4) {
            image.bottom = Math.random()
            image.left = Math.random()
        }
        return new DrawableImage(imageArray, image.left, image.bottom, image.imageType, property)
    }

    clone() {
        return new DrawableImage(this.imageArray, this.left, this.bottom, this.imageType, this.property);
    }
    changeRandomParams() {
        if (this.imageType == 4) {
            this.bottom = Math.random()
            this.left = Math.random()
            let newproperty = {
                velocity: this.property.velocity,
                shift: Math.random()
            }
            this.property = newproperty;
        } else {
            console.log("imageType:")
            console.log(this.imageType)
            console.error("wrong imageType for utilizing changeRandomParams")
        }
    }

    drawThisImage(imageToDraw = 0, alpha0 = 1, lightOn, canvasHeight = 0, canvasWidth = 0, ctx, factor) {
        var h = this.imageArray[imageToDraw].naturalHeight * factor;
        var w = this.imageArray[imageToDraw].naturalWidth * factor;
        var x = this.left * canvasWidth;
        var y = (1 - this.bottom) * canvasHeight;
        ctx.globalAlpha = alpha0
        let posX = 0;
        let posY = 0;
        switch (this.imageType) {
            case (0):
                posX = x;
                posY = y - h
                break;
            case (1):
                if (lightOn) imageToDraw = 1
                else imageToDraw = 0
                posX = x;
                posY = y - h
                break;
            case (2):
                x = 0;
                y = 0;
                posX = 0;
                posY = 0
                break;
            case (3):
                posX = x;
                posY = y - h
                break;
            case (4):
                posX = 0;
                posY = 0;
                break;
        }
        ctx.drawImage(this.imageArray[imageToDraw], posX, posY, w, h)
        //ctx.drawImage(imageLightOff, x, y-h, w, h)
        ctx.globalAlpha = 1
    }

    getNWidth() {
        return this.imageArray[0].naturalWidth
    }
    getNHeight() {
        return this.imageArray[0].naturalHeight
    }
    getNImages() {
        return this.imageArray.length
    }
    getProperty() {
        return this.property
    }
}



/**
 * 
 * 
 * firebase 
 * 
 * 
 * 
 */





// Initialize Firebase
//const firebase = require("firebase");
// Required for side-effects
//require("firebase/firestore");

//import "firebase/firestore";

function initializeFirebase() {
    const firebaseConfig = {

        apiKey: "AIzaSyCx_9Kyfjn03jNXGM9dj7b8Omfd6CP0awU",

        authDomain: "actamproject-598ad.firebaseapp.com",

        projectId: "actamproject-598ad",

        storageBucket: "actamproject-598ad.appspot.com",

        messagingSenderId: "868627486863",

        appId: "1:868627486863:web:ee55ebd557f3abd6d5b8fa"

    };
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage()
}



//------------------storage handling-------------------------------------- 



async function getAsset(imageName) {
    let assetPos = 'assets/' + imageName
    let reference = storage.ref(assetPos)
    console.log(reference)
    let url = await reference.getDownloadURL()
    try {
        return new URL(url)
    } catch (error) {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
            case 'storage/object-not-found':
                // File doesn't exist
                break;
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
            case 'storage/canceled':
                // User canceled the upload
                break;

            // ...

            case 'storage/unknown':
                // Unknown error occurred, inspect the server response
                break;
        }
    }
}

async function getSample(instr, note) {
    let instrPos = 'samples/' + instr + '/'
    let notePos = instrPos + note
    console.log(notePos)
    let reference = ref(storage, notePos)
    console.log(reference)
    let url = await getDownloadURL(reference)
    try {
        return new URL(url)
    } catch (error) {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
            case 'storage/object-not-found':
                // File doesn't exist
                break;
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
            case 'storage/canceled':
                // User canceled the upload
                break;

            // ...

            case 'storage/unknown':
                // Unknown error occurred, inspect the server response
                break;
        }
    }
}

//-------------------------------database handling--------------------------//
async function getMenuTypes() {
    const docRef = db.collection("menu").doc("menuTypes");
    console.log("ci sono arrivato qui")
    //const docSnap = await getDoc(docRef);
    let doc = await docRef.get()
    try {
        if (doc.exists) {
            console.log("Document data:", doc.data());
            return doc.data();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    } catch (error) {
        console.log("Error getting document:", error);
    };
    console.log("ci sono arrivato qui2")
    /*
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
    */
}

async function getElementsByType(type) {
    const q = query(collection(db, "elements"), where("elementType", "==", type));

    const querySnapshot = await getDocs(q);
    elementsToRet = []
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        elementsToRet.push(doc.data());
    });
    return elementsToRet
}

async function getElements() {
    //const q = query(collection(db, "elements"));
    let elementsToRet =[];
    let querySnapshot = await db.collection("elements").get()
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        elementsToRet.push(doc.data());
    });


    // let el = db.collection("elements");
    // //const querySnapshot = await getDocs(el);
    // //elementsToRet = []
    // let querySnapshot = await el.get();

    // console.log("qsn")
    // console.log(doc.data())
    // querySnapshot.forEach((doc) => {
    //     // doc.data() is never undefined for query doc snapshots
    //     elementsToRet.push(doc.data());
    // });
    return elementsToRet
}

async function getDocumentElement(docId) {
    const docRef = doc(db, "elements", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}

async function getNodes() {
    const q = query(collection(db, "nodes"));

    const querySnapshot = await getDocs(q);
    elementsToRet = []
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        elementsToRet.push(doc.data());
    });
    return elementsToRet
}



/***
 * 
 * 
 * 
 * markov nodes 
 * 
 * 
 */

class MarkovMelody {
    constructor(nodes) {
        this.nodes = nodes
        console.log(this.nodes)
    }

    generateMelody(startId = 0) {
        var path = this._generatePath(startId)
        var melodySequence = ""
        var chordsSequence = "|"
        for (let node of path) {
            melodySequence = melodySequence + node.mel + "\n"
            chordsSequence = chordsSequence + " " + node.chord + " |"
        }

        return {
            melody: melodySequence,
            chords: chordsSequence
        }
    }

    _generatePath(anId = 0) {
        //anId = anId.toString()
        //console.log(this.tree)
        var startingNode = this.nodes.find(x => x.id == anId)
        var startingNodeId = startingNode.id
        let thisNodeId = -1;
        var thisNode = startingNode
        let path = []
        while (thisNodeId != startingNodeId) {
            path.push(thisNode)
            console.log(thisNode)
            var nextNodeId = this._nextRandomNode(thisNode)
            console.log(nextNodeId)
            thisNodeId = nextNodeId
            thisNode = this.nodes.find(x => x.id == nextNodeId)
        }
        return path
    }

    _nextRandomNode(aNode) {
        let possibleNodes = aNode.links
        let totalWeights = 0;
        for (var i = 0; i < possibleNodes.length; i++) {
            totalWeights = totalWeights + possibleNodes[i].prob
        }
        var random = Math.random() * totalWeights;
        //console.log(totalWeights)
        //console.log(random)
        for (var i = 0; i < possibleNodes.length; i++) {
            random -= possibleNodes[i].prob;

            if (random < 0) {
                return possibleNodes[i].id;
            }
        }
    }


}







//import * as Tone from 'tone'
//import { getSample} from "./firebase.js";

//import { DuoSynth, Freeverb, LFO } from 'tone';
let buffer1 = new Tone.Buffer()
let buffer2 = new Tone.Buffer()
let buffer3 = new Tone.Buffer()
let buffer4 = new Tone.Buffer()
class Kick {
    constructor() {
        var kick = new Tone.MembraneSynth({
            envelope: {
                attack: 0.01,
                decay: 0.01,
                sustain: 0.3,
                release: 0.2
            },
            frequency: 50,
        }).toDestination();
        this.kick = kick;
    }

    trigger(time, velocity) {
        this.kick.triggerAttackRelease("C1", "8n", time, velocity)
        // console.log("kicktime")
    }
}

class Snare {
    constructor() {
        var snare = new Tone.NoiseSynth({
            noise: {
                type: 'pink'
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.1,
                release: 0.1
            },
        })

        var filter = new Tone.Filter({
            frequency: 15000,
            type: "lowpass",
        }).toDestination()

        var gain = new Tone.Gain({
            gain: 3,
        });

        var freqEnv = new Tone.FrequencyEnvelope({
            attack: 0,
            decay: 0.01,
            sustain: 0.5,
            release: 0.2,
            baseFrequency: "10000hz",
            octaves: -2,
        }).connect(filter.frequency)

        snare.chain(gain, filter);

        this.env = freqEnv;
        this.snare = snare;
    }

    trigger(time, velocity) {
        this.env.triggerAttackRelease("8n", time, velocity);
        this.snare.triggerAttackRelease("8n", time, velocity);
        // console.log("snaretime")
    }
}

class HiHatClosed {
    constructor() {
        var hihat = new Tone.NoiseSynth({
            volume: -5,
            envelope: {
                attack: 0,
                decay: 0,
                sustain: 0.4,
                release: 0.1
            },
        }
        );

        var filter = new Tone.Filter({
            frequency: 5000,
            type: "highpass",
            rolloff: -24,
        }).toDestination();

        hihat.connect(filter);
        this.hihat = hihat;
    }

    trigger(time, velocity) {
        this.hihat.triggerAttackRelease(0.01, time, velocity)
    }
}

class HiHatOpen {
    constructor() {
        var hihat = new Tone.NoiseSynth({
            volume: -5,
            envelope: {
                attack: 0,
                decay: 0,
                sustain: 0.4,
                release: 0.02
            },
        }
        );

        var filter = new Tone.Filter({
            frequency: 3000,
            type: "highpass",
            rolloff: -24,
        }).toDestination();

        hihat.connect(filter);
        this.hihat = hihat;
    }

    trigger(time, velocity) {
        this.hihat.triggerAttackRelease(0.1, time, velocity)
    }
}

class Pad {
    constructor() {
        var pad = new Tone.PolySynth(Tone.Synth);
        pad.set({
            oscillator: {
                type: 'triangle',
            },

            volume: '-25',

            envelope: {
                attack: '4n',
                decay: '8n',
                sustain: '0.5',
                release: '2n'
            }
        })

        var filter = new Tone.Filter({
            frequency: '1000Hz',
            type: 'lowpass',
            rolloff: '-24db'
        })

        var phaser = new Tone.Phaser({
            baseFrequency: 500,
            frequency: '0.2hz',
            octaves: '3',
        })

        var verb = new Tone.Reverb({
            decay: '3',
        })

        pad.chain(filter, phaser, verb);
        this.pad = pad
        this.filter = filter
        this.verb = verb
    }

    connect(node) {
        this.verb.connect(node)
    }

    triggerAttackRelease(notes, duration, time, velocity) {
        this.pad.triggerAttackRelease(notes, duration, time, velocity)
    }
    setVolume(volValue) {
        this.pad.volume.value = volValue
    }

}

class Lead {
    constructor() {
        var instr = new Tone.PolySynth(Tone.Synth);
        instr.set({
            envelope: {
                attack: '8n',
                decay: '16n',
                sustain: '0.1',
                release: '16n'
            },

            oscillator: {
                type: 'sine2'
            },

            volume: "-10"
        })
        var filter = new Tone.Filter({
            frequency: '1500hz',
            type: 'lowpass',
            rolloff: '-24db'
        })

        var dly = new Tone.PingPongDelay('4n', 0.2);
        dly.wet.value = 0.7
        var verb = new Tone.Reverb({
            decay: '4'
        })
        verb.wet.value = 0.5
        var amp = new Tone.Gain(0.8)

        instr.chain(filter, dly, verb, amp)
        this.amp = amp
        this.instr = instr;
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.instr.triggerAttackRelease(note, duration, time, velocity)
    }

    connect(node) {
        this.amp.connect(node)
    }

    setVolume(volValue) {
        this.instr.volume.value = volValue
    }
}

class Synth {
    constructor() {
        var instr = new Tone.PolySynth(Tone.Synth);

        var amp = new Tone.Gain()
        instr.chain(amp)
        this.instr = instr;
        this.amp = amp
    }
    connect(node) {
        this.instr.connect(node)
    }
    triggerAttackRelease(note, duration, time, velocity) {
        this.instr.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.instr.volume.value = volValue
    }
}

class Bell {
    constructor() {
        const synth = new Tone.DuoSynth()
        const dly = new Tone.FeedbackDelay()
        const verb = new Tone.Reverb()
        const volume = new Tone.Volume()

        synth.set({
            voice0: {
                envelope: {
                    attack: 0,
                    attackCurve: 'linear',
                    decay: 1.241,
                    decayCurve: "exponential",
                    sustain: 0,
                    release: 1.89,
                },
            },
            voice1: {
                envelope: {
                    attack: 0,
                    attackCurve: 'linear',
                    decay: 1.241,
                    decayCurve: "exponential",
                    sustain: 0,
                    release: 1.89,
                },
            },
            harmonicity: 2,
            vibratoAmount: 0,
        });
        synth.voice0.oscillator.type = 'sine2'
        synth.voice1.oscillator.type = 'sine3'
        synth.voice1.volume.value = -20;
        synth.volume.value = -6

        dly.set({
            delayTime: '4n.',
            feedback: 0.3,
            wet: 0.08,

        })

        verb.set({
            decay: 4,
            // preDelay: 0.67,
            wet: 0.2,
        })

        synth.chain(dly, verb, volume, Tone.Destination)

        this.synth = synth;
        this.volume = volume;
        this.lastNode = volume;

    }

    triggerAttack(note, time, velocity) {
        this.synth.triggerAttackRelease(note, "8n", time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }
}

class Marimba {
    constructor() {
        const synthTone = new Tone.DuoSynth()
        const synthPulse = new Tone.Synth()
        const dist = new Tone.Distortion(0.63)
        const trim = new Tone.Volume(-10)
        const filterLP = new Tone.Filter({
            frequency: "4437Hz",
            type: 'lowpass',
            rolloff: -24,
        })
        const filterHP = new Tone.Filter({
            frequency: '170Hz',
            type: 'highpass',
            rolloff: -48
        })
        const chorus = new Tone.Chorus({
            frequency: 0.2,
            delayTime: 0.013,
            depth: 1
        })
        const dly = new Tone.FeedbackDelay({
            delayTime: '8n.',
            feedback: 0.1,
            wet: 0.05
        })
        const merge = new Tone.Merge()
        const mono = new Tone.Mono()
        const volume = new Tone.Volume()

        synthTone.set({
            voice1: {
                envelope: {
                    attack: 0,
                    decay: 0.5,
                    sustain: 0,
                    release: 0.19,
                },
                oscillator: {
                    type: 'sine3',
                    volume: -3.82
                },

            },
            voice0: {
                envelope: {
                    attack: 0,
                    decay: 0.5,
                    sustain: 0,
                    release: 0.19,
                },
                oscillator: {
                    type: 'triangle',
                    volume: -4.62
                },

            },
            harmonicity: 0.5,
            vibratoAmount: 0.1,
            vibratoRate: "0.5hz"
        })

        synthPulse.set({
            detune: 1200,
            envelope: {
                attack: 0,
                decay: 0.01,
                sustain: 0,
                release: 0
            },
            oscillator: {
                type: 'sine2',
                volume: -10,
            }
        });

        synthTone.chain(dist, trim, filterLP).connect(merge, 0, 0)
        synthPulse.connect(merge, 0, 1)

        merge.chain(mono, filterHP, chorus, dly, volume, Tone.Destination)


        this.dly = dly
        this.synthTone = synthTone;
        this.synthPulse = synthPulse;
        this.volume = volume;
        this.lastNode = volume;

    };

    triggerAttack(note, time, velocity) {
        this.synthPulse.triggerAttack(note, time, velocity);
        this.synthTone.triggerAttack(note, time, velocity);
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

}

class Sitar {
    constructor() {
        const string = new Tone.PluckSynth({
            attackNoise: 5,
            dampening: 1000,
            release: 1.5,
            resonance: 0.98,
            volume: 0
        })

        const toneSynth = new Tone.PolySynth(Tone.Synth)
        toneSynth.set({
            volume: -40,
            envelope: {
                attack: 0.05,
                decay: 1,
                decayCurve: 'linear',
                sustain: 0,
                release: 1.5
            },
            detune: 1220,
            oscillator: {
                type: 'sine',
                partialCount: 5,
                partials: [0, 0.2, 1, 0, 1]
            }
        })

        const filterLP = new Tone.Filter({
            frequency: '700Hz',
            type: 'lowpass',
            rolloff: -24,
        })
        const chorus = new Tone.Chorus({
            frequency: 0.2,
            delayTime: 20,
            depth: 1,
            wet: 1
        })
        const merge = new Tone.Merge()
        const mono = new Tone.Mono()
        const vibr = new Tone.Vibrato({
            frequency: '0.6Hz',
            depth: 1,
            wet: 0.4
        })
        const dly = new Tone.PingPongDelay({
            delayTime: '8n.',
            feedback: 0.1,
            wet: 0.1,
        })
        const verb = new Tone.Reverb({
            decay: 2.5,
            wet: 0.2,

        })
        const volume = new Tone.Volume(+5)

        string.connect(merge, 0, 0)
        toneSynth.connect(filterLP).connect(merge, 0, 1)

        merge.chain(mono, vibr, chorus, dly, verb, volume, Tone.Destination)

        this.volume = volume
        this.lastNode = volume
        this.string = string
        this.toneSynth = toneSynth
    }

    triggerAttack(note, time, velocity) {
        this.string.triggerAttack(note, time, velocity);
        this.toneSynth.triggerAttackRelease(note, '8n', time, velocity);
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }
}

class Bass1 {
    constructor() {
        const bass = new Tone.DuoSynth({
            voice0: {
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.0012,
                    decay: 0.136,
                    sustain: 0.5,
                    release: 0.557
                }
            },
            voice1: {
                oscillator: {
                    type: 'sine',
                    volume: -6
                },
                envelope: {
                    attack: 0.0012,
                    decay: 0.136,
                    sustain: 0.5,
                    release: 0.557
                }
            },
            harmonicity: 2,
            vibratoAmount: 0
        })

        const volume = new Tone.Volume()

        bass.chain(volume, Tone.Destination)

        this.synth = bass
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

}

class Bass2 {
    constructor() {
        const bass = new Tone.DuoSynth({
            //high voice
            voice0: {
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            // low voice
            voice1: {
                oscillator: {
                    type: 'sawtooth',
                    volume: -18
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            harmonicity: 0.5,
            vibratoAmount: 0
        })

        const filter = new Tone.Filter({
            frequency: '2000hz',
            rolloff: -12,
            type: 'lowpass'
        })

        const volume = new Tone.Volume()

        bass.chain(filter, volume, Tone.Destination)

        this.synth = bass
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

}

class Bass3 {
    constructor() {
        const bass = new Tone.DuoSynth({
            //high voice
            voice0: {
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            // low voice
            voice1: {
                oscillator: {
                    type: 'square',
                    volume: -18
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            harmonicity: 1,
            vibratoAmount: 0
        })

        const bass2 = new Tone.DuoSynth({
            harmonicity: 0.5,
            //voice high
            voice0: {
                oscillator: {
                    type: 'sawtooth',
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            //voice low
            voice1: {
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                }
            },
            volume: -15,
        })

        const filter = new Tone.Filter({
            frequency: '2000hz',
            rolloff: -12,
            type: 'lowpass'
        })

        const tremolo = new Tone.Tremolo({
            frequency: '16n',
            depth: 1,
            type: 'square'
        })

        const merge = new Tone.Merge()
        const mono = new Tone.Mono()
        const volume = new Tone.Volume()

        bass.connect(merge, 0, 0)
        bass2.connect(merge, 0, 1)
        merge.chain(mono, tremolo, filter, volume, Tone.Destination)

        this.synth1 = bass
        this.synth2 = bass2
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
        this.synth2.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

}

class Bass4 {
    constructor() {
        const bass = new Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.003,
                decay: 0.5,
                sustain: 0.1,
                release: 0.65
            }
        })

        const volume = new Tone.Volume()

        bass.chain(volume, Tone.Destination)

        this.synth = bass
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

}

class Synth1 {
    constructor() {

        const synth = new Tone.PolySynth(Tone.DuoSynth)
        synth.set({
            voice0: {
                envelope: {
                    attack: 1,
                    decay: 1,
                    sustain: 0.4,
                    release: 0.500
                },
                oscillator: {
                    type: 'sine',
                    volume: -10
                }
            },
            voice1: {
                envelope: {
                    attack: 1,
                    decay: 1,
                    sustain: 0.4,
                    release: 0.500
                },
                oscillator: {
                    type: 'sine',
                    volume: 0
                }
            },
            harmonicity: 2,
            vibratoAmount: 0.4,
            vibratoRate: "8n"
        })
        const saw = new Tone.PolySynth(Tone.Synth)
        saw.set({
            envelope: {
                attack: 1,
                decay: 1,
                sustain: 0.4,
                release: 0.500
            },
            oscillator: {
                type: 'sawtooth'
            },
            volume: -20,
        })
        const merge = new Tone.Merge()
        const mono = new Tone.Mono()
        const phaser = new Tone.Phaser({
            frequency: '0.1Hz',
            octaves: 1,
            baseFrequency: '440Hz',
            wet: 1
        })
        const filter = new Tone.Filter({
            type: 'lowpass',
            frequency: '350Hz',
            rolloff: -48
        })
        const lfo = new Tone.LFO({
            min: 320,
            max: 380,
            frequency: '4n',
        })
        const dly = new Tone.FeedbackDelay({
            delayTime: '8n',
            feedback: 0.1,
            wet: 0.2
        })
        const tremolo = new Tone.Tremolo({
            type: 'sine',
            frequency: '8n',
            depth: 0.45,
            wet: 1,
        })
        const volume = new Tone.Volume()

        synth.connect(merge, 0, 0)
        saw.connect(merge, 0, 1)

        merge.chain(mono, phaser, filter, dly, tremolo, volume, Tone.Destination)

        lfo.connect(filter.frequency)

        this.synth1 = synth
        this.synth2 = saw
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
        this.synth2.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }
}

class Synth2 {
    constructor() {
        const synth1 = new Tone.PolySynth(Tone.DuoSynth)
        synth1.set({
            voice0: {
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                },
                oscillator: {
                    type: 'sawtooth',
                    volume: -30
                }
            },
            voice1: {
                envelope: {
                    attack: 0.003,
                    decay: 1,
                    sustain: 1,
                    release: 0.008
                },
                oscillator: {
                    type: 'triangle',
                    volume: 0
                }
            },
            harmonicity: 1,
            vibratoAmount: 0
        })
        const dly = new Tone.FeedbackDelay({
            delayTime: '16n.',
            feedback: 0.2,
            wet: 0.06
        })
        const tremolo = new Tone.Tremolo({
            type: 'sine',
            frequency: '16n',
            depth: 1,
            wet: 0.5,
        })
        const volume = new Tone.Volume()

        synth1.chain(tremolo, dly, volume, Tone.Destination)

        this.synth1 = synth1
        this.volume = volume
        this.lastNode = volume

    }
    //FIXME: too much latency on load
    triggerAttackRelease(chord, duration, time, velocity) {
        var playrate = 3
        var arpNoteDuration = (4 * Math.pow(2, (playrate - 1))).toString() + 'n'
        console.log(arpNoteDuration);

        const pattern = new Tone.Pattern((aTime, note) => {
            this.synth1.triggerAttackRelease(note, arpNoteDuration, aTime, velocity)
        }, chord, 'upDown').start(time)

        console.log(pattern.state);
        pattern.playbackRate = playrate

        pattern.stop(time + duration)
        console.log(pattern.state);
        // pattern.dispose()
    }

    culo(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }

    get() {
        console.log(this.synth1.get())
    }
}

class Synth3 {
    constructor() {

        const synth1 = new Tone.PolySynth(Tone.DuoSynth)
        synth1.set({
            voice0: {
                envelope: {
                    attack: 1.479,
                    decay: 0.001,
                    sustain: 0,
                    release: 0
                },
                oscillator: {
                    type: 'sine',
                    volume: -0
                }
            },
            voice1: {
                envelope: {
                    attack: 1.479,
                    decay: 0.001,
                    sustain: 0,
                    release: 0
                },
                oscillator: {
                    type: 'fatsquare',
                    volume: -20
                },
            },
            volume: -8,
            harmonicity: 1,
            vibratoAmount: 0,
        })

        const synth2 = new Tone.PolySynth(Tone.DuoSynth)
        synth2.set({
            voice0: {
                envelope: {
                    attack: 0,
                    decay: 0.099,
                    sustain: 0,
                    release: 0
                },
                oscillator: {
                    type: 'sine',
                    volume: 0
                },
            },
            voice1: {
                envelope: {
                    attack: 0,
                    decay: 0.099,
                    sustain: 0,
                    release: 0
                },
                oscillator: {
                    type: 'sine',
                    volume: -10
                }
            },
            harmonicity: 2,
            detune: 1200,
            volume: -10
        })

        const merge = new Tone.Merge()
        const mono = new Tone.Mono()

        const env = new Tone.FrequencyEnvelope({
            attack: 1.479,
            decay: 0.001,
            sustain: 0,
            release: 0,
            baseFrequency: '1700hz',
            octaves: 3,

        })

        const dly = new Tone.FeedbackDelay({
            delayTime: '8n.',
            feedback: 0.2,
            wet: 0.3
        })

        const chorus = new Tone.Chorus({
            frequency: '0.2Hz',
            delayTime: 13.25,
            depth: 1,
            wet: 1
        })

        const filter1 = new Tone.Filter({
            type: 'lowpass',
            frequency: '1700Hz',
            rolloff: -12
        })

        const filter2 = new Tone.Filter({
            type: 'highpass',
            frequency: '200Hz',
            rolloff: -12
        })

        const volume = new Tone.Volume()

        env.connect(filter1.frequency)

        synth1.connect(merge, 0, 0)
        synth2.connect(merge, 0, 1)

        merge.chain(mono, dly, chorus, filter1, filter2, volume, Tone.Destination)

        this.synth1 = synth1
        this.synth2 = synth2
        this.env = env
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
        this.synth2.triggerAttackRelease(note, duration, time, velocity)
        this.env.triggerAttackRelease(duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }
}

class Synth4 {
    constructor() {
        const synth = new Tone.PolySynth()
        synth.set({
            envelope: {
                attack: 0,
                decay: 0.367,
                sustain: 0,
                release: 0.008
            },
            oscillator: {
                type: 'sine'
            },
            volume: -18,
        })
        const dly = new Tone.FeedbackDelay({
            delayTime: '8n.',
            feedback: 0.2,
            wet: 0.35
        })
        const phaser = new Tone.Phaser({
            frequency: '1n.',
            baseFrequency: '1100hz',
            stages: 6,
            octaves: 1,
            wet: 0.23
        })
        const volume = new Tone.Volume()

        synth.chain(dly, phaser, volume, Tone.Destination)

        this.synth1 = synth
        this.volume = volume
        this.lastNode = volume
    }

    triggerAttackRelease(note, duration, time, velocity) {
        this.synth1.triggerAttackRelease(note, duration, time, velocity)
    }

    setVolume(volValue) {
        this.volume.volume.value = volValue
    }

    connect(node) {
        this.lastNode.disconnect(Tone.Destination)
        this.lastNode.connect(node)
    }
}