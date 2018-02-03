/**
 * Created by Hidemi on 10/22/13.
 */

function RadixSort(array, isAsc, key, isNotCaseSensitive)
{
    if(isAsc==null) //if isAsc is not defined, then sort in asc order
        isAsc=true;

    if(isNotCaseSensitive==null) //if isAsc is not defined, then sort in asc order
        isNotCaseSensitive=true;

    var size = array.length;
    var hasKey=false;

    //padding and change letter case
    var currLength, largestLength;
    if(key || (typeof key==='number' && (key%1)===0))
    {
        hasKey=true;

        largestLength = array[0][key].length;
        for(var a = 0; a < size; a++) {
            currLength = array[a][key].length;

            if(currLength > largestLength)
                largestLength = currLength;

            if(isNotCaseSensitive)
                array[a][key] = array[a][key].toLowerCase();
        }

        for(var a = 0; a < size; a++) {
            var difference = largestLength - array[a][key].length;
            for(var b = 0; b < difference; b++){
                array[a][key] += " ";
            }
        }
    }
    else
    {
        largestLength = array[0].length;
        for(var a = 0; a < size; a++) {
            currLength = array[a].length;

            if(currLength > largestLength)
                largestLength = currLength;

            if(isNotCaseSensitive)
                array[a] = array[a].toLowerCase();
        }

        for(var a = 0; a < size; a++) {
            var difference = largestLength - array[a].length;
            for(var b = 0; b < difference; b++){
                array[a] += " ";
            }
        }
    }

    //radix sort
    for(var j=largestLength-1; j>=0; j--)
    {
        var buckets = [];

        for(var i=0; i<size; i++)
        {
            var element;
            if(isAsc)
                element = array.shift();
            else
                element = array.pop();

            var charCode;
            if(hasKey)
                charCode = element[key].charCodeAt(j);
            else
                charCode = element.charCodeAt(j);

            if(!buckets[charCode])
                buckets[charCode] = [ element ];
            else
                buckets[charCode].push(element);
        }

        //empty all buckets into array
        if(isAsc) //ascending
        {
            for(var i=0; i<buckets.length; i++)
            {
                if(buckets[i])
                {
                    var bucket = buckets[i];
                    var bSize = bucket.length;
                    for(var n=0; n<bSize; n++)
                        array.push(bucket.shift());
                }
            }
        }
        else //descending
        {
            for(var i=buckets.length-1; i>=0; i--)
            {
                if(buckets[i])
                {
                    var bucket = buckets[i];
                    var bSize = bucket.length;
                    for(var n=0; n<bSize; n++)
                        array.push(bucket.pop());
                }

            }
        }
    }

    return array;
}

//var test=["hiss","Hisa","his", "gold"];
//var test2=[];
//for(var i=0; i<test.length; i++)
//{
//    test2.push([test[i], i]);
//}
//RadixSort(test2,false,0);
//
//var str1="",str2="";
//for(var i=0; i<test2.length; i++)
//{
//    str1=str1+test2[i][0]+",";
//    str2=str2+test2[i][1]+",";
//}
//
//alert(test+"\n0,1,2,3\n\n"+str1+"\n"+str2);
