import * as index from "./index.js"
import EventEmitter from 'eventemitter3'

export class Emitter extends EventEmitter {
    updateReadyModel(ready) {
        this.emit("modelReady")
        index.state.readyModel = true
        console.log("updateReady called")
    }
    isReadyModel() {
        var p = new Promise((resolve)=> {
            const success = () => {
                console.log("value updated successfully")
                resolve()
            }
            this.once("modelReady",success)
        }) 
        return p
    }

    updateReadyToPlay() {
        this.emit("readyToPlay")
        index.state.readyToPlay = true
        console.log("updateReady called")
    }
    isReadyToPlay() {
        var p = new Promise((resolve)=> {
            const success = () => {
                console.log("melody ready to play")
                resolve()
            }
            this.once("readyToPlay",success)
        }) 
        return p
    }

    isThePreviousMelodyScheduled(actualMelody) {
        var previousMelody = actualMelody-1;
        var p = new Promise((resolve)=> {
            const success = () => {
                console.log("previous melody: "+previousMelody+"schedule received and ready to go on")
                resolve()
            }
            this.once("melody"+previousMelody+"Scheduled",success)
        });
        console.log("waiting for melody n: "+ previousMelody+"to be scheduled")
        return p 
    }
    melodyScheduled(melodyScheduled) {
        this.emit("melody"+melodyScheduled+"Scheduled")
        index.state.melody.partPosition++;
        console.log("melody"+melodyScheduled+"Scheduled")
    }
}