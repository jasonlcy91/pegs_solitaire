<?php

require("access/database_login.php");

if(isset($_POST["id"]))
{
    $id = $_POST["id"];
    $feedback = $_POST["feedback"];
    $query = "UPDATE highscore SET feedback='$feedback' WHERE id=$id";

    $result = mysql_query($query);
    if (!$result) {
        die("Invalid query: " . mysql_error());
    }

//    echo $feedback."  ".$id;
}