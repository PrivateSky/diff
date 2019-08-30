const fs = require('fs');
let Operations = require('./Operations');
const operators = new Operations();

function Patcher(){

    this.applyPatch = function(diffData,fileData,callback){
        let diffArr = JSON.parse(diffData);
        operators.patch(0,diffArr,fileData,(err,data)=>{
            if(err){
                return callback(err);
            }
            return callback(undefined,data);
        });
    }
}
// new Patcher().applyPatch('b.txt','a.txt',(err,data)=>{
//     if(err){
//         console.log(err.message);
//     }
//     console.log(data);
// });
module.exports = Patcher;