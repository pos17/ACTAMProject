import * as MVC from "./modelViewController.js"
import * as Tone from 'tone'
//import { saveAs } from 'file-saver';
import { getAsset, getDocumentElement } from "./firebase.js";

const canvasDiv = document.getElementById('canvas-div');
// const canva = document.getElementById('main-canvas');
const sky = document.getElementById('sky');
const container = document.getElementById('canva-container')



var factor = 8;

var canvas = document.getElementById("main-canvas")
canvas.className = "canvases";

canvas.width = 256 * factor;
canvas.height = 128 * factor;
canvasDiv.appendChild(canvas);

var ctx = canvas.getContext('2d');

//fintanto che non capisco come gira il discorso background, il bg è notturno, si cambia poi in caso 


var time0 = new Date();
var omega = 0; /* canvas angular speed */
var moonRadius = canvas.width / 1.1;

var t = Tone.Time('16m').toMilliseconds()

export async function initImages() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    console.log(MVC.getImageToDraw("astrumDay"))
    console.log(MVC.getImageToDraw("astrumNight"))

    console.log("passato")
    await MVC.setFrameReq(window.requestAnimationFrame(countFPS))
}

function countFPS() {
    if (MVC.isPlaying()) {
        if (Date.now() - MVC.getAnimationSnap() > 1000 / MVC.getFPS()) {
            //console.log("print")
            MVC.setAnimationSnap(Date.now())
            MVC.setFrameReq(window.requestAnimationFrame(createEnvironment));
            //console.log(Model.state.framereq)
        } else {

            MVC.setFrameReq(window.requestAnimationFrame(countFPS));
            //console.log(Model.state.framereq)
        }
    }
}



function createEnvironment() {

    //const values to modify canvas elements 
    const NIGHT_START = 0.5
    const SUNRISE_START = 3.05
    const SUNRISE_END = 3.30
    const DAY_START = 4.0
    const SUNSET_START = 6.10
    const SUNSET_END = 0
    let lightOn = false
    const ALPHASTART = Math.PI * 3 / 2

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
    var a = 5//0.5
    omega = a / t;
    let hAstra = h - MVC.getImageToDraw("floor").getNHeight() * factor - 25 * factor;
    let wAstra = w / 2 - ((MVC.getImageToDraw("astrumNight").getNWidth()) / 2 * factor)
    var angle = (ALPHASTART + omega * (time - time0.getTime()))

    let angleD = angle % (2 * Math.PI)
    let transAngle = angle % (w)
    // BACKGROUND IMAGE
    if (angleD < NIGHT_START) {
        alphaNight = 1
        alphaSunrise = 0
        alphaSunset = 1 - (1 / (NIGHT_START - SUNSET_END)) * (angleD - SUNSET_END)
        alphaDay = 0
        lightOn = true
        sunToDraw = 1
    }
    else if (angleD < SUNRISE_START) {
        alphaNight = 1
        alphaSunrise = 0
        alphaSunset = 0
        alphaDay = 0
        lightOn = true
    } else if (angleD < SUNRISE_END) {
        alphaNight = 1
        alphaSunrise = (1 / (SUNRISE_END - SUNRISE_START)) * (angleD - SUNRISE_START)
        alphaSunset = 0
        alphaDay = 0
        lightOn = true
    } else if (angleD < DAY_START) {
        alphaNight = 0
        alphaSunrise = 1
        alphaSunset = 0
        alphaDay = (1 / (DAY_START - SUNRISE_END)) * (angleD - SUNRISE_END)
        lightOn = false
    } else if (angleD < SUNSET_START) {
        alphaNight = 0
        alphaSunrise = 0
        alphaSunset = 0
        alphaDay = 1
        lightOn = false
    } else {
        alphaNight = 0
        alphaSunrise = 0
        alphaSunset = 1
        alphaDay = 1 - (1 / (2 * Math.PI - SUNSET_START)) * (angleD - SUNSET_START)
        lightOn = false
        sunToDraw = (1 / (2 * Math.PI - SUNSET_START)) * (angleD - SUNSET_START)
    }
    let background = MVC.getImageToDraw("background");
    background.drawThisImage(0, alphaNight, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(1, alphaSunrise, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(2, alphaSunset, lightOn, canvas.height, canvas.width, ctx, factor)
    background.drawThisImage(3, alphaDay, lightOn, canvas.height, canvas.width, ctx, factor)


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
    ctx.translate(Math.round(w / 2), Math.round(hAstra - 15 * factor))
    // var angle = ((a/60)*time.getSeconds()+(a/60000)*time.getMilliseconds());
    // var angle = ((2*Math.PI/6000)*time.getSeconds()) + ((2*Math.PI/100000)*time.getMilliseconds());

    //ctx.rotate(angle);

    // if(angle%(2*Math.PI) < 0.1) {
    //     Model.state.queueDay = 3
    // } else if ((angle%(2*Math.PI) > 3.11 )&&(angle%(2*Math.PI) <3.13)) {
    //     Model.state.queueDay = 1
    // }

    ctx.save()

    let moon = MVC.getImageToDraw("astrumNight")
    ctx.translate(Math.round(-wAstra * (Math.cos(angle))), Math.round(hAstra * (Math.sin(-angle))))
    ctx.translate(Math.round(-(moon.getNWidth() * factor) / 2), Math.round((moon.getNHeight() * factor) / 2))
    moon.drawThisImage(0, 1, lightOn, 0, 0, ctx, factor)
    ctx.restore()

    ctx.save()

    let sun = MVC.getImageToDraw("astrumDay")
    ctx.translate(Math.round(wAstra * (Math.cos(angle - 0.1))), Math.round(hAstra * (Math.sin(angle - 0.1))))
    ctx.translate(Math.round(-(sun.getNWidth() * factor) / 2), Math.round((sun.getNHeight() * factor) / 2))
    sun.drawThisImage(0, 1, lightOn, 0, 0, ctx, factor)
    sun.drawThisImage(1, sunToDraw, lightOn, 0, 0, ctx, factor)


    ctx.restore()
    ctx.restore()

    ctx.save()
    let flyObjs = MVC.getImageToDraw("flyingObject")
    if (flyObjs.length != 0) {
        //console.log("num of objs")
        //console.log(flyObjs.length)
        let i = 1;
        for (let j = 1; j < 3; ++j) {
            for (let flyObj of flyObjs) {
                ctx.save()
                ctx.translate((-w) + ((3 * j * (flyObj.getProperty().shift * w) + (((flyObj.getProperty().velocity * angle) * w))) % (2 * w)), flyObj.getProperty().shift * (h / 3)/*(h / 10)*/)
                flyObj.drawThisImage(0, alphaNight, lightOn, canvas.height, canvas.width, ctx, factor)
                flyObj.drawThisImage(1, alphaSunrise, lightOn, canvas.height, canvas.width, ctx, factor)
                flyObj.drawThisImage(2, alphaSunset, lightOn, canvas.height, canvas.width, ctx, factor)
                flyObj.drawThisImage(3, alphaDay, lightOn, canvas.height, canvas.width, ctx, factor)
                ctx.restore()
                i++;
            }
        }
    }
    ctx.restore()
    // STATIC ELEMENTS
    MVC.getImageToDraw("landscape").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    MVC.getImageToDraw("floor").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    MVC.getImageToDraw("building").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)
    MVC.getImageToDraw("tree").drawThisImage(0, 1, lightOn, canvas.height, canvas.width, ctx, factor)

    MVC.setFrameReq(window.requestAnimationFrame(countFPS));
}




/*
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
*/
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
 * 4: flyingObjec
 */

export class DrawableImage {
    constructor(anImageArray, left, bottom, anImageType, property) {
        this.imageType = anImageType;
        this.imageArray = anImageArray;
        this.left = left;
        this.bottom = bottom;
        this.property = property
    }

    static async build(image) {
        //hasLight,urlLightOff,urlLightOn,left,bottom
        let imageArray = []
        for (let url of image.imageArray) {
            let anImage = new Image()
            anImage.src = await getAsset(url)
            imageArray.push(anImage)
        }
        let property = {}
        switch (image.imageType) {
            case (4):
                property.velocity = image.velocity;
                property.shift = Math.random();
                break;
        }
        if (image.imageType == 4) {
            image.bottom = Math.random()
            image.left = Math.random()
        }
        return new DrawableImage(imageArray, image.left, image.bottom, image.imageType, property)
    }

    drawThisImage(imageToDraw = 0, alpha0 = 1, lightOn, canvasHeight = 0, canvasWidth = 0, ctx, factor) {
        var h = this.imageArray[imageToDraw].naturalHeight * factor;
        var w = this.imageArray[imageToDraw].naturalWidth * factor;
        var x = this.left * canvasWidth;
        var y = (1 - this.bottom) * canvasHeight;
        ctx.globalAlpha = alpha0
        let posX = 0;
        let posY = 0;
        switch (this.imageType) {
            case (0):
                posX = x;
                posY = y - h
                break;
            case (1):
                if (lightOn) imageToDraw = 1
                else imageToDraw = 0
                posX = x;
                posY = y - h
                break;
            case (2):
                x = 0;
                y = 0;
                posX = 0;
                posY = 0
                break;
            case (3):
                posX = x;
                posY = y - h
                break;
            case (4):
                posX = 0;
                posY = 0;
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
    getProperty() {
        return this.property
    }
}