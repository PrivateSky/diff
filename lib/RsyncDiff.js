const fs = require('fs');
const crypto = require('crypto');

const reader = require('./RsyncReader');

function RsyncDiff(fileName,dimension,toString){
    //checksum that i obtain with alder32
    function easyCheckSum(byteArr){
        let a = 0;
        let b = 0;
        for(let i = 0 ; i < byteArr.length; i ++){
            let value;
            if(typeof byteArr[0] == 'string')
                value = byteArr.charCodeAt(0);
            else
                value = byteArr[0];
            a += value;
            b += (dimension - i)*value;
        }
        b += a;
        return [a,b];
    }

    //checksum that i obtain with sha2 or with md5
    function hardCheckSum(buffer){
        const key = 'abcdefghijklmnoprqstvuxyzw';
        let hash = crypto.createHmac('md5',key).update(buffer).digest('hex');
        return hash;
    }

    function moveWindow(charToRemove,charToAdd,enc){
        let a = enc[0];
        let b = enc[1];
        a -= charToRemove;
        a += charToAdd;
        b -= dimension*charToRemove;
        b += a;
        return [a,b];
    }

    function compare(tuples,hash){
        let relativePosition = 0;
        let window = easyCheckSum(toString.slice(0,dimension));
        for(let i = dimension; i < toString.length; i++){
            if((window[0] + window[1]) == (tuples[0] + tuples[1])){
                let tempBuffer = Buffer.from(toString.slice(i-dimension,dimension),'utf8');
                if(hardCheckSum(tempBuffer) != hash){

                }else{
                    
                }
            }else{
                moveWindow(toString.charCodeAt(i-dimension),toString.charCodeAt(i),window);
            }
        }
    }

    function execute(){
        let blockReader = reader(fileName,dimension);
        blockReader.runReader((block)=>{
            //console.log(block.toString());
            let arr = new Uint8Array(block);
            let tuples = easyCheckSum(arr);
            //console.log(tupls[0],tupls[1]);
            let hash = hardCheckSum(block);
            //console.log(hardCheckSum(block));
            console.log(tuples[0]+tuples[1]);
            console.log(hash);
        });
    }

    this.runRsync = function(){
        execute();
    }
}

new RsyncDiff('a.txt',3,"don't").runRsync();
//console.log((3 << 16) | 5);