<?php
session_start();

require("access/database_login.php");

if(isset($_POST["score"]))
{
    $score = $_POST["score"];
    $name = $score[0];
    $time = $score[1];
    $moves = $score[2];
    $remaining = $score[3];
    $pegs_position = $score[4];
    $query = "INSERT INTO highscore VALUES ('','$name','$time','$moves','$remaining','$pegs_position','')";

    $result = mysql_query($query);
    if (!$result) {
        die("Invalid query: " . mysql_error());
    }

    $response["lastID"] = mysql_insert_id();
}

$query = "SELECT username,time,moves,remaining,final_positions
          FROM highscore
          ORDER BY CASE WHEN final_positions='24' THEN 1 else 2 END,
          remaining, time";

$result = mysql_query($query);
if (!$result) {
    die("Invalid query: " . mysql_error());
}

while($row = mysql_fetch_assoc($result))
{
    $data[] = $row;
}

$response["data"] = $data;
echo json_encode($response);

