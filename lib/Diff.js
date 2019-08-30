
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
        matrix[0] = [];
        for(let i=0;i<=max(lengths[0],lengths[1]);i++){
            matrix[0][i] = 0;
            matrix[i] = [];
            matrix[i][0] = 0;
        }
        return callback(matrix);
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
            console.log(matrix);
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
});