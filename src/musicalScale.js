//Main reference: https://codepen.io/jakealbaugh/pen/qNrZyw?editors=0010

/*---------------------NOTES DICTIONARY------------------------*/
module.exports = class musicalScale {
    
    constructor(key, mode) {
        this.key = key;
        this.mode = mode;
        this.dict = this._loadDictionary()
        console.table(this.dict);
        this._scale = this.dict.scales[this._paramMode(this.mode)]  //FIXME: doesn't work with flat and sharps
    }
    //given a key and a mode returns the notes of a scale
    getNotesOfScale() {

    }

    scaleNotes() {
        //console.log(this._scale = this.dict.scales[this._paramMode(this.mode)])
        var steps = this._scale.steps
        console.log(this._scale.steps)
        var keys = this.dict.keys
        var keyToRet = [] 
        var offset = keys.indexOf(this.key);
        console.log("offset:" +offset)
        console.log("keys:"+keys)
        console.log("steps:"+steps)
        console.log("keys.length:"+keys.length)
        for(var i = 0;i <keys.length;i++) {
            
            if(steps[i]>=1) {
                keyToRet.push(keys[(offset+i) % keys.length])
            }
            console.log(keyToRet)
        }
        
        return keyToRet;
    }
    _genTriads(ciao) {

    }
    _loadDictionary() {
      return {
        keys: 'C C# D D# E F F# G G# A A# B'.split(' '),
        scales: {
          ion: {
            name: 'Ionian',
            steps: this._genSteps('W W H W W W H'),
            dominance: [3,0,1,0,2,0,1],
            triads: this._genTriads(0)
          },
          dor: {
            name: 'Dorian',
            steps: this._genSteps('W H W W W H W'),
            dominance: [3,0,1,0,2,2,1],
            triads: this._genTriads(1)
          },
          phr: {
            name: 'Phrygian',
            steps: this._genSteps('H W W W H W W'),
            dominance: [3,2,1,0,2,0,1],
            triads: this._genTriads(2)
          },
          lyd: {
            name: 'Lydian',
            steps: this._genSteps('W W W H W W H'),
            dominance: [3,0,1,2,2,0,1],
            triads: this._genTriads(3)
          },
          mix: {
            name: 'Mixolydian',
            steps: this._genSteps('W W H W W H W'),
            dominance: [3,0,1,0,2,0,2],
            triads: this._genTriads(4)
          },
          aeo: {
            name: 'Aeolian',
            steps: this._genSteps('W H W W H W W'),
            dominance: [3,0,1,0,2,0,1],
            triads: this._genTriads(5)
          },
          loc: {
            name: 'Locrian',
            steps: this._genSteps('H W W H W W W'),
            dominance: [3,0,1,0,3,0,0],
            triads: this._genTriads(6)
          },
          mel: {
            name: 'Melodic Minor',
            steps: this._genSteps('W H W W W W H'),
            dominance: [3,0,1,0,3,0,0],
            triads: 'min min aug maj maj dim dim'.split(' ')
          },
          har: {
            name: 'Harmonic Minor',
            steps: this._genSteps('W H W W H WH H'),
            dominance: [3,0,1,0,3,0,0],
            triads: 'min dim aug min maj maj dim'.split(' ')
          }
        },
        modes: [
          'ionian', 'dorian', 'phrygian', 
          'lydian', 'mixolydian', 'aeolian',
          'locrian', 'major', 'minor', 
          'melodic', 'harmonic'
        ],
        flat_sharp: {
          Cb: 'B',
          Db: 'C#',
          Eb: 'D#',
          Fb: 'E',
          Gb: 'F#',
          Ab: 'G#',
          Bb: 'A#'
        },
        triads: {
          maj: [0,4,7],
          min: [0,3,7],
          dim: [0,3,6],
          aug: [0,4,8]
        }
      };
    };

    _genSteps(steps_str) {
        console.log(steps_str)
        let arr = steps_str.split(' ');
        console.log(arr)
        let steps = [];
        //let step = 0;
        steps.push(1);
        for(let i = 0; i < arr.length - 1; i++) {
          //let int = 0;
          switch(arr[i]) {
            case 'W':{
                steps.push(0);    
                steps.push(1);
            }
              break;
            case 'H':
              steps.push(1); break;
            case 'WH':{
                steps.push(0);
                steps.push(0);    
                steps.push(1);
            }
            break;
          }
          console.log(steps)
        }
        return steps;
      };

    _paramMode(mode) {
      return {
        minor: 'aeo',
        major: 'ion',
        ionian: 'ion',
        dorian: 'dor',
        phrygian: 'phr',
        lydian: 'lyd',
        mixolydian: 'mix',
        aeolian: 'aeo',
        locrian: 'loc',
        melodic: 'mel',
        harmonic: 'har'
      }[mode];
    };
  }