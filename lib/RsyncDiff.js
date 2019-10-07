const fs = require('fs');
const crypto = require('crypto');

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
                }else{
                    listOfPositions.push(new getTuple(new getTuple(i-dimension,i),new getTuple(left,right)));
                    window = easyCheckSum(fromString.slice(i, i + dimension));
                }
            }else{
                window = moveWindow(fromString.charCodeAt(i - dimension), fromString.charCodeAt(i), window);
            }
        }
    }

    function execute(callback){
        let blockReader = reader(fileName,dimension);
        blockReader.runReader((block,left,right,info)=>{
            let arr = new Uint8Array(block);
            let tuples = easyCheckSum(arr);
            let hash = hardCheckSum(block);
            //console.log(block.toString());
            compare(tuples,hash,left,right);
            if(info === 'f'){
                return callback();
            }
        });
    }

    this.runRsync = function(){
        execute(()=>{
            let li = [];
            listOfPositions.sort((a,b) => (a.second.first < b.second.first) ? -1 : 1);
            for(let i=0;i<listOfPositions.length;i++){
                console.log(listOfPositions[i].first.first,listOfPositions[i].first.second,listOfPositions[i].second.first,listOfPositions[i].second.second);
                console.log(fromString.slice(listOfPositions[i].first.first,listOfPositions[i].first.second));
                li[listOfPositions[i].first.first]++;
            }
        });
    }
}

new RsyncDiff('a.txt',3,"Don't cry, smile because it happened").runRsync();
//console.log((3 << 16) | 5);