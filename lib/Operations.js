
function Operations(){

    function addData(position,data,fileData,callback){
        fileData = fileData.substring(0,position) + data + fileData.substring(position);
        return callback(fileData);
    }


    function deleteData(position,numberOfCharacters,fileData,callback){
        fileData = fileData.substring(0,position) + fileData.substring((position+numberOfCharacters));
        return callback(fileData);
    }

    function changeData(position,numberOfCharacters,data,fileData,callback){
        fileData  = fileData.substring(0,position) + data + fileData.substring((position+numberOfCharacters));
        return callback(fileData);
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

    this.patch = function(index,diffArr,fileData,callback){
        executeOperation(index,diffArr,fileData,callback);
    }
}

module.exports = Operations;