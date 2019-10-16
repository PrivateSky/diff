const fs = require('fs');
const crypto = require('crypto');
const parserReader = require('./RsyncParserReader');

const reader = require('./RsyncReader');

function getTuple(firstElement,secondElement){
    return {
        get first() {
            return firstElement;
        },
        get second(){
            return secondElement;
        },
        set firstValue(x) {
            firstElement = x;
        },
        set secondValue(x) {
            secondElement = x;
        }
    }
}


function RsyncDiff(fileName,dimension,fromString){

    let forMultiplying = -1;
    const uniCodes = 1112064;
    const bigPrime = 6700417;
    let listOfPositions = [];
    let map = new Map();
    let mySet = new Set();
    let dictionary = {};
    let contor = 0;
    let setOfHits = new Set();
    let setOfHits_2 = new Set();
    let blocksNotInUse = [];

    function easyCheckSum(byteArr){
        let a = 0;
        if(forMultiplying === -1){
            forMultiplying = 1;
            for(let i = 0 ; i < dimension; i ++){
                forMultiplying = (forMultiplying * uniCodes) % bigPrime;
            }
        }
        for(let i = 0 ; i < byteArr.length; i ++){
            let value;
            if(typeof byteArr[0] == 'string')
                value = byteArr.charCodeAt(i);
            else
                value = byteArr[i];
            a += value;
        }
        return a;
    }

    //checksum that i obtain with sha2 or with md5
    function hardCheckSum(buffer){
        const key = 'abcdefghijklmnoprqstvuxyzw';
        let hash = crypto.createHmac('md5',key).update(buffer).digest('hex');
        return hash;
    }

    function moveWindow(charToRemove,charToAdd,enc){
        let a = enc;
        a = a - charToRemove + charToAdd;
        return a;
    }

    function compare(tuples,hash,left,right){
        let relativePosition = 0;
        let window = easyCheckSum(fromString.slice(0,dimension));
        let lstF = -1,lstS = -1;
        for(let i = dimension; i < fromString.length + 1; i++){
            if(window === tuples){
                let tempBuffer = Buffer.from(fromString.slice(i - dimension,i),'utf8');
                if(hardCheckSum(tempBuffer) !== hash){
                    window = moveWindow(fromString.charCodeAt(i - dimension), fromString.charCodeAt(i), window);
                }else {
                    listOfPositions.push(new getTuple(new getTuple(i - dimension, i), new getTuple(left, right)));
                    if(lstF != i-dimension && lstS != left) {
                        // console.log(fromString.slice(i-dimension,i));
                        // console.log(i-dimension,left);
                        if(setOfHits.has(i-dimension) === false && setOfHits_2.has(left) === false) {
                            let checker1 = 1, checker2 = 1;
                            for(let ch = 1; ch < dimension; ch++){
                                if(setOfHits.has(i-ch-dimension) === true){
                                    checker1 = 0;
                                    break;
                                }
                                if(setOfHits.has(i+ch-dimension) === true){
                                    checker1 = 0;
                                    break;
                                }
                                if(setOfHits_2.has(left + ch) === true){
                                    checker2 = 0;
                                    break;
                                }
                                if(setOfHits_2.has(left-ch) === true){
                                    checker2 = 0;
                                    break;
                                }
                            }
                            if(checker1 !== 0 && checker2 !== 0) {
                                setOfHits.add(i - dimension);
                                setOfHits_2.add(left);
                                lstF = i - dimension;
                                lstS = left;
                            }
                        }
                    }
                    window = moveWindow(fromString.charCodeAt(i-dimension),fromString.charCodeAt(i),window);
                }
            }else{
                window = moveWindow(fromString.charCodeAt(i - dimension), fromString.charCodeAt(i), window);
            }
        }
    }


    function execute(callback){
        let blockReader = parserReader(fileName,dimension);
        let lengthOfFile = blockReader.getSizeOfFile();
        for(let iterator = 0 ; iterator < lengthOfFile; iterator += dimension){
            contor++;
            blockReader.runReader(iterator,(block,lMargin,rMargin,size)=>{
                contor--;
                let arr = new Uint8Array(block);
                let tuples = easyCheckSum(arr);
                let hash = hardCheckSum(block);
                compare(tuples,hash,lMargin,rMargin);
                if(contor === 0){
                    return callback(size);
                }
            });
        }
    }

    this.runRsync = function(callback){
        execute((size)=>{
            let diffArray = [];
            console.log(Array.from(setOfHits).length);
            console.log(Array.from(setOfHits_2).length);
            listOfPositions.sort((a,b)=>(a.first.first < b.first.first) ? -1 : 1);
            let currentPosition;
            // for(let i=0;i<listOfPositions.length;){
            //     if(i + 1 < listOfPositions.length) {
            //         if (listOfPositions[i].first.second > listOfPositions[i + 1].first.first) {
            //             let j = i + 1;
            //             currentPosition = listOfPositions[i].first.first;
            //             while (listOfPositions[i].first.second > listOfPositions[j].first.first) {
            //                 j++;
            //                 if(j == listOfPositions.length){
            //                     break;
            //                 }
            //             }
            //             for (let index = i + 1; index < j; index++) {
            //                 mySet.add(listOfPositions[index].second.first);
            //                 setOfHits.delete(listOfPositions[index].first.first);
            //                 setOfHits_2.delete(listOfPositions[index].second.first);
            //                 console.log('A',Array.from(setOfHits).length,Array.from(setOfHits_2).length);
            //                 dictionary[listOfPositions[index].second.first] = listOfPositions[index].first.first;
            //             }
            //             i = j;
            //         } else {
            //             i++;
            //         }
            //     }else{
            //         i++;
            //     }
            // }
            let arraySet = Array.from(mySet);
            let arrayOfHits = Array.from(setOfHits);
            let arrayOfHits_2 = Array.from(setOfHits_2);
            console.log(arrayOfHits);
            for(let ij = 0; ij < arrayOfHits.length; ij++){
                console.log(fromString.slice(arrayOfHits[ij],arrayOfHits[ij]+dimension));
            }
            console.log(arrayOfHits_2);
            let pairArray = [];
            for(let ii = 0; ii < arrayOfHits.length; ii++){
                pairArray.push(getTuple(arrayOfHits[ii],arrayOfHits_2[ii]));
            }
            mySet.clear();
            setOfHits.clear();
            setOfHits_2.clear();
            pairArray.sort((a,b)=>{return a.second - b.second});
            let dp = [];
            let toSubstract = 0;
            //console.log(arrayOfHits_2);
            if(pairArray.length > 0) {
                if (pairArray[0].second > 0) {
                    diffArray.push('-');
                    diffArray.push(0);
                    diffArray.push(pairArray[0].second);
                    toSubstract += pairArray[0].second;
                }
            }
            for(let index_2 = 0; index_2 < pairArray.length - 1; index_2++){
                if(pairArray[index_2].second + dimension - toSubstract < pairArray[index_2 + 1].second - toSubstract){
                    diffArray.push('-');
                    console.log(pairArray[index_2].second,pairArray[index_2+1].second,dimension,toSubstract);
                    console.log(pairArray[index_2 + 1].second - pairArray[index_2].second - dimension);
                    diffArray.push(pairArray[index_2].second + dimension - toSubstract);
                    diffArray.push(pairArray[index_2+1].second - pairArray[index_2].second - dimension);
                    let tempToSub = toSubstract;
                    toSubstract += pairArray[index_2 + 1].second - pairArray[index_2].second - dimension;
                    pairArray[index_2].secondValue = pairArray[index_2].second - tempToSub;
                }else{
                    pairArray[index_2].secondValue = pairArray[index_2].second - toSubstract;
                }
            }

            pairArray[pairArray.length-1].secondValue = pairArray[pairArray.length-1].second - toSubstract;
            let toAdd = 0;
            let lastIndex = pairArray[pairArray.length - 1].second;
            if(size - toSubstract > lastIndex + dimension){
                diffArray.push('-');
                diffArray.push(lastIndex + dimension);
                diffArray.push(size - toSubstract - lastIndex - dimension);
            }
            pairArray.sort((a,b)=>{return a.first - b.first;});
            if(pairArray.length > 0){
                if(pairArray[0].first > 0){
                    diffArray.push('+');
                    diffArray.push(0);
                    diffArray.push(fromString.slice(0,pairArray[0].first));
                    toAdd += pairArray[0].first;
                }
            }
            for(let index_2 = 0; index_2 < pairArray.length-1; index_2++){
                if(pairArray[index_2].first + dimension < pairArray[index_2 + 1].first){
                    diffArray.push('+');
                    console.log('gg',pairArray[index_2].second,pairArray[index_2].first,toAdd,dimension);
                    diffArray.push(pairArray[index_2].second + dimension + toAdd);
                    diffArray.push(fromString.slice(pairArray[index_2].first + dimension,pairArray[index_2+1].first));
                    toAdd += pairArray[index_2+1].first - pairArray[index_2].first - dimension;
                }
            }
            if(fromString.length - pairArray[pairArray.length-1].first - dimension > 0){
                diffArray.push('+');
                diffArray.push(lastIndex + dimension + toAdd);
                diffArray.push(fromString.slice(pairArray[pairArray.length - 1].first + dimension,fromString.length));
                toAdd += (fromString.length - pairArray[pairArray.length-1].first - dimension);
            }
            // console.log('LI',lastIndex+toAdd);
            return callback(diffArray);
        });
    }
}

module.exports = (filePath,dimension,text)=>{
    return new RsyncDiff(filePath,dimension,text);
}