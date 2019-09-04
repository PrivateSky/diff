
function Diff(){
    let diffData;
    let matrix;

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

    function mkDiff(A,B,m,n,matrix){
        if(m>0 && n>0 && A[n-1] === B[m-1]){
            mkDiff(A,B,m-1,n-1,matrix);
        }
        else if(n>0 && (m === 0 || matrix[m][n-1] >= matrix[m-1][n])){
            mkDiff(A,B,m,n-1,matrix);
            console.log('+',B[n-1]);
        }
        else if(m>0 && (n === 0 || matrix[m][n-1] < matrix[m-1][n])){
            mkDiff(A,B,m-1,n,matrix);
            console.log('-',A[m-1]);
        }
    }

    function compare(fromData,toData){
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
            mkDiff(fromData,toData,fromData.length,toData.length,matrix);
        });
    }

    this.createDiff = function(fromData,toData,callback){
        if(fromData === toData){
            return callback(undefined,diffData);
        }
        compare(fromData,toData);
    }
}

new Diff().createDiff('ABC','AXYZFC',(err,data)=>{
    if(err){
        console.log(err.message);
    }
} );