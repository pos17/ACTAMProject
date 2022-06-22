# **BIO MASHUP**


![](./GitAssets/casaPIXEL.png)

- [**BIO MASHUP**](#bio-mashup)
  - [INTRODUCTION](#introduction)
  - [User Guide](#user-guide)
    - [Menu](#menu)
    - [NOTES](#notes)
    - [Caption: elements and music](#caption-elements-and-music)
      - [Melody Instrument](#melody-instrument)
      - [Chords Instrument](#chords-instrument)
      - [Bass](#bass)
      - [Music Style](#music-style)
      - [Rhythmic Pattern](#rhythmic-pattern)
  - [Music generation](#music-generation)
      - [Markov Chain](#markov-chain)
      - [Leadsheet Notation](#leadsheet-notation)
      - [Styles](#styles)
  - [Implementation](#implementation)
    - [Audio Generation](#audio-generation)
  - [Results and final considerations](#results-and-final-considerations)
  - [Group members](#group-members)

## INTRODUCTION
  Project developed for the course "Advance Coding Tools and Methodologies", held in the Master degree of Music and Acoustic Engineering, based in "Politecnico di Milano". 
  The project aims at the production of generative music threw the combination of different melodic and rythmic music styles, different instruments. Every component is represented by a simple and friendly visual component, combining the various component the user can build a visual and musical environment.


## User Guide

The system can be tested by the user in two ways: 
- [Hosted website](https://pox17.github.io/ACTAMProject/)
- Downloading the whole project from GitHub and running it using VS CODE live server
  

### Menu 
![](./GitAssets/mainMenu.png)

Through the main menu the user can choose one of the many combinations of environment components, in order to build the desired environment. 

Once the user found the wanted combination the user can let the system generate the musical part to be played pressing the "MUSIC" button: 
When a music part is not ready the button is white. 

<p float="left">
  <img src="./GitAssets/MusicButtonWhite.png" width="300" />
  <img src="./GitAssets/MusicButtonBlue.png" width="300" /> 
</p>

When the music part is ready the same button becomes blue.

Once the music is ready the user can click on the "PLAY" button and start the music playing. 
<p float="left">
  <img src="./GitAssets/EnvPlayer.png" width="900" /> 
</p>

### NOTES 
- Use on Mozilla Firefox for best user experience
- Internet connection needed while using the website in order to correctly downloading all the components.

### Caption: elements and music

#### Melody Instrument
The instruments used to play the melodic part is represented by the building elements in the canva.

#### Chords Instrument
The instruments used to play the harmonic part is represented by the floor elements in the canva.

#### Bass
The instruments used to play the bass part is represented by the decorative elements in the canva.

#### Music Style
Music style is dictated by the choose of the landscape element in the canva.

#### Rhythmic Pattern
Rhythmic patterns are represented by the number of clouds. Each cloud represents a different instrument like kick drum, snare drum, shakers and wood percussions. No clouds means no rhythmic pattern, therefore no rhythmic sound at all. Choosing one or more cloud for each type the pattern of that instrument get more complex, according to the table below. Try different combinations to create your rhythm!

![](./GitAssets/RhythmicTable.png)

## Music generation 

#### Markov Chain
#### Leadsheet Notation
#### Styles

## Implementation
 Given the unusual nature of the system built, it is implemented using mostly raw HTML, CSS and JAVASCRIPT code, some frameworks and instruments have been used for the development in order to speed up and enhance the results obtained by the system: 

- [Tone.js](https://tonejs.github.io/)
- [Firebase](https://firebase.google.com/)
- [NES CSS](https://nostalgic-css.github.io/NES.css/)
- [Shepherd.js](https://shepherdjs.dev/)



### Audio Generation
All the audio generation and synchronizing is implemented using Tone.js

## Results and final considerations

## Group members
- Paolo Ostan (paolo.ostan@mail.polimi.it)
- Stefano Donà (stefano2.dona@mail.polimi.it) 
- Sofia Parrinelli (sofia.parrinelli@mail.polimi.it)

