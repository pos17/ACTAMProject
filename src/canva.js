import * as Model from "./index.js"
import * as Tone from 'tone'
import { saveAs } from 'file-saver';
import { getAsset,getDocumentElement } from "./firebase.js";

const canvasDiv = document.getElementById('canvas-div');
// const canva = document.getElementById('main-canvas');
const sky = document.getElementById('sky');
const container = document.getElementById('canva-container')



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
export async function initImages(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    /*
     * momentary upload of elements  
     */
    el = await getDocumentElement("21sjvRkIbI4OCiBmLBqQhH")
    Model.state.drawing.image["sun"] = el.image
    el = await getDocumentElement("20p5Ppekl7T3P8WWJYN6Tc")
    Model.state.drawing.image["moon"] = el.image
    el = await getDocumentElement("OcyJGyHdUBI6fXb5AcD3")
    Model.state.drawing.image["background"] = el.image
    el = await getDocumentElement("229MYuVK7Qhl0OKlCOXwPJ")
    Model.state.drawing.image["flyingObject"] = el.image
    
    for(let key of Object.keys(Model.state.drawing.image)) {
        console.log(key)
        Model.state.imagesToDraw[key] = await DrawableImage.build(Model.state.drawing.image[key])
    }
    console.log(Model.state.imagesToDraw["moon"])
    console.log(Model.state.imagesToDraw["sun"])
    /*
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
    bgNight.src = await getAsset('BG/Background1.png')
    bgSunrise.src = await getAsset('BG/Background2.png')
    bgDay.src = await getAsset('BG/Background3.png')
    bgSunset.src = await getAsset('BG/Background4.png')
    landscape.src = await getAsset(Model.state.drawing.image.landscape.url)
    floor.src = Model.state.drawing.image.floor.url
    building.src = Model.state.drawing.image.building.url
    shrub.src = Model.state.drawing.image.shrub.url
    moon.src = Model.state.drawing.image.moon.url
    sun.src = Model.state.drawing.image.sun.url
    */
    //star.src = new_assets.star.url[0];

    // moon.classList.add('invert');
    //console.log('moon: ')
    //console.log(moon)
    /*
    state.assets.stars = []

    var numOfStars = 32

    for (i=0; i<numOfStars; i++){
        var aStar = {img: star, left: Math.random(), bottom: 1-(Math.random()*0.7)}
        state.assets.stars.push(aStar);
    }

    console.log(state.assets.stars)
    */
    // window.requestAnimationFrame(()=>{createEnvironment(env)});
    console.log("passato")
    Model.state.framereq = window.requestAnimationFrame(countFPS);
    console.log(Model.state.framereq)
}



function createEnvironment(timestamp) {
    
    //const values to modify canvas elements 
    const NIGHT_START = 0.5
    const SUNRISE_START = 3.05
    const SUNRISE_END = 3.30
    const DAY_START = 4.0
    const SUNSET_START = 6.10
    const SUNSET_END = 0
    let lightOn = false
    const ALPHASTART = Math.PI*3/2

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
    var a= 0.5
    omega = a/t;
    //console.log("floor")
    //console.log(Model.state.imagesToDraw["floor"])
    let hAstra = h-Model.state.imagesToDraw["floor"].getNHeight()*factor-25*factor;
    let wAstra = w/2 - ((Model.state.imagesToDraw["moon"].getNWidth())/2*factor) 
    //console.log("HEW")
    //console.log(wAstra)
    //console.log(hAstra)
    var angle = (ALPHASTART + omega * (time-time0.getTime()))
    
    let angleD = angle%(2*Math.PI)
    let transAngle = angle%(w)
    // BACKGROUND IMAGE
    switch(true){
        case (angleD< NIGHT_START):
            alphaNight = 1
            alphaSunrise = 0
            alphaSunset = 1 - (1/(NIGHT_START-SUNSET_END))*(angleD-SUNSET_END)
            alphaDay = 0
            lightOn = true
            sunToDraw = 1
        break
        case(angleD < SUNRISE_START):
            alphaNight = 1
            alphaSunrise = 0
            alphaSunset = 0
            alphaDay = 0  
            lightOn = true
        break
        case(angleD < SUNRISE_END):
            alphaNight = 1
            alphaSunrise = (1/(SUNRISE_END-SUNRISE_START))*(angleD-SUNRISE_START)
            alphaSunset = 0
            alphaDay = 0
            lightOn = true
        break
        case(angleD < DAY_START):
            alphaNight = 0
            alphaSunrise = 1
            alphaSunset = 0
            alphaDay = (1/(DAY_START-SUNRISE_END))*(angleD-SUNRISE_END)
            lightOn = false
        break
        case(angleD < SUNSET_START):
            alphaNight = 0
            alphaSunrise = 0
            alphaSunset = 0
            alphaDay = 1
            lightOn = false
            
        break
        default:
            alphaNight = 0
            alphaSunrise = 0
            alphaSunset = 1
            alphaDay = 1 - (1/(2*Math.PI-SUNSET_START))*(angleD-SUNSET_START)
            lightOn = false           
            sunToDraw = (1/(2*Math.PI-SUNSET_START))*(angleD-SUNSET_START)
        break  
    }
    /*
    drawThisImage(Model.state.imagesToDraw["bgNight"], 0, 0,alphaNight,false);
    drawThisImage(Model.state.imagesToDraw["bgSunrise"], 0, 0,alphaSunrise,false);
    drawThisImage(Model.state.imagesToDraw["bgSunset"], 0, 0,alphaSunset,false);
    drawThisImage(Model.state.imagesToDraw["bgDay"], 0, 0,alphaDay,false);
    */
    //drawThisImage(imageToDraw=0,alpha0=1,lightOn,canvasHeight=0,canvasWidth=0,ctx,factor)
    Model.state.imagesToDraw["background"].drawThisImage(0,alphaNight,lightOn,canvas.height,canvas.width,ctx,factor)
    Model.state.imagesToDraw["background"].drawThisImage(1,alphaSunrise,lightOn,canvas.height,canvas.width,ctx,factor)
    Model.state.imagesToDraw["background"].drawThisImage(2,alphaSunset,lightOn,canvas.height,canvas.width,ctx,factor)
    Model.state.imagesToDraw["background"].drawThisImage(3,alphaDay,lightOn,canvas.height,canvas.width,ctx,factor)
    
    
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
    ctx.translate(Math.round(w/2), Math.round(hAstra - 15*factor))
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
    
    ctx.translate(Math.round(-wAstra*(Math.cos(angle))), Math.round(hAstra*(Math.sin(-angle))))
    ctx.translate(Math.round(-(Model.state.imagesToDraw["moon"].getNWidth()*factor)/2), Math.round((Model.state.imagesToDraw["moon"].getNHeight()*factor)/2))
    //let numOfMoon = Math.floor(((angle) / (2* Math.PI) ) % (Model.state.imagesToDraw["moon"].getNImages()))
    Model.state.imagesToDraw["moon"].drawThisImage(0/*numOfMoon*/,1,lightOn,0,0,ctx,factor)
    //ctx.drawImage(Model.state.imagesToDraw["moon"], 0, 0, Model.state.imagesToDraw["moon"].naturalWidth*factor, Model.state.imagesToDraw["moon"].naturalHeight*factor);
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
    ctx.translate(Math.round(wAstra*(Math.cos(angle-0.1))), Math.round(hAstra*(Math.sin(angle-0.1))))
    ctx.translate(Math.round(-(Model.state.imagesToDraw["sun"].getNWidth()*factor)/2), Math.round((Model.state.imagesToDraw["sun"].getNHeight()*factor)/2))
    //ctx.translate(0, moonRadius)
    //ctx.rotate(-angle);
    Model.state.imagesToDraw["sun"].drawThisImage(0,1,lightOn,0,0,ctx,factor)
    Model.state.imagesToDraw["sun"].drawThisImage(1,sunToDraw,lightOn,0,0,ctx,factor)
    //ctx.drawImage(Model.state.imagesToDraw["sun"], 0, 0, Model.state.imagesToDraw["sun"].naturalWidth*factor, Model.state.imagesToDraw["sun"].naturalHeight*factor);
    ctx.restore()
    ctx.restore()


    ctx.save()
    ctx.translate(-h/4+((((0.02*angle)*w))%(w+h/2)),h/4)
    Model.state.imagesToDraw["flyingObject"].drawThisImage(0,1,lightOn,0,0,ctx,factor)
    ctx.restore()
    /*
    ctx.save()
    ctx.translate(0.3*(Math.cos(angle+1))*2*w,h/6   )
    Model.state.imagesToDraw["flyingObject"].drawThisImage(1,1,lightOn,0,0,ctx,factor)
    ctx.restore()
    ctx.save()
    ctx.translate(0.1*(Math.cos(angle+0.1))*2*w,h/8)
    Model.state.imagesToDraw["flyingObject"].drawThisImage(2,1,lightOn,0,0,ctx,factor)
    ctx.restore()
    ctx.save()
    ctx.translate(Math.cos(angle)*2*w,h/3)
    Model.state.imagesToDraw["flyingObject"].drawThisImage(3,1,lightOn,0,0,ctx,factor)
    ctx.restore()
    */
    /*
    ctx.save()
    ctx.translate(w/2*(Math.cos(angle)), -h*(Math.sin(angle)))
    //ctx.translate(0, -moonRadius)
    //ctx.rotate(-angle);
    ctx.drawImage(sun, 0, 0, sun.naturalWidth*factor, sun.naturalHeight*factor);
    ctx.restore()
    */
    

    //console.log("here5")
    // STATIC ELEMENTS
    Model.state.imagesToDraw["landscape"].drawThisImage(0,1,lightOn,canvas.height,canvas.width,ctx,factor)
    //drawThisImage(Model.state.imagesToDraw["landscape"],Model.state.drawing.image.landscape.left, Model.state.drawing.image.landscape.bottom,1,Model.state.drawing.image.landscape.hasLight,lightOn);
    //drawThisImage(landscape, Model.state.drawing.image.landscape.left, Model.state.drawing.image.landscape.bottom);
    Model.state.imagesToDraw["floor"].drawThisImage(0,1,lightOn,canvas.height,canvas.width,ctx,factor)
    //drawThisImage(Model.state.imagesToDraw["floor"],Model.state.drawing.image.floor.left, Model.state.drawing.image.floor.bottom,1,Model.state.drawing.image.floor.hasLight,lightOn);
    //drawThisImage(floor, Model.state.drawing.image.floor.left, Model.state.drawing.image.floor.bottom);
    Model.state.imagesToDraw["building"].drawThisImage(0,1,lightOn,canvas.height,canvas.width,ctx,factor)
    //drawThisImage(Model.state.imagesToDraw["building"],Model.state.drawing.image.building.left, Model.state.drawing.image.building.bottom,1,Model.state.drawing.image.building.hasLight,lightOn);
    //drawThisImage(building, Model.state.drawing.image.building.left, Model.state.drawing.image.building.bottom);
    Model.state.imagesToDraw["tree"].drawThisImage(0,1,lightOn,canvas.height,canvas.width,ctx,factor)
    //drawThisImage(Model.state.imagesToDraw["tree"],Model.state.drawing.image.tree.left, Model.state.drawing.image.tree.bottom,1,Model.state.drawing.image.tree.hasLight,lightOn);
    //drawThisImage(shrub, Model.state.drawing.image.shrub.left, Model.state.drawing.image.shrub.bottom);
    
    
    
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
/*
export  async function initJSON() {
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
 */

class DrawableImage {
    constructor(anImageArray,left,bottom,anImageType) {
        this.imageType = anImageType;
        this.imageArray = anImageArray;
        this.left = left;
        this.bottom = bottom;
    }

    static async build(image) {
        //hasLight,urlLightOff,urlLightOn,left,bottom
        let imageArray = []
        for(let url of image.imageArray) {
            let anImage = new Image()
            anImage.src = await getAsset(url)
            imageArray.push(anImage)
        }
        /*
        if(image.hasLight) {
            let imageLightOn = new Image()
            imageLightOn.src = await getAsset(image.urlLightOn)
            let imageLightOff = new Image()
            imageLightOff.src = await getAsset(image.urlLightOff)
            return new DrawableImage(image.hasLight,imageLightOff,imageLightOn,image.left,image.bottom)
        }else  {
            let imageLightOff = new Image()
            imageLightOff.src = await getAsset(image.url)
            return new DrawableImage(image.hasLight,imageLightOff,imageLightOff,image.left,image.bottom)
        }
        */
        return new DrawableImage(imageArray,image.left,image.bottom,image.imageType)
    }

    drawThisImage(imageToDraw=0,alpha0=1,lightOn,canvasHeight=0,canvasWidth=0,ctx,factor) {
        var h = this.imageArray[imageToDraw].naturalHeight*factor;
        var w = this.imageArray[imageToDraw].naturalWidth*factor;
        var x = this.left * canvasWidth;
        var y = (1-this.bottom) * canvasHeight;
        ctx.globalAlpha = alpha0
        let  posX = 0;
        let posY = 0;
        switch(this.imageType) {
            case(0):
                posX = x, 
                posY = y-h
            break;
            case(1):
                if(lightOn) imageToDraw = 1
                else imageToDraw = 0
                posX = x, 
                posY = y-h
            break;
            case(2):
                x = 0;
                y = 0;
                posX = 0, 
                posY = 0
            break;
            case(3):
                posX = x, 
                posY = y-h
            break;
            case(4):
                posX = 0, 
                posY = 0
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
}


