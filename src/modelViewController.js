import * as Tone from "tone";
import * as Firebase from "./firebase.js";
import { DrawableImage } from "./canva.js";
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
    effects: {
        melody: {},
        harmony: {}
    },
    fps: 24,
    instruments: {},
    stateChanged: false,
    readyModel: false,
    readyToPlay: false,
    isPlaying: true,
    key: "c", //main key of the system
    bpm: 60,
    totalLength: "",
    navigationPage: 0,
    //require("./possible_elements.json"),
    master: {},
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
        }
    },
}

export async function initiateState() {
    let data = await Firebase.getMenuTypes()
    console.log("got?")
    state.elementTypes = data.primaryTypes
    state.environments = data.environments
    let elements = await Firebase.getElements()
    state.elements = elements
}

export function getSelectedIdList() {
    return state.drawing.idList;
}

export function getStateElements() {
    return state.elements;
}

export function getImage() {
    return state.drawing.image
}


export function setNow() {
    state.loadingPage.lastUpdate = Date.now()
}
export function getMasterChain() {
    return state.master
}
export function setMasterChain() {
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

export function setMasterVolume(value) {
    if (value > 0) state.master.mainVolumeSave = value
    state.master.mainGain.gain.value = value
}
export function getSavedVolume() {
    return state.master.mainVolumeSave
}

export function getMasterVolume() {
    return state.master.mainGain.gain.value
}

/**
 * loading bar improvement using requestAnimationFrame
 */
export function setLimit(toValue) {
    state.loadingPage.limit = toValue
}

export function increase() {
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
export function modifyIdList(idValue) {
    console.log(idValue)
    //console.log(state.possibleValues)
    modifyingValue = state.elements.find(element => element.id == idValue)
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

export async function updateState() {
    let ids = getIdList()
    let flyObjsArr = []
    state.imagesToDraw["flyingObject"] = flyObjsArr
    for (let id of ids) {
        modifyingValue = state.elements.find(element => element.id == id)
        switch (modifyingValue.elementType) {
            case ("floor"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])
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
            } break;
            case ("tree"): {
                state.drawing.image[modifyingValue.elementType] = modifyingValue.image
                state.imagesToDraw[modifyingValue.elementType] = await DrawableImage.build(state.drawing.image[modifyingValue.elementType])
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

export function getIdList() {
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

export function orderElements() {
    let orderedEl = []
    let elements = state.elements
    let elementTypes = state.elementTypes
    let environments = state.environments
    for (let elType of elementTypes) {
        for (let env of environments) {
            el = elements.find(element => ((element.elementType == elType) && (element.environment == env)))
            let index = elements.indexOf(el)
            elements.splice(index, 1)
            orderedEl.push(el)
        }
    }
    while ((el = elements.find(element => ((element.elementType == "flyingObject")))) != undefined) {
        let index = elements.indexOf(el)
        elements.splice(index, 1)
        orderedEl.push(el)
    }
    while (elements.length > 0) {
        let el = elements.pop()
        orderedEl.push(el)
    }
    state.elements = orderedEl;

}


export function getImageToDraw(key) {
    return state.imagesToDraw[key]
}
export function getFrameReq() {
    return state.framereq
}
export function setFrameReq(value) {
    state.framereq = value
}

/**
 * work on play pause elements
 */

 export function setPlaying(value) {
    state.isPlaying = value
}

export function isPlaying() {
    return state.isPlaying
}
export function getAnimationSnap() {
    return state.now1
}
export function setAnimationSnap(value) {
    state.now1 = value
}
export function getFPS() {
    return state.fps
}

export function getNavPage() {
    return state.navigationPage
}

export function setNavPage(aPage) {
    state.navigationPage = aPage
}