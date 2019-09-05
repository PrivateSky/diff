// const fs = require('fs');
//
// let a = [5,1,4,'+',6,',ob:"salut"','+',17,'valsViniez:{arr:[1,2,3]}'];
//
// fs.writeFileSync('b1.txt',JSON.stringify(a));

let a = [];

for(let i=0;i<10000020;i++){
    a[i] = [];
    a[i][0] = 0;
}

a[563][855] = 3;
//console.log(a);