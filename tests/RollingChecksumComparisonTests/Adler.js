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
        for(let i=0;i<1;i++){
            let easyDigest = adler32.sum(blocks[i]);
            let hardDigest = hardCheckSum(blocks[i]);
            blockSize = blocks[i].length;
            //console.log(easyDigest);
            let window = adler32.sum(byteArr.slice(0,blockSize));
            for(let j=blockSize;j<byteArr.length;j++){
                //console.log('A',window);
                if(window == easyDigest){
                    let hD = hardCheckSum(byteArr.slice(j-blockSize,j));
                    if(hardDigest == hD){
                        numberOfSuccess++;
                        window = adler32.sum(byteArr.slice(j,j+blockSize));
                        j = j + blockSize - 1;
                    }else{
                        numberOfCollisions++;
                        window = adler32.roll(window,blockSize,byteArr[j-blockSize],byteArr[j]);
                    }
                }else{
                    window = adler32.roll(window,blockSize,byteArr[j-blockSize],byteArr[j]);
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

module.exports = ()=>{
    return new Adler();
};

// let a = new Adler();
// console.log(a.execute('ana are mere', 3, 'ana are mult mere'));