
function Operations(){

    function addData(position,data,fileData){
        fileData = fileData.substring(0,position) + data + fileData.substring(position);
        return fileData;
    }


    function deleteData(position,numberOfCharacters,fileData){
        fileData = fileData.substring(0,position) + fileData.substring((position+numberOfCharacters));
        return fileData;
    }

    function changeData(position,numberOfCharacters,data,fileData){
        fileData  = fileData.substring(0,position) + data + fileData.substring((position+numberOfCharacters));
        return fileData;
    }

    function executeOperation(index,diffArr,fileData){
        if(index >= diffArr.length){
            return fileData;
        }
        if(diffArr[index] === '+'){
            fileData = addData(diffArr[index+1],diffArr[index+2],fileData);
        }else if(diffArr[index] === '-'){
            fileData = deleteData(diffArr[index+1],diffArr[index+2],fileData);
        }else {
            fileData = changeData(diffArr[index],diffArr[index+1],diffArr[index+2],fileData);
        }
        return executeOperation(index+3,diffArr,fileData);
    }

    this.patch = function(index,diffArr,fileData){
        return executeOperation(index,diffArr,fileData);
    }
}

module.exports = Operations;