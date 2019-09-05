process.env.NO_LOGS = "true";
require("../bundles/pskruntime");
const Diff = require("../lib/Diff.js");
const Patcher = require("../lib/Patcher.js");

const fs = require('fs');
const assert = require('double-check').assert;

let textEx = ['ana are mere','ana are mere, pere','ana are mere si pere','{pop:3}','Ana are mere'];
let patched = ['ana are pere verzi si mere','ana are pere, mere','ana are pere','{pop:4,ob:"salut",valsViniez:{arr:[1,2,3]}}','Ana are pere verzi si mere'];

assert.begin("testPath", () => {
    console.log("Cleanup")
}, 3000);

assert.callback("testDiff",(callback)=>{
    function smallRecursion(index,length){
        if(index>=length){
            return callback(undefined);
        }
        new Diff().createDiff(textEx[index],patched[index],(err,data)=>{
            console.log(JSON.stringify(data));
            new Patcher().applyPatch(JSON.stringify(data),textEx[index],(err,patchedData)=>{
                if(err){
                    return callback(err);
                }
                assert.true(patchedData === patched[index]);
                console.log(patchedData);
                smallRecursion(index+1,length);
            });
        });
    }
    smallRecursion(0,3);
},3000);