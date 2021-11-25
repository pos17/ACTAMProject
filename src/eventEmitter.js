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

    updateReadyToPlay(ready) {
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
}