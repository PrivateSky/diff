const fs = require('fs');
const Diff = require('./Diff');

console.log(new Diff().createDiff('ana are mere','ana are pere verzi'));

function RHDiff(){
    let diffData = [];

    function makeDifff(){

    }

    function createDiff(fromData,toData){
        if(fromData === toData){
            return diffData;
        }
    }
}
