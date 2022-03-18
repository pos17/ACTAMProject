//const core = require('@magenta/music/node/core');
export class MarkovMelody {
    constructor(nodes) {
        this.nodes = nodes
        console.log(this.nodes)
    }

    generateMelody(startId=0) {
        var path = this._generatePath(startId)
        var melodySequence = ""
        var chordsSequence = "|"
        for(let node of path) {
            melodySequence = melodySequence + node.mel + "\n"    
            chordsSequence = chordsSequence + " "+ node.chord +" |"
        }
        
        return {
            melody:melodySequence,
            chords:chordsSequence
        }
    }

    _generatePath(anId = 0) {
        //anId = anId.toString()
        //console.log(this.tree)
        var startingNode = this.nodes.find(x => x.id == anId)
        var startingNodeId = startingNode.id
        let thisNodeId = -1;
        var thisNode = startingNode
        let path = []
        while(thisNodeId != startingNodeId) {
            path.push(thisNode)
            console.log(thisNode)
            var nextNodeId = this._nextRandomNode(thisNode)
            console.log(nextNodeId)
            thisNodeId = nextNodeId
            thisNode = this.nodes.find(x => x.id == nextNodeId)
        }
        return path
    }

    _nextRandomNode(aNode) {
        let possibleNodes = aNode.links
        let totalWeights = 0;
        for(var i = 0; i < possibleNodes.length;i++) {
            totalWeights = totalWeights + possibleNodes[i].prob
        }
        var random = Math.random() * totalWeights;
        //console.log(totalWeights)
        //console.log(random)
        for (var i = 0; i < possibleNodes.length; i++) {
            random -= possibleNodes[i].prob;
    
            if (random < 0) {
                return possibleNodes[i].id;
            }
        }
    }


}