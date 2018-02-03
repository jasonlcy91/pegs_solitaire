$(document).ready(function(){ //start
//session data
    if( _user_data != "" )
    {
        $("#notice").remove();
        $(".playername").text(_user_data["username"]);
    }

//use basic
	$("#useBasic").click(function(){
		$("#notice").modal("hide");
	});

//login/sign up function
    $("#form-login").submit(function(event){
        event.preventDefault();
        $("#button-login").trigger("click");
    });

    $("#button-login, #button-join").click(function(){
        var username = $("#input-id").val();
        var password = $("#input-pass").val();

        if(username=="" || password=="")
        {
            $("#message").text("Cannot be blank..");
            return;
        }

        $.ajax({
            type: "post",
            url: "access/login.php",
            dataType: 'json',
            data: { username: username, password: password, action: $(this).attr("id") },
            success: function(response){
                if(response["success"])
                {
                    $("#notice").modal("hide");
                    _user_data = response["data"];
                    $(".playername").text(_user_data["username"]);
                }
                else
                {
                    $("#message").text(response["message"]);
                }
            }
        });
    });


/* section related to peg board game functions
    - build peg board ($.fn.pegsBoard)
    - pause/restart timer
    - display gameover message
    - update score to database
*/
    var timer = $("#time_record").timer();
    var moves = 0;
    var highscore_data;
    var score;

    $("#moves").text(0);
    $("#pauseTime").attr("disabled",true);

    $("#pauseTime").click(function(){
        timer.pause();
        $(this).attr("disabled",true);
    });

    $("#restartTime").click(function(){
        timer.reset();
        $("#pauseTime").attr("disabled",true);
        $(".pegs_board").html("");
        $(".pegs_board").pegsBoard("full");
        moves = 0;
        $("#moves").text(0);
    });

    function writeMessage(remaining, result) {
        var message="";
        if(remaining>=20)
            message = "You really don't understand the rules, do you?";
        else if(remaining>= 15)
            message = "Hang in there, you are getting BETTER";
        else if(remaining>=10)
            message = "You are good, but not great";
        else if(remaining>=7)
            message = "I suggest you should concentrate better.";
        else if(remaining>=5)
        {
            var $row = $("#highscore_table").find("tbody").find("tr");
            var num=0;
            $row.each(function(){
                var remaining = $(this).find("td:eq(4)").text();
                if(remaining=="5" || remaining=="6")
                    num++;
            });

            message = "JUST A LITTLE BIT MORE!<br>There were, maybe including you, "+num+" people who achieved what you just did though.";
        }
        else if(remaining>=2)
            message = "You are close to win a prize!<br>JUST GET RID OF "+(remaining-1)+" more pegs!<br>Play again!";
        else if(remaining>=1 && result!="24")
            message = "It has to be in the center! Play again to claim your prize!";
        else if(remaining>=1 && result=="24")
            message = "You are really lucky today.<br>Your prize: Pride";

        return message;
    }

    var last_id;
    function updateHighscore(score) {
        $.ajax({
            type: "POST",
            url: "update_table.php",
            data: { score: score },
            success: function(response){
                response = jQuery.parseJSON(response);
                var data = response["data"];

                if(highscore_data !== JSON.stringify(data))
                {
                    var body = "";
                    var no = 1;
                    $.each(data, function(){
                        var row = "";
                        $.each(this, function(key, value){
                            if(key != "final_positions")
                                row += "<td>"+ value +"</td>";
                            else
                            {
                                row += "<td><a id='"+ value +"' class='finallook_button' href='#finallook' role='button' data-toggle='modal' style='text-decoration: none;'><i class='icon-picture'></i>";
                                if(value==24)
                                    row += " <img src='media/trophy.png' width='20px' />";

                                row += "</a></td>";
                            }
                        });
                        body += "<tr><td>"+ no +"</td>"+ row +"</tr>";
                        no++;
                    });

                    $("#highscore_table").find("tbody").html(body);
                }

                $("#highscore_table").find("tbody > tr").each(function(){
                    if( $(this).find("td:eq(1)").text() == _user_data["username"] )
                        $(this).css("color","#D2691E");
                });

                highscore_data = JSON.stringify(data);

                last_id = response["lastID"];
            }
        });
    }

    $.fn.pegsBoard = function(pegsPosition, isDummy) {
        var img = "<img src='media/pegs1.png' class='peg' width='55px' height='55px'>";
        return $(this).each(function() {

            //initialize pegs game board
            for(var i=0; i<7; i++)
            {
                var $row = $("<tr></tr>");
                for(var j=0; j<7; j++)
                    $row.append("<td class='cell'></td>");

                $(this).append($row);
            }

            var $cell = $(this).find( ".cell" );

            var $blankcell = $cell.slice(0,2).add($cell.slice(47))
                .add($cell.slice(5,9))
                .add($cell.slice(12,14))
                .add($cell.slice(35,37))
                .add($cell.slice(40,44))
                .attr( "class", "blank" );
            var $boardcell = $cell.not( $blankcell );

            if(pegsPosition == "full")
                $boardcell.not( $boardcell.eq(16) ).html(img);
            else
                for(var i=0; i<pegsPosition.length; i++)
                    $cell.eq(pegsPosition[i]).html(img);

            if(isDummy)
                return;

            $boardcell.find(".peg").draggable({
                revert: "invalid", // when not dropped, the item will revert back to its initial position
                containment: $(this),
                cursor: "move",
                opacity: 0.8,
                start: function(event, ui) {
                    timer.play();
                    $("#pauseTime").removeAttr("disabled");

                    $(this).css("z-index","2");
                    $boardcell.has(".peg").droppable("disable"); //first check: disable dropping on cell containing peg
                },
                stop: function(event, ui) {
                    $(this).removeAttr("style").css("position","relative");
                    $boardcell.droppable("enable");
                }
            });

            var $middle;
            $cell.droppable({
                accept: $boardcell.find(".peg"),
                over: function( event, ui ) {
                    var $this = $(this);
                    var $origincell = ui.draggable.parent();
                    var originPos = $cell.index($origincell);
                    var originRow = $origincell.parent().index();
                    var destPos = $cell.index($this);
                    var destRow = $this.parent().index();

                    //second check: is the destination 2 cells vertically or horizontally away
                    if( Math.abs(originPos-destPos)==14 || ( Math.abs(originPos-destPos)==2 && originRow==destRow ) )
                    {
                        //third check: does the cell between destination and origin have peg
                        var middlePos = (originPos + destPos ) /2;
                        $middle = $cell.eq(middlePos);

                        if(!$middle.has(".peg").length)
                            $this.droppable("disable");
                    }
                    else
                        $this.droppable("disable");
                },
                drop: function( event, ui ) {
                    var $this = $(this);
                    ui.draggable.appendTo( $this );
                    moves++;
                    $("#moves").text(moves);

                    $middle.find(".peg").fadeOut(function(){
                        $(this).remove();
                        checkGameOver();
                    });
                }
            });

            function checkGameOver() {
                var gameOver = true;
                $boardcell.find(".peg").each(function(){
                    var $pegcell = $(this).parent();
                    var cellColumn = $pegcell.index();

                    var $left2 = $pegcell.prev().prev();
                    var $right2 = $pegcell.next().next();
                    var $up2 = $pegcell.parent().prev().prev().children().eq(cellColumn);
                    var $down2 = $pegcell.parent().next().next().children().eq(cellColumn);

                    var $direction = [ $left2, $right2, $up2, $down2 ];
                    for(var i=0; i<4; i++)
                    {
                        var $place = $direction[i];

                        if($place.hasClass("cell") && !$place.has(".peg").length)
                        {
                            var middle = ( $cell.index($pegcell) + $cell.index($place) )/2;
                            var $middle2 = $cell.eq(middle);

                            if( $middle2.has(".peg").length )
                            {
                                gameOver = false;
                                return false;
                            }
                        }
                    }
                });

                if(gameOver)
                {
                    $("#pauseTime").attr("disabled",true);
                    timer.stop();

                    var time = $("#time_record").text();
                    var result = "";
                    $boardcell.find(".peg").each(function(){
                        result += $cell.index($(this).parent()) + ",";
                    });
                    result = result.slice(0,-1);
                    var remaining = $boardcell.find(".peg").length;

                    $("#gameover").find(".stat-message").html(writeMessage(remaining,result));
                    $("#gameover").find(".stat-time").text(time);
                    $("#gameover").find(".stat-rem").text(remaining);

                    score = [ _user_data["username"], time, moves, remaining, result ];
                    updateHighscore(score);

                    $("#gameover").modal("show");
                }
            }
        });
    };


//functions triggering sorting/searching algorithm
    //search
    $("input#search").on("input propertychange", function(){
        //show all rows
        var $row = $("#highscore_table").find("tbody").find("tr");
        $row.show();
        var searchValue = $(this).val();

        //remove text underline
        $row.each(function(){
            var $column = $(this).find("td:eq(1)");
            var value = $column.text();
            $column.text(value);
        });

        if(searchValue == "")
            return;

        var searchType = $("#select_search").val();
        var colIndex = $("#highscore_table").find("thead").find("td:contains("+searchType+")").index();

        var $show = $();
        var searchArray = [];

        switch (searchType){
            case "Player":
                $row.each(function(){
                    var $column = $(this).find("td:eq("+colIndex+")");
                    var value = $column.text();
                    $column.text(value); //remove text underline
                    searchArray.push(value);
                });

                var svLen = searchValue.length;
                var result = boyerMooreMatch(searchArray, searchValue);

                $.each(result, function(i, v){
                    var $rowmatch = $row.eq(v.textIndex);
                    $show = $show.add($rowmatch);
                    var name = $rowmatch.find("td:eq("+colIndex+")").text();
                    //essentially str=searchValue. However, to demonstrate that
                    // boyerMooreMatch() found the character match index,
                    // we deliberately write more just to make use of the index.
                    // The index is passed as charIndex.
                    var str = name.slice(v.charIndex,v.charIndex+svLen);
                    name = name.replace(str,"<span style='text-decoration:underline;'>"+str+"</span>");
                    $rowmatch.find("td:eq("+colIndex+")").html(name);
                });
                break;

            default :
                $("#highscore_table > thead td:contains('"+searchType+"')").trigger("click", [true]);

                $row = $("#highscore_table").find("tbody").find("tr");
                if(searchType != "Time")
                {
                    $row.each(function(){
                        var text = $(this).find("td:eq("+colIndex+")").text();
                        var value = parseInt(text);
                        searchArray.push(value);
                    });
                }
                else
                {
                    $row.each(function(){
                        var timeText = $(this).find("td:eq("+colIndex+")").text().split(":");
                        var time = parseInt(timeText[0])*60 + parseInt(timeText[1]);
                        searchArray.push(time);
                    });
                }

                var result = binarySearchAll(searchArray, searchValue);
                if(result!=-1)
                {
                    for(var i=result[0]; i<(result[1]+1); i++)
                    {
                        var $rowmatch = $row.eq(i);
                        $show = $show.add($rowmatch);
                    }
                }

                break;
        }

        $row.not($show).hide();
    });

    //sort options
    $("input#isStable").click(function(){
        if($(this).is(":checked"))
            $("#highscore_table").find("td.quicksort").css("background","");
        else
            $("#highscore_table").find("td.quicksort").css("background","#D5FAFD");
    });

    //sort
    $("#highscore_table > thead td, #highscore_table > tfoot td").click(function(event, isAsc){
        var columnName = $(this).text();
        var colIndex = $(this).index();
        var $columns = $("#highscore_table > thead td, #highscore_table > tfoot td").filter(":contains('"+columnName+"')");
        var asc = true;

        if(typeof isAsc === "undefined")
        {
            if(typeof $(this).data("isNextSortOrderAsc") !== "undefined")
            {
                asc = $(this).data("isNextSortOrderAsc");
                $columns.data("isNextSortOrderAsc", !asc);
            }
            else
            {
                if(columnName=="Time" || columnName=="Moves")
                    $columns.data("isNextSortOrderAsc", false);
                else
                {
                    asc = false;
                    $columns.data("isNextSortOrderAsc", true);
                }
            }
        }
        else
        {
            asc = isAsc;
            $(this).data("isNextSortOrderAsc", !asc);
        }

        var $icon = $(this).find("i");

        if( !$icon.length )
        {
            $("#highscore_table > thead i, #highscore_table > tfoot i").remove();
            $("#highscore_table > thead td, #highscore_table > tfoot td").not($columns).removeData("isNextSortOrderAsc");
            $icon = $("<i>");
            $(this).append($icon);
        }

        if(asc)
        {
            $icon.addClass("icon-chevron-up");
            $icon.removeClass("icon-chevron-down");
        }
        else
        {
            $icon.addClass("icon-chevron-down");
            $icon.removeClass("icon-chevron-up");
        }

        var $row = $(this).closest("table").find("tbody > tr");

        var array = [];
        switch(columnName) {
            case "See Final Look":
                $row.each(function(i){
                    if($(this).find("td:eq("+colIndex+")").find("a").attr("id") == 24)
                        array.push( [1, i] );
                    else
                        array.push( [0, i] );
                });
                break;

            case "Player":
                $row.each(function(i){
                    array.push( [$(this).find("td:eq("+colIndex+")").text(), i] );
                });
                break;

            case "Time":
                $row.each(function(i){
                    var timeText = $(this).find("td:eq("+colIndex+")").text().split(":");
                    var time = parseInt(timeText[0])*60 + parseInt(timeText[1]);
                    array.push( [time, i] );
                });
                break;

            default:
                $row.each(function(i){
                    array.push( [ parseInt( $(this).find("td:eq("+colIndex+")").text() ), i] );
                });
                break;
        }

        var result;
        if(columnName!="Player")
            if($("input#isStable").is(":checked"))
                result = quickSortStable(array, asc, 0);
            else
                result = quickSortInPlace(array, asc, 0);
        else
        {
            result = RadixSort(array, asc, 0);
        }

        for(var i=0; i<result.length-1; i++)
            $row.eq(result[i][1]).after($row.eq(result[i+1][1]));
    });


//button functions triggering modal
    $("#highscore_button").click(function(){
        updateHighscore();
    });

    $("body").on("click", ".finallook_button", function(){
        var pegs_position = $(this).attr("id");
        pegs_position = pegs_position.split(",");
        var table = $("<table class='pegs_board'></table>").pegsBoard(pegs_position ,true);
        $("#game_result").html(table);
        table.find("td").css({"min-width": "45px", "height": "45px"});
        var remaining = $(this).parent().prev().text();
        $("#game_result").append("<div style='margin-top: 20px; border-radius: 3px; background: #468847; color: white'>"+ writeMessage(remaining,pegs_position) +"</div>");
    });


//modal functions
    $("#notice").on("shown", function(){
        $("input#input-id").focus();
    });

    $("#highscore").on("shown", function () {
        $("input#search").focus();
    });

    $("#gameover").on("hidden", function(){
        $("#restartTime").trigger("click");

        var feedback = "";
        $(".feedback").each(function(){
            if( $(this).attr("type")=="checkbox" )
            {
                if($(this).is(":checked"))
                    feedback += "y,";
                else
                    feedback += ",";
            }
            else
                feedback += $(this).val() + ",";
        });

        feedback = feedback.slice(0, feedback.length-1);
        feedback = feedback.replace(/\\/g,"\\\\");
        feedback = feedback.replace(/'/g,"\\'");

        $.ajax({
            type: "post",
            url: "feedback.php",
            data: { feedback: feedback, id: last_id },
            success: function(data){
//                alert(data);
            }
        });
    });


//jqueryui touch punch - enable dragging elements on touch screen
    $("#notice").draggable();
    $("#finallook").draggable();
    $("#gameover").draggable();

//initiating user interface
    var $table = $("<table class='pegs_board'></table>");
    $table.pegsBoard("full",false);
    $("#game").append($table);
    updateHighscore();

//initiating animation
    $("#record").hide();
    $("#button-logout").hide();
    $("#game").hide().slideDown(2000, function(){
        $("#button-logout").slideDown(1000);
        $("#record").slideDown(1000, function(){
            $("#notice").modal({
                backdrop: 'static',
                keyboard: false
            });
            $("#notice").modal("show");
        });
    });

}); //end