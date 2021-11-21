import Vue from "vue";


const canvasDiv = document.getElementById('canvas-div');
const sky = document.getElementById('sky');
console.log('sky width: '+sky.clientWidth);

var state = {
    canvas: {},
    assets: {}
} 

const urls = {
    mountains: [
        new URL('../assets/BG/Mountains.png', import.meta.url),
        new  URL('../assets/BG/Mountains2.png', import.meta.url),
    ],
    grass: new URL('../assets/BG/Grass.png', import.meta.url),
    house: new URL('../assets/HOUSE/Home.png', import.meta.url),
    moon: new URL('../assets/MOON/Moon.png', import.meta.url),
    star: new URL('../assets/Small Star.png', import.meta.url),
    bigStar: new URL('../assets/Big Star.png', import.meta.url),
    treeMaj: new URL('../assets/TREES/Tree Maj.png', import.meta.url),
    treeMin: new URL('../assets/TREES/Tree Min.png', import.meta.url),
    treeAlt: new URL('../assets/TREES/Tree Alt.png', import.meta.url),
}

var assets = {
    MoonUrls: ['../assets/MOON/Moon.png'],
    stars: [],
    trees: {
        Maj: [],
        Min: [],
        Alt: [],
    }
}


function addImage () {
    assets.mountains = addImageToCanvasDiv('mountains', urls.mountains[0], {
        class: 'overlay',
        width: '100%',
        left: '0',
        bottom: '0',
        zIndex:'+1'
    });
    
    assets.grass = addImageToCanvasDiv('grass', urls.grass, {
        class: 'overlay',
        width: '100%',
        left: '0',
        bottom: '0',
        zIndex:'+1'
    });

    assets.house = addImageToCanvasDiv('house', urls.house, {
        class: 'overlay',
        width: `${49/256*100}%`,
        // width: `${this.clientWidth/sky.clientWidth*100}%`,
        right: '10%',
        bottom: '10%',
        zIndex:'+1'
    });

    assets.moon = addImageToCanvasDiv('moon', urls.moon, {
        class: 'overlay',
        width: `${31/256*100}%`,
        left: '10%',
        top: '10%',
        zIndex:'+1'
    });

    assets.bigStar = addImageToCanvasDiv('big-star', urls.bigStar  , {
        class: 'overlay',
        width: `${7/256*100}%`,
        zIndex:'0',
        display: 'none'
    });


    addStars(150)

}

function addStars (num) {
    for (var i=0; i<num; i++) {
        assets.stars[i] = addImageToCanvasDiv('star', urls.star, {
            class: 'overlay',
            width: `${7/256*100}%`,
            left: `${Math.floor(Math.random()*100)}%`,
            top: `${Math.floor(Math.random()*70)}%`,
            zIndex:'0'
        })
    }
}

function addTreeMaj () {
    var img = addImageToCanvasDiv(urls.treeMaj, {
        class: 'overlay',
        width: `${19/256*100}%`,
        left: `${Math.floor(Math.random()*40)}%`,
        bottom: `${Math.floor(Math.random()*17)}%`,
        zIndex:'+2'
    })
    assets.trees.Maj.push(img)
    console.log(assets)
}

function addTreeMin () {
    var img = addImageToCanvasDiv(urls.treeMin, {
        class: 'overlay',
        width: `${19/256*100}%`,
        left: `${Math.floor(Math.random()*40)}%`,
        bottom: `${Math.floor(Math.random()*17)}%`,
        zIndex:'+2'
    })
    assets.trees.Min.push(img)
    console.log(assets)
}

function addTreeAlt () {
    var img = addImageToCanvasDiv(urls.treeAlt, {
        class: 'overlay',
        width: `${19/256*100}%`,
        left: `${Math.floor(Math.random()*40)}%`,
        bottom: `${Math.floor(Math.random()*17)}%`,
        zIndex:'+2'
    })
    assets.trees.Alt.push(img)
    console.log(assets)
}


function subStar (star) {
    // var width = assets.bigStar.style.width; 
    assets.bigStar.style.top = star.style.top;
    assets.bigStar.style.left = star.style.left;
    // assets.bigStar.style.width = width;
    assets.bigStar.style.display = 'block';
    setTimeout(() => {
        assets.bigStar.style.display = 'none';
    }, 500);
}

// params = {class, height, width, top, left, display}
function addImageToCanvasDiv (id, src, params) {
    var img = new Image();
    img.src = src

    img.id = id ? id : null;
    img.style.position = 'absolute';
    img.style.display = params.display ? params.display : 'block'
    img.style.zIndex = params.zIndex ? params.zIndex : '0';
    img.style.imageRendering = 'crisp-edges';

    if (params.class) {
        if (params.class.includes(' ')) {
          img.classList.add(...params.class.split(' '));
        } else {
          img.classList.add(params.class);
        }
    }

    if (!params.height) {
        img.style.width = params.width ? params.width : '25%';
        img.style.height = 'auto';
      } else {
        img.style.height = params.height;
        img.style.width = 'auto';
    }

    if(!params.top) {
        img.style.bottom = params.bottom ? params.bottom : '5%';
    }
    else {
        img.style.top = params.top; 
    }

    if(!params.left) {
        img.style.right = params.right ? params.right : '5%'
    }
    else {
        img.style.left = params.left;
    }

    canvasDiv.appendChild(img);
    return img;
}

let timer;
document.getElementById("stop").onclick = () => {clearInterval(timer)};
document.getElementById('tree-M').onclick = addTreeMaj;
document.getElementById('tree-m').onclick = addTreeMin;
document.getElementById('tree-A').onclick = addTreeAlt;


timer = setInterval(()=> {
    subStar(assets.stars[Math.floor(Math.random()*assets.stars.length)]);
}, 1000)

window.addEventListener('load', ()=>{
    console.log(assets)
})

var myMount = new Vue({
    el: '#mountains',

    data: {
        red: true,
    },
    
    method: {
        seeMe: function () {
            if (this.red) {
                assets.mountains.src = urls.mountains[1]
            }
        }
    }
}); 

addImage()
// initCanvas()