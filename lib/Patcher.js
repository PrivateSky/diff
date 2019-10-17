const fs = require('fs');

function Operations() {

    //this function insert a substring to a string, on a specific index, then return the result
    function addData(position, data, fileData) {
        fileData = fileData.substring(0, position) + data + fileData.substring(position);
        return fileData;
    }

    //this function remove a substring at a specific index, from a string
    function deleteData(position, numberOfCharacters, fileData) {
        fileData = fileData.substring(0, position) + fileData.substring((position + numberOfCharacters));
        return fileData;
    }

    function changeData(position, numberOfCharacters, data, fileData) {
        fileData = fileData.substring(0, position) + data + fileData.substring((position + numberOfCharacters));
        return fileData;
    }

    //function where i choose what kind of operation should be executed
    //after the array of differences reaches its end, our initial string becomes the target string, due to all previous insertions and deletions
    function executeOperation(index, diffArr, fileData) {
        if (index >= diffArr.length) {
            return fileData;
        }
        if (diffArr[index] === '+') {
            fileData = addData(diffArr[index + 1], diffArr[index + 2], fileData);
        } else if (diffArr[index] === '-') {
            fileData = deleteData(diffArr[index + 1], diffArr[index + 2], fileData);
        } else {
            fileData = changeData(diffArr[index], diffArr[index + 1], diffArr[index + 2], fileData);
        }
        return executeOperation(index + 3, diffArr, fileData);
    }

    this.patch = function (index, diffArr, fileData) {
        return executeOperation(index, diffArr, fileData);
    }
}

const operators = new Operations();

function Patcher() {

    this.applyPatch = function (diffData, srcData) {
        return operators.patch(0, diffData, srcData);
    }
}

module.exports = () => {
    return new Patcher();
};