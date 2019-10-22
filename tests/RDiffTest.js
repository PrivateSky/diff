process.env.NO_LOGS = "true";
require("../bundles/pskruntime");
const Diff = require("../lib/Diff.js");
const Patcher = require("../lib/Patcher.js");
const RDiff = require("../lib/RsyncDiff.js");

const fs = require('fs');
const assert = require('double-check').assert;

let jsonBigEx = '{"propNum":100,"propStr":"string 100","propArr":[1,"100"],"propObj":{"propNum":101,"propStr":"string 101","redundantPropStr":"string 101","propArr":[1,"100",{"propNum":102,"propStr":"string 103"}]}}';
let jsonBigExM = '{"propNum":100,"propStr":"string 100","propArr":[1,"100"],"propObj":{"propNum":101,"propStr":"string 101","propArr":[1,"100",{"propNum":102,"propStr":"24"},70],"newProp":1007},"newNum":1001,"newProp":1002}';
let textEx = ['ana are mere','ana are mere, pere','ana are mere si pere','{pop:3}','Ana are mere',jsonBigEx,'ana are mere'];
let patched = ['ana are pere verzi si mere','ana are pere, mere','ana are pere','{pop:4,ob:"salut",valsViniez:{arr:[1,2,3]}}','Ana are pere verzi si mere',jsonBigExM,'ana are pere verzi'];

assert.begin("testDiff",()=>{
    console.log("Cleanup");
},3000);

assert.callback("testDiff",(callback)=>{
    function testAllDiffs(){
        for(let index = 0; index < textEx.length; index++){
            for(let index2 = 1; index2 < textEx[index].length - 1; index2++) {
                let diff = RDiff().runRsync(textEx[index], index2, patched[index]);
                let patchedData = Patcher().applyPatch(diff, textEx[index]);
                // console.log(diff);
                // console.log(patchedData);
                assert.true(patchedData === patched[index]);
            }
        }
        return callback(undefined);
    }
    testAllDiffs();
},3000);