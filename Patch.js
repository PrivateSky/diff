const fs = require("fs");

function patch(diffLocation,fileName){
    function apply(diffData){
        readFile((err,fileData)=>{
            if(err){
                console.log(err.message);
            }
            
        });
    }

    function readDiff(){
        fs.readFile(diffLocation,(err,data)=>{
            apply(data);
        });
    }

    function readFile(callback){
        fs.readFile(fileName,(err,data)=>{
            if(err){
                return callback(err);
            }
            return callback(undefined,data);
        });
    }
}