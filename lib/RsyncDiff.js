const fs = require('fs');
const crypto = require('crypto');
const parserReader = require('./RsyncParserReader');

const reader = require('./RsyncReader');

function getIndexTuple(firstElement, secondElement) {
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

    let forMultiplying;
    let srcSet = new Set();
    let targetSet = new Set();

    const checksumConstants = getConstants();

    function easyCheckSum(str) {
        let checksum = 0;
        if (forMultiplying) {
            forMultiplying = 1;
            for (let i = 0; i < str.length - 1; i++) {
                forMultiplying = (forMultiplying * checksumConstants.alphabetSpace) % checksumConstants.bigPrime;
            }
        }

        for (let i = 0; i < str.length; i++) {
            checksum += str.charCodeAt(i);
        }

        return checksum;
    }

    //checksum that i obtain with sha2 or with md5
    function hardCheckSum(input) {
        if (typeof input === "string") {
            input = Buffer.from(input);
        }
        return crypto.createHash('md5').update(input).digest('hex');
    }

    function moveWindow(charToRemove, charToAdd, checksum) {
        return checksum - charToRemove + charToAdd;
    }

    function storeMatches(srcBlock, blockIndex, targetString, srcSet, targetSet) {
        const srcEasyDigest = easyCheckSum(srcBlock);
        const srcHardDigest = hardCheckSum(srcBlock);
        const blockSize = srcBlock.length;
        let windowCheckSum = easyCheckSum(targetString.slice(0, blockSize));

        for (let i = blockSize; i < targetString.length + 1; i++) {
            if (windowCheckSum === srcEasyDigest) {
                if (hardCheckSum(targetString.slice(i - blockSize, i)) !== srcHardDigest) {
                    windowCheckSum = moveWindow(targetString.charCodeAt(i - blockSize), targetString.charCodeAt(i), windowCheckSum);
                } else {

                    if (srcSet.has(blockIndex) === false && targetSet.has(i - blockSize) === false) {
                        let alreadyExists = false;
                        for (let ch = 1; ch < blockSize; ch++) {
                            if (targetSet.has(i - ch - blockSize) === true) {
                                alreadyExists = true;
                                break;
                            }
                            if (targetSet.has(i + ch - blockSize) === true) {
                                alreadyExists = true;
                                break;
                            }
                            if (srcSet.has(blockIndex + ch) === true) {
                                alreadyExists = true;
                                break;
                            }
                            if (srcSet.has(blockIndex - ch) === true) {
                                alreadyExists = true;
                                break;
                            }
                        }

                        if (!alreadyExists) {
                            srcSet.add(blockIndex);
                            targetSet.add(i - blockSize);
                            return;
                        } else {
                            //de optimizat
                            windowCheckSum = moveWindow(targetString.charCodeAt(i - blockSize), targetString.charCodeAt(i), windowCheckSum);
                        }

                    } else {
                        //windowCheckSum = easyCheckSum(target.slice(..));
                        windowCheckSum = moveWindow(targetString.charCodeAt(i - blockSize), targetString.charCodeAt(i), windowCheckSum);
                    }
                }
            } else {
                windowCheckSum = moveWindow(targetString.charCodeAt(i - blockSize), targetString.charCodeAt(i), windowCheckSum);
            }
        }
    }


    function execute(callback) {
        let blockReader = parserReader(fileName, blockSize);
        let lengthOfFile = blockReader.getSizeOfFile();
        for (let iterator = 0; iterator < lengthOfFile; iterator += blockSize) {
            contor++;
            blockReader.runReader(iterator, (block, lMargin, rMargin, size) => {
                contor--;
                let arr = new Uint8Array(block);
                let tuples = easyCheckSum(arr);
                let hash = hardCheckSum(block);
                storeMatches(tuples, hash, lMargin, rMargin);
                if (contor === 0) {
                    return callback(size);
                }
            });
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
        const srcSet = new Set();
        const targetSet = new Set();
        const blocks = generateBlocks(srcString, blockSize);
        blocks.forEach((block, i) => {
            storeMatches(block, i * blockSize, targetString, srcSet, targetSet);
        });

        return createDiff(srcString, blockSize, targetString, srcSet, targetSet);
    }

    function createDiff(srcString, blockSize, targetString, srcSet, targetSet) {
        let diffArray = [];

        let srcIndexArray = Array.from(srcSet);
        let targetIndexArray = Array.from(targetSet);
        let indexPair = [];
        for (let i = 0; i < srcIndexArray.length; i++) {
            indexPair.push(getIndexTuple(srcIndexArray[i], targetIndexArray[i]));
        }

        indexPair.sort((a, b) => {
            return a.srcIndex - b.srcIndex
        });

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
            if (indexPair[i].srcIndex + blockSize - toSubtract < indexPair[i + 1].srcIndex - toSubtract) {
                diffArray.push('-');
                diffArray.push(indexPair[i].srcIndex + blockSize - toSubtract);
                diffArray.push(indexPair[i + 1].srcIndex - indexPair[i].srcIndex - blockSize);
                let tempToSub = toSubtract;
                toSubtract += indexPair[i + 1].srcIndex - indexPair[i].srcIndex - blockSize;
                indexPair[i].srcIndexValue = indexPair[i].srcIndex - tempToSub;
            } else {
                indexPair[i].srcIndexValue = indexPair[i].srcIndex - toSubtract;
            }
        }

        indexPair[indexPair.length - 1].srcIndexValue = indexPair[indexPair.length - 1].srcIndex - toSubtract;

        let lastIndex = indexPair[indexPair.length - 1].srcIndex;
        if (srcString.length - toSubtract > lastIndex + blockSize) {
            diffArray.push('-');
            diffArray.push(lastIndex + blockSize);
            diffArray.push(srcString.length - toSubtract - lastIndex - blockSize);
        }
        indexPair.sort((a, b) => {
            return a.targetIndex - b.targetIndex;
        });

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
        if (targetString.length - indexPair[indexPair.length - 1].targetIndex - blockSize > 0) {
            diffArray.push('+');
            diffArray.push(lastIndex + blockSize + toAdd);
            diffArray.push(targetString.slice(indexPair[indexPair.length - 1].targetIndex + blockSize, targetString.length));
        }

        return diffArray;
    }

    this.runRsync = function (srcString, blockSize, targetString) {
        return processBlocks(srcString, blockSize, targetString);
    }
}

module.exports = RsyncDiff;