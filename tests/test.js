const fs = require('fs');

let a = [5,1,4,'+',6,',ob:"salut"','+',17,'valsViniez:{arr:[1,2,3]}'];

fs.writeFileSync('b1.txt',JSON.stringify(a));