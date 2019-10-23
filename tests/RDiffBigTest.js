process.env.NO_LOGS = "true";
require("../bundles/pskruntime");
const Diff = require("../lib/Diff.js");
const Patcher = require("../lib/Patcher.js");
const RDiff = require("../lib/RsyncDiff.js");

const fs = require('fs');
const assert = require('double-check').assert;

assert.begin("testDiff",()=>{
    console.log("Cleanup");
},3000);

assert.callback("testDiff",(callback)=>{
    function testAllDiffs(){
        // for(let index = 0; index < textEx.length; index++){
        //     for(let index2 = 1; index2 < textEx[index].length - 1; index2++) {
        //         let diff = RDiff().runRsync(textEx[index], index2, patched[index]);
        //         let patchedData = Patcher().applyPatch(diff, textEx[index]);
        //         // console.log(diff);
        //         // console.log(patchedData);
        //         assert.true(patchedData === patched[index]);
        //     }
        // }
        let firstString ='';
        let secondString ='';
        let picks = ['anba','babafa','faf','fafafa','1baca1','vcacabga','{{FAfafa{}{{}','dfafa1124','Fafar11{PVAFafa{LAf}','rrorao','afafq12eqwdesabgf','2qewdeas'];
        for(let i = 0 ; i < 256010; i++) {
            let position = Math.floor(Math.random() * picks.length);
            firstString += picks[position];
            position = Math.floor(Math.random()*picks.length);
            secondString += picks[position];
        }
        console.log('done');
        console.time('diff');
        let diff = RDiff().runRsync(firstString,512,secondString);
        console.timeEnd('diff');
        let patchedData = Patcher().applyPatch(diff,firstString);
        console.log(patchedData === secondString);
        return callback(undefined);
    }
    testAllDiffs();
},3000);