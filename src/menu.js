import * as MVC from "./modelViewController.js"
import * as index from "./index.js"
import { getElementsByType, getMenuTypes, getAsset, getElements } from "./firebase"
import { initImages } from "./canva.js"
import * as Tone from 'tone'
var generateButton = document.createElement('button')
var helpButton = document.createElement('button')
var menuPanel = document.createElement('div')
menuPanel.className = 'menu-panel'

var btn_left = document.getElementById('btn-sx')
var btn_center = document.getElementById('btn-ct')
var btn_right = document.getElementById('btn-dx')



export async function createMenu() {
    console.log("menu Creation")
    var btnContainer = document.getElementById("tokenGrid")// document.createElement('div')
    btnContainer.className = 'token-btn-container'
    console.log(MVC.getStateElements())
    for (let datum of MVC.getStateElements()) {
        console.log('datum: ')
        console.log(datum)
        console.log(datum.image.previewUrl)
        var aNewSrc = await getAsset(datum.image.previewUrl)
        var img = document.createElement('img')
        img.src = aNewSrc
        img.className = 'token-image'
        var btnDiv = document.createElement('div')
        var btn = document.createElement('button')
        btn.id = datum.id
        btn.className = 'nes-btn'
        btn.classList.add('token-btn')
        btn.classList.add(datum.elementType)
        btn.classList.add(datum.environment)

        btn.style.margin = '7px'
        btn.style.marginLeft = 'auto'
        btn.style.marginRight = 'auto'
        btn.appendChild(img)
        btnDiv.classList.add("token-div")
        if (datum.elementType == "flyingObject") {
            var tokenAdd = document.createElement('div')
            tokenAdd.id = "tAdd" + btn.id
            tokenAdd.classList.add("token-add");
            tokenAdd.append("0")
            btnDiv.appendChild(btn)
            btnDiv.appendChild(tokenAdd)
            btnContainer.appendChild(btnDiv)

            console.log("ciao nuvoletta")

        } else {
            btnDiv.appendChild(btn)
            btnContainer.appendChild(btnDiv)
        }
    }
}

export function assignClick() {
    document.querySelectorAll('.token-btn').forEach((btn) => {

        btn.addEventListener('click', () => {
            var id = btn.id
            var env = btn.classList[3]
            var el = btn.classList[2]
            console.log("elements")
            console.log(env)
            console.log(el)
            //console.log(Model.state.drawing)
            //Model.state.drawing.
            //document.querySelectorAll('.'+ el).forEach((elem)=>{elem.classList.remove('selected-btn')})
            MVC.modifyIdList(id)

            visualizeSelectedTokens()

        })
    })
}


function visualizeSelectedTokens() {
    document.querySelectorAll('.token-btn').forEach((btn) => {
        btn.classList.remove('selected-btn')
    });
    document.querySelectorAll('.token-btn').forEach((btn) => {
        var elPos = Object.values(MVC.getIdList()).indexOf(parseInt(btn.id))
        var counter = 0;
        while (elPos > -1) {
            counter = counter + 1;
            elPos = Object.values(MVC.getIdList()).indexOf(parseInt(btn.id), elPos + 1)
        }
        if (btn.classList.contains("flyingObject")) {
            var tAdd = document.getElementById("tAdd" + btn.id)
            tAdd.removeChild(tAdd.firstChild)
            tAdd.append(counter)
        }
        if (counter > 0) {
            btn.classList.add('selected-btn')
        }
    });
}


/*
export async function createMenu () {
    console.log("menu Creation")
    var btnContainer = document.getElementById("tokenGrid")// document.createElement('div')
    btnContainer.className = 'token-btn-container'

    //if the menu isn't initialized a new element is created
    if(Model.state.elementTypes==undefined || Model.state.environments==undefined) {
        let data  = await getMenuTypes()
        Model.state.elementTypes = data.primaryTypes
        Model.state.environments = data.environments
    }
    
    console.log(Model.state.elementTypes)
    for (let elType of Model.state.elementTypes) {
        console.log(elType)
        var btnDiv = document.createElement('div')
        btnDiv.className = 'token-btn-div'    
        
        let toPutIn = []
        if(Model.state.possibleValues == 0) {
            toPutIn = await getElementsByType(elType)
            for(let datum of toPutIn) {
                Model.state.possibleValues.push(datum)
            }
        } else {
            for(let datum of Model.state.possibleValues) {
                if(datum.elementType === elType) {
                    toPutIn.push(datum)
                }
            }
        }   
        console.log("toPutIn:")
        console.log(toPutIn)
        if(toPutIn.length == 0) {
            toPutIn = await getElementsByType(elType)
            for(let datum of toPutIn) {
                Model.state.possibleValues.push(datum)
            }
        }

        toPutIn = toPutIn.sort((a,b) => {
            return Model.state.environments.indexOf(a.environment) - Model.state.environments.indexOf(b.environment)

        })
        console.log("toPutIn$")
        console.log(toPutIn)
        for (let datum of toPutIn) {
            console.log('datum: ')
            console.log(datum)
            console.log(datum.image.previewUrl)
            var aNewSrc =await getAsset(datum.image.previewUrl) 
            var img = document.createElement('img')
            img.src = aNewSrc
            img.className = 'token-image'

            var btn = document.createElement('button')
            btn.id = datum.id
            btn.className = 'nes-btn'
            btn.classList.add('token-btn')
            btn.classList.add(datum.elementType)
            btn.classList.add(datum.environment)
            btn.type = "button"
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
*/



/* -------------------------------------------------------- */

// export function playableButton (ready) {
//     if (ready) {
//         playButton.classList.replace('is-disabled', 'is-success');
//     }
// }

function showInitPanel() {
    document.getElementById("panel-container").hidden = !document.getElementById("panel-container").hidden
    document.getElementById('front-panel').hidden = false
    document.getElementById('start-panel').hidden = true;
}
/*
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
        Tone.context.latencyHint = "playback"
    }    
}*/

// var playButton = document.getElementById('play-button');
// playButton.onclick = ()=> {
//     if (playButton.classList.contains('is-success')){
//         showInitPanel();
//         Model.startMusic(); 

//         }
// }
/*
btn_right.onclick = async () => {
    //console.log(Model.state)
    await MVC.updateState()
    await initImages()
    document.getElementById("canva-container").hidden = false;
    document.getElementById("menu-container").hidden = true;
    //document.getElementById("container").hidden = true; 
    console.log("Hey there")
    //menuPanel.style.display = 'none'
    Tone.start()
    //Model.propagateStateChanges(false)
    //Model.startMusic()
    //updatePage(0)
    //console.log(Model.state)

}
*/
/*
document.getElementById('menu').onclick = () => {
    //Model.stopMusic()
    console.log("merda")
    menuPanel.style.display = 'inline-flex  '
}
*/
/**
 * 
 * @param {*} aPage 0 selecting tokens
 *                  1 player page 
 */
export async function updatePage(aPage) {
    MVC.setNavPage(aPage)
    console.log("page")
    console.log(aPage)

    switch (aPage) {
        case 0:
            await menuPage()
            break;

        case 1:
            await playerPage()
            break;
        default:
            break;
    }
}


async function playerPage() {
    await MVC.updateState()
    await initImages()
    Tone.start()
    document.getElementById("btn-vol").onclick = volumeButton
    let volSlider = document.getElementById("volume-slider")
    volumeUpdate(70)
    volSlider.addEventListener('input', function () { volumeUpdate(volSlider.value) }, false);
    document.getElementById("btn-dx1").onclick = () => { openFullscreen("main-canvas") }
    document.getElementById("btn-stop").onclick = () => { updatePage(0);  index.stopMusic()}
    document.getElementById("player-navbar").hidden = false;
    document.getElementById("canva-container").hidden = false;
    document.getElementById("menu-container").hidden = true;
    document.getElementById("menu-navbar").hidden = true;
    document.getElementById("upbar").hidden = true;

}

async function menuPage() {
    //await createMenu()
    visualizeSelectedTokens()
    //document.getElementById("main-fs-button").onclick = () => { openFullscreen("main-body") }
    document.getElementById("btn-dx").onclick = () => { updatePage(1); index.startMusic()}
    document.getElementById("player-navbar").hidden = true;
    document.getElementById("canva-container").hidden = true;
    document.getElementById("menu-container").hidden = false;
    document.getElementById("menu-navbar").hidden = false;
    document.getElementById("upbar").hidden = false;

}



/**
 * fullscreen handling part 
 */
function openFullscreen(element) {
    elem = document.getElementById(element)
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}
/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}



window.addEventListener("keydown", function (event) {
    if (event.key == "Escape") closeFullscreen()
}, true);




var prevScrollpos = window.pageYOffset;
window.onscroll = function () {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
        document.getElementById("upbar").style.top = "0";
    } else {
        document.getElementById("upbar").style.top = "-100px";
    }
    prevScrollpos = currentScrollPos;
}

/**
 * 
 * @param {*} valueToSet index from 0 to 100
 */
function volumeUpdate(valueToSet) {
    //0-100
    if (valueToSet <= 0) {
        document.getElementById("vol-no").style.display = "block"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 40) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "block"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 75) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "block"
        document.getElementById("vol-high").style.display = "none"
    } else if (valueToSet < 101) {
        document.getElementById("vol-no").style.display = "none"
        document.getElementById("vol-low").style.display = "none"
        document.getElementById("vol-mid").style.display = "none"
        document.getElementById("vol-high").style.display = "block"
    }
    document.getElementById("volume-slider").value = valueToSet;
    let vts = valueToSet / 100
    MVC.setMasterVolume(vts)
    console.log(MVC.getMasterVolume())
}

function volumeButton() {
    console.log("accazzo")
    let testValue = MVC.getMasterVolume() * 100
    console.log(testValue)
    if (testValue > 0) {
        volumeUpdate(0)
    } else {
        console.log("savedVolume")
        console.log(MVC.getSavedVolume() * 100)
        volumeUpdate(MVC.getSavedVolume() * 100)
    }
}