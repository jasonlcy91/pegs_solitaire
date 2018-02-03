/**
 * Created by Abdul Rahman on 10/29/13.
 */

Array.prototype.swap=function(a, b)
{
    var temp=this[a];
    this[a]=this[b];
    this[b]=temp;
};

function quickSortInPlace(array, isAsc, key)
{
    if(isAsc==null) //if isAsc is not defined, then sort in asc order
        isAsc=true;

    var hasKey = false;
    if(key || (typeof key==='number' && (key%1)===0))
        hasKey = true;

    qsort(array, 0, array.length-1);

    function qsort(array, begin, end)
    {
        if(begin < end) {
            var pivot = begin + Math.floor( Math.random() * (end+1-begin) );

            pivot = partition(array, begin, end, pivot);

            qsort(array, begin, pivot-1);
            qsort(array, pivot, end);
        }
    }

    function partition(array, begin, end, pivot)
    {
        var piv = array[pivot];
        if(hasKey)
            piv = piv[key];
        array.swap(pivot, end);
        var store=begin;
        for(var i=begin; i<end; i++) {
            var element = array[i];
            if(hasKey)
                element = element[key];

            if(isAsc)
            {
                if(element <= piv) {
                    array.swap(store, i);
                    store++;
                }
            }
            else
            {
                if(element >= piv) {
                    array.swap(store, i);
                    store++;
                }
            }
        }
        array.swap(end, store);

        return store;
    }

    return array;
}

function quickSortStable(array, isAsc, key)
{
    var size = array.length;
    if(size <= 1)
        return array;

    var lessArr = [];
    var equalArr = [];
    var greaterArr = [];

    var pivot;

    if(key == null)
        pivot = array[ Math.floor( Math.random() * size ) ];
    else
        pivot = array[ Math.floor( Math.random() * size ) ][key];


    for(var i=0; i<size; i++)
    {
        var element = array[i];
        var elementValue;
        if(key == null)
            elementValue = element;
        else
            elementValue = element[key];

        if(elementValue < pivot)
            lessArr.push(element);
        else if(elementValue == pivot)
            equalArr.push(element);
        else
            greaterArr.push(element);
    }

    switch (isAsc){
        case false:
            return quickSortStable(greaterArr, isAsc, key).concat(equalArr, quickSortStable(lessArr, isAsc, key));
            break;
        default :
            return quickSortStable(lessArr, isAsc, key).concat(equalArr, quickSortStable(greaterArr, isAsc, key));
            break;
    }
}

//var test=[3,5,1,75,34,78,34,1,5,1];
//var ori=[3,5,1,75,34,78,34,1,5,1];
//var test2=[];
//for(var i=0; i<test.length; i++)
//{
//    test2.push([test[i], i]);
//}
//
//var order = quickSortStable(test2, true, 0);
//var str1="", str2="";
//
//for(var i=0; i<order.length; i++)
//{
//    str1=str1+order[i][0]+",";
//    str2=str2+order[i][1]+",";
//}
//
//alert(ori+"\n0,1,2,3,4,5,6,7,8,9\n"+test+"\n"+str1+"\n"+str2);
//alert(ori+"\n0,1,2,3,4,5,6,7,8,9\n"+test+"\n"+order);

