const canvasDiv = document.getElementById('canvas-div');
const sky = document.getElementById('sky');
console.log('sky width: '+sky.clientWidth);

var state = {
    canvas: {},
    assets: {}
} 

const urls = {
    mountains: new URL('../assets/BG/Mountains.png', import.meta.url),
    grass: new URL('../assets/BG/Grass.png', import.meta.url),
    house: new URL('../assets/HOUSE/Home.png', import.meta.url),
    moon: new URL('../assets/MOON/Moon.png', import.meta.url),
    star: new URL('../assets/Small Star.png', import.meta.url),
    bigStar: new URL('../assets/Big Star.png', import.meta.url),
}

var assets = {
    MoonUrls: ['../assets/MOON/Moon.png'],
    stars: []
}


function addImage () {
    assets.mountains = addImageToCanvasDiv(urls.mountains, {
        class: 'overlay',
        width: '100%',
        left: '0',
        bottom: '0',
        zIndex:'+1'
    });
    
    assets.grass = addImageToCanvasDiv(urls.grass, {
        class: 'overlay',
        width: '100%',
        left: '0',
        bottom: '0',
        zIndex:'+1'
    });

    assets.house = addImageToCanvasDiv(urls.house, {
        class: 'overlay',
        width: `${49/256*100}%`,
        // width: `${this.clientWidth/sky.clientWidth*100}%`,
        right: '10%',
        bottom: '10%',
        zIndex:'+1'
    });

    assets.moon = addImageToCanvasDiv(urls.moon, {
        class: 'overlay',
        width: `${31/256*100}%`,
        left: '10%',
        top: '10%',
        zIndex:'+1'
    });

    assets.bigStar = addImageToCanvasDiv(urls.bigStar  , {
        class: 'overlay',
        width: `${7/256*100}%`,
        zIndex:'0',
        display: 'none'
    });

    addStars(150)

}

function addStars (num) {
    for (var i=0; i<num; i++) {
        assets.stars[i] = addImageToCanvasDiv(urls.star, {
            class: 'overlay',
            width: `${7/256*100}%`,
            left: `${Math.floor(Math.random()*100)}%`,
            top: `${Math.floor(Math.random()*70)}%`,
            zIndex:'0'
        })
    }
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
function addImageToCanvasDiv (src, params) {
    var img = new Image();
    img.src = src

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


document.getElementById("stop").onclick = () => {clearInterval(timer)};

let timer = setInterval(()=> {
    subStar(assets.stars[Math.floor(Math.random()*assets.stars.length)]);
}, 1000)

window.addEventListener('load', ()=>{
    console.log(assets)
})

addImage()
// initCanvas()