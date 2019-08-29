process.env.NO_LOGS = "true";
require("../bundles/pskruntime");
const Patcher = require("../lib/Patcher");

const fs = require('fs');
const assert = require('double-check').assert;

let textEx = ['ana are mere','ana are mere, pere','ana are mere si pere'];
let diffs = ['["+",8,"pere verzi si "]','[8,1,"p",14,1,"m"]','["-",8,8]'];
let patched = ['ana are pere verzi si mere','ana are pere, mere','ana are pere'];
assert.begin("testPath", () => {
    console.log("Cleabnup")
}, 3000);

assert.callback("testPath",(callback)=>{
    function smallRecursion(index,length){
        if(index>=length){
            return callback(undefined);
        }
        fs.writeFile('a.txt',textEx[index],(err)=>{
            if(err){
                return callback(err);
            }
            fs.writeFile('b.txt',diffs[index],(err)=>{
                if(err){
                    return callback(err);
                }
                new Patcher().callPatcher('b.txt','a.txt',(err,data)=>{
                    if(err){
                        return callback(err);
                    }
                    assert.true(data === patched[index]);
                    fs.unlink('a.txt',(err)=>{
                        if(err){
                            return callback(err);
                        }
                        fs.unlink('b.txt',(err)=>{
                            if(err){
                                return callback(err);
                            }
                            smallRecursion(index+1,length);
                        });
                    });
                });
            });
        });
    }
    smallRecursion(0,3);
},3000);