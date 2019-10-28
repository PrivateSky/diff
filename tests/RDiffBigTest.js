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
        // let picks = ['anba','babafa','faf','fafafa','1baca1','vcacabga','{{FAfafa{}{{}','dfafa1124','Fafar11{PVAFafa{LAf}','rrorao','afafq12eqwdesabgf','2qewdeas'];
        // for(let i = 0 ; i < 256010; i++) {
        //     let position = Math.floor(Math.random() * picks.length);
        //     firstString += picks[position];
        //     position = Math.floor(Math.random()*picks.length);
        //     secondString += picks[position];
        // }
        firstString = fs.readFileSync('nm2.txt');
        secondString = fs.readFileSync('nm4.txt');
        firstString = firstString.toString();
        secondString = secondString.toString();
        let filePath = 'nm4.txt';
        // if (!fs.existsSync(filePath)) {
        //     const file = fs.createWriteStream(filePath);
        //     for (let i = 0; i <= 1e4; i++) {
        //         file.write('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n');
        //     }
        //
        //     file.end();
        // }
        // filePath = 'nm2.txt';
        // if (!fs.existsSync(filePath)) {
        //     const file = fs.createWriteStream(filePath);
        //     for (let i = 0; i <= 1e4; i++) {
        //         file.write('consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n');
        //     }
        //
        //     file.end();
        // }
        // console.log(firstString.length);
        // console.log(secondString.length);
        console.log(firstString.length);
        console.log(secondString.length);
        console.time('diff');
        let diff = RDiff().runRsync(firstString,256,secondString);
        console.log(diff.length);
        console.timeEnd('diff');
        console.log(diff[0],diff[3]);
        let patchedData = Patcher().applyPatch(diff,firstString);
        //console.log(diff);
        console.log(patchedData === secondString);
        return callback(undefined);
    }
    testAllDiffs();
},3000);