const fs = require('fs');
let Operations = require('./Operations');
const operators = new Operations();

function Patcher(){

    this.applyPatch = function(diffData,fileData){
        let diffArr = diffData;
        return operators.patch(0,diffArr,fileData);
    }
}
module.exports = Patcher;