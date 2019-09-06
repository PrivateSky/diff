process.env.NO_LOGS = "true";
require("../bundles/pskruntime");
const Patcher = require("../lib/Patcher");

const fs = require('fs');
const assert = require('double-check').assert;

let textEx = ['ana are mere','ana are mere, pere','ana are mere si pere','{pop:3}','Ana are mere'];
let diffs = [['+',8,'pere verzi si '],[8,1,'p',14,1,'m'],['-',8,8] ,[5,1,4,'+',6,',ob:"salut"','+',17,',valsViniez:{arr:[1,2,3]}'],['+',5,'re pe','+',11,'e v','+',15,'rzi si']];
let patched = ['ana are pere verzi si mere','ana are pere, mere','ana are pere','{pop:4,ob:"salut",valsViniez:{arr:[1,2,3]}}','Ana are pere verzi si mere'];
assert.begin("testPath", () => {
    console.log("Cleabnup")
}, 3000);

assert.callback("testPatch",(callback)=>{
    function smallRecursion(index,length){
        if(index>=length){
            return callback(undefined);
        }
        new Patcher().applyPatch(diffs[index],textEx[index],(err,data)=>{
            if(err){
                return callback(err);
            }
            assert.true(data === patched[index]);
            console.log(data);
            smallRecursion(index+1,length);
        });
    }
    smallRecursion(0,5);
},3000);