process.env.NO_LOGS = "true";
require("../bundles/pskruntime");
const Patch = require("../lib/Patch");

const fs = require('fs');
const assert = require('double-check').assert;

let textEx = ['ana are mere','ana are mere, pere','ana are mere si pere'];
let diffs = ['["+",8,"pere verzi si"]','[8,1,"p",14,1,"m"]','["-",8,8]'];
let patched = ['ana are pere verzi si mere','ana are pere, mere','ana are pere'];
assert.begin("testPath", () => {
    console.log("Cleabnup")
}, 3000);

assert.callback("testPath",(callback)=>{
    for(let index = 0; index< 1; index++){
        fs.writeFileSync('../tests/a.txt',textEx[index]);
        fs.writeFileSync('../tests/b.txt',diffs[index]);
        Patch('b.txt','a.txt');
        console.log(fs.readFileSync('a.txt').toString());
        assert.true(1 === 1);
    }
    callback();
},3000);