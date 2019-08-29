const fs = require('fs');
let Operations = require('./Operations');
const operators = new Operations();

function Patcher(){
    function readDiff(diffLocation,callback){
        fs.readFile(diffLocation,(err,data)=>{
            if(err){
                return callback(err);
            }
            return callback(undefined,data.toString());
        });
    }

    function readFileToPatch(fileToPatchLocation,callback){
        fs.readFile(fileToPatchLocation,(err,data)=>{
            if(err){
                return callback(err);
            }
            return callback(undefined,data.toString());
        });
    }

    function applyPatch(diffLocation,fileToPatchLocation,callback){
        readFileToPatch(fileToPatchLocation,(err,fileData)=> {
            if(err){
                return callback(err);
            }
            readDiff(diffLocation,(err,diffData) => {
                if(err){
                    return callback(err);
                }
                let diffArr = JSON.parse(diffData);
                operators.patch(0,diffArr,fileData,callback);
            });
        });
    }

    this.callPatcher = function(diffLocation,fileToPatchLocation,callback){
        applyPatch(diffLocation,fileToPatchLocation,(err,data)=>{
            if(err){
                return callback(err);
            }else{
                fs.writeFile(fileToPatchLocation,data,(err)=>{
                    if(err){
                        return callback(err);
                    }
                    return callback(undefined,data);
                });
            }
        });
    }

}
// new Patcher().callPatcher('b.txt','a.txt',(err,data)=>{
//     if(err){
//         console.log(err.message);
//     }
//     console.log(data);
// });
module.exports = Patcher;