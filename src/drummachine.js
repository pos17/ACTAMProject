const Instr = require("./instruments")

module.exports = class DrumMachine {
    constructor (instruments){
        this.instruments = instruments;
    }

    play(note, time, velocity) {
        this.instruments.forEach(element => {
            if (element.note == note) {
                element.obj.trigger(time, velocity)
                // console.log(element.note)
            }
        });
    }
}