import * as Model from "./index.js"
import { getElementsByType, getMenuTypes,getAsset } from "./firebase"
import { initImages } from "./canva.js"
import * as Tone from 'tone'

var generateButton = document.createElement('button')
var helpButton = document.createElement('button')
var menuPanel = document.createElement('div')
menuPanel.className = 'menu-panel'

var btn_left = document.getElementById('btn-sx')
var btn_center =  document.getElementById('btn-ct')
var btn_right =  document.getElementById('btn-dx')


export async function createMenu () {
    console.log("menu Creation")
    var btnContainer = document.createElement('div')
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
        Tone.context.latencyHint = "playback"
    }    
}

var playButton = document.getElementById('play-button');
playButton.onclick = ()=> {
    if (playButton.classList.contains('is-success')){
        showInitPanel();
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

generateButton.onclick = async () => {
    console.log(Model.state)
    await initImages()
    menuPanel.style.display = 'none'
    Tone.start()
    Model.propagateStateChanges(false)
    Model.startMusic()
    updatePage(0)
    console.log(Model.state)
    
}

document.getElementById('menu').onclick = () => {
    Model.stopMusic()
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
