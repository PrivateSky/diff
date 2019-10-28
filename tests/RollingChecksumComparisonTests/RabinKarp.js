const crypto = require('crypto');
const {TextEncoder} = require('util');

function RabinKarp(){

    let forMultiplying;
    let alphabetSpace = 1112064;
    let bigPrime = 6700417;
    function computeCheckSum(block){
        let checksum = 0;

        if (forMultiplying === undefined) {
            forMultiplying = 1;
            for (let i = 0; i < block.length - 1; i++) {
                forMultiplying = (forMultiplying * alphabetSpace) % bigPrime;
            }
        }

        for (let i = 0; i < block.length; i++) {
            // checksum += str.charCodeAt(i);
            checksum = (alphabetSpace * checksum + block[i])%bigPrime;
        }

        return checksum;
    }

    function moveWindow(byteToRemove,byteToAdd,checksum){
        checksum =(alphabetSpace*(checksum - byteToRemove*forMultiplying) + byteToAdd)%bigPrime;
        if(checksum < 0)
            checksum += bigPrime;
        return checksum;
    }

    function compare(blocks,second,blockSize){
        let numberOfCollisions = 0;
        let numberOfSuccess = 0;
        let index;
        for(let i=0;i<blocks.length;i++){
            let easyDigest = computeCheckSum(blocks[i]);
            blockSize = blocks[i].length;
            let window = computeCheckSum(second.slice(0,blockSize));
            let hardDigest = hardCheckSum(blocks[i]);
            for(let j=blockSize;j<second.length;j++){
                if(window == easyDigest){
                    let hD = hardCheckSum(second.slice(i,i-blockSize));
                    if(hD != hardDigest){
                        numberOfCollisions++;
                        window = moveWindow(second[j-blockSize],second[j],window);
                    }else{
                        numberOfSuccess++;
                        window = computeCheckSum(second.slice(j,j+blockSize));
                        j = j + blockSize - 1;
                    }
                }else{
                    window = moveWindow(second[j-blockSize],second[j],window);
                }
            }
        }
        return [numberOfCollisions,numberOfSuccess];
    }

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

    this.execute = function(source,blockSize,destination){
        let encoder = new TextEncoder();
        let srcBA = encoder.encode(source);
        let targetBA = encoder.encode(destination);
        let blocks = produceBlocks(srcBA,blockSize);
        return compare(blocks,targetBA,blockSize);
    }
}

let a = new RabinKarp();
console.log(a.execute('ana are mere', 5, 'ana are mult mere'));
