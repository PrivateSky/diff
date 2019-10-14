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
            //a = (a*forMultiplying + value) % bigPrime;
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
        for(let i = dimension; i < fromString.length + 1; i++){
            if(window== tuples){
                let tempBuffer = Buffer.from(fromString.slice(i - dimension,i),'utf8');
                if(hardCheckSum(tempBuffer) != hash){
                    window = moveWindow(fromString.charCodeAt(i - dimension), fromString.charCodeAt(i), window);
                }else {
                    listOfPositions.push(new getTuple(new getTuple(i - dimension, i), new getTuple(left, right)));
                    setOfHits.add(i-dimension);
                    setOfHits_2.add(left);
                    //window = easyCheckSum(fromString.slice(i, i + dimension));
                    window = moveWindow(fromString.charCodeAt(i-dimension),fromString.charCodeAt(i),window);
                }
            }else{
                window = moveWindow(fromString.charCodeAt(i - dimension), fromString.charCodeAt(i), window);
            }
        }
    }

    // function execute(callback){
    //     let blockReader = reader(fileName,dimension);
    //     blockReader.runReader((block,left,right,info)=>{
    //         let arr = new Uint8Array(block);
    //         let tuples = easyCheckSum(arr);
    //         let hash = hardCheckSum(block);
    //         //console.log(block.toString());
    //         compare(tuples,hash,left,right);
    //         if(info === 'f'){
    //             return callback();
    //         }
    //     });
    // }

    function execute(callback){
        let blockReader = parserReader(fileName,dimension);
        let lengthOfFile = blockReader.getSizeOfFile();
        for(let iterator = 0 ; iterator < lengthOfFile; iterator += dimension){
            contor++;
            blockReader.runReader(iterator,(block,lMargin,rMargin)=>{
                contor--;
                let arr = new Uint8Array(block);
                let tuples = easyCheckSum(arr);
                let hash = hardCheckSum(block);
                compare(tuples,hash,lMargin,rMargin);
                if(contor === 0){
                    return callback();
                }
            });
        }
    }

    this.runRsync = function(){
        execute(()=>{
            let diffArray = [];
            // for(let i=0;i<listOfPositions.length-1;i++){
            //     let numberOfCharacters = listOfPositions[i+1].second.first - listOfPositions[i].second.second;
            //     if(listOfPositions[i+1].second.first - listOfPositions[i].second.second > 0){
            //         diffArray.push(['-',listOfPositions[i].second.second,numberOfCharacters]);
            //     }
            // }
            listOfPositions.sort((a,b)=>(a.first.first < b.first.first) ? -1 : 1);
            let currentPosition;
            for(let i=0;i<listOfPositions.length;){
                console.log(listOfPositions[i].first.first,listOfPositions[i].first.second,listOfPositions[i].second.first,listOfPositions[i].second.second);
                console.log(fromString.slice(listOfPositions[i].first.first,listOfPositions[i].first.second));
                if(i + 1 < listOfPositions.length) {
                    if (listOfPositions[i].first.second > listOfPositions[i + 1].first.first) {
                        let j = i + 1;
                        currentPosition = listOfPositions[i].first.first;
                        while (listOfPositions[i].first.second > listOfPositions[j].first.first) {
                            j++;
                        }
                        for (let index = i + 1; index < j; index++) {
                            mySet.add(listOfPositions[index].second.first);
                            setOfHits.delete(listOfPositions[index].first.first);
                            setOfHits_2.delete(listOfPositions[index].second.first);
                            dictionary[listOfPositions[index].second.first] = listOfPositions[index].first.first;
                        }
                        i = j;
                    } else {
                        i++;
                    }
                }else{
                    i++;
                }
            }
            let arraySet = Array.from(mySet);
            let arrayOfHits = Array.from(setOfHits);
            let arrayOfHits_2 = Array.from(setOfHits_2);
            //console.log(mySet.values());
            //console.log(dictionary.values());
            mySet.clear();
            setOfHits.clear();
            setOfHits_2.clear();
            arrayOfHits.sort((a,b)=>{return a-b;});
            arrayOfHits_2.sort((a,b)=>{return a-b;});
            console.log(arrayOfHits);
            console.log(arrayOfHits_2);
            let dp = [];
            let toSubstract = 0;
            for(let index_2 = 0 ; index_2 < arrayOfHits.length-1; index_2++){
               // arrayOfHits_2[index_2] -= toSubstract;
                if(arrayOfHits_2[index_2] + dimension - toSubstract < arrayOfHits_2[index_2 + 1] - toSubstract){
                    diffArray.push(['-',arrayOfHits_2[index_2]+dimension-toSubstract,arrayOfHits_2[index_2+1] - arrayOfHits_2[index_2] - dimension]);
                    arrayOfHits_2[index_2] -= toSubstract;
                    toSubstract += arrayOfHits_2[index_2+1] - arrayOfHits_2[index_2] - dimension;
                }
                else{
                    arrayOfHits_2[index_2] -= toSubstract;
                }
            }
            arrayOfHits_2[arrayOfHits_2.length-1] -= toSubstract;
            let toAdd = 0;
            for(let index_2 = 0; index_2 < arrayOfHits_2.length-1; index_2++){
                if(arrayOfHits[index_2] + dimension < arrayOfHits[index_2 + 1]){
                    diffArray.push(['+',arrayOfHits_2[index_2]+dimension+toAdd,fromString.slice(arrayOfHits[index_2]+dimension,arrayOfHits[index_2+1])]);
                    toAdd += arrayOfHits[index_2+1] - arrayOfHits[index_2] - dimension;
                    console.log('toad',toAdd);
                }
            }
            console.log(arrayOfHits);
            console.log(arrayOfHits_2);
            // for(let index_2 = 0 ; index_2 < arraySet.length; index_2++){
            //     console.log(arraySet[index_2],dictionary[arraySet[index_2]]);
            //     for(let index_3 = 0; index_3 < dimension; index_3++){
            //         console.log(fromString[dictionary[arraySet[index_2]] + index_3]);
            //     }
            // }
            for(let indo = 0; indo < diffArray.length; indo++){
                if(diffArray[indo][0] == '+'){
                    console.log(fromString.slice(diffArray[indo][1],diffArray[indo][1] + diffArray[indo][2]));
                }
            }
            console.log(diffArray);
        });
    }
}

new RsyncDiff('a.txt',3,"Don't cry over, smile because it happened").runRsync();
//console.log((3 << 16) | 5);