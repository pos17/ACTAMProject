import * as index from "./index.js"
import EventEmitter from 'eventemitter3'

export class Emitter extends EventEmitter {
    updateReady(ready) {
        this.emit("modelReady")
        index.state.readyModel = true
        console.log("updateReady called")
    }
    isReady() {
        var p = new Promise((resolve)=> {
            const success = () => {
                console.log("value updated successfully")
                resolve()
            }
            this.once("modelReady",success)
        }) 
        return p
    }
}