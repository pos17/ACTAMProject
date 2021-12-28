import * as index from "./index.js"
import EventEmitter from 'eventemitter3'

export class Emitter extends EventEmitter {
    constructor() {
        super()
        this.waitingNum = 0;
        
    }
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
    waitForWorker() {   
        var p = new Promise((resolve)=> {
            const success = () => {
                resolve()
                console.log("waiting num: "+this.waitingNum+" resolved")
            }
            this.once("waiting"+this.waitingNum,success)
        });
        
        console.log("waiting for num: "+ this.waitingNum+" to be scheduled")
        var waitingIndex= this.waitingNum
        this.waitingNum++;
        return {promise:p,waitingIndex:waitingIndex} 
    }
    waitingResolved(waitingIndex) {
        this.emit("waiting"+waitingIndex)
        console.log("waiting resolved "+waitingIndex)
    }
}