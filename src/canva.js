import * as Model from "./index.js"
import * as Tone from 'tone'


const canvasDiv = document.getElementById('canvas-div');
// const canva = document.getElementById('main-canvas');
const sky = document.getElementById('sky');
const container = document.getElementById('container')

var generateButton = document.createElement('button')

var factor = 8;
var channels = ['mountain', 'seaside', 'city']


var skySunSet = new Image()
skySunSet.src = new URL('../assets/BG/Background2.png', import.meta.url)
skySunSet.classList.add('sky')
skySunSet.style.opacity = '0';
skySunSet.style.position = 'absolute';
skySunSet.style.zIndex = '1'
canvasDiv.appendChild(skySunSet)

var skyDay = new Image()
skyDay.src = new URL('../assets/BG/Background3.png', import.meta.url)
skyDay.classList.add('sky')
skyDay.style.opacity = '0';
skyDay.style.position = 'absolute';
skyDay.style.zIndex = '1'
canvasDiv.appendChild(skyDay)

var canvas = document.createElement("canvas")
canvas.className = "canvases";
canvas.width = 256*factor;
canvas.height = 128*factor;
canvasDiv.appendChild(canvas);
// state.canvas = canvas;

var ctx = canvas.getContext('2d');

var bg = new Image()
var floor = new Image()
var building = new Image()

var moon = new Image();
var sun = new Image();
var star = new Image();

var time0 = new Date();
var omega = 0; /* canvas angular speed */
var moonRadius = canvas.width/1.1;
var alpha0 = Math.acos((canvas.width/2)/moonRadius) 

var t = Tone.Time('16m').toMilliseconds()

var state = {
    canvas: {},
    assets: {
        stars: []
    },
    environment: channels[0],
} 

const new_assets = {
    mountains: {
        url: new URL('../assets/BG/Mountains.png', import.meta.url),
        left: 0,
        bottom: 0,
        index: 0
    },

    sea: {
        url: new URL('../assets/BG/Sea.png', import.meta.url),
        left: 0,
        bottom: 0,
        index: 0
    },

    skyline: {
        url: new URL('../assets/BG/Skyline.png', import.meta.url),
        left: 0,
        bottom: 0,
        index: 0
    },

    grass: {
        url: new URL('../assets/BG/Grass.png', import.meta.url),
        left: 0,
        bottom: 0,
    },

    sand: {
        url: new URL('../assets/BG/Sand.png', import.meta.url),
        left: 0,
        bottom: 0,
    },

    concrete: {
        url: new URL('../assets/BG/Concrete.png', import.meta.url),
        left: 0,
        bottom: 0,
    },

    house: {
        url: new URL('../assets/HOUSE/Home.png', import.meta.url),
        left: 0.7,
        bottom: 0.1,
    },

    moon: {
        url: [
            new URL('../assets/MOON/Moon1.png', import.meta.url),
            new URL('../assets/MOON/Moon2.png', import.meta.url),
            new URL('../assets/MOON/Moon3.png', import.meta.url),
            new URL('../assets/MOON/Moon4.png', import.meta.url),
            new URL('../assets/MOON/Moon5.png', import.meta.url),
        ],
        left: 0,
        bottom: 0,
    },

    sun: {
        url: new URL('../assets/MOON/Sole.png', import.meta.url),
        left: 0,
        bottom: 0,
    },

    star: {
        url: [new URL('../assets/Small Star.png', import.meta.url), new URL('../assets/Big Star.png', import.meta.url),],  
    },

    tree1: {
        url: new URL('../assets/TREES/Tree Alt.png', import.meta.url),
        left: 0,
        bottom: 0,
    }, 

    tree2: {
        url: new URL('../assets/TREES/Tree Maj.png', import.meta.url),
        left: 0,
        bottom: 0,
    },
    
    tree3: {
        url: new URL('../assets/TREES/Tree Min.png', import.meta.url),
        left: 0,
        bottom: 0,
    }, 
}

// TODO: environment

const environment = {
    mountain: {
        background: new_assets.mountains,
        floor: new_assets.grass,
        building: new_assets.house,
        shrub: new_assets.tree1,
    },
    desert: {
        background: new_assets.mountains,
        floor: new_assets.concrete,
        building: new_assets.house,
        shrub: new_assets.tree2,
    },
    city: {
        background: new_assets.skyline,
        floor: new_assets.concrete,
        building: new_assets.house,
        shrub: new_assets.tree3,
    },
    seaside: {
        background: new_assets.sea,
        floor: new_assets.sand,
        building: new_assets.house,
        shrub: new_assets.tree1,
    }
}

var environmentToGenerate = {
    background: "",
    floor: "",
    building: "",
    shrub: "",
}

function initImages(env){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    bg.src = environment[env].background.url
    floor.src = environment[env].floor.url
    building.src = environment[env].building.url

    moon.src = new_assets.moon.url;
    sun.src = new_assets.sun.url;
    star.src = new_assets.star.url[0];

    state.assets.stars = []

    var numOfStars = 32

    for (i=0; i<numOfStars; i++){
        var aStar = {img: star, left: Math.random(), bottom: 1-(Math.random()*0.7)}
        state.assets.stars.push(aStar);
    }

    console.log(state.assets.stars)

    window.requestAnimationFrame(()=>{createEnvironment(env)});
}


function drawThisImage (img, left, bottom) {
    var h = img.naturalHeight*factor;
    var w = img.naturalWidth*factor;
    var x = left * canvas.width;
    var y = (1-bottom) * canvas.height;
    ctx.drawImage(img, x, y-h, w, h)
}

function createEnvironment(env) {
    var time = Date.now()

    var h = canvas.height;
    var w = canvas.width; 

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false;

    state.assets.stars.forEach((star)=>{
        drawThisImage(star.img, star.left, star.bottom)
    })

    // ANIMATED IMAGES
    var s = moonRadius - Math.sqrt(Math.pow(moonRadius,2)-(Math.pow(canvas.width,2)/4))
    var a = 2 * Math.acos(1-(s/moonRadius))
    omega = a/t;

    ctx.save();
    ctx.translate(w/2, h*2)
    // var angle = ((a/60)*time.getSeconds()+(a/60000)*time.getMilliseconds());
    // var angle = ((2*Math.PI/6000)*time.getSeconds()) + ((2*Math.PI/100000)*time.getMilliseconds());
    var angle = (alpha0 + omega * (time-time0.getTime()))
    ctx.rotate(angle);

    ctx.save()
    ctx.translate(moonRadius, 0)
    ctx.rotate(-angle);
    ctx.drawImage(moon, 0, 0, moon.naturalWidth*factor, moon.naturalHeight*factor);
    ctx.restore()

    ctx.save()
    ctx.translate(-moonRadius, 0)
    ctx.rotate(-angle);
    ctx.drawImage(moon, 0, 0, moon.naturalWidth*factor, moon.naturalHeight*factor);
    ctx.restore()

    ctx.save()
    ctx.translate(0, moonRadius)
    ctx.rotate(-angle);
    ctx.drawImage(sun, 0, 0, sun.naturalWidth*factor, sun.naturalHeight*factor);
    ctx.restore()

    ctx.save()
    ctx.translate(0, -moonRadius)
    ctx.rotate(-angle);
    ctx.drawImage(sun, 0, 0, sun.naturalWidth*factor, sun.naturalHeight*factor);
    ctx.restore()

    ctx.restore()
    
    // STATIC IMAGES
    drawThisImage(bg, environment[env].background.left, environment[env].background.bottom);
    drawThisImage(floor, environment[env].floor.left, environment[env].floor.bottom);
    drawThisImage(building, environment[env].building.left, environment[env].building.bottom);

    // blendBG()

    window.requestAnimationFrame(() => {createEnvironment(env)});
}

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

initImages(state.environment);  

function appendTokenButton () {
    console.log('ASSETS')
    console.log(Object.keys(new_assets).length)
    var body = document.body;

    // for (let index = 0; index < Object.keys(new_assets).length; index++) {
    //     var img = document.createElement('img')
    //     img.src = 
        
    // }

    for(var elem in new_assets) {
        var img = document.createElement('img')
        img.src = new_assets[elem].url
        img.className  = 'token-image'

        console.log("ASSET"+elem.toString())
        console.log(new_assets[elem].url)

        
        var btn = document.createElement('button')

        // btn.classList.add('nes-btn token-btn')
        btn.classList = 'nes-btn'
        btn.classList.add('token-btn')
        btn.appendChild(img)
        body.appendChild(btn)

    }
}

// appendTokenButton()


/* CREATING MENU' */

function createMenu () {
    var menuPanel = document.createElement('div')
    menuPanel.className = 'menu-panel'
    var btnContainer = document.createElement('div')
    btnContainer.className = 'token-btn-container'
    // TODO: ciclo per creare in modo modulare i bottoni dalla struttura environment

    // cycle each environment to create each row 
    for (let env in environment) {
        var btnDiv = document.createElement('div')
        btnDiv.className = 'token-btn-div'    
        // console.log(env)

        // cycle every element of the environment
        for (let asset of Object.entries(environment[env])) {

            console.log('env: '+env)
            console.log(asset[1])

            var img = document.createElement('img')
            img.src = asset[1].url
            img.className = 'token-image'

            var btn = document.createElement('button')
            btn.className = 'nes-btn'
            btn.classList.add('token-btn')
            btn.classList.add(asset[0])
            btn.classList.add(env)
            btn.style.margin = '7px'
            btn.style.marginLeft = 'auto'
            btn.style.marginRight = 'auto'
            btn.appendChild(img)
            btnDiv.appendChild(btn)
            // btnDiv.style.margin = 'auto'
        }
        btnContainer.appendChild(btnDiv)
    }

    menuPanel.appendChild(btnContainer)

    generateButton.className = 'nes-btn is-success'
    generateButton.innerText = 'GENERATE'
    menuPanel.appendChild(generateButton)

    container.appendChild(menuPanel)
}

createMenu()

/* -------------------------------------------------------- */

export function playableButton (ready) {
    if (ready) {
        playButton.classList.replace('is-disabled', 'is-success');
    }
}

function showInitPanel() {
    document.getElementById("panel-container").hidden = !document.getElementById("panel-container").hidden
    document.getElementById('front-panel').hidden = false
    document.getElementById('start-panel').hidden = true;
}

var okButton = document.getElementById('ok-button');
okButton.onclick = () => {
    var word1 = document.getElementById('name-field1').value
    var word2 = document.getElementById('name-field2').value
    Model.setSeedWords(word1, word2);
    if ((word1 != "")&&(word2 != "")) {
        document.getElementById('front-panel').hidden = true;
        document.getElementById('start-panel').hidden = false;
        Model.initializeMelody()
    }    
}

var playButton = document.getElementById('play-button');
playButton.onclick = ()=> {
    if (playButton.classList.contains('is-success')){
        showInitPanel();
        // window.requestAnimationFrame(moveMoon) 
        Model.startMusic(); 
        
        }
}

document.getElementById('change').onclick = () => {
    var idx = channels.indexOf(state.environment)
    idx = (idx + 1) % channels.length
    state.environment = channels[idx]; 
    
    initImages(state.environment)
}

document.querySelectorAll('.token-btn').forEach((btn)=>{
    btn.addEventListener('click', ()=>{
        var env = btn.classList[3]
        var el = btn.classList[2]

        document.querySelectorAll('.'+ el).forEach((elem)=>{elem.classList.remove('selected-btn')})
        btn.classList.add('selected-btn')

        environmentToGenerate[el] = env


        console.log(env)
        console.log(environmentToGenerate)
        
    })
})
