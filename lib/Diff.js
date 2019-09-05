const Patcher = require('./Patcher');
function Diff(){
    let diffData = [];
    let matrix;
    let subString = '';

    function max(first,second){
        if(first>second){
            return first;
        }else{
            return second;
        }
    }

    function constructMatrix(lengths,callback){
        matrix = [];

        for(let i=0;i<=lengths[0];i++){
            matrix[i] = [];
            matrix[i][0] = 0;
        }

        for(let i=0;i<=lengths[1];i++){
            matrix[0][i] = 0;
        }

        return callback(matrix);
    }

    function buildDiff(B,n,prec,sign){
        if(n === prec){
            if(diffData.length>=2){
                //console.log(diffData[diffData.length-2],diffData[diffData.length-1]);
                if(diffData[diffData.length - 2] === '+' || diffData[diffData.length - 2] === '-'){
                    subString += B[n-1];
                }
                else{
                    diffData.push(sign);
                    diffData.push(n-1);
                    subString += B[n-1];
                }
            }else{
                diffData.push(sign);
                diffData.push(n-1);
                subString += B[n-1];
            }
        }else{
            if(diffData[diffData.length-2] !== '+' && diffData[diffData.length-2] !== '-') {
                diffData.push(sign);
                diffData.push(n-1);
            }
            subString += B[n-1];
            if(sign === '+') {
                diffData.push(subString);
            }else{
                diffData.push(subString.length);
            }
            subString = '';

        }
    }

    function mkDiff(A,B,m,n,prec,matrix){
        if(m>0 && n>0 && A[m-1] === B[n-1]){
            mkDiff(A,B,m-1,n-1,-1,matrix);
        }
        else if(n>0 && (m === 0 || matrix[m][n-1] >= matrix[m-1][n])){
            mkDiff(A,B,m,n-1,n-1,matrix);
            buildDiff(B,n,prec,'+');
            //console.log(n-1,'+',B[n-1]);
        }
        else if(m>0 && (n === 0 || matrix[m][n-1] < matrix[m-1][n])){
            mkDiff(A,B,m-1,n,m-1,matrix);
            buildDiff(A,m,prec,'-');
            //console.log(m-1,'-',A[m-1]);
        }
    }

    function compare(fromData,toData,callback){
        constructMatrix([fromData.length,toData.length],(matrix)=>{
            for(let i=1;i<=fromData.length;i++){
                for(let j=1;j<=toData.length;j++){
                    matrix[i][j] = 0;
                    if(fromData[i-1] === toData[j-1]){
                        matrix[i][j] = matrix[i-1][j-1] + 1;
                    }else{
                        matrix[i][j] = max(matrix[i-1][j],matrix[i][j-1]);
                    }
                }
            }
            //console.log(matrix);
            mkDiff(fromData,toData,fromData.length,toData.length,-1,matrix);
            return callback(diffData);
        });
    }

    this.createDiff = function(fromData,toData,callback){
        if(fromData === toData){
            return callback(undefined,diffData);
        }
        compare(fromData,toData,(diffData)=>{
            return callback(undefined,diffData);
        });
    }
}

// new Diff().createDiff('ABC','AXYZFC',(err,data)=>{
//     if(err){
//         console.log(err.message);
//     }
// } );
module.exports = Diff;
// new Diff().createDiff('ana are mere, pere','ana are pere, mere',(err,data)=>{
//     if(err){
//         console.log(err.message);
//     }
//     new Patcher().applyPatch(JSON.stringify(data),'ana are mere, pere',(err,fld)=>{
//         console.log(fld);
//     });
//     console.log(data);
// } );