// const fs = require('fs');
//
// let a = [5,1,4,'+',6,',ob:"salut"','+',17,'valsViniez:{arr:[1,2,3]}'];
//
// fs.writeFileSync('b1.txt',JSON.stringify(a));

const Diff = require('../lib/Diff');
const Patcher = require('../lib/Patcher');
let obj1 = {
    propNum:100,
    propStr:"string 100",
    propArr:[1, "100"],
    propObj:{
        propNum:101,
        propStr:"string 101",
        redundantPropStr:"string 101",
        propArr:[1, "100", {
            propNum:102,
            propStr:"string 103",
        }],
    }
}

let obj2 =  JSON.parse(JSON.stringify(obj1));

obj2.newNum = 1001;
obj2.newProp = 1002;
obj2.propObj.newProp = 1007;
delete obj2.propObj.redundantPropStr;
obj2.propObj.propArr[2].propStr = "24";
obj2.propObj.propArr.push(70);

//console.log(JSON.stringify(obj1),JSON.stringify(obj2));

//console.log(JSON.stringify(obj1),JSON.stringify(obj1).length);
//console.log(JSON.stringify(obj2),JSON.stringify(obj2).length);
// let a = '{"redundantPropStr":"string 101","propArr":[1,"100",{"propNum":102,"propStr":"string 103"}]}';
// let b = '{"propArr":[1,"100",{"propNum":102,"propStr":"24"},70],"newProp":1007},"newNum":1001,"newProp":1002}';
let a = '{"redundantPropStr":"string 101"}';
let b = '{"propArr":[1,"100"]}';
// let a = 'ana are pere verzi si mere';
// let b = 'ana are mere';
new Diff().createDiff(b,a,(err,data)=>{
    console.log(data);
   new Patcher().applyPatch(data,b,(err,dataF)=>{
       //console.log(JSON.stringify(obj2));
       console.log(dataF);
   });
});