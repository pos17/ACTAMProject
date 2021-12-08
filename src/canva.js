import * as Model from "./index.js"

const canvasDiv = document.getElementById('canvas-div');
// const canva = document.getElementById('main-canvas');
const sky = document.getElementById('sky');

var factor = 16;

var skySunSet = new Image()
skySunSet.src = new URL('../assets/BG/Background2.png', import.meta.url)
skySunSet.classList.add('sky')
skySunSet.style.opacity = '0';
skySunSet.style.position = 'absolute';
skySunSet.style.zIndex = '1'
canvasDiv.appendChild(skySunSet)

var canvas = document.createElement("canvas")
canvas.className = "canvases";
canvas.width = 256*factor;
canvas.height = 128*factor;
canvasDiv.appendChild(canvas);

var ctx = canvas.getContext('2d');
// ctx.imageSmoothingEnabled = false;

var mountains = new Image();
var grass = new Image();
var house = new Image();
var moon = new Image();
var sun = new Image();
var star = new Image();

var state = {
    canvas: {},
    assets: {
        stars: []
    }
} 

const new_assets = {
    mountains: {
        url: new URL('../assets/BG/Mountains.png', import.meta.url),
        left: 0,
        bottom: 0,
        index: 0
    },

    grass: {
        url: new URL('../assets/BG/Grass.png', import.meta.url),
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

    trees: {
        url: {
            Maj: new URL('../assets/TREES/Tree Maj.png', import.meta.url),
            Min: new URL('../assets/TREES/Tree Min.png', import.meta.url),
            Alt: new URL('../assets/TREES/Tree Alt.png', import.meta.url),
        },
        left: 0,
        bottom: 0,
    }  
}

function initImages(){
    mountains.src = new_assets.mountains.url;
    grass.src = new_assets.grass.url;
    house.src = new_assets.house.url;
    moon.src = new_assets.moon.url;
    sun.src = new_assets.sun.url;
    star.src = new_assets.star.url[0];

    for (i=0; i<250; i++){
        var aStar = {img: star, left: Math.random(), bottom: 1-(Math.random()*0.7)}
        state.assets.stars.push(aStar);
    }

    window.requestAnimationFrame(createEnvironment);
}


function drawThisImage (img, left, bottom) {
    var h = img.naturalHeight*factor;
    var w = img.naturalWidth*factor;
    var x = left * canvas.width;
    var y = (1-bottom) * canvas.height;
    ctx.drawImage(img, x, y-h, w, h)
}

function createEnvironment() {

    var h = canvas.height;
    var w = canvas.width; 

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.imageSmoothingEnabled = false;

    state.assets.stars.forEach((star)=>{
        drawThisImage(star.img, star.left, star.bottom)
    })

    // ANIMATED IMAGES
    var time = new Date();
    ctx.save();
    ctx.translate(w/2, h*2)
    var angle = (((2 * Math.PI) / 6) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds())/40
    ctx.rotate(angle);

    var moonRadius = w/1.1; 

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

    // ctx.drawImage(moon, moonRadius, moonRadius);

    
    ctx.restore()

    // STATIC IMAGES
    drawThisImage(mountains, new_assets.mountains.left, new_assets.mountains.bottom);
    drawThisImage(grass, new_assets.grass.left, new_assets.grass.bottom);
    drawThisImage(house, new_assets.house.left, new_assets.house.bottom)

    blendBG()

    window.requestAnimationFrame(createEnvironment);
}

function blendBG() {
    var opa = parseFloat(skySunSet.style.opacity.split()[0])

    if (opa<=1){
        var opac = opa + 0.0005;
        skySunSet.style.opacity = `${opac}`
    }
}

initImages();  


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
