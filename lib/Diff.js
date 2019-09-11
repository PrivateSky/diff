const Patcher = require('./Patcher');
//this diff algorithm, has as its source, Myers algorithm
function Diff(){
    //diffArr is the array where i have differences between strings in a specific format, starting from 0, next 3 positions will have data related to a delete or an insertion
    //starting from 0 to 2, array will looks like this [sign('+' or '-'),position where the first character of the difference occurs,substring if we add and a length of substring to remove if we remove...
    let diffData = [];
    let subString = '';
    let remainder = 0;


    function max(first,second){
        if(first>second){
            return first;
        }else{
            return second;
        }
    }

    //i create a empty matrix, for the dynamic that i will further do
    function constructMatrix(lengths){
        let matrix = [];

        for(let i=0;i<=lengths[0];i++){
            matrix[i] = [];
            matrix[i][0] = 0;
        }

        for(let i=0;i<=lengths[1];i++){
            matrix[0][i] = 0;
        }

        return matrix;
    }

    //here i compare the two strings that i get as an input, after this two for loops executes, i will have in the last cell of the matrix, the length of the longest common subsequence
    function compare(fromData,toData){
        let matrix = constructMatrix([fromData.length,toData.length]);
        for(let i=1;i<=fromData.length;i++){
            for(let j=1;j<=toData.length;j++){
                matrix[i][j] = 0;
                if(fromData[i-1] === toData[j-1]){
                    //if two characters are equal, then that means that i will add one to the length of the longest subsequence that i've found yet
                    matrix[i][j] = matrix[i-1][j-1] + 1;
                }else{
                    //if two characters aren't equal, then i will put on this position, length of the longest subsequence that i discovered until now
                    matrix[i][j] = max(matrix[i-1][j],matrix[i][j-1]);
                }
            }
        }
        mkDiff(fromData,toData,fromData.length,toData.length,-1,matrix);
        return diffData;
    }

    //after i've compute the length of the longest common subsequence, i have a matrix full of values
    //this values are lengths of the longest common subsequence at some point
    //checking the state of the neighbors of a cell allows me to establish if the characters which are on the line and column of the cell should be removed from or added to initial string
    function mkDiff(A,B,m,n,prec,matrix){
        if(m>0 && n>0 && A[m-1] === B[n-1]){
            mkDiff(A,B,m-1,n-1,-1,matrix);
        }
        else if(n>0 && (m === 0 || matrix[m][n-1] >= matrix[m-1][n])){
            mkDiff(A,B,m,n-1,n-1,matrix);
            buildDiff(B,n,m+1,prec,'+');
        }
        else if(m>0 && (n === 0 || matrix[m][n-1] < matrix[m-1][n])){
            mkDiff(A,B,m-1,n,m-1,matrix);
            buildDiff(A,m,m,prec,'-');
        }
    }

    //in this function, i construct substring from characters that i'm walking through in mkDiff function
    //prec stands for precedent, and helps me to find out when a substring that starts at index y ends, and from now on, i should build another substring, another difference between our strings
    function buildDiff(B,n,pos,prec,sign){
        if(n === prec){
            if(diffData.length>=2){
                if(diffData[diffData.length - 2] === '+' || diffData[diffData.length - 2] === '-'){
                    subString += B[n-1];
                }
                else{
                    diffData.push(sign);
                    diffData.push(pos-1);
                    subString += B[n-1];
                }
            }else{
                diffData.push(sign);
                diffData.push(pos-1);
                subString += B[n-1];
            }
        }else{
            if(diffData[diffData.length-2] !== '+' && diffData[diffData.length-2] !== '-') {
                diffData.push(sign);
                diffData.push(pos-1);
            }
            subString += B[n-1];
            if(sign === '+') {
                diffData[diffData.length - 1] += remainder;
                remainder += (subString.length);
                diffData.push(subString);
            }else{
                diffData[diffData.length - 1] += remainder;
                remainder -= (subString.length);
                diffData.push(subString.length);
            }
            subString = '';
        }
    }

    //main function, it produces the differences array from input strings and returns it
    this.createDiff = function(fromData,toData){
        if(fromData === toData){
            return undefined;
        }
        return compare(fromData,toData);
    }
}

module.exports = ()=>{
    return new Diff();
}