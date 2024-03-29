const RK = require('./RabinKarp')
const Ad = require('./Adler')
const fs = require('fs');

function compareRHModules(){
    let rkComparator = RK();
    let adComparator = Ad();
    let firstString;
    let secondString;
    let filePath = 'nm2.txt';
    if (!fs.existsSync(filePath)) {
        for (let i = 0; i <= 1e4; i++) {
            fs.appendFileSync('nm2.txt','Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n',);
        }
    }
    filePath = 'nm4.txt';
    if (!fs.existsSync(filePath)) {
        for (let i = 0; i <= 1e4; i++) {
            fs.appendFileSync('nm4.txt','consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n');
        }
    }
    firstString = fs.readFileSync('nm2.txt');
    secondString = fs.readFileSync('nm4.txt');
    firstString = firstString.toString();
    secondString = secondString.toString();
    console.time('RK');
    console.log(rkComparator.execute(firstString,128,secondString));
    console.timeEnd('RK');
    console.time('Adler');
    console.log(adComparator.execute(firstString,128,secondString));
    console.timeEnd('Adler');
    fs.unlinkSync('nm2.txt');
    fs.unlinkSync('nm4.txt');
}

compareRHModules();