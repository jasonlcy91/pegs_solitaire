<?php
function curPageName() {
    return substr($_SERVER["SCRIPT_NAME"],strrpos($_SERVER["SCRIPT_NAME"],"/")+1);
}

if( curPageName() == "database_login.php" )
    header("location: ../index.html");

$connection = mysql_connect('localhost','root');
if(!$connection)
{
    die('Could not connect: ' . mysql_error());
}

mysql_select_db('pegs', $connection);