const fs = require('fs');


function RsyncReader(fileName,dimension){
    let blocks_queue = [];
    function readBlocksFromFile(fd,relativePosition,size,callback) {
        let buffer = Buffer.alloc(dimension);
        fs.read(fd, buffer, 0, dimension, relativePosition, (err, btsR, buffer) => {
            buffer = buffer.slice(0,btsR);
            if(relativePosition + dimension > size){
                return callback(buffer);
            }
            if(btsR > 0) {
                callback(buffer);
            }
            readBlocksFromFile(fd,relativePosition + dimension,size,callback);
        });
    }


    function openFile(relativePosition,size,callback){
        fs.open(fileName,'r+',(err,fd)=>{
            readBlocksFromFile(fd,relativePosition,size,callback);
        });
    }

    this.runReader = function(callback){
        let relativePosition = 0;
        let stats = fs.statSync(fileName);
        openFile(relativePosition, stats.size,callback);
    }
}

module.exports = (fileName,dimension)=>{
    return new RsyncReader(fileName,dimension);
}