import * as Model from "./index.js"
import * as Tone from 'tone'
import { saveAs } from 'file-saver';

const canvasDiv = document.getElementById('canvas-div');
// const canva = document.getElementById('main-canvas');
const sky = document.getElementById('sky');
const container = document.getElementById('canva-container')

var generateButton = document.createElement('button')
var helpButton = document.createElement('button')
var menuPanel = document.createElement('div')
menuPanel.className = 'menu-panel'

var btn_left = document.getElementById('btn-sx')
var btn_center =  document.getElementById('btn-ct')
var btn_right =  document.getElementById('btn-dx')

var factor = 8;
var channels = ['mountain', 'seaside', 'city']


var skySunSet = new Image()
skySunSet.src = new URL('../assets/BG/Background2.png', import.meta.url)
skySunSet.classList.add('sky')
skySunSet.style.opacity = '0';
skySunSet.style.position = 'absolute';
// skySunSet.style.zIndex = '1'
// canvasDiv.appendChild(skySunSet)

var skyDay = new Image()
skyDay.src = new URL('../assets/BG/Background3.png', import.meta.url)
skyDay.classList.add('sky')
skyDay.style.opacity = '0';
skyDay.style.position = 'absolute';
// skyDay.style.zIndex = '1'
// canvasDiv.appendChild(skyDay)

var canvas = document.createElement("canvas")
canvas.className = "canvases";
canvas.width = 256*factor;
canvas.height = 128*factor;
canvasDiv.appendChild(canvas);
// state.canvas = canvas;

var ctx = canvas.getContext('2d');

//fintanto che non capisco come gira il discorso background, il bg è notturno, si cambia poi in caso 
var bgNight = new Image()
var bgSunrise = new Image()
var bgDay = new Image()
var bgSunset = new Image()
var landscape = new Image()
var floor = new Image()
var building = new Image()
var shrub = new Image()

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
    night:{
        url: new URL('../assets/BG/Background1.png', import.meta.url),
        previewUrl: new URL('../assets/BG/Background1.png', import.meta.url), 
        left: 0,
        bottom: 0,
        index: 0
    },
    day:{
        url: new URL('../assets/BG/Background3.png', import.meta.url),
        previewUrl: new URL('../assets/BG/Background3.png', import.meta.url), 
        left: 0,
        bottom: 0,
        index: 0
    },
    sunset:{
        url: new URL('../assets/BG/Background4.png', import.meta.url),
        previewUrl: new URL('../assets/BG/Background4.png', import.meta.url), 
        left: 0,
        bottom: 0,
        index: 0
    },
    sunrise:{
        url: new URL('../assets/BG/Background2.png', import.meta.url),
        previewUrl: new URL('../assets/BG/Background2.png', import.meta.url), 
        left: 0,
        bottom: 0,
        index: 0
    },
    mountains: {
        url: new URL('../assets/BG/Mountains.png', import.meta.url),
        previewUrl: new URL('../assets/PREVS/Mountains prev.png', import.meta.url), 
        left: 0,
        bottom: 0,
        index: 0
    },

    sea: {
        url: new URL('../assets/BG/Sea.png', import.meta.url),
        previewUrl: new URL('../assets/PREVS/Sea prev.png', import.meta.url), 
        left: 0,
        bottom: 0,
        index: 0
    },

    skyline: {
        url: new URL('../assets/BG/Skyline.png', import.meta.url),
        previewUrl: new URL('../assets/PREVS/Skyline prev.png', import.meta.url), 
        left: 0,
        bottom: 0,
        index: 0
    },

    desert: {
        url: new URL('../assets/BG/Desert.png', import.meta.url),
        previewUrl: new URL('../assets/PREVS/Desert prev.png', import.meta.url), 
        left: 0,
        bottom: 0,
        index: 0
    },

    grass: {
        url: new URL('../assets/BG/Grass.png', import.meta.url),
        previewUrl: new URL('../assets/PREVS/Grass prev.png', import.meta.url), 
        left: 0,
        bottom: 0,
    },

    seaSand: {
        url: new URL('../assets/BG/Sand.png', import.meta.url),
        previewUrl: new URL('../assets/PREVS/Sea Sand prev.png', import.meta.url), 
        left: 0,
        bottom: 0,
    },

    desertSand: {
        url: new URL('../assets/BG/Desert Sand.png', import.meta.url),
        previewUrl: new URL('../assets/PREVS/Desert Sand prev.png', import.meta.url), 
        left: 0,
        bottom: 0,
    },

    concrete: {
        url: new URL('../assets/BG/Concrete.png', import.meta.url),
        previewUrl: new URL('../assets/PREVS/Concrete prev.png', import.meta.url), 
        left: 0,
        bottom: 0,
    },

    mountainHouse: {
        url: new URL('../assets/HOUSE/Mountain Home.png', import.meta.url),
        previewUrl: new URL('../assets/HOUSE/Mountain Home.png', import.meta.url),
        left: 0.7,
        bottom: 0.1,
    },
    
    seaHouse: {
        url: new URL('../assets/HOUSE/Sea Home.png', import.meta.url),
        previewUrl: new URL('../assets/HOUSE/Sea Home.png', import.meta.url),
        left: 0.7,
        bottom: 0.1,
    },

    cityHouse: {
        url: new URL('../assets/HOUSE/City Home.png', import.meta.url),
        previewUrl: new URL('../assets/HOUSE/City Home.png', import.meta.url),
        left: 0.7,
        bottom: 0.1,
    },

    desertHouse: {
        url: new URL('../assets/HOUSE/Desert Home.png', import.meta.url),
        previewUrl: new URL('../assets/HOUSE/Desert Home.png', import.meta.url),
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
    moon1: {
        url: new URL('../assets/MOON/Moon1.png', import.meta.url),
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
        previewUrl: new URL('../assets/TREES/Tree Alt.png', import.meta.url),
        left: 0.35,
        bottom: 0.09,
    }, 

    tree2: {
        url: new URL('../assets/TREES/Tree Maj.png', import.meta.url),
        previewUrl: new URL('../assets/TREES/Tree Maj.png', import.meta.url),
        left: 0.2,
        bottom: 0.15,
    },
    
    tree3: {
        url: new URL('../assets/TREES/Tree Min.png', import.meta.url),
        previewUrl: new URL('../assets/TREES/Tree Min.png', import.meta.url),
        left: 0.2,
        bottom: 0.1,
    }, 

    palm: {
        url: new URL('../assets/TREES/Palm.png', import.meta.url),
        previewUrl: new URL('../assets/TREES/Palm.png', import.meta.url),
        left: 0.3,
        bottom: 0.1,
    }, 

    streetLamp: {
        url: new URL('../assets/TREES/Street Lamp.png', import.meta.url),
        previewUrl: new URL('../assets/TREES/Street Lamp.png', import.meta.url),
        left: 0.3,
        bottom: 0.1,
    },

    cactus: {
        url: new URL('../assets/TREES/Cactus.png', import.meta.url),
        previewUrl: new URL('../assets/TREES/Cactus.png', import.meta.url),
        left: 0.3,
        bottom: 0.1,
    },
}


// TODO: environment
/*
const environment = {
    mountain: {
        background: new_assets.mountains,
        floor: new_assets.grass,
        building: new_assets.mountainHouse,
        shrub: new_assets.tree3,
    },
    desert: {
        background: new_assets.desert,
        floor: new_assets.desertSand,
        building: new_assets.desertHouse,
        shrub: new_assets.cactus,
    },
    city: {
        background: new_assets.skyline,
        floor: new_assets.concrete,
        building: new_assets.cityHouse,
        shrub: new_assets.streetLamp,
    },
    seaside: {
        background: new_assets.sea,
        floor: new_assets.seaSand,
        building: new_assets.seaHouse,
        shrub: new_assets.palm,
    }
}
*/
/*
var environmentToGenerate = {
    background: "mountain",
    floor: "mountain",
    building: "mountain",
    shrub: "mountain",
}
*/
export function initImages(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    bgNight.src = new_assets.night.url
    bgSunrise.src = new_assets.sunrise.url
    bgDay.src = new_assets.day.url
    bgSunset.src = new_assets.sunset.url
    landscape.src = Model.state.drawing.image.landscape.url
    floor.src = Model.state.drawing.image.floor.url
    building.src = Model.state.drawing.image.building.url
    shrub.src = Model.state.drawing.image.shrub.url
    moon.src = Model.state.drawing.image.moon.url
    sun.src = Model.state.drawing.image.sun.url
    //star.src = new_assets.star.url[0];

    // moon.classList.add('invert');
    //console.log('moon: ')
    //console.log(moon)

    state.assets.stars = []

    var numOfStars = 32

    for (i=0; i<numOfStars; i++){
        var aStar = {img: star, left: Math.random(), bottom: 1-(Math.random()*0.7)}
        state.assets.stars.push(aStar);
    }

    console.log(state.assets.stars)

    // window.requestAnimationFrame(()=>{createEnvironment(env)});
    Model.state.framereq = window.requestAnimationFrame(countFPS);
    console.log(Model.state.framereq)
}


function drawThisImage (img, left, bottom,alpha=1) {
    var h = img.naturalHeight*factor;
    var w = img.naturalWidth*factor;
    var x = left * canvas.width;
    var y = (1-bottom) * canvas.height;
    ctx.globalAlpha = alpha
    ctx.drawImage(img, x, y-h, w, h)
    ctx.globalAlpha = 1
}


function createEnvironment(timestamp) {
    
    //const values to modify canvas elements 
    const NIGHT_START = 0.5
    const SUNRISE_START = 3.05
    const SUNRISE_END = 3.30
    const DAY_START = 4.0
    const SUNSET_START = 6.10
    const SUNSET_END = 0

    let alphaNight = 0 
    let alphaSunrise = 0 
    let alphaDay = 0 
    let alphaSunset = 0


    var time = Date.now()

    var h = canvas.height;
    var w = canvas.width; 

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false;
    var a= 4
    omega = a/t;
    let hAstra = (h-floor.naturalHeight*factor)-25*factor;
    let wAstra = w/2 - (moon.naturalWidth/2)*factor 
    var angle = (/*alpha0 +*/ omega * (time-time0.getTime()))
    let angleD = angle%(2*Math.PI)
    console.log(angleD)
    
    // BACKGROUND IMAGE
    switch(true){
        case (angleD< NIGHT_START):
            alphaNight = 1
            alphaSunrise = 0
            alphaSunset = 1 - (1/(NIGHT_START-SUNSET_END))*(angleD-SUNSET_END)
            alphaDay = 0
        break
        case(angleD < SUNRISE_START):
            alphaNight = 1
            alphaSunrise = 0
            alphaSunset = 0
            alphaDay = 0  
        break
        case(angleD < SUNRISE_END):
            alphaNight = 1
            alphaSunrise = (1/(SUNRISE_END-SUNRISE_START))*(angleD-SUNRISE_START)
            alphaSunset = 0
            alphaDay = 0
        break
        case(angleD < DAY_START):
            alphaNight = 0
            alphaSunrise = 1
            alphaSunset = 0
            alphaDay = (1/(DAY_START-SUNRISE_END))*(angleD-SUNRISE_END)
        break
        case(angleD < SUNSET_START):
            alphaNight = 0
            alphaSunrise = 0
            alphaSunset = 0
            alphaDay = 1
        break
        default:
            alphaNight = 0
            alphaSunrise = 0
            alphaSunset = 1
            alphaDay = 1 - (1/(2*Math.PI-SUNSET_START))*(angleD-SUNSET_START)            
        break  
    }
    drawThisImage(bgNight, Model.state.drawing.image.background.left, Model.state.drawing.image.background.bottom,alphaNight);
    drawThisImage(bgSunrise, Model.state.drawing.image.background.left, Model.state.drawing.image.background.bottom,alphaSunrise);
    drawThisImage(bgSunset, Model.state.drawing.image.background.left, Model.state.drawing.image.background.bottom,alphaSunset);
    drawThisImage(bgDay, Model.state.drawing.image.background.left, Model.state.drawing.image.background.bottom,alphaDay);
    
    
    
    
    
    state.assets.stars.forEach((star)=>{
        drawThisImage(star.img, star.left, star.bottom)
    })
    //console.log("HereWeAre")

    // ANIMATED IMAGES
    //var s = moonRadius - Math.sqrt(Math.pow(moonRadius,2)-(Math.pow(canvas.width,2)/4))
    //var a = 2 * Math.acos(1-(s/moonRadius))
    
    //console.log("HereWeAre1")
    ctx.save();
    ctx.translate(w/2, hAstra-15*factor)
    // var angle = ((a/60)*time.getSeconds()+(a/60000)*time.getMilliseconds());
    // var angle = ((2*Math.PI/6000)*time.getSeconds()) + ((2*Math.PI/100000)*time.getMilliseconds());
   
    //ctx.rotate(angle);

    // if(angle%(2*Math.PI) < 0.1) {
    //     Model.state.queueDay = 3
    // } else if ((angle%(2*Math.PI) > 3.11 )&&(angle%(2*Math.PI) <3.13)) {
    //     Model.state.queueDay = 1
    // }

    ctx.save()
    //ctx.translate(moonRadius, 0)
    
    ctx.translate(-wAstra*(Math.cos(angle)), hAstra*(Math.sin(-angle)))
    ctx.translate(-(moon.naturalWidth*factor)/2, (moon.naturalHeight*factor)/2)
    //ctx.rotate(-angle);
    ctx.drawImage(moon, 0, 0, moon.naturalWidth*factor, moon.naturalHeight*factor);
    ctx.restore()
    /*
    ctx.save()
    ctx.translate(-w/2*(Math.cos(angle)), -h*(Math.sin(angle)))
    //ctx.translate(-moonRadius, 0)
    //ctx.rotate(-angle);
    ctx.drawImage(moon, 0, 0, moon.naturalWidth*factor, moon.naturalHeight*factor);
    ctx.restore()
    */
    ctx.save()
    ctx.translate(wAstra*(Math.cos(angle-0.1)), hAstra*(Math.sin(angle-0.1)))
    ctx.translate(-(sun.naturalWidth*factor)/2, (sun.naturalHeight*factor)/2)
    //ctx.translate(0, moonRadius)
    //ctx.rotate(-angle);
    ctx.drawImage(sun, 0, 0, sun.naturalWidth*factor, sun.naturalHeight*factor);
    ctx.restore()
    /*
    ctx.save()
    ctx.translate(w/2*(Math.cos(angle)), -h*(Math.sin(angle)))
    //ctx.translate(0, -moonRadius)
    //ctx.rotate(-angle);
    ctx.drawImage(sun, 0, 0, sun.naturalWidth*factor, sun.naturalHeight*factor);
    ctx.restore()
    */
    ctx.restore()


    // STATIC ELEMENTS
    drawThisImage(landscape, Model.state.drawing.image.landscape.left, Model.state.drawing.image.landscape.bottom);
    drawThisImage(floor, Model.state.drawing.image.floor.left, Model.state.drawing.image.floor.bottom);
    drawThisImage(building, Model.state.drawing.image.building.left, Model.state.drawing.image.building.bottom);
    drawThisImage(shrub, Model.state.drawing.image.shrub.left, Model.state.drawing.image.shrub.bottom);
    
    
    
    /*
    drawThisImage(bg, environment[env.background].background.left, environment[env.background].background.bottom);
    drawThisImage(floor, environment[env.floor].floor.left, environment[env.floor].floor.bottom);
    drawThisImage(building, environment[env.building].building.left, environment[env.building].building.bottom);
    drawThisImage(shrub, environment[env.shrub].shrub.left, environment[env.shrub].shrub.bottom);
    */
    // blendBG()

    // window.requestAnimationFrame(() => {createEnvironment(env)});
    
    Model.state.framereq = window.requestAnimationFrame(countFPS);
    //console.log(Model.state.framereq)
}

function countFPS(timestamp) {
    if(Model.state.isPlaying) {
        if(Date.now() - Model.state.now > 1000 / Model.state.fps) {
            //console.log("print")
            Model.state.now = Date.now()
            Model.state.framereq = window.requestAnimationFrame(createEnvironment);
            //console.log(Model.state.framereq)
        } else {
            
            Model.state.framereq = window.requestAnimationFrame(countFPS);
            //console.log(Model.state.framereq)
        }
    }
}


/*
function animate() {
  // perform some animation task here

  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 1000 / fps);
}
animate();
*/

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

// initImages(state.environment);  
//initImages(
//);  


/* CREATING MENU' */
export  async function initJSON() {
    for(let datum of Model.state.possibleValues.data) {
        datum.image = new_assets[datum.imageName]
    }
}



export async function createMenu () {
    console.log("menu Creation")
    var btnContainer = document.createElement('div')
    btnContainer.className = 'token-btn-container'
    // cycle each environment to create each row 

    console.log(Model.state.possibleValues.elementTypes)
    for (let elType of Model.state.possibleValues.elementTypes) {
        console.log(elType)
        var btnDiv = document.createElement('div')
        btnDiv.className = 'token-btn-div'    
        
        let toPutIn = []
        for(let datum of Model.state.possibleValues.data) {
            if(datum.elementType === elType) {
                toPutIn.push(datum)
            }
        }
        console.log(new_assets["mountains"].previewUrl)
        // cycle every element of the environment
        console.log("toPutIn:")
        console.log(toPutIn)


        for (let datum of toPutIn) {
            console.log('datum: ')
            console.log(datum)
            //console.log(asset[1])
            console.log(datum.image.previewUrl)
            var aNewSrc = datum.image.previewUrl
            var img = document.createElement('img')
            img.src = aNewSrc//asset[1].previewUrl
            img.className = 'token-image'

            var btn = document.createElement('button')
            btn.id = datum.id
            btn.className = 'nes-btn'
            btn.classList.add('token-btn')
            btn.classList.add(datum.elementType)//asset[0])
            btn.classList.add(datum.environment)

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

function visualizeSelectedTokens() {
    document.querySelectorAll('.token-btn').forEach((btn)=>{
        if (Object.values(Model.state.drawing.idList).indexOf(parseInt(btn.id)) > -1) {
            console.log("it is here num 2")
            console.log(btn);
            btn.classList.add('selected-btn')
        }
    })
}

//createMenu()

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
    // Model.setSeedWords(word1, word2);
    if ((word1 != "")&&(word2 != "")) {
        document.getElementById('front-panel').hidden = true;
        document.getElementById('start-panel').hidden = false;
        Model.state.emitter.updateReadyToPlay()
        Tone.start()
        //Tone.setContext(new Tone.Context({ latencyHint : "balanced" }))
        Tone.context.latencyHint = "playback"
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

export function assignClick() {
    document.querySelectorAll('.token-btn').forEach((btn)=>{

        btn.addEventListener('click', ()=>{
            var id = btn.id
            var env = btn.classList[3]
            var el = btn.classList[2]
            console.log("elements")
            console.log(env)
            console.log(el)
            //Model.state.drawing.
            document.querySelectorAll('.'+ el).forEach((elem)=>{elem.classList.remove('selected-btn')})
            Model.modifyState(id)
            visualizeSelectedTokens()
            
        })
    })
}

generateButton.onclick = () => {
    menuPanel.style.display = 'none'
    Tone.start()
    /*
    Model.state.drawing.image.moon = Model.state.possibleValues.data.find(x=>x.imageName==="moon1").image
    Model.state.drawing.image.sun = Model.state.possibleValues.data.find(x=>x.imageName==="sun").image
    Model.state.drawing.image.background = Model.state.possibleValues.data.find(x=>x.imageName==="night").image
    var fileName = 'myDrawing.json';
    // Create a blob of the data
    var fileToSave = new Blob([JSON.stringify(Model.state.drawing)], {
        type: 'application/json'
    });
    
    // Save the file
    saveAs(fileToSave, fileName);
    */
    //cancelAnimationFrame(framereq)
    Model.propagateStateChanges(false)
    Model.startMusic()
    updatePage(0)
    initImages()
}

document.getElementById('menu').onclick = () => {
    Model.stopMusic()
    //console.log("puttana")
    //console.log(Model.state.framereq)
    //window.cancelAnimationFrame(Model.state.framereq)
    console.log("merda")
    menuPanel.style.display = 'inline-flex  '
}



export function updatePage(aPage) {
    Model.state.navigationPage = aPage
    console.log("page")
    console.log(aPage)

    switch (aPage) {
        case 0:
            homePage()
            break;
        
        case 1:
            menuPage()
            Model.stopMusic()
            menuPanel.style.display = 'inline-flex  '
            break;
    
        default:
            break;
    }
}

function homePage(){
    btn_left.innerHTML = "menu"
    btn_center.innerHTML = "map"
    btn_right.innerHTML = "help"

    btn_left.onclick = ()=>{
        //Model.state.navigationPage=1;
        updatePage(1)
        console.log(Model.state.navigationPage)
    }

}

function menuPage(){
    btn_left.innerHTML = "save"
    btn_center.innerHTML = "map"
    btn_right.innerHTML = "help"

    btn_left.onclick = ()=>{
        //Model.state.navigationPage=1;
        updatePage(0)
        console.log(Model.state.navigationPage)
    }
}

