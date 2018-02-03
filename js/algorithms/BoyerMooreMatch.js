function boyerMooreMatch(textArr, pattern, isCaseSensitive) {
    var found = [];
    for(var i=0; i<textArr.length; i++)
    {
        var text = textArr[i];
        if(!isCaseSensitive)
        {
            text = text.toLowerCase();
            pattern = pattern.toLowerCase();
        }

        var lo = {}; //sigma function

        var tLastIndex = text.length - 1;
        var patternLen = pattern.length;
        var pLastIndex = patternLen - 1;

        //build sigma function
        for(var j=0; j<patternLen; j++)
            lo[ pattern.charAt(j) ] = j;

        var tI = pLastIndex; //text's index
        var pI = pLastIndex; //pattern's index

        //searching operation
        while(tI <= tLastIndex)
        {
            if(text.charAt(tI) == pattern.charAt(pI))
            {
                if(pI == 0)
                {
                    found.push({"textIndex":i,"charIndex":tI});
                    break;
                }
                else
                {
                    tI = tI - 1;
                    pI = pI - 1;
                }
            }
            else
            {
                var char = text.charAt(tI);
                var last_occurence = ( lo[char]==null ? -1 : lo[char] ) ;
                tI = tI + patternLen - Math.min(pI, 1+last_occurence);
                pI = pLastIndex;
            }
        }
    }

    return found;
}