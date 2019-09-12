const fs = require('fs');
const Diff = require('./Diff');

// console.log(Diff().createDiff('ana are mere','ana are pere verzi si mere'));

function RHDiff(){
    let diffData = [];
    let substring = '';
    const P_M = 1000005;
    const P_B = 227;

    function indexOfDiff(fromData,toData){
        if(fromData === toData){
            return -1;
        }
        if((typeof fromData === "undefined") || (typeof toData === "undefined")){
            return 0;
        }
        let i = 0;
        for(i = 0; i < fromData.length && i < toData.length; i++){
            if(fromData[i] !== toData[i]){
                break;
            }
        }
        if(i < fromData.length || i < toData.length){
            return i;
        }
        return -1;
    }

    function hash(fileData){
        let hash_value = 0;
        for(let index = 0; index < fileData.length; index ++){
            hash_value = hash_value * P_B + fileData.charCodeAt(index);
            hash_value = hash_value % P_M;
        }
        return hash_value;
    }

    function mkDiff(fromData,toData,diffData){
        let hashFD = hash(fromData);
        let hashTD = 0;
        let power = 1;
        for(let i=0;i<fromData.length;i++){
            power = (power * P_B) % P_M;
        }
        for(let i=0;i<toData.length;i++){
            hashTD = hashTD * P_B + toData.charCodeAt(i);
            hashTD = hashTD % P_M;
            if(i>= fromData.length){
                hashTD -= power * toData.charCodeAt(i-fromData.length) % P_M;
                if(hashTD < 0){
                    hashTD += P_M;
                }
            }
            if(i>=fromData.length - 1 && hashFD === hashTD){
                return i - (fromData.length - 1);
            }
        }
        return -1;
    }

    this.createDiff = function(fromData,toData){
        //mkDiff(fromData,toData,diffData);
        let start = 0;
        let position = 0;
        let tempString = '';
        let badSubstring = '';
        for(let i=0;i<fromData.length;i++){
            tempString = fromData.substring(start,i+1);
            position = mkDiff(tempString,toData,diffData);
            if(position === -1){
                start = i;
                console.log(tempString);
                badSubstring += (tempString[tempString.length-1]);
            }
        }
        console.log(tempString);
        console.log(badSubstring);
        //console.log(mkDiff(fromData,toData,diffData));
    }
}
let jsonBigEx = '{"propNum":100,"propStr":"string 100","propArr":[1,"100"],"propObj":{"propNum":101,"propStr":"string 101","redundantPropStr":"string 101","propArr":[1,"100",{"propNum":102,"propStr":"string 103"}]}}';
let jsonBigExM = '{"propNum":100,"propStr":"string 100","propArr":[1,"100"],"propObj":{"propNum":101,"propStr":"string 101","propArr":[1,"100",{"propNum":102,"propStr":"24"},70],"newProp":1007},"newNum":1001,"newProp":1002}';

//new RHDiff().createDiff('Ana are mere','Ana are pere verzi si mere');
new RHDiff().createDiff(jsonBigEx,jsonBigExM);