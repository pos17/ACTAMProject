
const canvasDiv = document.getElementById('canvas-div');
const sky = document.getElementById('sky');
console.log('sky width: '+sky.clientWidth);

var state = {
    canvas: {},
    assets: {
        stars: []
    }
} 

const new_assets = {
    mountains: {
        url: [
            new URL('../assets/BG/Mountains.png', import.meta.url),
            new  URL('../assets/BG/Mountains2.png', import.meta.url),
        ],
        style: {
            class: 'overlay',
            width: '100%',
            left: '0',
            bottom: '0',
            zIndex:'+1'
        },
    },

    grass: {
        url: new URL('../assets/BG/Grass.png', import.meta.url),
        style: {
            class: 'overlay',
            width: '100%',
            left: '0',
            bottom: '0',
            zIndex:'+1'
        }
    },

    house: {
        url: new URL('../assets/HOUSE/Home.png', import.meta.url),
        style: {
            class: 'overlay',
            width: `${49/256*100}%`,
            right: '10%',
            bottom: '10%',
            zIndex:'+1'
        }
    },

    moon: {
        url: [
            new URL('../assets/MOON/Moon1.png', import.meta.url),
            new URL('../assets/MOON/Moon2.png', import.meta.url),
            new URL('../assets/MOON/Moon3.png', import.meta.url),
            new URL('../assets/MOON/Moon4.png', import.meta.url),
            new URL('../assets/MOON/Moon5.png', import.meta.url),
        ],
        style: {
            class: 'overlay',
            width: `${31/256*100}%`,
            left: '10%',
            top: '10%',
            zIndex:'+1'
        }
    },

    star: {
        url: [new URL('../assets/Small Star.png', import.meta.url), new URL('../assets/Big Star.png', import.meta.url),],
        style: {
            class: 'overlay',
            width: `${7/256*100}%`,
            left: '0',
            top: '0',
            zIndex:'0',
            display: 'none'
        }
    },

    trees: {
        url: {
            Maj: new URL('../assets/TREES/Tree Maj.png', import.meta.url),
            Min: new URL('../assets/TREES/Tree Min.png', import.meta.url),
            Alt: new URL('../assets/TREES/Tree Alt.png', import.meta.url),
        },
        style: {
            class: 'overlay',
            width: `${19/256*100}%`,
            zIndex:'+2'
        }
    }  
}

/* var assets = {
    MoonUrls: ['../assets/MOON/Moon.png'],
    stars: [],
    trees: {
        Maj: [],
        Min: [],
        Alt: [],
    }
} */


// function addImage () {
    /* assets.mountains = addImageToCanvasDiv('mountains', urls.mountains[0], {
        class: 'overlay',
        width: '100%',
        left: '0',
        bottom: '0',
        zIndex:'+1'
    }); */
    
    /* assets.grass = addImageToCanvasDiv('grass', urls.grass, {
        class: 'overlay',
        width: '100%',
        left: '0',
        bottom: '0',
        zIndex:'+1'
    }); */

    /* assets.house = addImageToCanvasDiv('house', urls.house, {
        class: 'overlay',
        width: `${49/256*100}%`,
        right: '10%',
        bottom: '10%',
        zIndex:'+1'
    }); */

    /* assets.moon = addImageToCanvasDiv('moon', urls.moon, {
        class: 'overlay',
        width: `${31/256*100}%`,
        left: '10%',
        top: '10%',
        zIndex:'+1'
    }); */

    /* assets.bigStar = addImageToCanvasDiv('big-star', urls.bigStar  , {
        class: 'overlay',
        width: `${7/256*100}%`,
        zIndex:'0',
        display: 'none'
    }); */


/*     addStars(150)

} */

/* function addStars (num) {
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
} */


function subStar (star) {
    // var width = assets.bigStar.style.width; 
    // assets.bigStar.style.top = star.style.top;
    // assets.bigStar.style.left = star.style.left;
    // // assets.bigStar.style.width = width;
    // assets.bigStar.style.display = 'block';
    // setTimeout(() => {
    //     assets.bigStar.style.display = 'none';
    // }, 500);
    // console.log(state.assets.stars.indexOf(star))
    star.src = new_assets.star.url[1];
   
    setTimeout((star)=>{
        star.src = new_assets.star.url[0];
    }, 1100, star)
}


function addImage() {
    state.assets.mountains = addImageToCanvasDiv(new_assets.mountains.url[0], new_assets.mountains.style);
    state.assets.grass = addImageToCanvasDiv(new_assets.grass.url, new_assets.grass.style);
    state.assets.house = addImageToCanvasDiv(new_assets.house.url, new_assets.house.style);
    state.assets.moon = addImageToCanvasDiv(new_assets.moon.url[0], new_assets.moon.style);
    addStars(150);
}

function addStars (num) {
    for (var i=0; i<num; i++) {
        state.assets.stars[i] = addImageToCanvasDiv(new_assets.star.url[0], {
            class: 'overlay',
            width: `${7/256*100}%`,
            left: `${Math.floor(Math.random()*95)}%`,
            top: `${Math.floor(Math.random()*70)}%`,
            zIndex:'0'
        });
    }
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

let timer;
document.getElementById("stop").onclick = () => {clearInterval(timer)};
<<<<<<< HEAD
// document.getElementById('tree-M').onclick = addTreeMaj;
// document.getElementById('tree-m').onclick = addTreeMin;
// document.getElementById('tree-A').onclick = addTreeAlt;
=======
document.getElementById('tree-M').onclick = addTreeMaj;
document.getElementById('tree-m').onclick = addTreeMin;
document.getElementById('tree-A').onclick = addTreeAlt;
document.getElementById('toggleRed').onclick = toggleRedFun;

function toggleRedFun() {
    if(!state.redMountains){
        assets.mountains.src = urls.mountains[1]
        state.redMountains = true
    } else {
        assets.mountains.src = urls.mountains[0]
        state.redMountains =  false
    }
}
>>>>>>> 23d78fc9bbba2e037e6ca31ac93725bb3db2fdaf


timer = setInterval(()=> {
    subStar(state.assets.stars[Math.floor(Math.random()*state.assets.stars.length)]);
}, 1000)

window.addEventListener('load', ()=>{
    console.log(state)
})
<<<<<<< HEAD


/* state.assets.moon.onclick = (e) => {
    e.target.src = new_assets.mountains.url[1]
} */

=======
/*
var myMount = new Vue({
    el: '#toggleRed',
    data: {
        red: true,
    },
    
    methods: { toggleRed: function() {
        if(red) this.red = false
        else this.red =true;
        console.log("red="+this.red)
    }
    },
    
    updated: function () {
        if (this.red) {
            assets.mountains.src = urls.mountains[1]
         }
    }
});
*/ 
>>>>>>> 23d78fc9bbba2e037e6ca31ac93725bb3db2fdaf
addImage()
// initCanvas()