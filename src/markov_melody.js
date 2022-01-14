//const core = require('@magenta/music/node/core');
export class MarkovMelody {
    constructor(tree, nodes=undefined) {
        this.tree = tree
        this.nodes = nodes
        //console.log(this.tree)
    }

    generateMelody(startId) {
        var path = this.generatePath(startId)
        var musicSequence = []
        for(let id of path) {
            musicSequence.push(this.nodes.find(x => x.id == id))
        }
        
        return musicSequence
    }

    generatePath(anId = 0) {
        //anId = anId.toString()
        console.log(this.tree)
        var startingNode = this.tree.find(x => x.id == anId)
        var startingNodeId = startingNode.id
        let thisNodeId = -1;
        var thisNode = startingNode
        let path = []
        while(thisNodeId != startingNodeId) {
            path.push(thisNode.id)
            console.log(thisNode)
            var nextNodeId = this._nextRandomNode(thisNode)
            console.log(nextNodeId)
            thisNodeId = nextNodeId
            thisNode = this.tree.find(x => x.id == nextNodeId)
        }
        return path
    }

    _nextRandomNode(aNode) {
        let possibleNodes = aNode.links
        let totalWeights = 0;
        for(var i = 0; i < possibleNodes.length;i++) {
            totalWeights = totalWeights + possibleNodes[i].probability
        }
        var random = Math.random() * totalWeights;
        //console.log(totalWeights)
        //console.log(random)
        for (var i = 0; i < possibleNodes.length; i++) {
            random -= possibleNodes[i].probability;
    
            if (random < 0) {
                return possibleNodes[i].id;
            }
        }
    }


}