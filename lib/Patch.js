const fs = require('fs');

function Patch(diffLocation,fileToPatchLocation){
    function readDiff(callback){
        fs.readFile(diffLocation,(err,data)=>{
            if(err){
                return callback(err);
            }
            return callback(undefined,data.toString());
        });
    }

    function readFileToPatch(callback){
        fs.readFile(fileToPatchLocation,(err,data)=>{
            if(err){
                return callback(err);
            }
            return callback(undefined,data.toString());
        });
    }

    function addData(position,data,fileData,callback){
        fileData = fileData.substring(0,position) + data + fileData.substring(position);
        return callback(fileData);
    }


    function deleteData(position,numberOfCharacters,fileData,callback){
        fileData = fileData.substring(0,position) + fileData.substring((position+numberOfCharacters));
        return callback(fileData);
    }

    function changeData(position,numberOfCharacters,data,fileData,callback){
        // deleteData(position,numberOfCharacters,fileData,(newFileData)=>{
        //     addData(position,data,newFileData,(finalFileData)=>{
        //         return callback(finalFileData);
        //     });
        // });
        fileData  = fileData.substring(0,position) + data + fileData.substring((position+numberOfCharacters));
        return callback(fileData);
    }

    function applyPatch(callback){
        readFileToPatch((err,fileData)=> {
            if(err){
                return callback(err);
            }
            readDiff((err,diffData) => {
                if(err){
                    return callback(err);
                }
                let diffArr = JSON.parse(diffData);
                executeOperation(0,diffArr,fileData,callback);
            });
        });
    }

    function executeOperation(index,diffArr,fileData,callback){
        if(index >= diffArr.length){
            return callback(undefined,fileData);
        }
        if(diffArr[index] === '+'){
            addData(diffArr[index+1],diffArr[index+2],fileData,__callbackHelper);
        }else if(diffArr[index] === '-'){
            deleteData(diffArr[index+1],diffArr[index+2],fileData,__callbackHelper);
        }else {
            changeData(diffArr[index],diffArr[index+1],diffArr[index+2],fileData,__callbackHelper);
        }
        function __callbackHelper(data){
            fileData = data;
            executeOperation(index+3,diffArr,fileData,callback);
        }
    }

    applyPatch((err,data)=>{
        if(err){
            console.log(err.message);
        }else{
            fs.writeFile(fileToPatchLocation,data,(err)=>{
                if(err){
                    console.log(err.message);
                }
            });
        }
    });

}

Patch('b.txt','a.txt');
module.exports = Patch;