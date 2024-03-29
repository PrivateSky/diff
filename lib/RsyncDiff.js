const fs = require('fs');
const crypto = require('crypto');
const parserReader = require('./RsyncParserReader');

const reader = require('./RsyncReader');

function getIndexTuple(firstElement, secondElement, blockSize) {
    return {
        get srcIndex() {
            return firstElement;
        },
        get targetIndex() {
            return secondElement;
        },
        set srcInd(x) {
            firstElement = x;
        },
        set targetInd(x) {
            secondElement = x;
        }
    }
}

function getConstants() {
    return {
        get alphabetSpace() {
            return 1112064;
        },
        get bigPrime() {
            return 6700417;
        }
    };
}

function RsyncDiff() {

    let numberOfCollisions = 0;
    let forMultiplying;
    let srcSet = new Set();
    let targetSet = new Set();
    let lastIndexSrc, lastIndexTarget;

    const checksumConstants = getConstants();

    function easyCheckSum(str) {
        let checksum = 0;
        if (forMultiplying === undefined) {
            forMultiplying = 1;
            for (let i = 0; i < str.length - 1; i++) {
                forMultiplying = (forMultiplying * checksumConstants.alphabetSpace) % checksumConstants.bigPrime;
            }
        }

        for (let i = 0; i < str.length; i++) {
            // checksum += str.charCodeAt(i);
            checksum = (checksumConstants.alphabetSpace * checksum + str.charCodeAt(i))%checksumConstants.bigPrime;
        }

        return checksum;
    }

    //checksum that i obtain with sha2 or with md5
    function hardCheckSum(input) {
        if (typeof input === "string") {
            input = Buffer.from(input);
        }
        return crypto.createHash('sha256').update(input).digest('hex');
    }

    function moveWindow(charToRemove, charToAdd, checksum) {
        //return checksum - charToRemove + charToAdd;
        checksum =(checksumConstants.alphabetSpace*(checksum - charToRemove*forMultiplying) + charToAdd)%checksumConstants.bigPrime;
        if(checksum < 0)
            checksum += checksumConstants.bigPrime;
        return checksum;
    }

    function getLastValueOfSet(set){
        let value = - 1;
        for(value of set.values());
        return value;
    }

    function storeMatches(blockSize,targetString, srcSet, targetSet, checkSums, strongCheckSums) {
        let window = easyCheckSum(targetString.slice(0,blockSize));
        let lastTargetIndex = -1;
        //console.log(easyDigestList);
        for(let i=blockSize; i < targetString.length + 1; i++){
            //console.log(window);
            if(checkSums[window] !== undefined && checkSums[window].length > 0){
                //console.log('a');
                if(lastTargetIndex == -1) {
                    let hardDigest = hardCheckSum(targetString.slice(i-blockSize,i));
                    let blockIndex = checkSums[window][0];
                    if(hardDigest === strongCheckSums[blockIndex]) {
                        //console.log(i-blockSize);
                        targetSet.push(i - blockSize);
                        srcSet.push(blockIndex);
                        lastTargetIndex = blockIndex;
                        checkSums[window].splice(0, 1);
                        window = easyCheckSum(targetString.slice(i, i + blockSize));
                        if(i+blockSize >= targetString.length){
                            i = i + (targetString.length - i) - 1;
                        }else {
                            i = i + blockSize - 1;
                        }
                    }
                }else{
                    window = moveWindow(targetString.charCodeAt(i-blockSize),targetString.charCodeAt(i),window);
                }
            }else{
                window = moveWindow(targetString.charCodeAt(i-blockSize),targetString.charCodeAt(i),window);
            }
        }
    }


    function generateBlocks(srcString, blockSize) {
        const blocks = [];
        for (let i = 0; i < srcString.length; i += blockSize) {
            blocks.push(srcString.slice(i, i + blockSize));
        }
        return blocks;
    }

    function processBlocks(srcString, blockSize, targetString){
        let checkSums = {};
        let strongCheckSums = {};
        const srcSet = [];
        const targetSet = [];
        const blocks = generateBlocks(srcString, blockSize);
        for(let i = 0 ; i < blocks.length; i++){
            //storeMatches(blocks[i],i*blockSize,targetString,srcSet,targetSet,blockSize);
            let srcEasyDigest = easyCheckSum(blocks[i]);
            let srcHardDigest = hardCheckSum(blocks[i]);
            if(checkSums[srcEasyDigest] === undefined){
                checkSums[srcEasyDigest] = [];
                checkSums[srcEasyDigest].push(i*blockSize);
            }else{
                checkSums[srcEasyDigest].push(i*blockSize);
            }
            strongCheckSums[i*blockSize] = srcHardDigest;
        }
        storeMatches(blockSize,targetString,srcSet,targetSet,checkSums,strongCheckSums);
        return createDiff(srcString, blockSize, targetString, srcSet, targetSet);
        //return [];
    }

    function createDiff(srcString, blockSize, targetString, srcIndexArray, targetIndexArray) {
        let diffArray = [];
        if(srcIndexArray.length === 0){
            diffArray.push('-');
            diffArray.push(0);
            diffArray.push(srcString.length);
            diffArray.push('+');
            diffArray.push(0);
            diffArray.push(targetString);
            return diffArray;
        }
        let indexPair = [];
        for (let i = 0; i < srcIndexArray.length; i++) {
            indexPair.push(getIndexTuple(srcIndexArray[i], targetIndexArray[i]));
        }

        let toSubtract = 0;

        if (indexPair.length > 0) {
            if (indexPair[0].srcIndex > 0) {
                diffArray.push('-');
                diffArray.push(0);
                diffArray.push(indexPair[0].srcIndex);
                toSubtract += indexPair[0].srcIndex;
            }
        }
        for (let i = 0; i < indexPair.length - 1; i++) {
            if (indexPair[i].srcIndex + blockSize- toSubtract < indexPair[i + 1].srcIndex - toSubtract) {
                diffArray.push('-');
                diffArray.push(indexPair[i].srcIndex + blockSize - toSubtract);
                diffArray.push(indexPair[i + 1].srcIndex - indexPair[i].srcIndex - blockSize);
                let tempToSub = toSubtract;
                toSubtract += indexPair[i + 1].srcIndex - indexPair[i].srcIndex - blockSize;
                indexPair[i].srcInd = indexPair[i].srcIndex - tempToSub;
            } else {
                indexPair[i].srcInd = indexPair[i].srcIndex - toSubtract;
            }
        }

        let preSubtractionLastIndex = indexPair[indexPair.length - 1].srcIndex;

        indexPair[indexPair.length - 1].srcInd = indexPair[indexPair.length - 1].srcIndex - toSubtract;

        let lastIndex = indexPair[indexPair.length - 1].srcIndex;
        if (srcString.length - toSubtract > lastIndex + blockSize) {
            if(lastIndex + blockSize < srcString.length) {
                diffArray.push('-');
                diffArray.push(lastIndex + blockSize);
                diffArray.push(srcString.length - toSubtract - lastIndex - blockSize);
            }
        }

        let toAdd = 0;
        if (indexPair.length > 0) {
            if (indexPair[0].targetIndex > 0) {
                diffArray.push('+');
                diffArray.push(0);
                diffArray.push(targetString.slice(0, indexPair[0].targetIndex));
                toAdd += indexPair[0].targetIndex;
            }
        }
        for (let i = 0; i < indexPair.length - 1; i++) {
            if (indexPair[i].targetIndex + blockSize < indexPair[i + 1].targetIndex) {
                diffArray.push('+');
                diffArray.push(indexPair[i].srcIndex + blockSize + toAdd);
                diffArray.push(targetString.slice(indexPair[i].targetIndex + blockSize, indexPair[i + 1].targetIndex));
                toAdd += indexPair[i + 1].targetIndex - indexPair[i].targetIndex - blockSize;
            }
        }
        let actualBlockSize;
        if(targetString.length < indexPair[indexPair.length - 1].targetIndex + blockSize){
            actualBlockSize = targetString.length - indexPair[indexPair.length - 1].targetIndex;
        }
        if(typeof actualBlockSize === 'undefined'){
            actualBlockSize = blockSize;
        }
        if (targetString.length - indexPair[indexPair.length - 1].targetIndex - actualBlockSize >= 0) {
            diffArray.push('+');
            if(preSubtractionLastIndex + blockSize <= srcString.length) {
                diffArray.push(lastIndex + blockSize + toAdd);
                diffArray.push(targetString.slice(indexPair[indexPair.length - 1].targetIndex + blockSize, targetString.length));
            }else{
                diffArray.push(lastIndex + (srcString.length - preSubtractionLastIndex) + toAdd);
                diffArray.push(targetString.slice(indexPair[indexPair.length - 1].targetIndex + (srcString.length - preSubtractionLastIndex),targetString.length));
            }
        }
        return diffArray;
    }

    this.runRsync = function (srcString, blockSize, targetString) {
        return processBlocks(srcString, blockSize, targetString);
    }
}

// let ob = new RsyncDiff();
// console.log(ob.runRsync('ana are mere',3,'ana are pere si mere multe'));

module.exports = ()=>{
    return new RsyncDiff();
};