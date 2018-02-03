/**
 * Created by Naveed on 11/20/13.
 */

function binarySearchAll(array, toFind){

    var position = [];
    var middle = binarySearch(array, toFind, 0, array.length-1);

    if(middle != -1)
    {
        var posLeft = middle, posRight = middle;
        var left=middle, right=middle;
        do {
            left = posLeft;
            posLeft = binarySearch(array, toFind, 0, posLeft-1);
        } while(posLeft!=-1);

        do {
            right = posRight;
            posRight = binarySearch(array, toFind, posRight+1, array.length-1);
        } while(posRight!=-1);

        position.push(left,right);
        return position;
    }
    else return -1;

    function binarySearch(array, toFind, start, end){
        var mid = 0;

        while(start <= end){
            mid = Math.floor( (start + end) / 2 );
            if (array[mid] == toFind) {
                return mid;
            }
            else if(toFind > array[mid]) {
                start = mid + 1;
            }
            else{
                end = mid - 1;
            }
        }
        return -1;
    }
}

//var array = [1,2,3,4,4,4,4,4,4,4,4,5,5,6,7];
//var result = binarySearchAll(array, 3);
//if(result != -1)
//    alert(result);