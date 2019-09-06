const fs = require('fs');
let Operations = require('./Operations');
const operators = new Operations();

function Patcher(){

    this.applyPatch = function(diffData,fileData,callback){
        let diffArr = diffData;
        operators.patch(0,diffArr,fileData,(err,data)=>{
            if(err){
                return callback(err);
            }
            return callback(undefined,data);
        });
    }
}
module.exports = Patcher;