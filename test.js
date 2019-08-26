const fs = require("fs");

let obj2 = {
    propNum: 100,
    propStr:"string 100",
    propArr:[1,"100"],
    propObj:{
        propNum:101,
        propStr:"string 101",
        redundantPropStr:"string 101",
        propArr:[1,"100",{
            propNum:102,
            propStr:"string 103"
        }]
    },
    minobj:{
        duo:3,
        uno:2
    },
    arr:[1,2,3,4,5,6,7,'a']
};
let obj3 = {
    propNum: 100,
    propStr:"string 100",
    propArr:[1,"100"],
    propObj:{
        propNum:101,
        propFs:'LLT',
        propStr:"string 101",
        redundantPropStr:"string 101",
        propArr:[1,"100",{
            propNum:102,
            propStr:"string 122",
            propstar:"HM"
        }]
    },
    minobj:{
        uno:2,
        duo:3
    },
    arr:[1,2,3,4,5,6,7,'b','c']
};
let diff = [3,['d',{propFs:"LLT"}],5,['d',{propstar:"HM"}],7,[['m','a','b'],['d','c']]];
let diff2 = '[3,["d",{"propFs":"LLT"}],5,["d",{"propstar":"HM"}],7,[["m","a","b"],["d","c"]]]';
// console.log(obj3);
// console.log(JSON.stringify(diff));
console.log(JSON.parse(diff2)[1][1]);
fs.writeFile('a.txt',JSON.stringify(diff),(err)=>{
    if(err){
        throw err;
    }
});



// let diff={
//     difs:["propObj:[propArr:(propStr[c],propstar[a]),(propFs[a])]","(arr[c][a])"],
//     obj:{
//         d:[['string 103','>','string 101'],'HM'],
//         d1:['LLT'],
//         d2:[['a','>','b'],'c']
//     }
// }
//
// function __do(obj1,callback){
//     console.log(JSON.stringify(obj1));
//
//     fs.writeFile('al.txt',JSON.stringify(obj1),(err)=>{
//         if(err){
//             return callback(err);
//         }
//         let str;
//         fs.readFile('al.txt',(err,data)=>{
//             if(err){
//                 return callback(err);
//             }
//             console.log(data.toString());
//             return callback();
//         });
//     });
// }
// __do(obj2,(err)=>{
//     if(err){
//         console.log(err.message);
//     }
//     __do(obj3,(err)=>{
//         if(err){
//             console.log(err.message);
//         }
//     });
// });
//
// let diff = {
//
// }
//
// let obj1 = obj2;

// let a = {
//     a:'String1',
//     b:{
//         arr:[1,2,3,4,5]
//     }
// };
//
//
// console.log(a.b.arr.length);
