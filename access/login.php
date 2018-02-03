<?php
header('Content-type: application/json');
session_start();

if(isset($_POST["username"]) && $_POST["password"])
{
    $username = $_POST["username"];
    $password = $_POST["password"];
    $action = $_POST["action"];

    require("database_login.php");

    if($action == "button-login")
    {
        $query = "SELECT * FROM user
              WHERE u_username='$username' AND u_password='$password'";

        $result = mysql_query($query);
        if (!$result) {
            die("Invalid query: " . mysql_error());
        }

        if (mysql_num_rows($result) == 1)
        {
            $row = mysql_fetch_assoc($result);
            $_SESSION["data"] =  [ "username" => $row["u_username"] ];
            $response["data"] = $_SESSION["data"];
            $response["success"] = true;
        }
        else
        {
            $response["success"] = false;
            $response["message"] = "Invalid username and/or password";
        }
    }
    else if($action == "button-join")
    {
        $query = "SELECT * FROM user
              WHERE u_username='$username'";

        $result = mysql_query($query);
        if (!$result) {
            die("Invalid query: " . mysql_error());
        }

        if (mysql_num_rows($result) < 1)
        {
            $query = "INSERT INTO user
                      VALUES('$username', '$password')";
            $result = mysql_query($query);
            if (!$result) {
                die("Invalid query: " . mysql_error());
            }

            $query = "SELECT * FROM user
                      WHERE u_username='$username' AND u_password='$password'";
            $result = mysql_query($query);
            if (!$result) {
                die("Invalid query: " . mysql_error());
            }

            if (mysql_num_rows($result) == 1)
            {
                $row = mysql_fetch_assoc($result);
                $_SESSION["data"] =  [ "username" => $row["u_username"] ];
                $response["data"] = $_SESSION["data"];
                $response["success"] = true;
            }
            else
            {
                $response["success"] = false;
                $response["message"] = "Register failed";
            }
        }
        else
        {
            $response["success"] = false;
            $response["message"] = "Username already picked!";
        }
    }

    echo json_encode($response);
}