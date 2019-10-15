const fs = require('fs');


function RsyncParserReader(fileName,dimension){
    let fileDescriptor;
    function readBlocksFromFile(fd,size,leftMargin,callback) {
        let buffer = Buffer.alloc(dimension);
        fs.read(fd,buffer,0,dimension,leftMargin,(err,btsR,buffer)=>{
            buffer = buffer.slice(0,btsR);
            return callback(buffer,leftMargin,leftMargin + dimension - (dimension - btsR),size);
        });
    }


    function openFile(size,leftMargin,callback){
        if(typeof fileDescriptor === "undefined") {
            fs.open(fileName, 'r+', (err, fd) => {
                fileDescriptor = fd;
                readBlocksFromFile(fd, size, leftMargin, callback);
            });
        }else{
            readBlocksFromFile(fileDescriptor,size,leftMargin,callback);
        }
    }

    this.runReader = function(leftMargin,callback){
        let relativePosition = 0;
        let stats = fs.statSync(fileName);
        openFile(stats.size,leftMargin,callback);
    }

    this.getSizeOfFile = function(){
        let length = fs.statSync(fileName).size;
        return length;
    }
}

// let a = new RsyncParserReader('a.txt',3);
// a.runReader(0,(block,lMargin,rMargin)=>{
//     console.log(block.toString(),lMargin,rMargin);
// });
// console.log(a.getSizeOfFile());

module.exports = (fileName,dimension)=>{
    return new RsyncParserReader(fileName,dimension);
}