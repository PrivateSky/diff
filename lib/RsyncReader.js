const fs = require('fs');


function RsyncReader(fileName,dimension){
    let blocks_queue = [];
    let cnt = 0;
    function readBlocksFromFile(fd,relativePosition,size,callback) {
        cnt++;
        let buffer = Buffer.alloc(dimension);
        fs.read(fd, buffer, 0, dimension, relativePosition, (err, btsR, buffer) => {
            cnt--;
            buffer = buffer.slice(0,btsR);
            if(cnt === 0) {
                return callback(buffer,relativePosition,relativePosition + dimension - (dimension - btsR),'f');
            }
            if(relativePosition + dimension > size && btsR > 0){
                return callback(buffer,relativePosition,relativePosition + dimension - (dimension - btsR),'c');
            }
            if(btsR > 0) {
                callback(buffer,relativePosition,relativePosition + dimension - (dimension - btsR),'c');
            }
        });
        if(relativePosition <= size) {
            readBlocksFromFile(fd, relativePosition + dimension, size, callback);
        }
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