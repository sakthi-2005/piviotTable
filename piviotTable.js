 let display_orginal = document.getElementsByClassName("display_orginalTable");
 let header = [];
 let data = [];
 let alt_header = [];
 let alt_data = [];
 
 document.getElementById("file_input").addEventListener('change',(event)=>{

    document.getElementById("file_input").disabled = true;
    document.getElementById('file_label').style.display = 'none';

    let file  = event.target.files[0];

    let reader = new FileReader();

    reader.onload = (e) => {
        let csvData = e.target.result.split('\r\n');
        let len = csvData[0].split(',').length;
        data = csvData.map((val)=>{
            let arr = val.split(',').filter((value)=>value != ''); 
            if(arr.length == len)return arr;
        }).filter((value)=>value != undefined); // shaping the csv data to matrix

        header = data.shift(); 

        determine_dataType(data); // changing the data to its preffered data type

        display_orginal[0].innerHTML = `<div>
                                            <input type='radio' name='select' value='row' class='select'>ROW
                                            <input type='radio' name='select' value='column' class='select'>COLUMN
                                            <input type='radio' name='select' value='values' class='select'>VALUES <br/>
                                            <button onclick='convert()'>create piviot Table </button>
                                        </div>
                                        <br />
                                        <div class='table'> 
                                            <table>
                                                <thead>
                                                    <tr>
                                                        ${header.map((val)=>{
                                                            return `<td onclick="select(this)">${val}</td>`
                                                        }).join('')}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${data.map(value=>{
                                                        return `<tr>
                                                            ${value.map(val=>{
                                                                return `<td>${val}</td>`
                                                            }).join('')}

                                                        </tr>`
                                                    }).join('')}
                                                </tbody>
                                            </table>
                                        </div>`

    }

    reader.readAsText(file)
 })


 function determine_dataType(arr){
    
    for(let i=0;i<arr[0].length;i++){
        for(let j=0;j<arr.length;j++){

            // for floating point values
            if(String(arr[j][i]).includes('.') && !isNaN(arr[j][i])){
                for( let k = 0; k < arr.length ; k++){
                    arr[k][i] = parseFloat(arr[k][i])
                }
            }
            else if(!isNaN(arr[j][i])){ // for numerical values
                arr[j][i] = Number(arr[j][i])
            }
            else{
                for(let k=0;k<arr.length;k++){ // for strings 
                    arr[k][i] = String(arr[k][i]);
                }
                break;
            }
        }
    }
 }

let rowCatagory = new Set();
let ColumnCatagory = new Set();
let valueCatagory = new Set();

function select(e){ // selection of row and column catagory

    let typeOfcatagory = document.querySelector('input[name="select"]:checked')

    if(!typeOfcatagory){
        alert('select row/column/values')
        return;
    }

    if(rowCatagory.has(header.indexOf(e.innerText))){
        rowCatagory.delete(header.indexOf(e.innerText))
    }
    else if(ColumnCatagory.has(header.indexOf(e.innerText))){
        ColumnCatagory.delete(header.indexOf(e.innerText))
    }
    else if(valueCatagory.has(header.indexOf(e.innerText))){
        valueCatagory.delete(header.indexOf(e.innerText));
    }


    if(e.classList.contains(`selected-${typeOfcatagory.value}`)){
        e.classList.remove(`selected-${typeOfcatagory.value}`)
    }
    else{
        e.className = '';
        e.classList.add(`selected-${typeOfcatagory.value}`)
        if(typeOfcatagory.value == 'row'){
            rowCatagory.add(header.indexOf(e.innerText));
        }
        else if(typeOfcatagory.value == 'column'){
            ColumnCatagory.add(header.indexOf(e.innerText));
        }
        else{
            valueCatagory.add(header.indexOf(e.innerText));
        }
    }
}

function convert(){ 

    if((rowCatagory.size == 0 && ColumnCatagory.size == 0 ) || valueCatagory.size == 0){
        alert('atlest one value , row/column must be selected');
        return;
    }

    // logic for pivioting

    let row_arr = []
    let row_arr_dumy = [];
    
    for(let row of rowCatagory){
        let array = []
        let arr =[]
        alt_header.push(header[row])
        let set = new Set();
        for(let i=0;i<data.length;i++){
            set.add(data[i][row]);
        }

        if(row_arr.length == 0){
            for(let val of set){
                row_arr_dumy.push(val);
                arr.push(val);
            }
        }
        else{

            for(let i=0;i<row_arr_dumy.length;i++){
                for(let val of set){
                    array.push(`${row_arr_dumy[i]}~${val}`)
                    
                }
            }
            row_arr_dumy = array;

            // for(let i=0;i<row_arr[row_arr.length-1].length;i++){
                for(let val of set){
                    arr.push(val)
                }
            // }
        }
        row_arr.push([...arr])

        // console.log(arr,row_arr)

    }

    let col_arr = [];
    let col_value_arr = [];

    for(let col of ColumnCatagory){
        let array = [];
        let col_val_arr = [];
        let set = new Set();
        for(let i=0;i<data.length;i++){
            set.add(data[i][col]);
        }

        if(col_arr.length == 0){
            for(let val of set){
                col_arr.push(val);
                col_val_arr.push(val);
            }
        }
        else{
            for(let i=0;i<col_arr.length;i++){
                for(let val of set){
                    array.push(`${col_arr[i]}~${val}`)
                    
                }
            }
            col_arr = array;

            for(let val of set){
                col_val_arr.push(val)
            }
        }

        col_value_arr.push([...col_val_arr]);
    }

    let value_arr = [];

    for(let value of valueCatagory){
        value_arr.push(header[value])
    }

    alt_header = [...alt_header,...col_arr];
    // console.log(col_arr,alt_header)

    if(col_arr.length == 0){
        for(let value of valueCatagory){
            alt_header.push(header[value]);
        }
    }


    filteringValues(row_arr,col_value_arr,row_arr_dumy,value_arr)
}


function filteringValues(row_arr,col_arr,row_arr_dumy,value_arr){
   let required_map = new Map();

   unique_array = [];
   generateCombinations([...row_arr,...col_arr]).forEach(element => {
        required_map.set(element.join('~'),[]);
   })

//    console.log(required_map)

   let indexes = [...rowCatagory,...ColumnCatagory];

        for(let i=0;i<data.length;i++){
            let group = [];
            for(let j=0;j<indexes.length;j++){
                group.push(data[i][indexes[j]])
            }


            if(required_map.has(group.join('~'))){
                let temp = required_map.get(group.join('~'))
                
                for(let j=0;j<valueCatagory.size;j++){
                    if(temp.length < j){
                        temp.push(data[i][[...valueCatagory][j]])
                        continue;
                    }
                    // console.log(temp , group , header[[...valueCatagory][j]])
                    // console.log(temp[j],typeof(temp[j]),'temp[j]', valueCatagory)
                    // console.log(data[i][[...valueCatagory][j]],typeof(data[i][[...valueCatagory][j]]),'data[i][[...valueCatagory][j]]')
                    temp[j] = (Number(temp[j]) || 0) + data[i][[...valueCatagory][j]]
                }

                required_map.set(group.join('~'),[...temp]);
                // required_map.set(group.join('~'),Number(required_map.get(group.join('~')))+data[i][[...valueCatagory][0]])
            }

        }

        // console.log(...required_map.values())

   displayTable([...required_map.values()],row_arr,col_arr,value_arr);
}


function generateCombinations(arrays) {

    return arrays.reduce((acc, curr) => {
      const result = [];
      acc.forEach(existingCombo => {
        curr.forEach(value => {
          result.push([...existingCombo, value]);
        });
      });
      return result;
    }, [[]]);

}


function displayTable(array,row,col,value_arr){
    console.log(row,'row')

    console.log(array);

    let row_length = 1;

    for(let i=0;i<row.length;i++){
        row_length *= row[i].length;
    }

    console.log(row_length,'row length')

    let data_array = new Array()

    for(let i=0;i<row_length;i++){
        data_array.push([])
    }
    let row_data = rowdata(row);

    console.log(row_data,row);


    // console.log(array.length,array)

    for(let i=0;i<data_array.length;i++){
        let count =0;
        // console.log((alt_header.length - rowCatagory.size ) * valueCatagory.size) + rowCatagory.size
        for(let j=0;j<((alt_header.length - rowCatagory.size ) * valueCatagory.size) + rowCatagory.size;){
            // console.log(row_data,row,'from row ')
            //
            // console.log()
            if(j < row.length){
                // console.log('escaped here')
                for(let k=0;k<row_data[i].length;k++){
                    data_array[i].push(row_data[i][k])
                    j++;
                }
                
            }
            else{
                let arr = array.shift();
                // console.log(arr,'arr');
                if(arr && arr.length != 0){
                    // console.log('pushing value')
                    for(let a = 0;a<arr.length;a++){
                        data_array[i].push(arr[a])
                        j++;
                        count++;
                    }
                    
                }
                else{
                    // console.log('pushing o')
                    for(let b of valueCatagory){
                        data_array[i].push(0)
                        j++
                        count++;
                    }
                    
                }
            }
        }
        // console.log(count);
        // console.log(alt_header.length)
    }


    console.log(data_array)
    console.log(alt_header)

    let matrix = correct_table(alt_header,data_array,value_arr)
    
    let for_row = []
    for(let val of rowCatagory){
        for_row.push(matrix[0].shift())
    }
    if(ColumnCatagory.size != 0){    
        matrix = matrix[0].map((_, colIndex) =>
        matrix.map(row => row[colIndex])
    );}
    console.log(matrix.length , matrix)

    display_orginal[0].innerHTML = `<div class='table'>
    <table>
    <thead>
    ${
        matrix.map((val,ind)=>{
            console.log(val);
            return `<tr>
                        ${ind == 0 ? for_row.map(val=>`<td rowspan=${Number(val.split('^row')[1])}>${val}</td>`).join('') : ''}
                       ${val.map((value)=>{
                            if(value == 0){
                                return;
                            }
                            else if(value.split('^')[1].includes('col')){
                                let val = Number(value.split('^col')[1])
                                return `<td colspan=${val}>${value.split('^col')[0]}</td> `
                            }
                            else if(value.split('^')[1].includes('row')){
                                let val = Number(value.split('^row')[1])
                                return `<td rowspan=${val}>${value.split('^col')[0]}</td> `
                            }
                            else{
                                return;
                            }
                        }).join('')}
                    </tr>`
        }).join('')
    }
    </thead>
    <tbody>
    ${
        data_array.map((val,index)=>{
            return `<tr>
                       ${ val.map((value,ind)=>{
                            // console.log(typeof(value) == Number , typeof(value) == 'Number' , typeof(value),value)
                            if(value == 0 && ind < rowCatagory.size){
                                return ``;
                            }
                            else if(value == 0){
                                return `<td></td>`;
                            }
                            else if(typeof(value) == 'number'){
                                return `<td>${value}</td>`;
                            }
                            else if(value.split('^')[1].includes('col')){
                                let val = Number(value.split('^col')[1])
                                return `<td colspan=${val}>${value.split('^col')[0]}</td> `
                            }
                            else if(value.split('^')[1].includes('row')){
                                let val = Number(value.split('^row')[1])
                                return `<td rowspan=${val}>${value.split('^row')[0]}</td> `
                            }
                            else{
                                return `<td>${value}</td>`;
                            }
                        }).join('')}
                    </tr>`
        }).join('')
    }
            
    </tbody>
</table>
</div>`
}

function rowdata(matrix, row = 0, path = [], result = []) {
    // console.log('hi')
    if (row === matrix.length) {
      result.push([...path]);
      return;
    }
  
    for (let val of matrix[row]) {
      path.push(val);
      rowdata(matrix, row + 1, path, result);
      path.pop();
    }

    // console.log(result);
  
    return result;
}


function correct_table(header,body,value_arr){
    // console.log(header,rowCatagory,ColumnCatagory)
    header = header.map(val=>val.split('~'))
    row_head = header.filter((_,ind)=>ind < rowCatagory.size)
    // console.log('header',header,row_head)
    header = header.filter((_,ind)=>ind >= rowCatagory.size)
    header = header.filter((val) => !value_arr.includes(val[0]));
    console.log(row_head,header,value_arr);

    // console.log(header,value_arr,'values header')
    let with_values = header.map((val)=>generateCombinations([[val],value_arr])).flat(2)
    console.log(with_values,header)
    // console.log('after the permutations',with_values)
    for(let i=0;i<with_values.length-1;i++){
        with_values.splice(i,2,[...with_values[i],with_values[i+1]])
    }

    console.log(with_values)

    if(with_values.length == 0){
        with_values.push([...value_arr]);
    }
    // with_values = [...with_values];

    console.log(with_values,header)

    // if(!with_values || with_values.length == 0){
    //     return value_arr;
    // }

    let len = with_values[0].length;
    for(let i=0;i<len;i++){ // for the first row(header) including value header
        let pre;
        let pre_index;
        for(let j=0;j<with_values.length;j++){
            // console.log(with_values[j][i])
            if(j==0){
                pre = with_values[j][i];
                pre_index = j;
                cspan = 1;
                continue;
            }

            if( pre == with_values[j][i]){
                cspan += 1;
                with_values[j][i] = 0;
                
            }
            else{
                with_values[pre_index][i] += `^col${cspan}`
                pre = with_values[j][i];
                pre_index = j;
                cspan = 1;
            }
        }
        with_values[pre_index][i] += `^col${cspan}`
    }
    console.log(with_values)

    for(let i=0;i<row_head.length;i++){
        with_values[0].unshift(`${row_head[row_head.length-i-1][0]}^row${ColumnCatagory.size + 1}`)
    }
    console.log(with_values)

    // for(let i=1;i<with_values.length;i++){
    //     for(let j=0;j<row_head.length;j++){
    //         with_values[i].unshift(0);
    //     }
    // }
    // console.log(body)

    len = row_head.length;
    for(let i=0;i<len;i++){
        
        let pre;
        let pre_index;
        for(let j=0;j<body.length;j++){
            // console.log(body[j])
            if(j==0){
                pre = body[j][i];
                pre_index = j;
                rspan = 1;
                continue;
            }

            if( pre == body[j][i]){
                rspan += 1;
                body[j][i] = 0
                
            }
            else{
                body[pre_index][i] += `^row${rspan}`
                pre = body[j][i];
                pre_index = j;
                rspan = 1;
            }
        }
        body[pre_index][i] += `^row${rspan}`
    }

    // console.log(body,with_values)
    return with_values;


}

