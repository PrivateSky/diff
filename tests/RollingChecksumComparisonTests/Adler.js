const crypto = require('crypto');
const {TextEncoder} = require('util');
const adler32 = require('adler32');

function Adler(){
    function produceBlocks(byteArr,blockSize){
        let blocks = [];
        for(let i=0;i<byteArr.length;i+=blockSize){
            blocks.push(byteArr.slice(i,i+blockSize));
        }
        return blocks;
    }

    function hardCheckSum(input) {
        return crypto.createHash('sha256').update(input).digest('hex');
    }

    function compare(blocks,byteArr,blockSize){
        let numberOfCollisions = 0;
        let numberOfSuccess = 0;
        for(let i=0;i<blocks.length;i++){
            let easyDigest = adler32.sum(blocks[i]);
            let hardDigest = hardCheckSum(blocks[i]);
            blockSize = blocks[i].length;
            let window = adler32.sum(byteArr.slice(0,blockSize));
            for(let j=blockSize;j<byteArr.length;j++){
                if(window == easyDigest){
                    console.log(i,j);
                    let hD = hardCheckSum(byteArr.slice(i-blockSize,i));
                    if(hardDigest == hD){
                        numberOfSuccess++;
                        window = adler32.sum(byteArr.slice(i,i+blockSize));
                    }else{
                        numberOfCollisions++;
                        window = adler32.sum(byteArr[i],window);
                    }
                }else{
                    window = adler32.sum(byteArr[i],window);
                }
            }
        }
        return [numberOfCollisions,numberOfSuccess];
    }

    this.execute = function(source,blockSize,destination){
        let encoder = new TextEncoder();
        let srcBA = encoder.encode(source);
        let targetBA = encoder.encode(destination);
        let blocks = produceBlocks(srcBA,blockSize);
        return compare(blocks,targetBA,blockSize);
    }
}

let a = new Adler();
console.log(a.execute('ana are mere', 3, 'ana are mult mere'));