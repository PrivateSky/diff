const crc = require('crc-32');

function Crc(){

    this.compare = function(){
        let s = crc.str('ana');
        let b = crc.str('na ');
        console.log(s);
        console.log(b);
        s -= crc.str('a');
        console.log(s);
        s += crc.str(' ');
        console.log(s);
    }
}

new Crc().compare();